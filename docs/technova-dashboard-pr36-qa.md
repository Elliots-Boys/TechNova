# Personal Dashboard — PR #36 QA

## Scope
- Refreshes `pages/dashboard.html` into a responsive personal workspace.
- Adds `js/dashboard.js` for read-only, user-scoped overview totals, saved-event previews and the admin shortcut.
- Reuses the existing Supabase authentication, account profile and registered-event loading code.
- Updates `TECHNOVA_MASTER_DOCUMENT.md` with the PR #35 merge, the dashboard decision and this PR record.
- Does not change the admin dashboard, Supabase schema/data/policies/settings, Edge Functions, shared navigation, homepage or production deployment.

## Manual QA
1. Sign in with a normal TechNova account and open `pages/dashboard.html`.
2. Confirm unauthenticated visitors are redirected to login.
3. Confirm the greeting, email, profile bio and membership status load from the signed-in account.
4. Confirm registration and saved-event totals reflect the current user's records only.
5. Confirm registered events render using the existing account.js loader and that the existing remove-registration action still works.
6. Confirm saved event previews and View links work; confirm the empty state when there are no saved events.
7. Confirm the admin shortcut appears only when the existing `user_roles.role` lookup returns `admin`; the admin page must still enforce its own access check.
8. Confirm quick links open AI Assistant, events, saved events, learning, resources, private cloud and account settings.
9. Test logout, keyboard navigation, focus visibility, mobile navigation and narrow-screen layout.
10. Test a normal account with empty saved/registration lists and with a temporary network/query failure.
11. Confirm no writes are made to Supabase and no personal data is stored in local storage by this dashboard.
12. Confirm `pages/admin.html` is unchanged by this PR.

## Data and privacy
- Uses existing authenticated Supabase client and the current user's ID for read-only counts.
- Uses existing `event_registrations`, `saved_events`, `profiles` and `user_roles` read patterns already present in the repository.
- Event and profile data are rendered into DOM text nodes; no HTML from user profile fields is injected.
- The dashboard does not introduce new database objects, policies, migrations, writes or third-party analytics.

## Validation and limitations
- Repository source inspection and static integration review only; browser/device testing remains outstanding.
- Read access depends on the existing Supabase RLS policies and account configuration.
- Some totals may show unavailable if the current user's read policies or related tables are unavailable.
