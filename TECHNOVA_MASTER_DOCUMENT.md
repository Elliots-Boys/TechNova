# TechNova — Master Project Document

> **Purpose:** This is the central project memory for TechNova. Update it whenever a significant architectural decision, feature, deployment, bug, pull request, or roadmap decision changes.
>
> **Last consolidated:** 25 November 2026  
> **Repository:** [Elliots-Boys/TechNova](https://github.com/Elliots-Boys/TechNova)  
> **Live website:** [https://technova-bmm.pages.dev](https://technova-bmm.pages.dev/)

---

## 1. Project overview

**TechNova** is a technology-focused website and community platform. Its branding currently uses the tagline **“Technology for what's next.”**

The project's direction is to bring technology information, news, events, learning resources, community features, account functionality, developer-facing services, and browser-based productivity tools together.

TechNova has grown beyond a simple informational website. The longer-term ambition is an all-in-one technology platform, while preserving the existing website and its working features.

This document distinguishes between:
- **Confirmed/current:** visible in the repository or confirmed in project decisions.
- **Historical:** recorded from earlier development conversations; may need checking against the current deployment.
- **Planned:** agreed future work, not a claim that the feature already exists.
- **Unverified:** needs a fresh repository, Supabase, Cloudflare, or browser check.

## 2. Core project details

| Item | Value |
|---|---|
| GitHub repository | `Elliots-Boys/TechNova` |
| Default branch | `main` |
| Website | `https://technova-bmm.pages.dev` |
| Hosting platform | Cloudflare Pages |
| Pages project name | `technova` |
| Supabase project reference | `maxlbgiomkdfynnjoghs` |
| Supabase project URL | `https://maxlbgiomkdfynnjoghs.supabase.co` |
| Frontend | HTML, CSS and JavaScript |
| Database/backend services | Supabase |
| Source control and reviews | GitHub branches and pull requests |

**Security note:** Never place passwords, private API keys, service-role keys, access tokens, OAuth client secrets, or other credentials in this document. Public project identifiers and URLs are not substitutes for credentials. Check the actual environment and Supabase settings before changing backend configuration.

### 2.1 Technology stack

- **HTML:** page structure and content.
- **CSS:** shared visual styling and responsive layouts.
- **JavaScript:** navigation, page interactions, assistant tools and browser-side functionality.
- **Supabase:** PostgreSQL database and authentication/backend services.
- **Cloudflare Pages:** website hosting.
- **GitHub:** source code, history, branches, pull requests and review workflow.

Historical project work also discussed a Cloudflare Worker. Its current deployment and purpose must be verified before relying on it.

## 3. Design and navigation conventions

The site uses a dark technology-oriented visual style, with navy/dark surfaces and bright cyan/blue/purple accents.

The homepage title in the repository is **“TechNova — Technology for what's next.”**

Important recorded navigation preference:
- The **Tools** navbar link should appear on `index.html` only, not automatically on every page.

Do not redesign the homepage, dashboard, shared navigation, or unrelated site areas while implementing a scoped feature unless the user explicitly requests it.

## 4. Website pages and areas

The current sitemap and repository inspection show these page areas. A page existing in the repository does not prove every proposed capability is complete or currently working.

| Area | Known page/path | Notes |
|---|---|---|
| Homepage | `index.html` | Main landing page and site navigation |
| Events | `pages/events.html` | Event listings and event-related flows |
| Technology | `pages/technology.html` | Technology content |
| Innovation | `pages/innovation.html` | Innovation-related content |
| News | `pages/news.html` | News/articles |
| About | `pages/about.html` | About TechNova |
| Contact | `pages/contact.html` | Contact page |
| Login | `pages/login.html` | Authentication entry |
| Signup | `pages/signup.html` | Account registration |
| Account | `pages/account.html` | Account area |
| Settings | `pages/settings.html` | User settings |
| Discover | `pages/discover.html` | Discovery content |
| Community | `pages/community.html` | Community area |
| Resources | `pages/resources.html` | Learning/resources |
| FAQ | `pages/faq.html` | Frequently asked questions |
| Support | `pages/support.html` | Support information |
| AI Assistant | `pages/ai-assistant.html` | Assistant and browser-based tools |
| Personal dashboard | `pages/dashboard.html` | Signed-in member workspace; refreshed in PR #36 |
| OAuth consent | `pages/oauth-consent.html` | Application authorisation/consent UI |
| Authorised apps | `pages/authorized-apps.html` | User's authorised applications UI |
| OAuth developer information | `pages/oauth-developers.html` | Developer-facing sign-in information |

Other features discussed or present during earlier development include projects, updates, experiments, status, idea submissions, notifications, dashboard, challenges, directory, calendar, bookmarks, metrics and feedback. Their exact current implementation and status should be checked in the repository before changing or documenting them as complete.

### 4.1 Community status — historical finding

On 23 November 2026, the Community page was reviewed and found to have topic categories and guidelines, but not a complete forum experience. The missing capabilities identified at that time included creating posts/topics and replying to posts. Article and event comments were separate from a full discussion forum.

**Action:** Re-check the current Community page and code before treating this historical finding as current.

## 5. Infrastructure and backend

### 5.1 Cloudflare

- The public Pages site is `https://technova-bmm.pages.dev`.
- The Cloudflare Pages project is named `technova`.
- Preview deployments may be available for branches/PRs, but never assume a preview URL exists or is healthy without checking the actual deployment or PR checks/comments.
- Production deployments must not be triggered without the user's explicit permission.

A historical conversation recorded a Cloudflare Worker deployment and issues with Pages Git integration. This is historical context only; verify current Cloudflare configuration before making changes.

### 5.2 Supabase

The known project reference is `maxlbgiomkdfynnjoghs`, with project URL:

`https://maxlbgiomkdfynnjoghs.supabase.co`

The repository contains a shared Supabase client configuration in `js/supabase-config.js`. The client is initialised when the Supabase browser library is available. The repository file has historically used a publishable/anonymous browser key; do not copy keys into documentation, commits, chat, or public issue descriptions.

Supabase is used for authentication and application data. Historical work has involved event registrations and the AI knowledge bank.

**Backend change policy:** Do not change Supabase settings, database schema/data, Row Level Security policies, authentication providers, secrets, or Edge Functions unless the user separately and explicitly approves that specific backend work.

### 5.3 Historical database notes

Earlier database work recorded:
- A duplicate index on `event_registrations` was removed.
- An index on `event_registrations.user_id` was added.
- A database health review identified a `SECURITY DEFINER` function named `register_for_event()`.
- Leaked-password protection was reported disabled at that time.

These are historical notes, not a statement of current database health. Re-run an authorised, read-only review before making any claim about present status or proposing a change.

## 6. Authentication and TechNova sign-in / OAuth

An important direction discussed for TechNova is acting as an identity provider, allowing third-party applications to offer a **Continue with TechNova** sign-in experience.

The Supabase Auth issuer URL discussed was:

`https://maxlbgiomkdfynnjoghs.supabase.co/auth/v1`

The repository contains:
- `pages/oauth-consent.html`
- `pages/authorized-apps.html`
- `pages/oauth-developers.html`

These pages establish that an OAuth/developer-facing experience exists in the codebase. They do not, by themselves, prove that every OAuth flow, callback, provider, scope, consent validation, token exchange, or production setting is configured correctly.

### 6.1 Identity provider discussions

The historical provider discussion included Roblox, Telegram, Google, Microsoft, Discord, GitHub, Twitch, Spotify and email.

The recorded decision was that Roblox already existed and Telegram was accepted as the next custom provider to investigate/add. Google, Microsoft, Discord, GitHub, Twitch, Spotify and email were discussed as possibilities.

**Important:** A provider being discussed or accepted as a future task is not proof that it is configured or live. Check Supabase Auth provider settings and the corresponding application code before describing provider availability.

Supabase plan limitations for custom providers were discussed. Verify current plan capabilities and provider requirements before implementation.

## 7. AI Assistant — current architecture and principles

### 7.1 Main files

- `pages/ai-assistant.html`
- `js/ai-assistant.js`
- `js/ai-enhancements.js`

Additional AI features are loaded as separate scripts where appropriate, for example:
- `js/ai-writing-studio.js` (introduced in PR #33)

### 7.2 What the existing assistant is

The original TechNova assistant uses a curated/local knowledge bank and deterministic browser-side functionality. It must not be described as a fully generative AI model unless a real generative provider/model is actually integrated and verified.

The assistant can provide information from its knowledge bank and has had event-related integration work. A server-side AI function was found during earlier investigation but was not connected to the assistant at that time.

### 7.3 AI knowledge bank — historical investigation

On 23 November 2026, an investigation recorded:
- 19 local knowledge-bank entries in `js/ai-assistant.js`.
- Zero entries in the Supabase `ai_wordbank` table at the time checked.
- A server-side AI function existed but was disconnected from the assistant.

PR #24 was proposed to increase the local knowledge bank from 19 to 95 entries by adding 76 entries across more technology topics. Its final merge status is not established in this master record and must be checked in GitHub.

### 7.4 AI development decisions

The user explicitly decided:
1. Keep the existing AI provider/functionality and free functionality; build tools around it.
2. Keep personal data in the browser wherever possible.
3. Build the agreed roadmap in order, one feature/PR at a time.
4. Keep the platform completely free; do not introduce paid external AI APIs.
5. Do not reintroduce the experimental local AI model.
6. Dashboard work is now an explicitly approved, separate phase after the AI roadmap: personal dashboard first, admin dashboard in a later separate PR.
7. Preserve existing features and create separate PRs for review/merge by the user.
8. Do not deploy production without permission.
9. Leave Supabase untouched unless separately approved.

**Capability wording:** Deterministic tools, templates, curated knowledge-bank answers, text substitutions, local calculations and external public-data lookups are not the same thing as generative AI. Describe each feature honestly.

### 7.5 AI features introduced in earlier work

PR #26 was recorded as merged by the user. Its features included:
- Browser-local chat history.
- New chat and history selection.
- Clear history.
- Helpful/not helpful feedback.
- Browser-side document extraction.
- Local document search.
- Extractive summaries.
- Document comparison.
- Flashcard/revision prompts.
- Calculator.
- Unit conversion.
- Word count.
- Optional Wikipedia search.
- Open-Meteo weather lookup using location permission.
- Frankfurter currency lookup.

Document formats recorded as supported included PDF, DOCX, PPTX, XLSX, TXT, Markdown, CSV, JSON and HTML.

Known limitations recorded:
- Scanned PDFs require OCR; OCR was not implemented.
- PPTX and XLSX extraction is text-oriented.
- Uploaded document contents were held in memory for processing and were not sent to an AI provider.
- Public-data features depend on their external services being available.

Re-test current behaviour before claiming every item remains fully operational.

## 8. AI experiment history

The experimental local WebAssembly model was tested and produced poor/repetitive responses. The user decided to remove it completely.

Historical PRs:
- **PR #28:** local model WASM fallback.
- **PR #29:** local model output-quality adjustments.
- **PR #30:** short repetitive-output guard; closed and superseded by PR #31.
- **PR #31:** removal of the experimental local model.

The recorded PR #31 branch was `remove/technova-local-ai-model`, and its intended changes were to remove `js/ai-local-model.js`, remove obsolete QA material, remove local-model routing/UI from `js/ai-enhancements.js`, and remove its script from `pages/ai-assistant.html`.

The last known historical status was that PR #31 was open/draft and had not been merged at that point. **Its current status must be checked in GitHub.** Do not reintroduce the experimental model unless the user explicitly changes this decision.

## 9. AI roadmap

The agreed roadmap is to extend the existing assistant with useful free tools. The roadmap below is **feature order**, not a promise that a GitHub PR with the same number has already been created. GitHub assigns PR numbers automatically.

| Order | Feature | Scope |
|---:|---|---|
| 1 | Advanced assistant controls | Answer formatting, copy/download controls and saved preferences |
| 2 | AI Writing Studio | Basic proofreading, tone/wording tools, shorten/expand prompts, paraphrase and simplify |
| 3 | Quiz generator | Multiple choice, true/false, difficulty, scoring and explanations |
| 4 | Flashcards | Document-based cards, flip, mastered/practice status and shuffle |
| 5 | Study planner | Assignments, deadlines, revision schedules, tasks and progress; browser storage |
| 6 | Online code editor | HTML/CSS/JS editor, live preview, download and examples |
| 7 | Developer toolkit | Formatting, JSON validation, HTML/CSS utilities, regex tester, colour picker and code explanations/examples |
| 8 | Website builder | Template/instruction-based site creation, editable HTML/CSS/JS, preview and ZIP export |
| 9 | Document studio | Supported PDF/document utilities, merge/split where libraries permit, conversions, notes and summaries |
| 10 | Notes and productivity | Local notes, organisation, search/export, to-do lists and checklists |
| 11 | Presentation/report creator | Outlines, slide/report content, templates and supported exports |
| 12 | Research assistant | Free search services, sourced summaries, links and clear distinction between sourced facts and explanations |
| 13 | Language toolkit | Optional free translation service, language identification, simplification and vocabulary practice |
| 14 | Image studio | Browser-side resize, crop, format conversion and filters |
| 15 | Creative studio | Posters, social graphics, templates and downloads |
| 16 | Export tools | Conversation TXT/PDF/DOCX export and import/export utilities |
| 17 | Privacy and performance | Browser-storage review, error handling, speed, accessibility and privacy/security review |

### 9.1 Technical principles for roadmap work

- Use existing project architecture and browser JavaScript where practical.
- Prefer local processing and IndexedDB/local storage for user-owned content.
- Use open-source browser libraries where appropriate and compatible.
- Public/free APIs may be used only where they are genuinely free and their privacy/availability implications are made clear.
- No paid AI APIs, paid model inference, or experimental local AI model.
- Do not promise generative capabilities from deterministic templates or substitutions.
- Preserve existing assistant, uploads, chat history and quick tools.
- Dashboard work is outside the AI feature roadmap and is handled in separately approved dashboard PRs.
- No Supabase changes without separate approval.

## 10. Pull request and development history

This table records known PR history. Where a final state has not been verified, it is explicitly marked unknown.

| PR | Work | Recorded status / notes |
|---:|---|---|
| #24 | Expand local AI knowledge bank from 19 to 95 entries | Proposed; final merge status unknown |
| #26 | Browser-side AI enhancements, history, document tools and utilities | Recorded as merged by user |
| #28 | Local model WASM fallback | Historical experiment; later superseded |
| #29 | Local model output quality adjustments | Recorded as merged by user; still poor output |
| #30 | Short repetitive-output guard | Closed, not merged; superseded by #31 |
| #31 | Remove experimental local model | Last recorded as open draft; current state must be checked |
| #32 | Advanced assistant controls | Confirmed merged by user |
| #33 | AI Writing Studio | Merged into `main` on 25 November 2026 (verified via GitHub PR state) |
| #34 | Central TechNova master document | Merged into `main` on 25 November 2026 (verified before dashboard work) |
| #35 | Browser-based Quiz Generator | Merged into `main` on 25 November 2026; deterministic note-based questions, scoring and explanations; no AI API or backend changes |
| #36 | Personal dashboard refresh | Merged into `main` on 25 November 2026; responsive member workspace, read-only user-scoped totals and saved-event previews; merge verified via GitHub |
| #39 | Personal dashboard workspace refinement | Merged into `main` on 25 November 2026; adds upcoming registrations and recent activity and fixes the registered-events panel |
| #40 | Personal dashboard command-centre enhancement | Merged into `main` on 25 November 2026; searchable directory, local pins/recent pages/notes/widget preferences |
| #41 | Dashboard AI workspace integration | Merged into `main` on 25 November 2026 (verified via GitHub); embeds the existing free assistant and tools in the personal dashboard while retaining the dedicated AI page |
| #42 | Personal dashboard command palette | Merged into `main` on 25 November 2026; local searchable Quick open dialog with Ctrl/Cmd+K and keyboard navigation |
| #43 | Personal dashboard focus workspace | Merged into `main` on 25 November 2026; private browser-local task planner and visual refinements; merge commit `c0d5f3329e68f697a4857bfaa109d063b30727d5` |
| #44 | Expanded personal dashboard workspace | Open draft PR: [#44](https://github.com/Elliots-Boys/TechNova/pull/44); calendar, habits, notes, insights, projects, local developer utilities, study prompts and community/admin quick links; browser-local data only; not merged or deployed |

| #37 | Admin dashboard refinement and dashboard-first login redirects | Merged into `main` on 25 November 2026; browser/provider QA remains outstanding |
| #38 | Refresh cached authentication script for dashboard redirects | Open draft PR; updates the login and signup script cache version; no auth logic or backend changes |

### 10.1 PR #32 — Advanced assistant controls

Recorded branch: `feature/technova-ai-assistant-controls-32`

Changes:
- Answer format selector for paragraphs, bullet points and numbered lines.
- Save selected format in local storage.
- Copy latest assistant answer.
- Download latest assistant answer as TXT.
- Response formatting before rendering.
- QA checklist.

The JavaScript syntax check was recorded as passing. Full browser end-to-end testing was not performed by the assistant. The user subsequently confirmed that PR #32 was merged.

### 10.2 PR #33 — AI Writing Studio

PR: [https://github.com/Elliots-Boys/TechNova/pull/33](https://github.com/Elliots-Boys/TechNova/pull/33)

Branch: `feature/technova-ai-writing-studio-33`

Created: 25 November 2026.

Files:
- `js/ai-writing-studio.js`
- `pages/ai-assistant.html`
- `docs/technova-ai-pr33-qa.md`

Features:
- Basic rule-based spelling and punctuation cleanup.
- Formal/friendly wording substitutions.
- Simplification and concise wording substitutions.
- Lightweight paraphrasing.
- Expansion prompts that ask the writer to add their own evidence/examples rather than inventing facts.
- Copy result, download TXT, use result as input, clear and character counter.
- Local browser processing; no AI API or upload.

Limitations:
- It is not a generative AI model or a full grammar checker.
- It may miss errors or change nuance.
- Users must review the output.
- Manual browser/device testing remains necessary.

PR #33 was subsequently merged into `main` on 25 November 2026. Its original implementation details and limitations remain as described above.

### 10.3 PR #35 — Browser-based Quiz Generator

PR: [https://github.com/Elliots-Boys/TechNova/pull/35](https://github.com/Elliots-Boys/TechNova/pull/35)

Branch: `feature/technova-ai-quiz-generator-35`

Merged into `main` on 25 November 2026 (verified in GitHub).

Files:
- `js/ai-quiz-generator.js`
- `pages/ai-assistant.html`
- `docs/technova-ai-pr35-qa.md`

The generator creates multiple-choice, true/false or mixed revision questions from user-pasted notes, with heuristic difficulty, answer checking, explanations, progress and scoring. It runs in the browser and does not upload or persist source text. It is a deterministic revision aid, not a generative AI model; generated questions can be awkward or ambiguous and should be checked against the source notes. Browser/device regression testing remains a manual QA task.

## 11. Dashboard refresh — approved direction

On 25 November 2026, the user approved improving both dashboards in separate PRs, with the personal dashboard first.

- **Personal dashboard:** PR #36 (`feature/technova-personal-dashboard-36`) was merged into `main` on 25 November 2026 (verified via GitHub). It refreshes `pages/dashboard.html` as a responsive member workspace with account identity/profile, user-scoped read-only registration and saved-event totals, registered-event activity, saved-event previews and links to existing TechNova areas. Browser/device QA remains a manual check.
- **Admin dashboard:** PR #37 is the separate follow-up for `pages/admin.html`. It refines the existing administrator workspace rather than replacing its existing event, user, registration, article, quiz, website-content and audit-log tools. The existing `checkAdmin()` role verification remains in place.

Dashboard work must preserve existing account/authentication behaviour, avoid fake activity or fabricated statistics, keep user-scoped data protected by existing RLS, and avoid backend changes unless the user separately approves them. Every feature PR must update this master document in that same PR.

## 12. Admin dashboard and authentication routing

The admin dashboard remains in `pages/admin.html` and retains its existing feature areas: overview metrics, event management, user/profile management, registrations, articles, quiz management, website content and administrator activity.

PR #37 refines the existing administrator workspace with:
- A control-centre introduction and a link back to the personal dashboard.
- A manual refresh button that calls the existing data-loading flow and prevents overlapping refreshes.
- A visible last-refreshed status.
- Sticky, horizontally scrollable section tabs on smaller screens, with an accessible current-tab indicator.
- Improved spacing, card hierarchy, keyboard focus, hover and reduced-motion behaviour.

The existing `checkAdmin()` check remains responsible for requiring an authenticated user and a `user_roles.role` value of `admin` before administrator data is loaded. The refresh action does not add database writes or replace the existing permission checks.

PR #37 also changes the default return destination in `js/auth.js` to `/pages/dashboard.html` for email and OAuth sign-in when no explicit destination is supplied. An already signed-in visitor opening the login form is sent to the same default destination. Explicit same-origin OAuth `redirect` requests and the existing `next=events.html` / `next=google-drive.html` flows are retained. Password-reset URLs are exempt from the automatic login-page redirect.

No Supabase schema, RLS policy, settings, Edge Function, production data or deployment changes are included. Provider OAuth and browser-session behaviour require manual preview testing.


These instructions reflect the user's explicit preferences.

1. **Inspect first.** Check the current repository, target files, current branch/base and related features before editing.
2. **One feature at a time.** Finish the current PR review/merge cycle before starting the next roadmap feature, unless the user explicitly approves a different approach.
3. **Separate branches and PRs.** Keep each feature isolated and reviewable.
4. **User controls merging.** Create the PR; the user reviews and merges it.
5. **No production deployment without explicit permission.**
6. **No Supabase/backend changes without separate explicit approval.**
7. **Dashboard work is separately scoped.** The personal dashboard is first; the admin dashboard follows in its own PR after review/merge.
8. **No unrelated refactoring.** Change only files required for the approved scope.
9. **Preserve existing functionality.** Consider chat, history, uploads, assistant tools, navigation and other site features when regression testing.
10. **Be honest about testing.** Distinguish syntax checks, static inspection, automated tests, manual browser tests and production verification. Never claim a test passed if it was not run.
11. **Verify previews.** Do not invent or assume Cloudflare preview URLs. Confirm a preview deployment exists and is accessible before sharing it as verified.
12. **Explain trade-offs.** Clearly identify local processing, external services, data retention and feature limitations.

### 11.1 Suggested PR checklist

- [ ] Confirm the current PR/feature has been approved to proceed.
- [ ] Inspect latest `main` and relevant source files.
- [ ] Create a feature-specific branch from the correct base.
- [ ] Implement only the agreed scope.
- [ ] Review the diff for accidental/unrelated changes.
- [ ] Run relevant syntax, build and automated checks where available.
- [ ] Perform browser tests where possible; otherwise provide honest manual QA steps.
- [ ] Check responsive layout and keyboard/accessibility basics.
- [ ] Check for secrets, unnecessary external requests and privacy concerns.
- [ ] Add/update QA documentation.
- [ ] Open a draft PR with scope, limitations and test evidence.
- [ ] Verify any Cloudflare preview before sharing it.
- [ ] Wait for the user to review and merge.
- [ ] Update this master document in the same PR with the feature scope, files, decisions, testing and PR link/status; update the record again when merge/deployment is verified.

## 13. Non-negotiable development workflow

1. Use a separate feature branch and pull request for each independently reviewable change.
2. Preserve existing working features and keep changes within the approved scope.
3. Do not merge PRs or deploy to production unless the user explicitly asks.
4. Do not change Supabase schema, policies, settings, Edge Functions or production data without separate explicit approval.
5. Include a QA checklist and state honestly which checks were performed versus which require browser/manual testing.
6. Update `TECHNOVA_MASTER_DOCUMENT.md` inside every PR, including its scope, files, decisions, validation, PR link and accurate open/merged/deployed status.
7. When merge or deployment status changes, update the master document in the next relevant PR.

## 14. SEO and public discovery

Historical work included:
- `robots.txt`
- `sitemap.xml`
- Google Search Console setup and checks.

The repository's `robots.txt` points to:

`https://technova-bmm.pages.dev/sitemap.xml`

The sitemap lists the site's public pages.

An earlier Search Console check had not yet returned performance data. Re-check Search Console for current indexing, clicks, impressions, coverage and sitemap status before drawing conclusions.

## 15. Known gaps and items requiring verification

This section intentionally records uncertainty so historical notes are not mistaken for current truth.

| Item | What is known | What to verify |
|---|---|---|
| PR #24 | Knowledge-bank expansion was proposed | Current PR/commit and merge status |
| PR #31 | Model removal PR was previously open/draft | Current PR status and whether removal is in main |
| PR #36 | Personal dashboard refresh | Merged into `main` on 25 November 2026; browser/device QA outstanding |
| PR #39 | Personal dashboard workspace refinement | Merged into `main` on 25 November 2026; browser/device QA remains outstanding |
| PR #40 | Personal dashboard command-centre enhancement | Merged into `main` on 25 November 2026; browser/device and signed-in account QA remain outstanding |
| PR #37 | Admin dashboard refinement and dashboard-first login redirects | Merged into `main` on 25 November 2026; browser QA outstanding |
| PR #43 | Personal dashboard focus workspace | Merged into `main` on 25 November 2026; browser QA outstanding; no backend changes |
| Admin dashboard | Existing `pages/admin.html` includes overview, user, event, registration, article, quiz, website and activity sections; PR #37 refines its workspace UI and refresh flow | Browser QA outstanding |
| Login destination | PR #37 changes the default post-login destination to `pages/dashboard.html`; explicit same-origin OAuth redirects and supported `next` destinations remain | Test email and each configured OAuth provider on preview/live domains |
| Community | Earlier review found no complete post/reply forum | Current implementation |
| OAuth providers | Roblox/Telegram and other providers were discussed | Actual Supabase provider configuration and live flows |
| OAuth app authorisation | Consent, authorised-app and developer pages exist | Full OAuth protocol, callback, scopes and security validation |
| AI knowledge bank | 19 local entries and empty Supabase table were recorded on 23 Nov | Current local entries and current table contents |
| Server-side AI function | Function existed but was disconnected at the time | Current function deployment and integration |
| Database warnings | Historical warnings were noted | Current database advisor/security state |
| Cloudflare Worker | Historical deployment was discussed | Current Worker name, code, bindings and status |
| Search Console | Setup/checks were discussed | Current verification and performance data |
| Browser storage | AI chat/document work used local browser processing | Current retention, clearing and export behaviour |

## 16. Change log for this master document

| Date | Update |
|---|---|
| 25 Nov 2026 | Consolidated project identity, infrastructure, page map, historical architecture decisions, AI roadmap, PR history, development rules and verification gaps from available project context and repository inspection. |
| 25 Nov 2026 | Verified PRs #33–#37 merged into `main`; PR #36 personal dashboard and PR #37 admin dashboard/auth routing are merged. |
| 25 Nov 2026 | Verified PRs #40–#43 merged into `main`; PR #43 adds a browser-local focus planner to the personal dashboard. |
| 25 Nov 2026 | PR #44 opened as a draft with calendar, habit, notes, insights, project, developer, study and community workspace widgets; master document and QA checklist included in the PR. |

---

## 22. Expanded personal dashboard workspace (PR #44)

The user requested that the dashboard receive the full set of suggested personal workspace additions. PR #43 was inspected and verified merged into `main` before this work began. The new implementation is isolated on branch `feature/technova-dashboard-complete-workspace-44`.

Scope:
- Add a personal calendar widget with month navigation, date selection, browser-local reminders and markers/list entries for due dates from the existing Focus task board.
- Add a habit tracker with daily check-ins, current streaks, a maximum of 12 habits and local persistence.
- Add a multi-note workspace with note creation, editing, search, deletion and TXT export; retain the existing quick scratchpad separately.
- Add personal insights calculated from real local task, habit, reminder and project records, plus the existing signed-in account registration/saved-event totals.
- Add a lightweight local project list with Planning, In progress, On hold and Complete stages.
- Add local developer utilities for JSON formatting/minification/validation and colour selection/HEX copying, plus links to existing developer tools.
- Add study prompt buttons that prefill the existing TechNova Assistant, plus links to existing Learning/Academy content.
- Add a community and spaces hub linking to existing Community, Ideas, Leaderboard, Showcase, Directory, Learning, Private Cloud and Google Drive pages.
- Add administrator quick links to existing admin pages only after the existing role check succeeds. The admin panel is deliberately excluded from ordinary widget visibility toggles so a non-admin cannot reveal it by changing Personalise settings.
- Add Personalise toggles for the new member-facing widgets and a manual QA checklist.

Files:
- `pages/dashboard.html`
- `js/dashboard-workspace.js`
- `docs/technova-dashboard-complete-workspace-pr44-qa.md`
- `TECHNOVA_MASTER_DOCUMENT.md`

Privacy, architecture and limitations:
- Calendar reminders, habits, notes and projects are stored only in the current browser's local storage. They are not synced to Supabase or other devices.
- Insights use actual local workspace records and the dashboard's existing read-only, user-scoped account totals. No fabricated statistics are introduced.
- JSON formatting parses and serialises data; it does not execute code. The study controls only prefill the existing free browser-based assistant; they do not add a generative model.
- Community, Academy, cloud storage, and advanced developer tools are linked to existing pages. This dashboard PR does not create a new discussion forum, messaging system, app store, cloud-sync service, new courses, or server-side community features.
- Admin quick links are navigation only; the destination pages keep their own permission checks.
- No Supabase schema, RLS, settings, Edge Functions, credentials, production data, other page implementations, or Cloudflare deployment changes.
- JavaScript syntax and static markup checks passed before PR creation. Real signed-in browser, responsive, keyboard and screen-reader testing remains a manual QA requirement.

Pull request: [#44 — Expand the TechNova personal dashboard into a complete workspace](https://github.com/Elliots-Boys/TechNova/pull/44). GitHub confirms it is open as a draft and not merged. No Cloudflare deployment was performed or authorised.

## 17. Instructions for future maintainers and AI assistants

Before making a TechNova change:
1. Read this document.
2. Check the live repository and current PR state; this document is a project memory, not a substitute for current GitHub state.
3. Confirm the requested scope with the user's existing decisions.
4. Do not infer that a planned or historical feature is live.
5. Follow the development workflow in Section 13.
6. Update this document when a meaningful decision or project state changes.

**When uncertain, preserve the existing implementation and ask before changing infrastructure, Supabase, authentication, the dashboard, or production.**


## 18. Personal dashboard command-centre enhancement (PR #40)

The user clarified that the dashboard is the signed-in landing page for TechNova, not a replacement for the rest of the website. All existing public/member pages and the normal site navigation must remain available. The personal dashboard is being expanded as a command centre while the separate administrator dashboard remains separate.

Planned/implemented scope on branch `feature/technova-personal-dashboard-command-centre-40`:
- Rework the personal dashboard visual hierarchy into a responsive command-centre layout while retaining the existing TechNova header, logout control, footer and account sign-in guard.
- Add a searchable, category-filtered directory of existing TechNova pages and tools, with a link to the full site map.
- Add locally saved pinned shortcuts and a recently opened list.
- Add a browser-local quick note and controls to show/hide supported dashboard widgets.
- Retain a preview of the user's saved events using the existing saved-events helper.
- Retain read-only, authenticated-user-scoped registration and saved-event counts, event previews and the existing admin role lookup.
- Keep the normal website pages, their routes, and the admin dashboard implementation unchanged.

Privacy/technical boundaries:
- Pins, recent dashboard links, widget visibility and the quick note are stored in the current browser only; they are not synced to Supabase or another device.
- No new backend writes, schema/RLS changes, settings changes, Edge Functions, credentials, or external services.
- No production deployment. Browser/device QA remains required.

Pull request: [#40 — Turn the personal dashboard into a TechNova command centre](https://github.com/Elliots-Boys/TechNova/pull/40). It was merged into `main` on 25 November 2026 (verified via GitHub). Browser/device and signed-in account QA remain outstanding; no production deployment was performed.


## 19. Dashboard AI workspace integration (PR #41)

The user requested that the existing TechNova AI assistant be built into the signed-in personal dashboard while keeping its dedicated page. PR #40 was confirmed merged before this work began. PR #41 is built on a new branch from `main`.

Scope:
- Add an integrated AI chat panel directly below the dashboard hero, with suggested prompts and a link to the full dedicated AI Assistant page.
- Load the existing `js/ai-assistant.js` and `js/ai-enhancements.js` on the dashboard, reusing the current free wordbank, document tools, calculations, conversions, public lookups, chat history, answer formatting and export controls.
- Add a Personalise toggle for the integrated AI panel.
- Retain the dedicated `pages/ai-assistant.html` page and do not modify its implementation.
- Bump dashboard/assistant script cache versions for the new dashboard integration.

Important limitations and privacy:
- This is the existing free browser-based assistant, not a newly connected generative AI model or paid provider.
- Document operations remain local and extractive/keyword based; scanned PDF OCR is not included.
- Existing assistant features may call public services such as Wikipedia, Open-Meteo and Frankfurter only when the corresponding tool is requested; weather asks for browser location permission.
- No Supabase schema, RLS, settings, Edge Functions, credentials, production data, other pages or admin dashboard changes.
- No Cloudflare deployment. Signed-in browser and device QA is required.

Pull request: [#41 — Embed the TechNova AI assistant in the personal dashboard](https://github.com/Elliots-Boys/TechNova/pull/41). It was merged into `main` on 25 November 2026 (verified via GitHub). Browser/device and signed-in account QA remain outstanding; no production deployment was performed.

## 20. Personal dashboard command palette (PR #42)

PR #41 was verified merged into `main` before this follow-up. PR #42 adds a fast launcher to the personal dashboard without replacing the existing Explore TechNova directory or site navigation.

Scope:
- Add a Quick open button and a keyboard shortcut (Ctrl+K on Windows/Linux; Cmd+K on macOS).
- Provide a native accessible dialog with live search over the existing dashboard page directory.
- Support keyboard selection with Arrow Up/Down, Enter to open and Escape to close.
- Record destinations opened through the palette in the existing browser-local Recently opened list.
- Retain all existing page routes, pins, filters, dashboard widgets, assistant, events and account controls.

Privacy and technical boundaries:
- Search is performed locally against existing `data-app-link` elements. No search terms or usage data are sent to a server.
- Reuses existing browser-local recent-page storage; no new persistence or external library.
- No Supabase schema, RLS, settings, Edge Functions, credentials, production data, admin dashboard or other site page changes.
- No Cloudflare deployment. Keyboard, screen-reader, responsive and signed-in browser QA remain required.

Pull request: [#42 — Add a keyboard-accessible dashboard command palette](https://github.com/Elliots-Boys/TechNova/pull/42). Merged into `main` on 25 November 2026 (verified via GitHub). Browser keyboard, screen-reader and responsive QA remain outstanding; no production deployment was performed.

## 21. Personal dashboard focus workspace (PR #43)

PR #42 was verified merged into `main` before this follow-up. PR #43 expands the personal workspace with a private task planner and a more polished command-centre presentation.

Scope:
- Add a Focus board with task creation, optional due dates, completion toggles, individual deletion, clearing completed tasks and a completion progress indicator.
- Sort active tasks before completed tasks, then by due date and creation order.
- Add a Personalise visibility control for the Focus planner.
- Refine the existing dashboard hero, visual depth, stat cards and focus-panel responsive layout.
- Bump the dashboard script cache version and add a manual QA checklist.

Privacy and technical boundaries:
- Tasks are stored in the current browser only under `technova.dashboard.tasks.v1`; they are not synced to Supabase or another device.
- The board allows up to 50 tasks and uses safe DOM text rendering.
- Existing AI assistant, command palette, directory, events, pins, notes, account and admin-role checks are retained.
- No Supabase schema, RLS, settings, Edge Functions, credentials, production data, admin dashboard or other page changes.
- No Cloudflare deployment. Signed-in browser, mobile, keyboard and screen-reader QA remain required.

Pull request: [#43 — Add a personal focus planner to the TechNova dashboard](https://github.com/Elliots-Boys/TechNova/pull/43). Merged into `main` on 25 November 2026 (verified via GitHub; merge commit `c0d5f3329e68f697a4857bfaa109d063b30727d5`). No Cloudflare deployment was performed.
