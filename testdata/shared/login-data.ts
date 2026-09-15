import { envConfig } from '@core/config/environment';

export const LOGIN_PAGE_DATA = {
  baseUrl: envConfig.baseUrl,
  credentials: {
    username: envConfig.credentials.username,
    password: envConfig.credentials.password,
  },
  invalidPassword: 'WrongPassword123',
  timeouts: {
    action: 10_000,
  },
  alerts: {
    signupSuccess: 'Sign up successful.',
    signupDuplicate: 'This user already exist.',
    loginWrongPassword: 'Wrong password.',
    loginUserNotFound: 'User does not exist.',
  },
};
