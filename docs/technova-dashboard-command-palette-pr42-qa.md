# TechNova dashboard command palette — PR #42 QA

## Scope
Adds a keyboard-accessible quick launcher to the signed-in personal dashboard. It searches the existing dashboard directory and opens existing TechNova pages without replacing navigation or changing page routes.

## Static checks
- [ ] The Quick open trigger has a dialog relationship and keyboard shortcut hint.
- [ ] Dialog, search field, results list and close button each have unique IDs.
- [ ] Dashboard script cache version is bumped.
- [ ] Command palette uses only existing `data-app-link` entries and their existing destination links.
- [ ] No new external libraries, API calls, backend writes or storage keys are introduced.
- [ ] JavaScript syntax check passes.

## Manual browser checks
- [ ] Sign in and open Quick open using its button.
- [ ] Open the palette using Ctrl+K on Windows/Linux and Cmd+K on macOS.
- [ ] Search by page name, category and keyword.
- [ ] Use Arrow Up/Down to move selection and Enter to open the highlighted destination.
- [ ] Use Escape and the Close button; confirm focus returns to the trigger.
- [ ] Click outside the dialog to close it.
- [ ] Confirm opening a destination updates the existing Recently opened list.
- [ ] Test narrow mobile layout, keyboard-only use, screen-reader announcements and browser zoom.
- [ ] Confirm normal navigation, pinned shortcuts, filters, notes, events, AI panel and Personalise settings still work.

## Privacy and infrastructure
- Search runs against the existing page directory in the current browser.
- The palette does not send searches or page usage to a server. Opening a page continues to use the existing local recent-pages storage.
- No Supabase schema, RLS, settings, Edge Functions, credentials or production data changes.
- No Cloudflare deployment.
