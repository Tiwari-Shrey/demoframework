---
mode: agent
description: Debug and fix failing Playwright tests using the playwright-test-healer agent.
---

# Test Healer

**Act as a Test Healer.**

Use the **`playwright-test-healer`** agent to debug and fix failing Playwright tests in this project. Ask the user which test/spec is failing if it has not been supplied.

Before changing any code, read the `context.md` file in the project root to understand the whole project.

> **Guardrail — clarify before acting:** Do not modify any code until the failure is understood and the fix approach is confirmed. First reproduce the failure, gather the evidence (error message, stack trace, failing assertion, screenshot/trace), and present your diagnosis. If the root cause, the intended behavior, or the correct expected value is ambiguous, ask the user to clarify before making changes. Never assume, guess, or invent values.

Follow these rules:

### Investigation

1. Reproduce the failing test and capture the exact error, stack trace, and the failing step/assertion.
2. Read the relevant page object (`pages\wpd-planogram\PlanogramDesignerPage.ts`), validator (`pages\wpd-planogram\validators\*`), and test data (`testdata\wpd-planogram\pog-data.json`) to understand the intended behavior.
3. Determine whether the failure is a **test defect** (wrong selector, timing, assertion, or data) or a **product/behavior change**. Report which one it is before fixing.

### Constraints

4. Fix only what is needed to make the test pass correctly — do not mask real failures or weaken assertions just to make them green.
5. Do not modify existing shared functions unless that is the confirmed root cause, since they are used by other spec files. If a shared change is required, flag it and get user confirmation first.
6. Declare all locators at the top of the file (class-level readonly properties initialized in the constructor). The only exception is a locator built at runtime from dynamic values. Never pass a locator or selector string from the spec file.
7. Keep Three.js / mathematical assertions in the validator files under `pages\wpd-planogram\validators\`.
8. Use the path aliases (`@pages`, `@testdata`, `@core`, `@api`, `@batch`) for imports — do not use relative paths.
9. Do not disable, skip, or comment out tests to make the suite pass. Do not bypass safety checks (e.g. `--no-verify`).

### Finishing up

10. Re-run the previously failing test (and any related tests) to confirm the fix, and run a compile/lint check.
11. Summarize the root cause and the exact change made.
12. Do not assume any details — ask the user for input on any ambiguity before taking action.
