# TechNova Desktop — PR #47 QA checklist

## Access and desktop shell
- [ ] Signed-out visitors are redirected to the existing login page.
- [ ] Signed-in members can open Desktop from the personal dashboard.
- [ ] Sign out returns to the login page.
- [ ] Start launcher, dock, shortcuts, search and taskbar work.
- [ ] Open multiple apps; confirm windows remain open and can be focused.
- [ ] Drag, resize, minimise, maximise and close windows.
- [ ] Confirm disabled extensions cannot be launched.

## Developer Studio
- [ ] Create nested files and switch between them.
- [ ] Save edits, run the sandboxed preview and verify no same-origin access.
- [ ] Download a file and export the project ZIP.
- [ ] Extract the ZIP and verify file names and contents.
- [ ] Reject duplicate and unsafe traversal-style file paths.

## Project Manager
- [ ] Create, select and delete projects.
- [ ] Add tasks with optional deadlines.
- [ ] Move tasks through To do, In progress and Done.
- [ ] Confirm progress updates and persists after reload.

## Calendar & Planner
- [ ] Navigate months and select dates.
- [ ] Add, view and remove events with optional times.
- [ ] Confirm calendar entries persist after reload.

## Knowledge Centre
- [ ] Create, edit, search, tag, folder and delete notes.
- [ ] Export a note as Markdown.
- [ ] Confirm content persists after reload.

## Analytics
- [ ] Confirm project/task/note totals reflect local records.
- [ ] Confirm focus chart reads recorded focus sessions.
- [ ] Confirm empty states display sensibly.

## Personalisation
- [ ] Test Midnight, Aurora and Light themes.
- [ ] Test accent colour, wallpaper, density and reduced motion.
- [ ] Reload and confirm settings persist.

## File Manager
- [ ] Import several file types and files with similar names.
- [ ] Search and filter by folder.
- [ ] Download imported files and compare contents.
- [ ] Delete files and confirm they disappear after reload.
- [ ] Confirm unsupported IndexedDB is reported without breaking other apps.
- [ ] Confirm cloud links open existing Google Drive and Cloud Manager pages.

## AI & Study Centre
- [ ] Add and delete flashcards.
- [ ] Record grades and confirm they persist.
- [ ] Open the existing AI Assistant from its link.
- [ ] Confirm no new AI provider or backend writes are introduced.

## Notifications and marketplace
- [ ] Confirm upcoming project deadlines and calendar items appear.
- [ ] Dismiss reminders and refresh the inbox.
- [ ] Enable and disable built-in apps in the marketplace.
- [ ] Confirm app availability updates in launcher and dock.

## Regression, privacy and accessibility
- [ ] Confirm existing dashboard, admin dashboard and other pages are unchanged apart from the new desktop link.
- [ ] Test desktop, tablet and narrow mobile viewports.
- [ ] Test keyboard-only navigation and visible focus.
- [ ] Check labels, button names and screen-reader announcements.
- [ ] Verify local records remain in browser storage and no Supabase data writes occur.
- [ ] Check browser console for errors.
