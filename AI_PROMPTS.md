# AI Interaction Documentation

## 1. Prompts Used (Phases 0-4)

- **Phase 0 (Initialization):** _"You are orchestrating a small multi-agent software build in Antigravity for a timed technical assignment. Do not write application code yet. TASK: Build a 'Festival Check-In Join Explorer' per the frozen specification below..."_
- **Phase 1 (Planning):** _"ROLE: Planning Agent. INPUT: The frozen specification above. OUTPUT FILE: PLAN.md. Produce a 3–5 step ordered implementation plan... End PLAN.md with a short 'Risks / things likely to need a second pass' list."_
- **Phase 2 (Architecture):** _"ROLE: Architecture Design Agent. You are NOT writing implementation code in this phase. Produce an Architecture Design Report with these sections... For at least these three decision points, document: the option chosen, the alternative(s) rejected, and why..."_
- **Phase 3 (Implementation):** _"ROLE: Implementation Agent. INPUT: PLAN.md, ARCHITECTURE.md, frozen specification. OUTPUT: Working application + sample data wiring. Build strictly to ARCHITECTURE.md's decomposition. Concretely implement, as independently callable pure functions before any UI wiring..."_
- **Phase 4 (Test Engineering):** _"ROLE: Test Engineering Agent. INPUT: The implementation's pure functions, frozen specification. OUTPUT: A unit test suite... Write focused unit tests. Do not test through the UI — target the pure functions directly."_

## 2. Iteration Example (Refining the Join Logic)

- **Initial Broad Assumption:** A standard left-join typically uses a `Map<String, Object>` for O(1) lookups. I initially assumed that since Rule 3 already enforces per-table uniqueness (rejecting duplicate Check-in IDs), a simple `Map.has(id)` check would suffice for Rule 4a's requirement to produce `MATCHED` "when exactly one check-in shares its ID."
- **Specific Constraint Added:** The Phase 2 prompt tightened this by asking me to justify how Rule 4a is implemented *despite* Rule 3 upstream validation.
- **Why the Refinement Was Needed:** To prevent brittle coupling. Relying on Rule 3 to magically satisfy Rule 4a meant if validation logic ever changed, the join logic would silently fail its contract. I refined the architecture to use a `Map<String, Array<Object>>` index, actively aggregating occurrences, and explicitly checking `matches.length === 1` to defensively guarantee the mathematical truth of Rule 4a.

## 3. Problem-Solving Example (UI Placeholder Renderings)

- **The Gap (Phase 3 Execution):** While planning the UI, I realized that delegating the placeholder rendering (the `" — "`) to the HTML templates created a risky dependency where the UI engine was executing business logic (i.e., checking `if (status === 'ORPHAN_CHECK_IN') { render('—') }`).
- **The Resolution:** I resolved this within the pure functions. The `compareTables` function was modified to directly inject the `'—'` string into the unified result object properties if they were undefined for that row's status. This guaranteed that the UI remains a "dumb" renderer, and the missing fields rule (Rule 6) can be asserted cleanly in the headless unit tests (Group 1 - `test_builtin_row_fields`).
