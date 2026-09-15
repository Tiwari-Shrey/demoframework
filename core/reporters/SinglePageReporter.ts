import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  TestStep,
  FullResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

type Img = { name: string; dataUri: string };
type Step = { title: string; ok: boolean; duration: number; images: Img[] };
type Scenario = {
  feature: string;
  title: string;
  file: string;
  line: number;
  status: TestResult['status'];
  ok: boolean;
  retry: number;
  duration: number;
  error?: string;
  steps: Step[];
  extraImages: Img[];
};

const ANSI = /\u001b\[[0-9;]*m/g;
const stripAnsi = (s: string) => s.replace(ANSI, '');
const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)} s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

function toImg(a: { name: string; contentType: string; body?: Buffer; path?: string }): Img | null {
  if (!a.contentType || !a.contentType.startsWith('image/')) return null;
  let buf: Buffer | undefined = a.body;
  if (!buf && a.path) {
    try {
      buf = fs.readFileSync(a.path);
    } catch {
      return null;
    }
  }
  if (!buf) return null;
  return { name: a.name, dataUri: `data:${a.contentType};base64,${buf.toString('base64')}` };
}

function collectImages(step: TestStep): Img[] {
  const imgs: Img[] = [];
  for (const a of step.attachments || []) {
    const i = toImg(a);
    if (i) imgs.push(i);
  }
  for (const child of step.steps) imgs.push(...collectImages(child));
  return imgs;
}

function comparisonImagePaths(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const paths: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) paths.push(...comparisonImagePaths(entryPath));
    else if (entry.isFile() && entry.name.endsWith('_comparison.png')) paths.push(entryPath);
  }
  return paths;
}

function comparisonImages(paths: string[]): Img[] {
  return paths.flatMap((filePath) => {
    try {
      const body = fs.readFileSync(filePath);
      return [
        {
          name: path.basename(filePath),
          dataUri: `data:image/png;base64,${body.toString('base64')}`,
        },
      ];
    } catch {
      return [];
    }
  });
}

// Flatten to the user-authored test.step entries; images aggregated from their subtree.
function collectSteps(steps: TestStep[], out: Step[]): void {
  for (const s of steps) {
    if (s.category === 'test.step') {
      out.push({ title: s.title, ok: !s.error, duration: s.duration, images: collectImages(s) });
    } else {
      collectSteps(s.steps, out);
    }
  }
}

function featureName(test: TestCase): string {
  const parts: string[] = [];
  let s: Suite | undefined = test.parent;
  while (s) {
    if (s.type === 'describe' && s.title) parts.unshift(s.title);
    s = s.parent;
  }
  return parts.join(' › ') || '(no feature)';
}

export default class SinglePageReporter implements Reporter {
  private scenarios: Scenario[] = [];
  private outputFile = path.resolve(process.cwd(), 'reports/custom-report/index.html');
  private comparisonDir = path.resolve(process.cwd(), 'reports/screenshots/distortion/diffs');
  private testStartMs = new WeakMap<TestResult, number>();

  onBegin(config: FullConfig): void {
    const opts = config.reporter.find((r) => r[0].includes('SinglePageReporter'))?.[1] as
      { outputFile?: string } | undefined;
    if (opts?.outputFile) this.outputFile = path.resolve(process.cwd(), opts.outputFile);
  }

  onTestBegin(_test: TestCase, result: TestResult): void {
    this.testStartMs.set(result, Date.now());
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const steps: Step[] = [];
    collectSteps(result.steps, steps);

    const seen = new Set(steps.flatMap((s) => s.images.map((i) => i.dataUri)));
    const extraImages: Img[] = [];
    for (const a of result.attachments) {
      const i = toImg(a);
      if (i && !seen.has(i.dataUri)) extraImages.push(i);
    }

    if (result.status !== test.expectedStatus) {
      const startMs = this.testStartMs.get(result) ?? result.startTime.getTime();
      const freshPaths = comparisonImagePaths(this.comparisonDir).filter((filePath) => {
        try {
          return fs.statSync(filePath).mtimeMs >= startMs;
        } catch {
          return false;
        }
      });
      for (const image of comparisonImages(freshPaths)) {
        if (!seen.has(image.dataUri)) extraImages.push(image);
      }
    }

    this.scenarios.push({
      feature: featureName(test),
      title: test.title,
      file: path.relative(process.cwd(), test.location.file),
      line: test.location.line,
      status: result.status,
      ok: result.status === test.expectedStatus,
      retry: result.retry,
      duration: result.duration,
      error: result.error ? stripAnsi(result.error.message || String(result.error)) : undefined,
      steps,
      extraImages,
    });
  }

  onEnd(result: FullResult): void {
    // Keep only the final attempt per scenario (drop earlier retries).
    const latest = new Map<string, Scenario>();
    for (const sc of this.scenarios) {
      const key = `${sc.file}::${sc.feature}::${sc.title}`;
      const prev = latest.get(key);
      if (!prev || sc.retry >= prev.retry) latest.set(key, sc);
    }
    fs.mkdirSync(path.dirname(this.outputFile), { recursive: true });
    fs.writeFileSync(this.outputFile, this.render([...latest.values()], result), 'utf-8');
    // eslint-disable-next-line no-console
    console.log(`\nSingle-page report: ${this.outputFile}`);
  }

  private render(scenarios: Scenario[], result: FullResult): string {
    const total = scenarios.length;
    const passed = scenarios.filter((s) => s.ok && s.status !== 'skipped').length;
    const failed = scenarios.filter((s) => !s.ok && s.status !== 'skipped').length;
    const skipped = scenarios.filter((s) => s.status === 'skipped').length;
    const passRate = total ? Math.round((passed / (total - skipped || 1)) * 100) : 0;

    const features = new Map<string, Scenario[]>();
    for (const sc of scenarios) {
      if (!features.has(sc.feature)) features.set(sc.feature, []);
      features.get(sc.feature)!.push(sc);
    }
    const featureHtml = [...features.entries()]
      .map(([f, list]) => this.renderFeature(f, list))
      .join('\n');

    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Test Report</title>
<style>
:root{--pass:#22a06b;--fail:#e5484d;--skip:#8b95a1;--bg:#eef1f5;--card:#fff;--border:#e4e8ee;--ink:#1e2530;--muted:#6b7684;}
*{box-sizing:border-box;}
body{margin:0;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;background:var(--bg);color:var(--ink);}
header{background:linear-gradient(120deg,#1f2933,#2f3e51);color:#fff;padding:22px 32px;box-shadow:0 2px 8px rgba(0,0,0,.15);}
header h1{margin:0;font-size:22px;font-weight:700;letter-spacing:.3px;}
header .meta{font-size:12px;opacity:.75;margin-top:4px;}
.hero{display:flex;gap:24px;flex-wrap:wrap;align-items:center;padding:22px 32px;}
.chart{display:flex;flex-direction:column;align-items:center;gap:10px;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px 22px;box-shadow:0 1px 3px rgba(20,30,50,.06);}
.donut{display:block;}
.donut-num{font-size:26px;font-weight:800;fill:var(--ink);}
.donut-lbl{font-size:11px;fill:var(--muted);text-transform:uppercase;letter-spacing:.5px;}
.legend{display:flex;gap:14px;font-size:12px;color:var(--muted);}
.legend span{display:flex;align-items:center;gap:5px;}
.legend i{width:10px;height:10px;border-radius:3px;display:inline-block;}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px;flex:1;min-width:280px;}
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px 18px;box-shadow:0 1px 3px rgba(20,30,50,.06);transition:transform .12s;}
.card:hover{transform:translateY(-2px);}
.card .n{font-size:28px;font-weight:800;line-height:1;}
.card .l{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;margin-top:6px;}
.card.pass .n{color:var(--pass);}.card.fail .n{color:var(--fail);}.card.skip .n{color:var(--skip);}.card.rate .n{color:#2f6fed;}
.filters{position:sticky;top:0;z-index:10;background:var(--bg);padding:10px 32px;display:flex;gap:8px;border-bottom:1px solid var(--border);}
.filters button{border:1px solid var(--border);background:#fff;padding:7px 16px;border-radius:20px;cursor:pointer;font-size:13px;font-weight:600;color:var(--muted);transition:all .12s;}
.filters button:hover{border-color:#c3ccd8;}
.filters button.active{background:var(--ink);color:#fff;border-color:var(--ink);}
main{padding:14px 32px 48px;}
.feature{margin-bottom:22px;}
.feature-head{display:flex;align-items:center;gap:14px;margin:18px 0 12px;}
.feature-head h2{font-size:15px;font-weight:700;color:var(--ink);margin:0;flex:1;}
.feature-head .fbar{width:160px;height:8px;border-radius:5px;background:#e4e8ee;overflow:hidden;display:flex;}
.feature-head .fbar i{height:100%;display:block;}
.feature-head .fcount{font-size:12px;color:var(--muted);white-space:nowrap;}
.scenario{background:var(--card);border:1px solid var(--border);border-left-width:5px;border-radius:12px;margin-bottom:10px;overflow:hidden;box-shadow:0 1px 2px rgba(20,30,50,.05);}
.scenario.ok{border-left-color:var(--pass);}.scenario.no{border-left-color:var(--fail);}.scenario.sk{border-left-color:var(--skip);}
.sc-head{display:flex;align-items:center;gap:12px;padding:13px 16px;cursor:pointer;}
.sc-head:hover{background:#fafbfc;}
.sc-head .badge{font-size:10px;font-weight:800;padding:4px 10px;border-radius:20px;color:#fff;letter-spacing:.4px;}
.ok .badge{background:var(--pass);}.no .badge{background:var(--fail);}.sk .badge{background:var(--skip);}
.sc-head .title{font-weight:600;flex:1;}
.sc-head .dur{font-size:12px;color:var(--muted);}
.sc-head .chev{color:#b6bfca;font-size:11px;transition:transform .15s;}
.scenario.open .chev{transform:rotate(90deg);}
.sc-body{display:none;padding:2px 16px 16px;border-top:1px solid var(--border);}.scenario.open .sc-body{display:block;}
.error{background:#fdecec;border:1px solid #f5c2c2;color:#8a1c1c;padding:10px 12px;border-radius:8px;white-space:pre-wrap;font-family:ui-monospace,Consolas,monospace;font-size:12px;margin:12px 0;}
ol.steps{list-style:none;margin:12px 0 0;padding:0;}ol.steps>li{padding:9px 0;border-bottom:1px dashed #eef1f4;}
.step-line{display:flex;align-items:center;gap:10px;}
.step-line .ic{width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex:none;}
.step-line .ic.ok{background:var(--pass);}.step-line .ic.no{background:var(--fail);}
.step-line .dur{margin-left:auto;font-size:11px;color:#aab2bd;}
.shots{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 0 30px;}
.shots img{max-height:130px;border:1px solid var(--border);border-radius:8px;cursor:zoom-in;transition:transform .12s;}
.shots img:hover{transform:scale(1.03);}
.file{font-size:11px;color:#aab2bd;margin-left:30px;margin-top:8px;}
#lb{position:fixed;inset:0;background:rgba(10,15,25,.9);display:none;align-items:center;justify-content:center;z-index:99;cursor:zoom-out;}#lb img{max-width:94%;max-height:94%;border-radius:8px;}
</style></head><body>
<header><h1>Test Execution Report</h1>
<div class="meta">Generated ${escapeHtml(new Date().toLocaleString())} · Overall status: ${escapeHtml(
      result.status
    )}</div></header>
<section class="hero">
<div class="chart">${this.donut(passed, failed, skipped)}
<div class="legend"><span><i style="background:var(--pass)"></i>Passed</span><span><i style="background:var(--fail)"></i>Failed</span><span><i style="background:var(--skip)"></i>Skipped</span></div>
</div>
<div class="stats">
<div class="card"><div class="n">${total}</div><div class="l">Total</div></div>
<div class="card pass"><div class="n">${passed}</div><div class="l">Passed</div></div>
<div class="card fail"><div class="n">${failed}</div><div class="l">Failed</div></div>
<div class="card skip"><div class="n">${skipped}</div><div class="l">Skipped</div></div>
<div class="card rate"><div class="n">${passRate}%</div><div class="l">Pass rate</div></div>
<div class="card"><div class="n">${fmtDuration(
      scenarios.reduce((a, s) => a + s.duration, 0)
    )}</div><div class="l">Duration</div></div>
</div>
</section>
<div class="filters"><button data-f="all" class="active">All</button><button data-f="no">Failed</button><button data-f="ok">Passed</button><button data-f="sk">Skipped</button></div>
<main>${featureHtml}</main>
<div id="lb"><img alt=""/></div>
<script>
document.querySelectorAll('.sc-head').forEach(h=>h.addEventListener('click',()=>h.parentElement.classList.toggle('open')));
document.querySelectorAll('.filters button').forEach(b=>b.addEventListener('click',()=>{
 document.querySelectorAll('.filters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');
 const f=b.dataset.f;
 document.querySelectorAll('.scenario').forEach(s=>{s.style.display=(f==='all'||s.classList.contains(f))?'':'none';});
 document.querySelectorAll('.feature').forEach(ft=>{const any=[...ft.querySelectorAll('.scenario')].some(s=>s.style.display!=='none');ft.style.display=any?'':'none';});
}));
const lb=document.getElementById('lb'),lbImg=lb.querySelector('img');
document.querySelectorAll('.shots img').forEach(i=>i.addEventListener('click',()=>{lbImg.src=i.src;lb.style.display='flex';}));
lb.addEventListener('click',()=>lb.style.display='none');
</script></body></html>`;
  }

  private donut(pass: number, fail: number, skip: number): string {
    const total = pass + fail + skip || 1;
    const r = 54;
    const c = 2 * Math.PI * r;
    const seg = (val: number, color: string, offset: number) =>
      `<circle r="${r}" cx="70" cy="70" fill="transparent" stroke="${color}" stroke-width="20" stroke-dasharray="${
        (c * val) / total
      } ${c}" stroke-dashoffset="${-offset}" transform="rotate(-90 70 70)"/>`;
    let off = 0;
    const passSeg = seg(pass, '#22a06b', off);
    off += (c * pass) / total;
    const failSeg = seg(fail, '#e5484d', off);
    off += (c * fail) / total;
    const skipSeg = seg(skip, '#8b95a1', off);
    const rate = Math.round((pass / (pass + fail || 1)) * 100);
    return `<svg width="140" height="140" viewBox="0 0 140 140" class="donut">
<circle r="${r}" cx="70" cy="70" fill="transparent" stroke="#eceff1" stroke-width="20"/>
${passSeg}${failSeg}${skipSeg}
<text x="70" y="66" text-anchor="middle" class="donut-num">${rate}%</text>
<text x="70" y="84" text-anchor="middle" class="donut-lbl">passed</text>
</svg>`;
  }

  private renderFeature(feature: string, list: Scenario[]): string {
    const p = list.filter((s) => s.ok && s.status !== 'skipped').length;
    const f = list.filter((s) => !s.ok && s.status !== 'skipped').length;
    const k = list.filter((s) => s.status === 'skipped').length;
    const tot = list.length || 1;
    const bar = `<div class="fbar"><i style="width:${(p / tot) * 100}%;background:var(--pass)"></i><i style="width:${
      (f / tot) * 100
    }%;background:var(--fail)"></i><i style="width:${(k / tot) * 100}%;background:var(--skip)"></i></div>`;
    return `<section class="feature"><div class="feature-head"><h2>${escapeHtml(
      feature
    )}</h2>${bar}<span class="fcount">${p}/${list.length} passed</span></div>
${list.map((sc) => this.renderScenario(sc)).join('\n')}</section>`;
  }

  private renderScenario(sc: Scenario): string {
    const cls = sc.status === 'skipped' ? 'sk' : sc.ok ? 'ok' : 'no';
    const label = sc.status === 'skipped' ? 'SKIPPED' : sc.ok ? 'PASSED' : 'FAILED';

    const steps = sc.steps
      .map((st) => {
        const ic = st.ok ? '<span class="ic ok">✓</span>' : '<span class="ic no">✗</span>';
        const shots = st.images.length
          ? `<div class="shots">${st.images
              .map((im) => `<img src="${im.dataUri}" alt="${escapeHtml(im.name)}"/>`)
              .join('')}</div>`
          : '';
        return `<li><div class="step-line">${ic}<span>${escapeHtml(
          st.title
        )}</span><span class="dur">${fmtDuration(st.duration)}</span></div>${shots}</li>`;
      })
      .join('\n');

    const extra = sc.extraImages.length
      ? `<div class="shots">${sc.extraImages
          .map((im) => `<img src="${im.dataUri}" alt="${escapeHtml(im.name)}"/>`)
          .join('')}</div>`
      : '';

    const error = sc.error ? `<div class="error">${escapeHtml(sc.error)}</div>` : '';
    const retry = sc.retry > 0 ? ` · retry ${sc.retry}` : '';

    return `<div class="scenario ${cls} ${cls === 'no' ? 'open' : ''}">
<div class="sc-head"><span class="chev">▶</span><span class="badge">${label}</span><span class="title">${escapeHtml(
      sc.title
    )}</span><span class="dur">${fmtDuration(sc.duration)}${retry}</span></div>
<div class="sc-body"><div class="file">${escapeHtml(sc.file)}:${sc.line}</div>${error}<ol class="steps">${steps}</ol>${extra}</div></div>`;
  }
}
