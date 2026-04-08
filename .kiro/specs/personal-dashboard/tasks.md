# Implementation Plan: Personal Dashboard

## Overview

Implement a client-side personal dashboard as a single `index.html` + `css/style.css` + `js/app.js` application. No build step, no backend, no external runtime dependencies. State is persisted in `localStorage` as JSON. Implementation follows the data → render → event cycle described in the design.

## Tasks

- [ ] 1. Scaffold project structure and HTML skeleton
  - Create `index.html` with semantic sections: greeting, timer, task list, quick links, theme toggle
  - Create `css/style.css` with CSS custom properties for light/dark themes and base layout
  - Create `js/app.js` with the eight commented sections (Constants, State, Storage, Greeting, Timer, Tasks, Links, Theme, Init)
  - _Requirements: 11.1, 11.4, 11.5_

- [ ] 2. Implement Storage module
  - [ ] 2.1 Implement `loadState()` and `saveState(state)` in the Storage section of `app.js`
    - Use storage keys `pd_tasks`, `pd_links`, `pd_name`, `pd_theme`
    - `loadState` must catch `JSON.parse` errors and return default `AppState`
    - `saveState` must catch quota/unavailability exceptions silently
    - _Requirements: 10.1, 10.2, 10.3_
  - [ ]* 2.2 Write property test for state persistence round-trip (Property 11)
    - **Property 11: State persistence round-trip**
    - **Validates: Requirements 4.4, 4.5, 5.7, 7.5, 7.6, 8.2, 9.3, 10.1, 10.2**
  - [ ]* 2.3 Write property test for name persistence round-trip (Property 5)
    - **Property 5: Name persistence round-trip**
    - **Validates: Requirements 2.2**
  - [ ]* 2.4 Write unit tests for Storage edge cases
    - `loadState` returns defaults when `localStorage` is empty
    - `loadState` returns defaults when `localStorage` contains invalid JSON
    - _Requirements: 10.3_

- [ ] 3. Implement Greeting component
  - [ ] 3.1 Implement time/date formatting helpers and `getSalutation(hour)`
    - Format time as HH:MM; format date with day-of-week, month name, and day number
    - `getSalutation` must cover all 24 hours: morning 5–11, afternoon 12–17, evening 18–21, night 22–4
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  - [ ]* 3.2 Write property test for time format (Property 1)
    - **Property 1: Time format is always HH:MM**
    - **Validates: Requirements 1.1**
  - [ ]* 3.3 Write property test for date format (Property 2)
    - **Property 2: Date format contains day-of-week, month name, and day number**
    - **Validates: Requirements 1.2**
  - [ ]* 3.4 Write property test for salutation coverage (Property 3)
    - **Property 3: Salutation covers all 24 hours correctly**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
  - [ ] 3.5 Implement `greetingRender(state)` and name inline editing
    - Update `#greeting-time`, `#greeting-date`, `#greeting-salutation`, `#greeting-name`
    - Clicking the name element converts it to an `<input>`; blur/Enter saves to state and storage
    - When name is empty, omit trailing comma/whitespace
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ]* 3.6 Write property test for greeting format (Property 4)
    - **Property 4: Greeting format is correct for any name**
    - **Validates: Requirements 2.1, 2.3, 2.4**
  - [ ] 3.7 Wire `setInterval` (60 s) in Init to call `greetingRender` every minute
    - _Requirements: 1.1_

- [ ] 4. Implement Timer component
  - [ ] 4.1 Implement `timerStart()`, `timerStop()`, `timerReset()`, `timerTick()`, and `timerRender()`
    - Internal state: `{ remaining: 1500, intervalId: null }`
    - `timerTick` decrements remaining, calls `timerRender`; at 0 stops and fires `window.alert`
    - `timerReset` sets remaining to 1500 and stops the interval
    - `timerRender` formats remaining as MM:SS and writes to `#timer-display`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 4.2 Write property test for timer countdown (Property 6)
    - **Property 6: Timer countdown is monotonically decreasing**
    - **Validates: Requirements 3.2, 3.4, 3.6**
  - [ ]* 4.3 Write property test for timer reset (Property 7)
    - **Property 7: Timer reset returns to initial state**
    - **Validates: Requirements 3.1, 3.5**
  - [ ] 4.4 Implement timer active-state UI (aria-pressed + CSS class on start button)
    - _Requirements: 3.7_
  - [ ]* 4.5 Write property test for timer UI state (Property 8)
    - **Property 8: Timer active state is reflected in UI**
    - **Validates: Requirements 3.7**
  - [ ]* 4.6 Write unit test: timer initialises at 1500 seconds on page load
    - _Requirements: 3.1_

- [ ] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Tasks component
  - [ ] 6.1 Implement `taskAdd(label)` with validation
    - Trim label; reject empty/whitespace-only with inline validation message
    - Append `{ id, label, completed: false }` to `state.tasks`, call `tasksRender`, call `saveState`
    - _Requirements: 4.1, 4.2, 4.3, 4.5_
  - [ ]* 6.2 Write property test for valid task add (Property 9)
    - **Property 9: Adding a valid task appends it with completed=false**
    - **Validates: Requirements 4.2**
  - [ ]* 6.3 Write property test for invalid task add (Property 10)
    - **Property 10: Adding an empty or whitespace-only task is rejected**
    - **Validates: Requirements 4.3**
  - [ ] 6.4 Implement `taskEdit(id, label)`, `taskToggle(id)`, `taskDelete(id)`
    - `taskEdit`: validate non-empty; if empty retain original label; exit edit mode; save
    - `taskToggle`: flip `completed`; save
    - `taskDelete`: remove by id; save
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 5.7_
  - [ ]* 6.5 Write property test for edit pre-fill (Property 12)
    - **Property 12: Edit pre-fills with current label**
    - **Validates: Requirements 5.1**
  - [ ]* 6.6 Write property test for edit confirm (Property 13)
    - **Property 13: Confirming a non-empty edit updates the label**
    - **Validates: Requirements 5.2, 5.3**
  - [ ]* 6.7 Write property test for completion toggle involution (Property 14)
    - **Property 14: Completion toggle is an involution**
    - **Validates: Requirements 5.4**
  - [ ] 6.8 Implement `tasksRender(state)` with completed styling
    - Clear and re-render `#task-list`; apply strikethrough CSS class to completed tasks
    - Render edit/complete/delete controls per task
    - _Requirements: 4.4, 5.5_
  - [ ]* 6.9 Write property test for completed task styling (Property 15)
    - **Property 15: Completed tasks are rendered with struck-through style**
    - **Validates: Requirements 5.5**
  - [ ]* 6.10 Write property test for delete removes item (Property 16 — tasks)
    - **Property 16: Deleting an item removes it from the collection**
    - **Validates: Requirements 5.6**

- [ ] 7. Implement Task Sort
  - [ ] 7.1 Implement `taskSort(mode)` and sort control cycling (default → incomplete-first → completed-first)
    - `taskSort` sets `state.sortMode` and calls `tasksRender`; does NOT mutate `state.tasks` array
    - Sort control label updates to reflect active mode
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ]* 7.2 Write property test for sort does not mutate stored order (Property 17)
    - **Property 17: Sort does not mutate stored order**
    - **Validates: Requirements 6.2, 6.3**
  - [ ]* 7.3 Write unit test: sort control cycles through all three modes in order
    - _Requirements: 6.1_

- [ ] 8. Implement Links component
  - [ ] 8.1 Implement `linkAdd(label, url)` with validation
    - Reject empty label or URL that fails `new URL(url)`; show inline validation message
    - Append `{ id, label, url }` to `state.links`, call `linksRender`, call `saveState`
    - _Requirements: 7.1, 7.2, 7.3, 7.5_
  - [ ]* 8.2 Write property test for valid link add (Property 18)
    - **Property 18: Adding a valid link appends it to the collection**
    - **Validates: Requirements 7.2**
  - [ ]* 8.3 Write property test for invalid link add (Property 19)
    - **Property 19: Adding an invalid link is rejected**
    - **Validates: Requirements 7.3**
  - [ ] 8.4 Implement `linkDelete(id)` and `linksRender(state)`
    - `linkDelete`: remove by id; save
    - `linksRender`: clear and re-render `#links-panel`; each button opens URL in new tab via `window.open`
    - _Requirements: 7.4, 7.6, 8.1, 8.2_
  - [ ]* 8.5 Write property test for delete removes item (Property 16 — links)
    - **Property 16: Deleting an item removes it from the collection**
    - **Validates: Requirements 8.1**
  - [ ]* 8.6 Write unit test: link button opens URL in new tab (mock `window.open`)
    - _Requirements: 7.4_

- [ ] 9. Implement Theme component
  - [ ] 9.1 Implement `themeApply(theme)` and `themeToggle()`
    - `themeApply`: set `data-theme` attribute on `<html>` and update toggle button state
    - `themeToggle`: flip theme between "light" and "dark"; call `saveState`
    - On init, if no stored theme, read `window.matchMedia('(prefers-color-scheme: dark)')`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [ ]* 9.2 Write property test for theme toggle involution (Property 20)
    - **Property 20: Theme toggle is an involution**
    - **Validates: Requirements 9.2**
  - [ ]* 9.3 Write unit test: theme defaults to OS preference when no stored theme exists
    - _Requirements: 9.4_

- [ ] 10. Wire everything together in Init
  - [ ] 10.1 Implement the `DOMContentLoaded` Init section
    - Call `loadState()`, then call all render functions (`greetingRender`, `timerRender`, `tasksRender`, `linksRender`, `themeApply`)
    - Attach all event listeners (timer controls, task form, task list delegation, link form, theme toggle, greeting name click)
    - Start the 60-second greeting interval
    - _Requirements: 4.4, 7.6, 10.2, 11.3_
  - [ ]* 10.2 Write unit tests for DOM structure on load
    - DOM contains task input field and submit button
    - DOM contains link label/URL inputs and submit button
    - DOM contains theme toggle button
    - _Requirements: 4.1, 7.1, 9.1_

- [ ] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use [fast-check](https://github.com/dubzzz/fast-check) with `numRuns: 100` and a comment tag `// Feature: personal-dashboard, Property N: <property text>`
- Unit tests use Node's built-in test runner (`node:test`) or [uvu](https://github.com/lukeed/uvu)
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
