# TechNova Phase 2 workspace — PR #46 QA checklist

## Advanced productivity
- [ ] Search tasks by title.
- [ ] Filter tasks by To do, In progress and Done.
- [ ] Filter tasks by High, Normal and Low priority.
- [ ] Add subtasks to an existing task and confirm the subtask count updates.
- [ ] Create daily, weekly and monthly recurring templates.
- [ ] Create the next task from a recurring template and confirm its next date advances correctly.
- [ ] Confirm existing Kanban tasks and Focus planner data remain intact.

## Personal analytics
- [ ] Complete a 25-minute focus timer and confirm a local session is recorded.
- [ ] Confirm the dashboard shows completed/open task counts, recorded grade average and focus minutes.
- [ ] Confirm the seven-day chart uses the recorded session dates.
- [ ] Confirm earlier focus sessions are not falsely counted.

## Smart agenda
- [ ] Confirm upcoming tasks and reminders appear within the next 14 days.
- [ ] Confirm weekly timetable sessions are placed on the correct weekdays.
- [ ] Confirm items are sorted by date and time.
- [ ] Confirm past and out-of-window entries are excluded.

## Notes organiser
- [ ] Select an existing note and assign a folder and tags.
- [ ] Reload the page and confirm metadata persists.
- [ ] Filter notes by folder and tag.
- [ ] Confirm note title/body and existing notes remain unchanged.

## Developer studio
- [ ] Add multiple files, including a nested path such as `src/app.js`.
- [ ] Switch between files and confirm edits persist.
- [ ] Run the index.html preview and confirm it remains inside the sandboxed iframe.
- [ ] Download an individual file.
- [ ] Export project JSON and reopen it to inspect its contents.
- [ ] Download the ZIP, extract it with a standard archive utility and verify file names/content.
- [ ] Confirm invalid paths, duplicate file names and traversal-style paths are rejected.

## Personalisation
- [ ] Apply Midnight, Aurora and Light themes.
- [ ] Change the accent colour.
- [ ] Change panel density and workspace width.
- [ ] Reload and confirm preferences persist.
- [ ] Reset preferences and confirm defaults are restored.

## Regression and accessibility
- [ ] Sign in with a normal member account and confirm the dashboard loads.
- [ ] Confirm admin shortcuts remain protected by the existing role check.
- [ ] Confirm the AI panel, events, saved events, calendar, notes, habits, projects and existing OS widgets still work.
- [ ] Test at desktop, tablet and mobile widths.
- [ ] Test keyboard-only navigation, visible focus and screen-reader labels.
- [ ] Confirm all new personal data remains in local browser storage and no backend writes occur.
