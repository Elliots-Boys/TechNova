# TechNova dashboard AI workspace — PR #41 QA

## Scope
Integrates the existing TechNova AI assistant into the signed-in personal dashboard. The dedicated `pages/ai-assistant.html` page remains available and unchanged. Existing public/member pages, navigation and the separate admin dashboard remain intact.

## Static checks
- [ ] `pages/dashboard.html` contains one each of `aiForm`, `aiInput`, `aiChat` and `aiStatus`.
- [ ] Dashboard AI widget has a matching Personalise toggle.
- [ ] AI scripts load after Supabase configuration and the existing dashboard/auth scripts.
- [ ] Assistant and enhancement script cache versions are bumped.
- [ ] Existing full AI Assistant page and script files are unchanged.
- [ ] No duplicate element IDs.
- [ ] Dashboard JavaScript and AI JavaScript pass syntax checks.

## Manual browser checks
- [ ] Sign in as a normal member and verify the assistant appears on the dashboard.
- [ ] Ask a basic knowledge-bank question and verify the response appears.
- [ ] Try a date/time question, calculator, unit conversion and upcoming events.
- [ ] Try a Wikipedia lookup and weather request; check browser permission is requested only for weather.
- [ ] Upload supported TXT, MD, CSV, JSON, HTML, PDF, DOCX, PPTX and XLSX documents; verify extracted text stays in the current browser tab.
- [ ] Test document search, extractive summary, comparison, flashcard/revision prompts.
- [ ] Check chat history, new chat, history selector, clear history, answer format/length, copy and download.
- [ ] Check the Personalise control can hide/show the assistant and the preference persists after refresh.
- [ ] Test mobile/tablet layout, keyboard navigation, focus indicators and reduced motion.
- [ ] Open the dedicated AI Assistant page and verify it still works independently.
- [ ] Confirm other dashboard widgets, all page shortcuts, events, saved events and admin-role gating still work.

## Limitations
- The assistant remains the existing free deterministic/browser-based system and curated knowledge bank, not a generative AI model. It can be unable to answer questions outside its known tools/topics.
- Document summaries and searches are extractive/keyword-based. Scanned PDFs need OCR, which is not included.
- Chat history/preferences and uploaded document contents remain local to the browser tab/device as implemented by existing AI features.
- Weather requires optional browser location permission; Wikipedia/weather/currency features contact their named public services when requested.
- Real signed-in browser testing and mobile/device QA are required.

## Infrastructure
- No Supabase schema, RLS policy, settings, Edge Function, credential or production-data changes.
- No Cloudflare deployment.
- No changes to the dedicated AI page, other site pages, or admin dashboard.
