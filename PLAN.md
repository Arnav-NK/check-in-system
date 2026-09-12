# Festival Check-In Join Explorer: Implementation Plan

## Step 1: Core Data Model & Validation Logic
- **Goal:** Define the exact in-memory JSON structures for the built-in Registrations and Check-ins tables, and implement pure functions for `INVALID_ID` and `DUPLICATE_KEY` validation.
- **Checkpoint:** Calling the validation function with an empty/whitespace ID returns `INVALID_ID` (naming the table and row). Calling it with duplicate IDs in the same table returns `DUPLICATE_KEY` (naming the table and ID). Calling it with the frozen built-in data returns a clean success state.
- **Time-box:** 10 minutes

## Step 2: Relational Join & Ordering Logic
- **Goal:** Implement the core comparison engine as a pure, UI-agnostic function that performs a left join combined with an anti-join, applying the strict rule-based ordering (Registrations-order first, Check-ins-order second).
- **Checkpoint:** Passing the built-in Registrations and Check-ins arrays to the `compare()` function returns exactly 5 objects in the contracted order. The objects will contain exactly the statuses: `MATCHED`, `REGISTERED_ONLY`, `MATCHED`, `REGISTERED_ONLY`, and `ORPHAN_CHECK_IN`, and output a summary object with counts `2/2/1`.
- **Time-box:** 15 minutes

## Step 3: UI Rendering & Action Wiring
- **Goal:** Build a single-page HTML/CSS interface with two editable input tables and one result table. Wire up the "Compare" and "Reset" buttons, ensuring validation errors immediately clear any stale data. 
- **Checkpoint:** Clicking "Compare" on the default UI dynamically renders the 5 expected result rows, explicitly using the "—" placeholder for missing fields. Injecting an invalid input and clicking "Compare" displays an error and immediately removes all prior rows and counts.
- **Time-box:** 20 minutes

## Step 4: Test Suite & Edge Case Verification
- **Goal:** Write a lightweight, headless vanilla JavaScript test suite (`runTests()`) that validates all logic against the exact edge cases defined in the frozen specification.
- **Checkpoint:** The test runner executes without a DOM and outputs passing assertions proving Acceptance Criteria B (built-in 2/2/1), C (empty check-ins), and D (duplicate key detection). 
- **Time-box:** 15 minutes

## Step 5: Final Documentation & Package Readiness
- **Goal:** Produce the remaining required phase deliverables (`AI_PROMPTS.md`, `DESIGN_SUMMARY.md`, and `VERIFICATION.md`) and package the solution.
- **Checkpoint:** All specified documentation files are present, and `VERIFICATION.md` contains a cross-referenced checklist mapping every aspect of Acceptance Criteria A-F back to the code.
- **Time-box:** 10 minutes

---

### Risks & Potential Friction Points (Needing a Second Pass)
1. **Missing Field Renderings:** Ensuring the "—" placeholder correctly applies to missing left-side data (for `ORPHAN_CHECK_IN`) and right-side data (for `REGISTERED_ONLY`) without crashing the template engine.
2. **Orphan Ordering Guarantee:** Accidental reassignment of array indexes could cause `ORPHAN_CHECK_IN` rows to lose their original Check-ins table order (Rule 5 requires preserving Check-ins-table order).
3. **Stale State on Validation Failure:** Rule 8 explicitly requires clearing *previously shown results and counts* if a validation failure occurs during a subsequent Compare click. This requires careful state management before the join is executed.
4. **Summary Counts vs. Filtering:** If the optional UI filter is implemented, we must ensure the `2/2/1` summary counts are derived from the *underlying data state*, not the currently visible DOM rows, so counts don't vanish when a user filters for "MATCHED".
