# QA & Live-Modification Readiness (VERIFICATION.md)

## 1. Acceptance Criteria Re-Run (Fresh QA Pass)

- **Criterion A (Built-in Data Load & Run):** 
  - *Expected:* One action loads built-in tables, producing 5 result rows in exact order.
  - *Actual:* Opening `index.html` fires `window.onload`, invoking `reset()` and `handleCompare()`. Exact rows rendered: `F101` (MATCHED), `F102` (REGISTERED_ONLY), `F103` (MATCHED), `F104` (REGISTERED_ONLY), `F999` (ORPHAN_CHECK_IN).
  - *Status:* PASS. No blocker.
- **Criterion B (Specific MATCHED/Statuses & Counts):**
  - *Expected:* F101/F103 = MATCHED; F102/F104 = REGISTERED_ONLY; F999 = ORPHAN. Counts = 2 / 2 / 1.
  - *Actual:* The DOM string `#summary-counts` outputs exactly `"2 matched, 2 registered only, 1 orphan check-in."` Rows map statuses correctly per the spec.
  - *Status:* PASS. No blocker.
- **Criterion C (Empty Check-ins):**
  - *Expected:* Clearing Check-ins yields 4 REGISTERED_ONLY rows, 0 MATCHED, 0 ORPHAN.
  - *Actual:* Manually clicking 'X' on all 3 check-in input rows and pressing 'Compare' dynamically removes `F999`, recalculates `F101` and `F103` to `REGISTERED_ONLY`, and outputs exactly 4 rows. Summary displays `"0 matched, 4 registered only, 0 orphan check-in."`
  - *Status:* PASS. No blocker.
- **Criterion D (Duplicate F101 Check-in):**
  - *Expected:* Adding a second F101 row reports `DUPLICATE_KEY` naming "Check-ins" and "F101", clearing results/counts.
  - *Actual:* Added an F101 row, clicked 'Compare'. The red `#error-box` displays `"Validation Error [DUPLICATE_KEY]: Table 'Check-ins' contains a duplicate ID 'F101'."` The results `<tbody>` collapses to 0 rows. The summary reads `"No results. Please Compare."`
  - *Status:* PASS. No blocker.
- **Criterion E (Sync Maintained):**
  - *Expected:* State synchrony guaranteed across interactions.
  - *Actual:* Due to the `handleCompare` function overwriting `lastResults` entirely or zeroing it on fail, it is impossible for stale rows to outlive a new validation failure.
  - *Status:* PASS. No blocker.

## 2. Quick Startup Instructions

*To run this application from a completely cold start, perform the following:*

1. Open your native file explorer (Windows Explorer / Finder).
2. Double-click the `index.html` file to open it in your default web browser (or drag and drop it into Chrome/Edge/Firefox).
3. **That's it.** No `npm install`, no local dev server, no Node.js dependency, and no build steps are required. The built-in oracle data initializes and compares automatically on page load.

## 3. Rehearsed "Live Modification" Scenarios

### Scenario 1: Feature Extension (UI Filter)
- **The Prompt:** *"Add an 'ORPHAN_CHECK_IN Only' and 'MATCHED Only' filter to the UI drop-down that hides non-matching rows, but ensure the summary text string still displays the total 2/2/1 count of the underlying data, not just the filtered subset's count."*
- **What to verify live:** I would verify that selecting 'MATCHED' hides F102, F104, and F999 in the DOM. Crucially, I would point the interviewer to `test_builtin_counts` in `test.js` to prove that because our `summarize()` function iterates the *pure state* rather than `document.querySelectorAll`, the counts cannot legally break when the view changes.

### Scenario 2: Architectural Stress Test (Composite Key)
- **The Prompt:** *"Refactor `validateTable` and `compareTables` to use a composite key consisting of `Registration ID + Gate` instead of just `Registration ID`. Update the index Maps and validation Sets to use `id.trim() + '|' + gate.trim()`."*
- **What to verify live:** I would trace what breaks. The pure functions will immediately fail the Group 5 unit tests because the tests inject rows missing the `gate` field. Furthermore, the Registrations table data model does not *have* a `gate` field, proving that a composite key mapping requires a schema migration on the Registrations side before the join can even logically execute. This showcases that the isolated architecture *prevents* silent failures by failing early in the tests.

## 4. Fragile / Manual Touchpoints

*To avoid surprises during a live interview, be aware of the following hard-coded touchpoints:*
- **The "—" Placeholder Mapping:** Inside `compareTables`, the missing fields are explicitly hardcoded (`gate: '—', time: '—'`). If the interviewer asks to add a new `Dietary Preference` column to the Registrations table, we must remember to manually add `diet: '—'` to the `ORPHAN_CHECK_IN` object creation logic, otherwise it will output `undefined`.
- **String Literals:** The filter logic (`r.status === filter`) relies on strict string matching for `'MATCHED'`, `'REGISTERED_ONLY'`, etc. Changing the status string to title-case (`'Matched'`) in the core logic will silently break the UI filter dropdown if the `<option value="...">` is not simultaneously updated.
- **DOM Columns Match Logic:** The `readTable()` function dynamically maps `input.dataset.col` to object properties. The HTML `data-col` attributes must exactly match the JavaScript object keys, or the data won't map into the validation engine correctly.
