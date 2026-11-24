import 'dotenv/config';

/**
 * Central environment resolver for the Daily Feast (lunch.sdettech.com) suite.
 *
 * `BASE_URL` is optional. `EMPLOYEE_ID` is required and has no fallback, so a
 * missing key fails the run instead of silently logging in as someone else.
 */
function resolve(key: string, fallback: string): string {
  const value = process.env[key];
  return value !== undefined && value.trim() !== '' ? value.trim() : fallback;
}

function required(key: string): string {
  const value = process.env[key];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required env variable "${key}" — set it in .env (see .env.example)`);
  }
  return value.trim();
}

export const envConfig = {
  baseUrl: resolve('BASE_URL', 'https://lunch.sdettech.com'),
  get employeeId(): string {
    return required('EMPLOYEE_ID');
  },
};
