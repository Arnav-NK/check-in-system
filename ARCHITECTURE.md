# Architecture Design Report: Festival Check-In Join Explorer

## 1. DATA MODEL
- **Types and Shape:** 
  Both the Registrations and Check-ins tables are modeled as array of plain JavaScript objects. 
  - `Registrations`: `Array<{ id: string, student: string, activity: string }>`
  - `CheckIns`: `Array<{ id: string, gate: string, time: string }>`
  The final result table is an array of unified objects: `Array<{ id: string, status: string, student: string, activity: string, gate: string, time: string }>`
  - **Storage and Reset:** The built-in data is stored as immutable `const` arrays. The application's working state clones these at initialization and whenever "Reset" is invoked.
- **Justification against rules:** 
  - **Trimmed ID:** Storing IDs as raw strings allows the UI to reflect exact user input (preserving spaces visually), while `id.trim()` is computed on-the-fly during comparison to enforce the trimmed-but-case-sensitive requirement (Rule 1).
  - **Uniqueness:** Storing as arrays allows natural order preservation (Rule 5), while validation can iterate these arrays, adding trimmed IDs to a `Set` to explicitly trap and report `DUPLICATE_KEY` violations (Rule 3).
  - **Missing Fields:** A unified object structure for the output table ensures that rendering logic is uniform; we explicitly map missing keys to `"—"` during the join logic to comply with Rule 6.

## 2. CORE LOGIC DECOMPOSITION
- **Pure Functions:**
  - `validateTable(tableData, tableName) -> { isValid: boolean, errorType: string, errorId: string, row: object }`: Checks for `INVALID_ID` (empty after trim) and `DUPLICATE_KEY` (ID already seen in `Set`).
  - `compareData(registrations, checkIns) -> { resultRows: Array, counts: { matched, registeredOnly, orphan } }`: Computes the left-join and anti-join, formatting final objects and returning summary counts.
- **Why Isolated from UI:** 
  Decoupling this logic guarantees unit testability without relying on a DOM. Furthermore, keeping validation strictly separate allows the UI controller to execute `validateTable()` first, immediately halt, clear the screen, and surface the exact error *without* risking side-effects or partial execution of the `compareData()` logic (satisfying Rules 2, 3, and 8).

## 3. TRADEOFFS AND ALTERNATIVES CONSIDERED

### a. Join Implementation
- **Chosen:** A `Map<string, Array<object>>` lookup index (Check-ins grouped by trimmed ID), followed by a sequential iteration over Registrations. 
- **Rejected:** A nested-loop `O(N^2)` comparison, or a flat `Map<string, object>` that silently assumes 1:1 mapping.
- **Why:** Rule 4a specifies MATCHED when "exactly one check-in has the same ID." Even though Rule 3 enforces per-table uniqueness upstream, we implement the index as an array-aggregator and explicitly check `checkIns.length === 1`. This defensive programming ensures that the core join logic contract (Rule 4a) remains robust and mathematically correct even if the upstream uniqueness validation rule is relaxed, refactored, or bypassed in future iterations.

### b. Row Ordering Guarantee
- **Chosen:** Sequential array traversal. We iterate over the original `Registrations` array to push `MATCHED`/`REGISTERED_ONLY` rows. Then, we iterate over the original `CheckIns` array, pushing `ORPHAN_CHECK_IN` rows if they were not marked as seen during the first pass.
- **Rejected:** Combining all data and passing it through `Array.prototype.sort()` using a derived sequence key or status weight.
- **Why:** Sorting relies on artificial keys which become brittle if data changes. Array traversal structurally guarantees Rule 5 (preserving original Registrations order, followed by original Check-ins order) directly from the source of truth, without any risk of unintended re-ordering.

### c. Validation Location
- **Chosen:** Whole-table validation executed exclusively upon invoking the "Compare" action.
- **Rejected:** Real-time per-row validation (e.g., highlighting errors instantly `onKeyUp`).
- **Why:** Rule 8 dictates that ANY input error (on either table) must stop the join and clear *prior results/counts*. Whole-pair validation tied to the "Compare" button precisely honors the "stop before running the join" contract while ensuring the screen completely resets at a predictable user-driven threshold, avoiding unpredictable UI thrashing while typing.

## 4. STATE MANAGEMENT FOR RESET / RE-COMPARE
- **Reset:** This action deeply clones the original frozen constant arrays, forcing the working input tables to revert. It distinctly purges the result array, clears validation errors, and zeroes summary counts. It is isolated from "Compare" because it actively mutates user input data back to defaults.
- **Compare:** This action strictly reads the current state of the DOM input tables. On every click, it runs a fresh whole-table validation pass, meaning it does not compute incremental diffs. If validation passes, it overwrites the result array and counts. If it fails, it explicitly clears the result array and counts, ensuring that stale, previously-compared results are never left lingering on screen if a user introduced a duplicate key after a successful run.

## 5. IMPROVEMENTS BEYOND THE MINIMUM SPEC
- **Result-Status Filter (MATCHED / REGISTERED / ORPHAN / All)**
  - **What it is:** A UI dropdown/toggle that hides/shows rows in the result table based on their status.
  - **Why added:** Directly addresses the optional requirement (Criterion F) and solves the user pain of navigating a potentially large result set.
  - **Cost:** Adds minor UI state (`activeFilter`) and DOM class-toggling logic. Requires tests to ensure that the summary counts remain unaffected by the view filter.
  - **Scope Check:** Does not require backend persistence, URL routing, or network calls. Purely client-side UI manipulation.

## 6. WHAT WAS DEFERRED / EXPLICITLY NOT DONE
- **CSV/Excel File Upload and Export:** While highly useful for a real-world tool, parsing files was skipped to adhere strictly to the "no file upload" and "in-memory for this session" constraints. It introduces async data handling outside the scope of this assignment.
- **Persistent State (LocalStorage/Cookies):** Saving the user's manual edits across page reloads was deferred. It adds state synchronization complexity and violates the boundary of keeping this a single-session ephemeral report.
- **Advanced Data Grids (Pagination / Column Sorting):** We opted for standard HTML tables rather than importing a heavy grid library (like AG Grid). The reviewer explicitly penalizes over-engineering, and the rule against re-sorting by ID (Rule 5) makes column sorting counterproductive to the core contract.
