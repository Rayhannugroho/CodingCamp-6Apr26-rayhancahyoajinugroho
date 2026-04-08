# Requirements Document

## Introduction

A personal dashboard web app intended to replace or complement the browser new tab page. Built with plain HTML, CSS, and Vanilla JavaScript — no frameworks, no backend. All data is persisted client-side via the browser's Local Storage API. The dashboard provides a greeting with time/date, a Pomodoro-style focus timer, a to-do list, and a quick links panel. Optional enhancements include light/dark mode, a custom name in the greeting, and task sorting.

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Storage**: The browser's Local Storage API used to persist user data.
- **Timer**: The 25-minute countdown focus timer component.
- **Task**: A single to-do item with a text label and a completion state.
- **Task_List**: The collection of Tasks displayed and managed by the Dashboard.
- **Link**: A user-defined label and URL pair stored as a quick-access button.
- **Quick_Links**: The panel that displays and manages Links.
- **Greeting**: The section that shows the current time, date, and a time-of-day salutation.
- **Theme**: The visual color scheme of the Dashboard, either light or dark.

---

## Requirements

### Requirement 1: Display Greeting with Time and Date

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the dashboard, so that I have an at-a-glance overview of the moment.

#### Acceptance Criteria

1. THE Greeting SHALL display the current time in HH:MM format, updated every minute.
2. THE Greeting SHALL display the current date including the day of the week, month, and day number.
3. WHEN the current hour is between 05:00 and 11:59, THE Greeting SHALL display "Good morning".
4. WHEN the current hour is between 12:00 and 17:59, THE Greeting SHALL display "Good afternoon".
5. WHEN the current hour is between 18:00 and 21:59, THE Greeting SHALL display "Good evening".
6. WHEN the current hour is between 22:00 and 04:59, THE Greeting SHALL display "Good night".

---

### Requirement 2: Custom Name in Greeting

**User Story:** As a user, I want to personalise the greeting with my name, so that the dashboard feels tailored to me.

#### Acceptance Criteria

1. THE Greeting SHALL include an editable name field that displays the stored name alongside the time-of-day salutation.
2. WHEN the user submits a new name, THE Storage SHALL persist the name so that it survives page reloads.
3. WHEN no name has been stored, THE Greeting SHALL display the salutation without a name suffix.
4. WHEN a stored name exists, THE Greeting SHALL display the salutation followed by the stored name (e.g., "Good morning, Alex").

---

### Requirement 3: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can time focused work sessions.

#### Acceptance Criteria

1. THE Timer SHALL initialise at 25:00 (twenty-five minutes, zero seconds) on page load.
2. WHEN the user activates the start control, THE Timer SHALL begin counting down one second at a time.
3. WHILE the Timer is counting down, THE Timer SHALL update the displayed time every second.
4. WHEN the user activates the stop control, THE Timer SHALL pause the countdown at the current value.
5. WHEN the user activates the reset control, THE Timer SHALL return to 25:00 and stop counting.
6. WHEN the countdown reaches 00:00, THE Timer SHALL stop automatically and notify the user with a browser alert.
7. WHILE the Timer is counting down, THE Dashboard SHALL reflect the active state visually on the start control.

---

### Requirement 4: To-Do List — Add and Display Tasks

**User Story:** As a user, I want to add tasks to a list and see them displayed, so that I can track what I need to do.

#### Acceptance Criteria

1. THE Task_List SHALL provide an input field and a submit control for adding new Tasks.
2. WHEN the user submits a non-empty task label, THE Task_List SHALL append a new Task with a completion state of false.
3. IF the user submits an empty task label, THEN THE Task_List SHALL reject the submission and display an inline validation message.
4. THE Task_List SHALL display all stored Tasks on page load.
5. WHEN a Task is added, THE Storage SHALL persist the updated Task_List immediately.

---

### Requirement 5: To-Do List — Edit, Complete, and Delete Tasks

**User Story:** As a user, I want to edit, mark as done, and delete tasks, so that I can keep my list accurate and up to date.

#### Acceptance Criteria

1. WHEN the user activates the edit control on a Task, THE Task_List SHALL replace the task label with an editable input pre-filled with the current label.
2. WHEN the user confirms an edit with a non-empty label, THE Task_List SHALL update the Task label and exit edit mode.
3. IF the user confirms an edit with an empty label, THEN THE Task_List SHALL retain the original label and exit edit mode.
4. WHEN the user activates the complete control on a Task, THE Task_List SHALL toggle the Task's completion state.
5. WHEN a Task's completion state is true, THE Task_List SHALL render the task label with a visual struck-through style.
6. WHEN the user activates the delete control on a Task, THE Task_List SHALL remove the Task from the list.
7. WHEN any Task is modified, THE Storage SHALL persist the updated Task_List immediately.

---

### Requirement 6: Sort Tasks

**User Story:** As a user, I want to sort my task list, so that I can prioritise completed or incomplete tasks.

#### Acceptance Criteria

1. THE Task_List SHALL provide a sort control that cycles through sort modes: default (insertion order), incomplete-first, and completed-first.
2. WHEN the user activates the sort control, THE Task_List SHALL re-render Tasks in the selected order without modifying the underlying stored order.
3. WHEN the sort mode changes, THE Task_List SHALL display the active sort mode label on the sort control.

---

### Requirement 7: Quick Links — Add and Display Links

**User Story:** As a user, I want to save favourite website links as buttons, so that I can navigate to them quickly.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide input fields for a label and a URL, and a submit control for adding new Links.
2. WHEN the user submits a Link with a non-empty label and a valid URL, THE Quick_Links SHALL add a new link button to the panel.
3. IF the user submits a Link with an empty label or an invalid URL, THEN THE Quick_Links SHALL reject the submission and display an inline validation message.
4. WHEN a Link button is activated, THE Dashboard SHALL open the associated URL in a new browser tab.
5. WHEN a Link is added, THE Storage SHALL persist the updated Link collection immediately.
6. THE Quick_Links SHALL display all stored Links on page load.

---

### Requirement 8: Quick Links — Delete Links

**User Story:** As a user, I want to remove quick links I no longer need, so that the panel stays relevant.

#### Acceptance Criteria

1. WHEN the user activates the delete control on a Link, THE Quick_Links SHALL remove the Link from the panel.
2. WHEN a Link is deleted, THE Storage SHALL persist the updated Link collection immediately.

---

### Requirement 9: Light / Dark Mode

**User Story:** As a user, I want to toggle between a light and dark colour scheme, so that I can use the dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a toggle control for switching between light and dark Themes.
2. WHEN the user activates the theme toggle, THE Dashboard SHALL switch to the opposite Theme immediately.
3. WHEN the Theme changes, THE Storage SHALL persist the selected Theme so that it is restored on the next page load.
4. WHEN no Theme preference has been stored, THE Dashboard SHALL apply the Theme that matches the user's OS-level colour scheme preference.

---

### Requirement 10: Data Persistence and Storage Integrity

**User Story:** As a user, I want my data to survive page reloads and browser restarts, so that I never lose my tasks, links, or preferences.

#### Acceptance Criteria

1. THE Storage SHALL store all user data (Tasks, Links, name, Theme) as serialised JSON in Local Storage.
2. WHEN the Dashboard loads, THE Storage SHALL deserialise and restore all previously saved data.
3. IF Local Storage is unavailable or returns malformed data, THEN THE Dashboard SHALL initialise with empty defaults and continue operating normally.

---

### Requirement 11: Technical Constraints

**User Story:** As a developer, I want the codebase to follow defined structural and compatibility rules, so that the project remains maintainable and portable.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no external frameworks or libraries.
2. THE Dashboard SHALL function correctly in the current stable releases of Chrome, Firefox, Edge, and Safari.
3. THE Dashboard SHALL load and be interactive without requiring a backend server.
4. THE Dashboard SHALL use exactly one CSS file located at `css/style.css`.
5. THE Dashboard SHALL use exactly one JavaScript file located at `js/app.js`.
