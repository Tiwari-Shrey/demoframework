---
mode: agent
description: Generate Playwright automation code from a test case .md file using the playwright-test-generator agent.
---

# Automation Code Generator

**Act as an Automation Code Generator.**

Use the **`playwright-test-generator`** agent (via the Playwright MCP) to generate the automation code for the test case written in the provided `.md` file. Ask the user which test case `.md` file to use if it has not been supplied.

Before writing any code, read the `context.md` file in the project root to understand the whole project.

> **Guardrail — clarify before acting:** Do not start generating code until every required detail is confirmed. Read the test case file and `context.md`, then list any gaps or ambiguities (missing test data, unclear steps, undefined expected results, unknown selectors) and ask the user to resolve them. Only proceed once the user has removed all ambiguity. Never assume, guess, or invent values.

Follow these rules:

### Setup & credentials

1. Login and logout are already handled in the `beforeAll` and `afterAll` annotations in `core\base\Hooks.ts` — do not re-implement them.
2. All user credentials are in the `.env` file in the root folder — reference them, never hardcode.

### Page Object Model

3. The test cases focus only on the Planogram Designer Page — add any new functions to `pages\wpd-planogram\PlanogramDesignerPage.ts`.
4. Reuse existing functions wherever possible; create new functions only when necessary.
5. Do not modify existing functions — they are used by other spec files.
6. Declare all locators at the top of the file (as class-level readonly properties initialized in the constructor). The only exception is a locator that must be built at runtime from dynamic values. Never pass a locator or selector string from the spec file into a page/validator function.

### Validators (Three.js / math assertions)

7. For any assertion that needs the Three.js library or mathematical calculations, use or create a function in a validator file under `pages\wpd-planogram\validators\`. Reuse the matching existing validator (`drag-drop-validator.ts`, `item-label-validator.ts`, `multi-select-delete-validators.ts`, `multi-select-drag-validator.ts`) when applicable, otherwise create a new `*-validator.ts` file following the same naming convention.

### Test data

8. Add test data to `testdata\wpd-planogram\pog-data.json`. Import it via the `@testdata` path alias.

### Spec file conventions

9. Create the spec file under `tests\wpd-planogram\ui\` using the `*.spec.ts` naming pattern.
10. Use the path aliases (`@pages`, `@testdata`, `@core`, `@api`, `@batch`) for all imports — do not use relative paths.
11. Follow the existing spec pattern: import `test` from `@core/fixtures/common.fixture`, use `setupSuite()` from `@core/fixtures/wpd-planogram.fixture` to get the shared logged-in page, and wrap steps in `test.step(...)`.
12. Tag the describe block consistently with existing specs (e.g. `@planogram`, `@regression`, plus a feature-specific tag).

### Finishing up

13. After generating the code, run a compile/lint check and fix any errors. Then run the generated test and resolve failures before finishing.
14. If the generated test fails and the cause is not obvious, hand off to the **`playwright-test-healer`** agent to debug and fix it (see the Test Healer prompt).
15. Update the `context.md` file once all the code is complete.
16. Do not assume any details — ask the user for input on any ambiguity before taking action.
