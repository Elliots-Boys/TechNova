# TechNova Browser — PR #49 QA checklist

## Startup and app integration
- [ ] Sign in and open TechNova Desktop.
- [ ] Confirm TechNova Browser appears in the app launcher, desktop app grid, dock/shortcuts and Extensions Marketplace.
- [ ] Disable and re-enable the Browser in Extensions Marketplace.
- [ ] Open, minimise, maximise and close the Browser window.
- [ ] Confirm existing Desktop apps still open and work.

## Navigation
- [ ] Start page quick links open the intended addresses.
- [ ] Enter a full HTTPS address and submit with Enter and Go.
- [ ] Enter a hostname without a scheme and confirm HTTPS is used.
- [ ] Enter search text and test DuckDuckGo, Bing and Google.
- [ ] Confirm javascript:, data:, file: and credential-bearing URLs are rejected.
- [ ] Reload the active tab.
- [ ] Test back and forward after navigating through the address bar.
- [ ] Confirm each tab retains its own current page and navigation stack.
- [ ] Add, switch between and close tabs; confirm at least one tab always remains.
- [ ] Confirm opening a new tab shows the start page.

## Bookmarks and history
- [ ] Bookmark a page and confirm the bookmark appears in the list.
- [ ] Open a bookmark and remove a bookmark.
- [ ] Visit multiple addresses and confirm local history is populated.
- [ ] Open a history entry.
- [ ] Clear history and confirm it is empty.
- [ ] Enable “Don't save local history”, visit a page and confirm it is not added to local history.
- [ ] Turn the session toggle off and confirm later visits are recorded again.
- [ ] Refresh the page and confirm bookmarks/history persist, while private-session mode resets.

## Embedding and external fallback
- [ ] Test a site that allows iframe embedding.
- [ ] Test a site that blocks embedding and confirm the notice explains the limitation.
- [ ] Use Open externally and confirm the current address opens in a new normal browser tab.
- [ ] Confirm the iframe sandbox does not include allow-same-origin.
- [ ] Confirm cross-origin page content is not read by TechNova Browser.
- [ ] Confirm the browser does not claim to control or list all third-party downloads.

## Accessibility and responsive behaviour
- [ ] Keyboard-operate address form, tabs, navigation, bookmarks and history.
- [ ] Confirm controls have accessible labels and visible focus.
- [ ] Test at desktop, tablet and narrow mobile widths.
- [ ] Test Midnight, Aurora and Light desktop themes.
- [ ] Test reduced motion and screen-reader labels.
- [ ] Confirm browser content scrolls without breaking the desktop window controls.

## Regression and scope
- [ ] Confirm Developer Studio, Project Manager, Calendar, Notes, Analytics, Personalisation, File Manager, Study Centre, Notifications and Marketplace still work.
- [ ] Confirm sign-in guard and sign-out remain unchanged.
- [ ] Confirm no Supabase schema, RLS, settings, Edge Functions or data were changed.
- [ ] Confirm no Cloudflare deployment was performed.
