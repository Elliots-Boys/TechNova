# TechNova complete personal workspace — QA

## Scope
This update expands the signed-in personal dashboard with browser-local calendar reminders, a habit tracker, a multi-note workspace, personal insights, a lightweight project list, local developer utilities, study prompt shortcuts, community/cloud/learning links and role-gated administrator quick links.

## Automated/static checks
- [ ] `js/dashboard-workspace.js` passes JavaScript syntax parsing.
- [ ] All element IDs referenced by the new script exist in `pages/dashboard.html`.
- [ ] No duplicate HTML IDs exist.
- [ ] The new script is loaded after `js/dashboard.js`.
- [ ] New widgets have Personalise visibility toggles.
- [ ] Administrator shortcuts have no widget toggle and remain hidden until the existing admin role check removes `dashboard-hidden` from the existing admin link.
- [ ] Dynamic user-provided text is inserted using `textContent`, not HTML parsing.
- [ ] No new Supabase calls, writes, database changes, external API calls or third-party libraries are introduced.

## Manual browser checks
### Calendar and reminders
- [ ] Navigate between months and return to today.
- [ ] Select a date and create a reminder.
- [ ] Confirm reminders appear on the correct date and persist after refresh.
- [ ] Confirm focus-task due dates appear as calendar markers and in the selected-day list.
- [ ] Delete a reminder and confirm it is removed.

### Habits
- [ ] Add a habit and mark it complete today.
- [ ] Uncheck it and confirm today's completion is removed.
- [ ] Verify streak display across consecutive dates and after a missed day.
- [ ] Delete a habit and refresh.

### Notes
- [ ] Create, rename, search, edit, export and delete notes.
- [ ] Confirm multiple notes persist after refresh.
- [ ] Confirm note limits and storage-failure messaging.
- [ ] Confirm existing quick scratchpad remains unchanged.

### Insights and projects
- [ ] Verify insights reflect focus tasks, habits, reminders and projects.
- [ ] Confirm existing registration/saved-event totals are displayed as account totals, not fabricated local activity.
- [ ] Create a project and change its stage; verify the progress indicator and persistence.
- [ ] Delete a project.

### Developer and study tools
- [ ] Format valid JSON and minify valid JSON.
- [ ] Submit invalid JSON and verify a readable error.
- [ ] Copy JSON and a colour HEX value where clipboard permission is available.
- [ ] Change the colour picker and confirm swatch/HEX update.
- [ ] Select each study prompt and verify it pre-fills the existing dashboard AI input without auto-submitting.

### Dashboard, community and admin
- [ ] Hide and restore each new widget using Personalise.
- [ ] Verify links to existing Community, Learning, Projects, Private Cloud, Drive and developer tools.
- [ ] Sign in as a non-admin and confirm administrator quick links remain hidden, including after changing Personalise controls.
- [ ] Sign in as an administrator and confirm quick links appear only after the existing role check succeeds.
- [ ] Test mobile layout, keyboard-only use, zoom, focus visibility and screen-reader labels.
- [ ] Regression-test dashboard authentication, logout, command palette, directory, pins, recent pages, AI assistant, focus planner, events and saved events.

## Privacy and limitations
- Calendar reminders, habits, notes and project lists are stored only in this browser using local storage; they are not synced to Supabase or other devices.
- Insights use local workspace records and the existing signed-in user's read-only event totals.
- JSON formatting and colour selection run locally. The JSON utility parses data; it does not execute code.
- Study buttons only prefill the existing free browser-based assistant. They do not add a generative model or claim that deterministic tools are generative AI.
- Community, cloud storage, Academy and developer destinations link to existing TechNova pages; this PR does not implement messaging, a new forum backend, cloud sync, new courses, or an app-store service.
- Administrator links are navigation shortcuts only; the destination pages retain their own access checks.
- No Supabase schema, RLS, settings, Edge Functions, credentials, production data or Cloudflare deployment changes.
