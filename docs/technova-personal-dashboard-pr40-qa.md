# TechNova personal command-centre dashboard — PR #40 QA

## Scope
This change upgrades only the signed-in personal dashboard at `pages/dashboard.html` and its page-specific script, `js/dashboard.js`. It does not replace or remove other TechNova pages, alter the shared site navigation, or change the separate admin dashboard.

## Automated/static checks
- [x] Dashboard JavaScript parses with the JavaScript Function parser.
- [x] Dashboard directory links checked against the current `pages/` directory.
- [x] Dashboard element IDs checked for duplicates.
- [x] Existing user-scoped read-only event-registration and saved-event count queries retained.
- [x] Existing admin-role lookup retained; admin shortcut remains hidden unless `user_roles.role` is `admin`.
- [x] Existing saved-event preview is retained through the current browser-side saved-events helper.
- [x] Browser-only preferences use local storage; no new backend writes or external services added.

## Manual browser checks required
- [ ] Sign in with a normal member account and confirm the dashboard loads.
- [ ] Sign in with an administrator account and confirm the admin shortcut appears; confirm it is absent for a normal member.
- [ ] Check greeting, display name, email, avatar initials and date.
- [ ] Search for a page/tool; confirm results filter as expected.
- [ ] Test each category filter and the empty-search state.
- [ ] Pin and unpin several shortcuts; refresh and confirm pins persist.
- [ ] Open a dashboard shortcut and return; confirm it appears in Recently opened.
- [ ] Hide and restore each available widget using Personalise; refresh and confirm preferences persist.
- [ ] Type in Quick note; refresh and confirm the note remains on the same browser/device.
- [ ] Confirm the note is not shown as a cloud-synced feature; it is browser-local.
- [ ] Confirm event registrations and counts match the signed-in user's records.
- [ ] Test desktop, tablet and mobile widths, keyboard navigation, focus indicators and reduced-motion settings.
- [ ] Confirm the normal header navigation, site map and existing pages still work.

## Limitations
- Pinned shortcuts, recently opened dashboard links, widget visibility and the quick note are stored locally in this browser, not synced between devices.
- Recent-page history only records links opened from this dashboard.
- The dashboard displays existing event/account data; it does not create achievements, activity or statistics.
- No live browser session or production deployment test has been performed as part of source validation.

## Infrastructure and privacy
- No Supabase schema, RLS policy, settings, Edge Function, credential or production-data changes.
- No Cloudflare deployment.
- No changes to the admin dashboard or other existing page implementations.
