# TechNova AI PR #33 — Writing Studio QA

## Summary
Adds a separate Writing Studio to the AI Assistant page. Text transformations run locally in the browser; no text is uploaded and no AI model/API is called.

## Included
- Basic rule-based spelling, capitalisation and punctuation cleanup.
- Formal, friendlier, simpler and more concise wording substitutions.
- Lightweight paraphrasing using word substitutions.
- Expand mode adds prompts to develop the writer's own points; it does not invent supporting facts.
- Copy, download as TXT, reuse result as input, clear, and character count.
- Explicit limitations notice: this is not a full grammar checker or generative AI.

## Manual checks
- [ ] Writing Studio appears on the AI Assistant page without replacing the chat.
- [ ] Empty input gives a helpful message.
- [ ] Test each transformation with sample text and inspect the output.
- [ ] Confirm input/output text stays in the current page and is not sent to the chat.
- [ ] Copy result and paste into a text editor.
- [ ] Download TXT and confirm it contains the result.
- [ ] Use result as input, clear, and confirm character count updates.
- [ ] Test long text near the 30,000-character limit and mobile layout.
- [ ] Check browser console and regression-test chat, history, uploads and existing quick tools.

## Limitations
- All transformations are deterministic substitutions and formatting rules, not contextual AI rewriting.
- Basic proofreading catches only a small set of common errors; it cannot guarantee correct grammar or spelling.
- Paraphrasing may change meaning; users must review the result.
- Expand mode provides prompts, not new factual content.
- No live browser/device end-to-end test or production deployment is included.
- No dashboard, Supabase, database, Edge Function, paid API or model changes are included.
