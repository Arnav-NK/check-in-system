# Festival Check-In Join Explorer — Build Log

**Process Documentation · AI-Assisted Engineering**  

| | |
|---|---|
| **Project** | Festival Check-In Join Explorer |
| **Assistant** | Google Antigravity (Calude 4.6 opus for planning, Gemini 3.8 Flash for implementation) |
| **Scope Logged** | Phase 1 through Phase 6 (Planning to Live-Modification Readiness) |

---

## My Working Philosophy: AI as an Accelerating Junior Engineer

I established four ground rules before writing a single prompt:

1. **Simplicity Over Hype:** Reject heavy frameworks (React, Next.js, Webpack) if vanilla HTML/JS/CSS can accomplish the interactive report cleanly and with 100% explainability.
2. **Purity Before Presentation:** Business logic (validation, the relational join, and ordering) must exist as pure functions completely decoupled from DOM manipulation and the UI.
3. **Challenge and Verify:** Never accept an AI plan without making it defend the rejected alternatives, specifically concerning how the most rigorous frozen constraints are guaranteed.
4. **I Own the Architecture:** If the AI's implementation creates a risk of silent failures or couples the UI to business logic, I step in, diagnose the root cause, and mandate the fix.

---

## Initial Direction: Rejecting the Heavy Web Framework

Before kicking off the formal phases, I constrained the AI's technology selection.

**What I Prompted:**
> *"Propose the technology choice (language/framework, or SQL dialect + host shell) in 2-3 sentences with a one-line justification tied to 'simplicity + explainability,' per the constraint above."*

**Why I Made This Choice:**
In a timed technical assignment, reviewers heavily penalize over-engineering. A complex web app introduces build steps, massive `node_modules`, and layers of abstraction that distract from the core algorithmic requirements. The data is small, in-memory, and requires a simple interactive UI. By forcing a plain Vanilla JavaScript Single-Page Application (SPA) inside a single `index.html` file, I eliminated all external dependencies and made every single line of code directly inspectable in the browser without any setup.

---

## Phase 1 — Planning with Concrete Checkpoints

> *Goal: Force the AI into an accountable roadmap with falsifiable exit gates.*

**Summary of My Prompt:**
I assigned the AI the role of Planning Agent and instructed it to generate a 3–5 step plan in `PLAN.md`. Crucially, I demanded that every step include a verifiable checkpoint (e.g. *"join function returns the 5-row built-in result in contracted order with counts 2/2/1"* rather than vague milestones like *"comparison works"*). I also asked for a final list of risks and friction points.

**How the AI Responded:**
The AI produced a 5-step roadmap spanning data modeling, pure functional joins, UI rendering, headless test suites, and package readiness. It flagged exact edge cases (e.g., rendering the `" — "` placeholders and guaranteeing orphan check-in order) as primary friction points.

**My Design Takeaway:**
Demanding concrete checkpoints forced the AI to design for testability. Because the checkpoints required verifying specific outputs (`2/2/1`), the AI instinctively separated the core logic into pure functions that could be evaluated without touching the DOM.

---

## Phase 2 — Architecture & Relational Constraint Defense

> *Goal: Make the AI justify its data structures against the hardest contract edge cases.*

**Summary of My Prompt:**
I instructed the AI to act as an Architecture Design Agent and write `ARCHITECTURE.md` without writing any implementation code. I asked for explicit justifications on three critical stress points:
1. How the join is implemented (specifically addressing the "exactly one" check-in rule when per-table uniqueness is already enforced).
2. How row ordering is guaranteed (preserving input order vs. sorting).
3. Where validation happens (whole-table vs. per-row).

**Key Design Decisions I Enforced & Validated:**
- **Explicit Length Checks over Implicit Mappings:** I mandated that even though Rule 3 enforces uniqueness upstream, the join must defensively aggregate check-ins and explicitly check `matches.length === 1`. This mathematical enforcement guarantees Rule 4a independently of upstream logic.
- **Iteration Over Sorting:** Rule 5 demands preserving the original table order. I ensured the architecture iterated the native arrays (Registrations first, Check-ins second) rather than throwing data into a unified array and attempting to `.sort()` it, preventing brittle derived sorting logic.
- **Atomic Whole-Pair Validation on Compare:** Validating on keystrokes causes UI thrashing. Validating everything exactly when the user hits "Compare" guarantees that the engine either perfectly executes the join or perfectly clears the screen per Rule 8.

---

## Phase 3 — Implementation & Pure Functional Decoupling

> *Goal: Build the engine as decoupled pure functions before wiring the browser UI.*

**Summary of My Prompt:**
I instructed the Implementation Agent to build strictly to the architecture. The pure functions (`validateTable`, `compareTables`, `summarize`) had to be implemented and callable *before* any UI wiring was written. The UI was restricted to simple DOM reads and writes using standard `<input>` fields for edits.

**How the AI Acted:**
The AI delivered a robust `index.html` file. The pure functions were constructed immaculately, and the spreadsheet-style UI was tied to them using a clean controller layer (`handleCompare`). The AI self-ran all Acceptance Criteria (A-E) and reported full success.

**My Review of the Code:**
The core functional separation was flawless. The `results-tbody` DOM node only renders the finalized objects provided by `compareTables()`, performing no data derivation of its own. 

---

## Phase 4 — Unit Testing & The Boundary Trap

> *Goal: Build an independent unit test suite that tests logic directly, not through the UI.*

**Summary of My Prompt:**
I instructed the Test Engineering Agent to write focused unit tests. I explicitly banned testing through the UI, mandating tests that target the pure functions directly. I requested a Group 1-6 testing matrix covering the built-in oracle, empty tables, duplicates, blank IDs, and sorting rules, outputting to `TEST_EVIDENCE.md`.

**The Problem-Solving Moment (UI Placeholder Rendering):**
While constructing the UI rendering strategy, we hit a subtle design boundary regarding the missing data `" — "` placeholders (Rule 6).
- *The Trap:* A standard approach is to let the UI rendering layer use ternary operators to decide what to show (e.g., `<td>${row.gate || '—'}</td>`). This leaks business logic into the view layer.
- *How It Was Solved:* I forced the resolution directly inside the pure function `compareTables`. The function explicitly creates objects with `gate: '—'` or `student: '—'`. This strictly decouples the UI from the domain rules, and allowed Group 1 unit tests (`test_builtin_row_fields`) to mathematically assert the placeholder strings without needing a headless browser.

---

## Where I Overruled the AI: Hands-On Audit & Iterative Refinement

While planning the testing and QA phases, I actively guided the AI away from its standard operating procedures to ensure maximum compliance and rigor.

### 1. Overriding the Join Uniqueness Assumption
* **What the AI wanted:** To use a simple `Map.has(id)` check to find a match, silently assuming the upstream validation would prevent multiple check-ins.
* **Why I overruled it:** Silent dependencies break scaling. I commanded the AI to aggressively capture *all* matches in a lookup index array and explicitly assert `matches.length === 1`. This defensive programming separates concerns.

### 2. Overriding UI-Centric Testing
* **What the AI wanted:** To write hypothetical DOM-click assertions (like `document.getElementById('compare').click()`).
* **Why I overruled it:** DOM tests are brittle and slow. By mandating a custom Node.js `test.js` script that evaluated only the isolated arrays and objects, I ensured the tests ran in milliseconds and proved the algorithmic core was 100% sound.

### 3. Forcing Live-Modification Scenarios
* **What the AI wanted:** To finish at Phase 5 with a basic design summary.
* **Why I overruled it:** Technical interviews often involve a "curveball" refactor. I forced the AI to act as a *Live-Modification Readiness Agent* (Phase 6), drafting exact scenarios (like implementing a composite key of `ID + Gate`). By doing so, I preemptively audited my own architecture to see where it would break and how easily it could adapt.

---

## Key Decisions & Takeaways

| Decision Point | AI Suggested | What I Decided / Overruled | Why I Did It |
|---|---|---|---|
| **Tech Stack** | Heavy Web Framework | Plain Vanilla `index.html` (JS/CSS) | Zero dependencies, no `npm install`, 100% inspectable without build tools. |
| **Handling Rule 4a (1:1 Match)** | Implicit `Map` trust | Explicit `matches.length === 1` check | Defensive programming; mathematically enforces the contract irrespective of validation logic. |
| **Missing Field Rendering** | Template fallback (`|| '—'`) | Pure Function Object Injection | Kept the UI "dumb"; enabled headless unit tests to verify exact string outputs. |
| **Row Ordering (Rule 5)** | Unified array sorting | Native Array Iteration | Structurally guaranteed the original sequence without relying on artificial derived sort keys. |
| **Testing Methodology** | DOM/Browser manipulation | Custom Node.js Headless Script | Eliminated brittle UI tests, testing the core pure functions directly against raw JSON inputs. |

### Summary
Using AI effectively requires orchestrating it with rigid boundaries. By setting strict architectural constraints, demanding pure functional logic, and forcing the AI to defend its testing methodology without touching a browser DOM, I transformed the AI from a chaotic code-generator into an accountable, disciplined engineering team.
