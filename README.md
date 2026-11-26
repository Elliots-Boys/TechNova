# TechNova

**Technology for what's next.**

TechNova is a technology-focused website and community platform bringing together technology information, learning resources, community features and browser-based productivity tools.

- **Website:** https://technova-bmm.pages.dev
- **Repository:** https://github.com/Elliots-Boys/TechNova
- **Hosting:** Cloudflare Pages

## TechNova Desktop

TechNova Desktop is an authenticated, browser-based workspace with built-in productivity and developer tools. Its application suite includes a document studio, spreadsheet, whiteboard, API studio, media centre, website designer, storage manager and Mail Centre.

Some features store data locally in the browser. Optional cloud features use the existing authenticated services and may require separate setup.

## Gmail connection (optional)

The Gmail connection for Mail Centre is being added in [PR #52](https://github.com/Elliots-Boys/TechNova/pull/52). It is **not available on the live site until that pull request is merged and the updated site is deployed**.

When the Gmail integration is available, connecting it requires a Google OAuth Web Client ID:

1. Create or select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Gmail API** for that project.
3. Configure Google Auth Platform and add the Gmail scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
4. Create an OAuth client with application type **Web application**.
5. Add the TechNova site as an authorised JavaScript origin: `https://technova-bmm.pages.dev`. Add any preview or local development origin separately if you use one.
6. If the OAuth app is in Testing mode, add your Google account as a test user.
7. Copy the **Client ID** into the Gmail connection field in TechNova Mail Centre.

See the full [Gmail OAuth setup guide](docs/technova-gmail-oauth-setup.md) for detailed instructions.

**Security:** TechNova needs the public OAuth Client ID only. Never paste, publish or commit a Google Client Secret. The integration uses a browser token flow; access tokens are held in memory and are not saved in TechNova storage. Gmail access is limited to the scopes you approve. Gmail attachments are not supported. Google may require OAuth verification before an app can be used publicly with these Gmail scopes.

## Development and contributions

Work is organised through Git branches and pull requests. Review changes before merging. Production deployment and backend configuration changes should be performed only when explicitly authorised.

## Project documentation

- [Gmail OAuth setup](docs/technova-gmail-oauth-setup.md)
- [TechNova Desktop expansion QA checklist](docs/technova-os-expansion-pr50-qa.md)
- [Master project document](TECHNOVA_MASTER_DOCUMENT.md)
