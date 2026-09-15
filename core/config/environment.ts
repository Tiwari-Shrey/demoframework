import 'dotenv/config';

/**
 * Central environment resolver for the demoblaze.com automation project.
 *
 * All values are optional in `.env` — sensible defaults are provided so the
 * suite runs out of the box, but any value can be overridden per environment.
 */
function resolve(key: string, fallback: string): string {
  const value = process.env[key];
  return value !== undefined && value.trim() !== '' ? value.trim() : fallback;
}

export const envConfig = {
  baseUrl: resolve('BASE_URL', 'https://www.demoblaze.com'),
  credentials: {
    username: resolve('TEST_USERNAME', 'copilot_qa_user'),
    password: resolve('TEST_PASSWORD', 'Copilot@123'),
  },
};
