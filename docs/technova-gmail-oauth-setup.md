# TechNova Mail Centre — Google Gmail setup

Mail Centre uses Google Identity Services in the browser. It does not use the TechNova Google sign-in provider token and does not require a Supabase schema or settings change.

## What the integration requests

- `https://www.googleapis.com/auth/gmail.readonly` — list and read inbox messages.
- `https://www.googleapis.com/auth/gmail.send` — send plain-text email.

Google classifies `gmail.readonly` as a restricted Gmail scope and `gmail.send` as a sensitive scope. Public production use may require Google's OAuth verification. See Google's [Gmail API scopes guide](https://developers.google.com/workspace/gmail/api/auth/scopes).

## Google Cloud setup

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and select the Google Cloud project used for TechNova's Google integrations, or create a dedicated project.
2. Open **APIs & Services → Library**, find **Gmail API**, and enable it.
3. Open **Google Auth Platform → Branding** and complete the app name, support email and contact details.
4. Open **Google Auth Platform → Audience**. For a personal Gmail account, choose **External**. While the app is in Testing, add the Google account you will use as a test user.
5. Open **Google Auth Platform → Data Access** and add the two scopes listed above. Review Google's user-data and verification requirements before making the app available to other users.
6. Open **Google Auth Platform → Clients → Create Client**. Choose **Web application**.
7. Under **Authorized JavaScript origins**, add the exact TechNova origin:
   - Production: `https://technova-bmm.pages.dev`
   - Add the exact Cloudflare Pages preview origin separately if you will test from a PR preview.
   - For local development, add the exact localhost origin and port you use.
8. Create the client and copy its **Client ID**. The Google Identity Services popup/token flow used here does not need a redirect URI.
9. In TechNova Desktop, open **Mail Centre**, paste the Client ID into **Google OAuth Web Client ID**, and select **Connect Gmail**. Complete Google's consent prompt.

Google's official instructions: [Gmail API JavaScript quickstart](https://developers.google.com/workspace/gmail/api/quickstart/js) and [Google Identity Services client ID setup](https://developers.google.com/identity/oauth2/web/guides/get-google-api-clientid).

## Important security notes

- Paste only the OAuth **Client ID** into TechNova. Never paste a client secret into the website, repository, or chat. A browser-based OAuth client is a public client and must not contain a client secret.
- The Client ID is stored in this browser's local storage. The Gmail access token stays in memory for the current page session and is not saved to TechNova or Supabase.
- Access tokens expire. Use **Connect Gmail** again when Mail Centre asks you to reconnect.
- The current integration reads inbox messages and sends plain-text email. It does not support attachments, deleting messages, or syncing Gmail messages into TechNova storage.
- Gmail message content is displayed in the browser only; it is not uploaded to TechNova's Supabase project.
- Google may show an unverified-app warning while the OAuth app is in Testing or before verification. Only authorise the app if the Google consent screen shows the expected TechNova app and scopes.
- If Google reports `origin_mismatch`, check that the exact page origin (scheme + hostname + optional port, with no path) is listed under Authorized JavaScript origins.
- No Google client secret, Gmail message data, or access token is committed to this repository.

## Manual test checklist

- [ ] Gmail API is enabled in the selected Google Cloud project.
- [ ] OAuth app has the Gmail scopes and test-user account configured.
- [ ] The exact Desktop origin is authorised.
- [ ] Mail Centre accepts the Client ID and opens the Google consent flow.
- [ ] Inbox list and message reader load.
- [ ] A plain-text test message can be sent to an address you control.
- [ ] Disconnect revokes the current token and clears it from the page session.
- [ ] Expired-token flow requests reconnection.
- [ ] No Gmail data or access token appears in local storage, Supabase Storage, or repository files.
