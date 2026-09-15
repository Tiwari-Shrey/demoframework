import fs from 'node:fs';
import path from 'node:path';
import * as XLSX from 'xlsx';

export type LoginCredentialsOverride = {
  username: string;
  password: string;
};

const workbookPath = path.resolve(process.cwd(), 'testdata/ui/login-credentials.xlsx');

// Mirrors getPlanogramWorkbookOverride: matches process.env.GLOBAL_VARIABLE_NAME
// against the TEST_FLOW column to pull that row's login credentials.
export function getLoginCredentialsOverride(
  globalVariableName = process.env.GLOBAL_VARIABLE_NAME
): LoginCredentialsOverride | undefined {
  if (!globalVariableName) return undefined;
  if (!fs.existsSync(workbookPath)) return undefined;

  const workbook = XLSX.readFile(workbookPath, { raw: true });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) return undefined;

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });
  const matchingRow = rows.find(
    (row) => String(row.TEST_FLOW).trim().toLowerCase() === globalVariableName.trim().toLowerCase()
  );
  if (!matchingRow) return undefined;

  const username = String(matchingRow.username).trim();
  const password = String(matchingRow.password).trim();
  if (!username || !password) return undefined;

  return { username, password };
}
