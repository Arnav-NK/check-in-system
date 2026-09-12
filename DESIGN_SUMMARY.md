# Design Summary

## Architecture Decisions & Justifications

- **Array-Based Storage:** Used arrays instead of mapping objects as the source of truth, natively guaranteeing Rule 5's original input order preservation.
- **Isolated Validation (`validateTable`):** Created a pure, independently executable validation function to allow the UI to immediately halt and clear errors before touching the join logic (Rule 8).
- **Sequential Array Join:** Performed the left-join and anti-join via loop traversal rather than array sorting, mathematically preventing accidental ID-based reordering.
- **Explicit Reset vs Re-Compare:** Separated `reset` (which destroys edits and restores frozen constants) from `compare` (which performs a fresh validation on current DOM state), ensuring stale results are never shown.

## AI Influence

- **Where AI suggestion changed approach:** The AI prompted the design to utilize a single, zero-dependency `index.html` file housing both the ES6 modules and the DOM scripts, actively sidestepping heavy build tools (Webpack/React) to honor the reviewer's penalty for over-engineering. 
- **Where I overrode it:** I initially intended to lean purely on the upstream `DUPLICATE_KEY` validation to guarantee a strict 1:1 join relationship. However, prompted by the rigorous constraints, I overrode this shortcut and implemented explicit length-checking (`matches.length === 1`) in the check-in map. This decoupled Rule 4a from Rule 3, ensuring the join mathematically enforces "exactly one" independently.

## Trade-offs

### Prioritized
- **Result-Status View Filter:** Implemented a pure-client-side toggle to quickly navigate the 5-row outcome, addressing reviewer/user navigation pain.
- **Inline Validation Banners:** Added immediate, bright UI feedback indicating precisely *which* table and *which* ID failed validation to prevent "silent failure" confusion.
- **Pure Function Isolation:** Sacrificed tight component coupling in favor of extracting logic that can be tested in a headless Node environment.

### Deferred
- **File Upload & Parsing (CSV):** Skipped entirely, as it violates the ephemeral "in-memory session" constraint and adds complex asynchronous overhead.
- **Persistent Storage (LocalStorage):** Skipped preserving user edits across reloads to keep state explicitly tied to the current DOM instance.
- **Complex Data Grids (AG Grid/Sorting):** Skipped sortable columns, as Rule 5 explicitly outlaws re-sorting the original ID sequence.
