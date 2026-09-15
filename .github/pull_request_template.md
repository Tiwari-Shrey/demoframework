# Playwright Automation – PR Code Review Checklist

## Code Review Checklist

- [ ] **Page Object Model:** Locators and page-specific actions are maintained inside Page Objects; tests contain business scenarios rather than UI implementation details.

- [ ] **Stable Locators:** Locators use stable strategies such as `getByRole`, `getByTestId`, `getByLabel`, etc. Fragile XPath/CSS selectors are avoided.

- [ ] **No Hard Waits:** No unnecessary `page.waitForTimeout()` or fixed delays are used. Playwright auto-waiting and condition-based waits are preferred.

- [ ] **Test Independence:** Tests can run independently and do not depend on test execution order or state created by another test.

- [ ] **Reusable Components:** Common workflows and repeated UI components are implemented through reusable Page Objects, components, fixtures, or utilities instead of duplicated code.

- [ ] **Fixtures & Test Data:** Common setup/teardown and reusable test context are handled through Playwright fixtures where appropriate. Test data is managed cleanly and does not create cross-test dependencies.

- [ ] **Correct Validation Layer:** UI, API, and DB validations are performed at the appropriate layer. DB/API validation is used where it provides stronger verification than UI-only validation.

- [ ] **Canvas / Three.js Validation:** Canvas-based functionality is validated using underlying application data/JSON and expected object properties or coordinates where applicable, rather than relying only on screenshots.

- [ ] **TypeScript & Code Quality:** Proper types/interfaces are used, methods are focused, naming is meaningful, and there are no unused imports, debugging statements, or commented-out code.

- [ ] **Framework Consistency:** The implementation follows the existing project architecture, naming conventions, folder structure, reporting, fixtures, and coding patterns. No unnecessary framework-level changes are introduced.

## Reviewer Confirmation

- [ ] I have reviewed the above checklist.
- [ ] The implementation follows the existing automation framework standards.
- [ ] No blocking issues remain before merge.
