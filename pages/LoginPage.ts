import { Page, Locator } from '@playwright/test';

/** "EMPLOYEE ACCESS" screen — login by Employee ID only. */
export class LoginPage {
  readonly main: Locator;
  readonly employeeIdInput: Locator;
  readonly accessProfileButton: Locator;
  readonly errorAlert: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main', { name: 'Employee Login' });
    this.employeeIdInput = page.getByRole('textbox', { name: 'Employee ID' });
    this.accessProfileButton = page.getByRole('button', {
      name: "Access profile and view today's menu",
    });
    this.errorAlert = page.getByRole('form', { name: 'EMPLOYEE ACCESS' }).getByRole('alert');
  }

  async submitEmployeeId(employeeId: string): Promise<void> {
    await this.employeeIdInput.fill(employeeId);
    await this.accessProfileButton.click();
  }
}
