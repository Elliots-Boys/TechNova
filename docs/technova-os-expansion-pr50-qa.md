# TechNova OS Expansion — PR #50 QA checklist

## Scope
One integrated expansion PR adding the App Store catalogue, Virtual Desktops, Whiteboard Studio, Document Studio, Spreadsheet Studio, API Studio, Desktop Widgets, Control Centre, Media Centre, Website Designer, Mail Centre draft manager and Storage Manager 2.0. The former embedded Browser window and launcher entry are removed from Desktop.

## Static validation
- [ ] JavaScript syntax check for `js/technova-desktop.js` and `js/technova-os-expansion.js`.
- [ ] No duplicate HTML IDs.
- [ ] All app registry IDs have matching windows after expansion initialisation.
- [ ] Confirm browser script is no longer loaded and browser app is absent from registry.
- [ ] Confirm no secret/service-role key is added to frontend or repository.
- [ ] Confirm migration enables RLS and scopes every row to `auth.uid()`.

## Manual signed-in browser QA
- [ ] Desktop authentication guard and sign-out still work.
- [ ] Existing Developer Studio, Project Manager, Calendar, Knowledge Centre, Analytics, Personalisation, File Manager, AI & Study Centre and Notifications still work.
- [ ] App Store lists the built-in applications and enable/disable controls work.
- [ ] Multiple app windows can remain open, be dragged, minimised, maximised and closed.
- [ ] Create, rename, switch and delete virtual desktops; Ctrl+Alt+Left/Right switches workspaces.
- [ ] Whiteboard drawing, sticky notes, save, reload and PNG export work.
- [ ] Document create/edit/save/reopen, safe formatting, HTML/TXT export and print-to-PDF work.
- [ ] Spreadsheet cells, supported formulas, row/column addition and CSV export work.
- [ ] API Studio handles valid requests, invalid JSON headers, network/CORS errors and bounded response display.
- [ ] Widget visibility, ordering and quick-note persistence work.
- [ ] Control Centre appearance controls, backup export/import and local clear confirmation work.
- [ ] Media import, playback and clear-library flow work for supported browser formats.
- [ ] Website Designer sections, preview and HTML download work.
- [ ] Mail drafts save/reopen/delete; mailto opens external mail application. No inbox integration is claimed.
- [ ] Storage Manager local import/download/delete and private cloud list/upload/download/delete work.
- [ ] Cloud sync is disabled by default; after applying migration, opt-in upload/restore works with two accounts and cannot cross-read or overwrite another user's records.
- [ ] Responsive, keyboard, reduced-motion and screen-reader checks.

## Supabase Storage sync
- [ ] Confirm cloud autosave is disabled by default.
- [ ] Enable sync and upload supported workspace records to the signed-in user's `user-files/<user-id>/desktop-sync/` folder.
- [ ] Restore cloud copies and verify the expected local records are updated.
- [ ] Sign in as a second test account and verify it cannot list, download, overwrite or delete the first account's sync objects.
- [ ] Confirm cloud sync errors do not stop local application use.
- [ ] Confirm no new database tables, RLS policies, bucket policies or project settings are required.

## Limitations
- API requests are browser-origin fetches and can fail due to CORS.
- Document Studio is a lightweight rich-text editor; PDF uses print dialog, DOCX export is not included.
- Spreadsheet Studio supports a deliberately limited formula set, not full Excel compatibility.
- Website Designer exports static HTML and does not deploy websites.
- Mail Centre manages local drafts and opens the system email client; it does not fetch an inbox or send through TechNova.
- Media Centre plays local files in browser-supported formats; DRM streams are not supported.
- Cloud sync covers supported structured workspace data. Media blobs/local files are uploaded separately by the user through Storage Manager 2.0.
