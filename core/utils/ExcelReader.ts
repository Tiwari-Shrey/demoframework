import * as XLSX from 'xlsx';
import * as path from 'path';

/**
 * Reads an Excel sheet into an array of row objects, keyed by the header row.
 * Defaults to the workbook's first sheet when `sheetName` is omitted.
 */
export function readExcelSheet<T extends Record<string, unknown>>(
  filePath: string,
  sheetName?: string
): T[] {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  const workbook = XLSX.readFile(absolutePath);
  const targetSheet = sheetName ?? workbook.SheetNames[0];
  const sheet = workbook.Sheets[targetSheet];

  if (!sheet) {
    throw new Error(
      `Sheet "${targetSheet}" not found in ${absolutePath}. Available sheets: ${workbook.SheetNames.join(', ')}`
    );
  }

  return XLSX.utils.sheet_to_json<T>(sheet, { defval: '' });
}
