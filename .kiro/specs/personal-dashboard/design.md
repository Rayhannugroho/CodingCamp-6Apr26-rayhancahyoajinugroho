# Design Document: Personal Dashboard

## Overview

A single-page personal dashboard built with plain HTML, CSS, and Vanilla JavaScript. It replaces or complements the browser new-tab page and runs entirely client-side — no build step, no backend, no external dependencies. All state is persisted in `localStorage` as JSON.

The application is delivered as a single `index.html` file, one stylesheet (`css/style.css`), and one script (`js/app.js`). On load the script reads `localStorage`, hydrates the UI, and wires up all event listeners.

---

## Architecture

The app follows a simple **data → render → event** cycle:

```
localStorage  ──read──▶  AppState (in-memory)  ──render──▶  DOM
                                 ▲                              │
                                 └──────── event handlers ◀────┘
```

- **AppState** is a plain JS object that is the single source of truth at runtime.
- Every user action mutates AppState, then calls the relevant render function, then persists to `localStorage`.
- There is no virtual DOM or reactive framework; render functions are idempotent and re-draw their section of the DOM from scratch.

### File Structure

```
index.html
css/
  style.css
js/
  app.js
```

### Module Sections inside `app.js`

`app.js` is organised into clearly commented sections:

1. **Constants** — storage keys, timer duration, sort modes
2. **State** — the single `AppState` object
3. **Storage** — `loadState()` / `saveState()` helpers
4. **Greeting** — time/date display and name personalisation
5. **Timer** — countdown logic
6. **Tasks** — add, edit, complete, delete, sort
7. **Links** — add, delete, open
8. **Theme** — light/dark toggle
9. **Init** — bootstraps everything on `DOMContentLoaded`

---

## Components and Interfaces

### Greeting Component

Reads `Date` every minute via `setInterval`. Derives the salutation from the current hour.

```
greetingRender(state)
  → updates #greeting-time, #greeting-date, #greeting-salutation, #greeting-name
```

Name editing: clicking the name element turns it into an `<input>`. On blur/Enter the new value is saved to state and storage.

### Timer Component

Internal state: `{ remaining: 1500, intervalId: null }` (seconds).

```
timerStart()   → sets interval, updates start-button aria/class
timerStop()    → clears interval
timerReset()   → clears interval, sets remaining = 1500, re-renders
timerTick()    → decrements remaining, re-renders; if 0 → stop + alert
timerRender()  → formats MM:SS, writes to #timer-display
```

### Tasks Component

```
taskAdd(label)         → validates, appends to state.tasks, render, save
taskEdit(id, label)    → validates, updates label, render, save
taskToggle(id)         → flips completed, render, save
taskDelete(id)         → removes from array, render, save
taskSort(mode)         → sets state.sortMode, render (no save — sort is view-only)
tasksRender(state)     → clears #task-list, re-renders all tasks in sort order
```

Each task object: `{ id: string, label: string, completed: boolean }`.

### Links Component

```
linkAdd(label, url)    → validates, appends to state.links, render, save
linkDelete(id)         → removes, render, save
linksRender(state)     → clears #links-panel, re-renders all link buttons
```

Each link object: `{ id: string, label: string, url: string }`.

### Theme Component

```
themeApply(theme)      → sets data-theme attribute on <html>, updates toggle button
themeToggle()          → flips theme, save
```

On init, if no stored theme, reads `window.matchMedia('(prefers-color-scheme: dark)')`.

### Storage Module

```
loadState() → AppState   // reads localStorage, parses JSON, falls back to defaults on error
saveState(state)         // serialises AppState to JSON, writes to localStorage
```

Storage keys:
- `pd_tasks`
- `pd_links`
- `pd_name`
- `pd_theme`

---

## Data Models

### AppState (runtime)

```js
{
  name: string,          // "" when not set
  theme: "light" | "dark",
  sortMode: "default" | "incomplete-first" | "completed-first",
  tasks: Task[],
  links: Link[]
}
```

### Task

```js
{
  id: string,            // crypto.randomUUID() or Date.now().toString()
  label: string,         // non-empty
  completed: boolean
}
```

### Link

```js
{
  id: string,
  label: string,         // non-empty
  url: string            // must pass URL constructor validation
}
```

### localStorage Layout

All keys are prefixed `pd_` to avoid collisions.

| Key | Value |
|---|---|
| `pd_tasks` | `JSON.stringify(Task[])` |
| `pd_links` | `JSON.stringify(Link[])` |
| `pd_name` | `JSON.stringify(string)` |
| `pd_theme` | `"light"` or `"dark"` |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Time format is always HH:MM

*For any* `Date` object, the time-formatting function should return a string that matches the pattern `HH:MM` (two-digit hour, colon, two-digit minute).

**Validates: Requirements 1.1**

---

### Property 2: Date format contains day-of-week, month name, and day number

*For any* `Date` object, the date-formatting function should return a string that contains a recognisable day-of-week name, a month name, and a numeric day number.

**Validates: Requirements 1.2**

---

### Property 3: Salutation covers all 24 hours correctly

*For any* integer hour in [0, 23], the `getSalutation(hour)` function should return exactly one of "Good morning" (hours 5–11), "Good afternoon" (hours 12–17), "Good evening" (hours 18–21), or "Good night" (hours 22–23 and 0–4), with no hour left unhandled.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

---

### Property 4: Greeting format is correct for any name

*For any* name string (including the empty string), the greeting render function should produce output that contains the salutation, and — if the name is non-empty — also contains the name; if the name is empty the output should not contain a trailing comma or extra whitespace.

**Validates: Requirements 2.1, 2.3, 2.4**

---

### Property 5: Name persistence round-trip

*For any* name string, saving it via `saveState` and then loading it via `loadState` should return the same name string.

**Validates: Requirements 2.2**

---

### Property 6: Timer countdown is monotonically decreasing

*For any* number of ticks N where 0 ≤ N ≤ 1500, after starting the timer and firing N ticks, the remaining value should equal 1500 − N, and the timer should be running if and only if N < 1500.

**Validates: Requirements 3.2, 3.4, 3.6**

---

### Property 7: Timer reset returns to initial state

*For any* timer state (running or stopped, any remaining value), calling `timerReset()` should set remaining to 1500 and set the timer to a stopped state.

**Validates: Requirements 3.1, 3.5**

---

### Property 8: Timer active state is reflected in UI

*For any* timer state, the start-button's active CSS class and aria-pressed attribute should be present if and only if the timer is currently running.

**Validates: Requirements 3.7**

---

### Property 9: Adding a valid task appends it with completed=false

*For any* non-empty, non-whitespace-only task label, calling `taskAdd(label)` should increase the task list length by exactly 1, and the new task should have `completed === false` and `label` equal to the trimmed input.

**Validates: Requirements 4.2**

---

### Property 10: Adding an empty or whitespace-only task is rejected

*For any* string composed entirely of whitespace (including the empty string), calling `taskAdd(label)` should leave the task list unchanged.

**Validates: Requirements 4.3**

---

### Property 11: State persistence round-trip

*For any* valid `AppState` (containing any combination of tasks, links, name, and theme), serialising it with `saveState` and then deserialising it with `loadState` should produce a structurally equivalent `AppState`.

**Validates: Requirements 4.4, 4.5, 5.7, 7.5, 7.6, 8.2, 9.3, 10.1, 10.2**

---

### Property 12: Edit pre-fills with current label

*For any* task, entering edit mode should produce a rendered input element whose value equals the task's current label.

**Validates: Requirements 5.1**

---

### Property 13: Confirming a non-empty edit updates the label

*For any* task and any non-empty new label, confirming the edit should set the task's label to the new value; confirming with an empty string should leave the original label unchanged.

**Validates: Requirements 5.2, 5.3**

---

### Property 14: Completion toggle is an involution

*For any* task, toggling its completion state twice should return it to its original `completed` value (i.e., `toggle(toggle(task)).completed === task.completed`).

**Validates: Requirements 5.4**

---

### Property 15: Completed tasks are rendered with struck-through style

*For any* task with `completed === true`, the rendered task element should carry the CSS class that applies a strikethrough style; tasks with `completed === false` should not carry that class.

**Validates: Requirements 5.5**

---

### Property 16: Deleting an item removes it from the collection

*For any* collection (tasks or links) and any item in that collection, after calling the corresponding delete function the item's `id` should no longer appear in the collection.

**Validates: Requirements 5.6, 8.1**

---

### Property 17: Sort does not mutate stored order

*For any* task list and any sort mode, applying `taskSort(mode)` should not change the order of tasks in `AppState.tasks` (the canonical stored array); only the rendered order should differ.

**Validates: Requirements 6.2, 6.3**

---

### Property 18: Adding a valid link appends it to the collection

*For any* non-empty label and URL string that passes `new URL(url)` without throwing, calling `linkAdd(label, url)` should increase the links collection length by exactly 1.

**Validates: Requirements 7.2**

---

### Property 19: Adding an invalid link is rejected

*For any* input where the label is empty or the URL fails `new URL(url)` validation, calling `linkAdd(label, url)` should leave the links collection unchanged.

**Validates: Requirements 7.3**

---

### Property 20: Theme toggle is an involution

*For any* current theme ("light" or "dark"), calling `themeToggle()` twice should return the dashboard to the original theme, and the `data-theme` attribute on `<html>` should match the current theme at every step.

**Validates: Requirements 9.2**

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| `localStorage` unavailable (e.g., private browsing quota exceeded) | `saveState` catches the exception silently; the app continues with in-memory state |
| `localStorage` contains malformed JSON | `loadState` catches `JSON.parse` errors and returns the default `AppState` |
| `taskAdd` called with empty/whitespace label | Returns early without mutating state; renders an inline validation message |
| `linkAdd` called with empty label or invalid URL | Returns early without mutating state; renders an inline validation message |
| `taskEdit` confirmed with empty label | Retains original label, exits edit mode |
| Timer reaches 00:00 | Timer stops, `window.alert` fires with a session-complete message |
| `new URL(url)` throws on link submission | Treated as invalid URL; submission rejected |

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:

- **Unit tests** cover specific examples, integration points, and edge cases (e.g., malformed localStorage, OS theme detection, timer initialisation).
- **Property-based tests** verify universal invariants across randomly generated inputs, catching edge cases that hand-written examples miss.

### Property-Based Testing

**Library**: [fast-check](https://github.com/dubzzz/fast-check) (JavaScript, no build step required via CDN or npm).

Each property-based test must:
- Run a minimum of **100 iterations** (fast-check default is 100; set `numRuns: 100` explicitly).
- Include a comment tag in the format:
  `// Feature: personal-dashboard, Property N: <property text>`
- Map 1-to-1 with a property defined in the Correctness Properties section above.

**Property test list** (one test per property):

| Test | Property | fast-check arbitraries |
|---|---|---|
| Time format | Property 1 | `fc.date()` |
| Date format | Property 2 | `fc.date()` |
| Salutation coverage | Property 3 | `fc.integer({ min: 0, max: 23 })` |
| Greeting format | Property 4 | `fc.string()` |
| Name persistence round-trip | Property 5 | `fc.string()` |
| Timer countdown | Property 6 | `fc.integer({ min: 0, max: 1500 })` |
| Timer reset | Property 7 | `fc.integer({ min: 0, max: 1500 })`, `fc.boolean()` |
| Timer UI state | Property 8 | `fc.boolean()` |
| Valid task add | Property 9 | `fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)` |
| Invalid task add | Property 10 | `fc.stringOf(fc.constantFrom(' ', '\t', '\n'))` |
| State round-trip | Property 11 | composed `AppState` arbitrary |
| Edit pre-fill | Property 12 | task arbitrary |
| Edit confirm | Property 13 | task arbitrary + `fc.string()` |
| Toggle involution | Property 14 | task arbitrary |
| Completed styling | Property 15 | task arbitrary |
| Delete removes item | Property 16 | array + item arbitrary |
| Sort does not mutate | Property 17 | task array + sort mode arbitrary |
| Valid link add | Property 18 | `fc.webUrl()` + `fc.string({ minLength: 1 })` |
| Invalid link add | Property 19 | invalid URL strings + empty labels |
| Theme toggle involution | Property 20 | `fc.constantFrom('light', 'dark')` |

### Unit Tests

Unit tests (using a simple test runner such as [uvu](https://github.com/lukeed/uvu) or plain `assert` with Node's built-in test runner) should cover:

- Timer initialises at 1500 seconds (Requirement 3.1 — specific example)
- `loadState` returns defaults when `localStorage` is empty (Requirement 10.3 edge case)
- `loadState` returns defaults when `localStorage` contains invalid JSON (Requirement 10.3 edge case)
- Theme defaults to OS preference when no stored theme exists (Requirement 9.4 edge case)
- Sort control cycles through all three modes in order (Requirement 6.1 example)
- Link button opens URL in new tab (Requirement 7.4 — example with `window.open` mock)
- DOM contains task input field and submit button on load (Requirement 4.1 example)
- DOM contains link label/URL inputs and submit button on load (Requirement 7.1 example)
- DOM contains theme toggle button on load (Requirement 9.1 example)
