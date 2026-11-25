# TechNova OS workspace — QA checklist

## Scope
Adds an integrated browser-local workspace to the signed-in personal dashboard: shared task Kanban, focus timer, weekly timetable, flashcards, grade tracker, generated notification centre, global local search, draggable layout, JSON backup/restore, sandboxed HTML/CSS/JS studio and poster generator.

## Static checks
- [ ] `js/dashboard-os.js` passes JavaScript syntax parsing.
- [ ] All referenced IDs exist exactly once.
- [ ] Script loads after the existing dashboard and workspace scripts.
- [ ] No new Supabase requests, database writes, external APIs or third-party dependencies.
- [ ] Dynamic user content uses text nodes/textContent.
- [ ] Code preview is sandboxed without same-origin permission.
- [ ] Backup import validates format, version, key allow-list and file size before replacing data.

## Manual browser checks
- [ ] Create tasks and move them between Kanban columns by buttons and drag/drop; verify the existing Focus planner reflects completion.
- [ ] Start, pause, resume and reset the focus timer; verify completion notification when browser permission is already granted.
- [ ] Add and remove weekly timetable entries.
- [ ] Create, flip and cycle flashcards; add grade records and refresh.
- [ ] Confirm due tasks and reminders appear in the notification centre; dismiss and clear dismissed state.
- [ ] Search app links and local workspace records; verify no search terms are sent to a server.
- [ ] Reorder cards by drag/drop, reload and reset layout.
- [ ] Export backup; inspect that only allow-listed local workspace keys are included; restore into a test browser/profile and confirm data.
- [ ] Confirm malformed, oversized and unsupported backup files are rejected.
- [ ] Test HTML/CSS/JS preview, JavaScript interaction, code persistence and HTML download. Confirm iframe cannot access parent dashboard DOM/storage.
- [ ] Generate and download a poster PNG.
- [ ] Test responsive layout, keyboard navigation, screen-reader labels, zoom and reduced motion.
- [ ] Regression-test dashboard login guard, logout, AI assistant, calendar, habits, notes, projects, pins, recent links, command palette and admin role gate.

## Privacy and limitations
- All new records are browser-local and are not synced between devices or to Supabase.
- Backup files can contain personal notes, tasks, grades and reminders. Store exported files carefully.
- Notifications are derived from local tasks/reminders; they are not a server push-notification service.
- The focus timer works while the dashboard tab remains open; it is not a background timer.
- The developer preview is sandboxed; do not paste untrusted code into a project unless you understand it.
- Grades are manually entered records, not official college records.
- No Supabase schema, RLS, settings, Edge Functions, credentials, production data or Cloudflare deployment changes.
