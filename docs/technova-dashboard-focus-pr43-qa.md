# TechNova focus workspace — PR #43 QA

## Feature summary
Adds a private, browser-local task board to the signed-in personal dashboard. Users can add tasks, optionally set due dates, mark tasks complete, remove individual tasks, clear completed tasks and see a completion percentage.

## Static checks
- [ ] JavaScript syntax parsing passes.
- [ ] Focus board form, task list, progress indicator and clear-completed control each have unique IDs.
- [ ] The dashboard script cache version is bumped.
- [ ] The Personalise panel includes a Focus planner visibility toggle.
- [ ] Task data uses only the browser's local storage; no server requests or Supabase writes are introduced.
- [ ] Existing command palette, AI assistant, event panels, pinned shortcuts and recent links remain present.

## Manual browser checks
- [ ] Sign in and add a task with no due date.
- [ ] Add a task with a due date; verify the date label.
- [ ] Mark a task complete and verify progress percentage and completed styling.
- [ ] Reopen a completed task.
- [ ] Delete one task and clear all completed tasks.
- [ ] Refresh the dashboard and confirm tasks persist in the same browser.
- [ ] Test empty state, 50-task limit and storage failure message.
- [ ] Hide and restore Focus planner using Personalise.
- [ ] Test mobile layout, keyboard-only operation, zoom and screen-reader labels.
- [ ] Confirm another browser/device does not imply synced tasks.
- [ ] Regression-test dashboard sign-in, admin shortcut gating, AI assistant, events, saved events, command palette, pins, notes and directory filters.

## Privacy and infrastructure
- Tasks are stored under `technova.dashboard.tasks.v1` in the current browser's local storage.
- Tasks are not synced to TechNova accounts, Supabase or other devices.
- No Supabase schema, RLS, settings, Edge Functions, credentials or production data changes.
- No Cloudflare deployment.
