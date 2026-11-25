# TechNova AI PR #32 — QA checklist

This PR adds answer presentation controls to the existing free assistant. It does not add an AI model or AI API.

## Changes
- Add a response format preference: paragraphs, bullet points, or numbered lines.
- Persist the selected format in browser local storage.
- Add a button to copy the latest assistant answer.
- Add a button to download the latest assistant answer as a plain-text file.
- Preserve the existing answer-length selector, chat history, document tools, quick tools, feedback and knowledge-bank fallback.
- Bump the assistant enhancement script cache version.

## Manual checks
- [ ] Open the AI assistant page and confirm the format selector and answer action buttons appear.
- [ ] Select each format and submit a question; confirm the answer is displayed in the chosen format.
- [ ] Reload the page and confirm the selected format is remembered in this browser.
- [ ] Copy an answer and paste it into a text editor.
- [ ] Download an answer and confirm the TXT file contains the latest answer.
- [ ] Confirm the controls show a useful status if there is no answer yet.
- [ ] Switch conversations and confirm copying uses the currently displayed conversation's latest answer.
- [ ] Confirm chat history and stored message text remain usable.
- [ ] Regression-check document upload, summaries, flashcards, calculator, unit conversion, weather, currency, Wikipedia and knowledge-bank fallback.
- [ ] Check browser console and mobile layout.

## Limitations
- Formatting changes presentation only; it does not make the underlying wordbank or deterministic tools generate new knowledge or behave like a generative AI model.
- Copy requires clipboard permission or browser copy support.
- No live browser/device end-to-end testing has been completed by this change.
- No dashboard, Supabase, paid AI API, model runtime or production deployment changes are included.
