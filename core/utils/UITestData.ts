import fs from 'node:fs';
import path from 'node:path';
import * as XLSX from 'xlsx';

export type PlanogramWorkbookOverride = {
  pogCode: string;
  pogVersion: string;
};

const workbookPaths = [
  path.resolve(process.cwd(), 'testdata/wpd-planogram/wpd-manual-test-data.xlsx'),
];

export function getPlanogramWorkbookOverride(
  globalVariableName = process.env.GLOBAL_VARIABLE_NAME
): PlanogramWorkbookOverride | undefined {
  if (!globalVariableName) return undefined;

  const workbookPath = workbookPaths.find((candidate) => fs.existsSync(candidate));
  if (!workbookPath) return undefined;

  const workbook = XLSX.readFile(workbookPath, { raw: true });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) return undefined;

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });
  const matchingRow = rows.find(
    (row) => String(row.TEST_FLOW).trim().toLowerCase() === globalVariableName.trim().toLowerCase()
  );
  if (!matchingRow) return undefined;

  const pogCode = String(matchingRow.POG_CODE).trim();
  const pogVersion = String(matchingRow.POG_VERSION).trim();
  if (!pogCode || !pogVersion) return undefined;

  return { pogCode, pogVersion };
}
