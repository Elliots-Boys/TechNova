# TechNova PR #39 — Personal dashboard workspace QA

## Included
- Refresh the personal dashboard into a more complete central workspace.
- Add a personalised time-of-day greeting and current date.
- Add overview cards for registrations, saved events and upcoming registered events.
- Expand quick access to existing TechNova areas, including Community and Labs.
- Populate registered events and a recent event-registration activity feed.
- Keep saved-event previews and profile information.
- Keep event and saved-event reads scoped to the authenticated user.
- Preserve the existing admin role lookup and admin shortcut visibility rule.

## Static checks
- [ ] Confirm dashboard JavaScript parses without syntax errors.
- [ ] Confirm all dashboard element IDs used by JavaScript exist in the page.
- [ ] Confirm quick links point to existing pages.
- [ ] Confirm registration and saved-event queries filter by the authenticated user ID.
- [ ] Confirm the admin shortcut remains hidden unless the existing role query returns `admin`.
- [ ] Confirm no database writes or Supabase configuration changes were added.

## Browser checks after preview deployment
- [ ] Sign in with a standard member account and open the dashboard.
- [ ] Confirm greeting, profile name, email and date display.
- [ ] Confirm registration, saved-event and upcoming-event counts.
- [ ] Confirm registered events appear with upcoming dates first.
- [ ] Confirm recent activity reflects registration records.
- [ ] Confirm saved events display and event links open correctly.
- [ ] Confirm empty states for accounts with no registrations or saved events.
- [ ] Confirm a non-admin does not see the admin shortcut.
- [ ] Confirm an admin still sees the admin shortcut.
- [ ] Check mobile layout, keyboard focus and reduced-motion preference.
- [ ] Confirm logout and sign-in navigation still work.

## Validation limits
No live browser session or production deployment is performed by this PR. Supabase schema, RLS policies, settings, functions, credentials and data are unchanged.
