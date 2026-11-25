# TechNova PR #38 — Login redirect cache-busting QA

## Scope
- Update the authentication script URL version on `pages/login.html` and `pages/signup.html`.
- Ensure browsers request the current `js/auth.js` after the dashboard redirect change in PR #37.
- Update `TECHNOVA_MASTER_DOCUMENT.md` with the verified PR #37 merge and PR #38 status.

## Static checks
- [ ] Confirm both pages reference `../js/auth.js?v=dashboard-redirect-38`.
- [ ] Confirm no duplicate or missing authentication script tags.
- [ ] Confirm the existing email login handler still calls `getAuthReturnPath()` after successful sign-in.
- [ ] Confirm `getAuthReturnPath()` defaults to `/pages/dashboard.html`.
- [ ] Confirm explicit `redirect`, supported `next`, and password-reset handling remain unchanged.

## Browser checks after merge and deployment
- [ ] Open the live login page in a fresh/private browser session.
- [ ] Complete hCaptcha and sign in with a valid email/password account.
- [ ] Confirm successful sign-in navigates to `/pages/dashboard.html`.
- [ ] Confirm invalid credentials remain on the login page with an error message.
- [ ] Confirm the dashboard loads the signed-in user's account.
- [ ] Confirm password-reset flow still opens the reset flow and is not redirected prematurely.
- [ ] Confirm signup page still loads and its auth handlers work.

## Validation limits
- This PR only changes static script cache-version references and the master document.
- No browser, live Supabase session, or production deployment test is performed by this PR.
- No Supabase settings, schema, policies, functions, credentials, or data are changed.
