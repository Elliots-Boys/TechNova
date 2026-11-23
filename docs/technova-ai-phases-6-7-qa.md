# TechNova AI phases 6–7: QA and release checklist

This checklist covers the optional browser-local model and the integration with the existing free assistant. It is a manual browser test plan, not evidence that these checks have already passed.

## Phase 6 — optional on-device model

- [ ] Open `pages/ai-assistant.html` on a secure origin (HTTPS or localhost).
- [ ] Confirm the model is not downloaded and is not active on first page load.
- [ ] Confirm the existing free assistant works without enabling the model.
- [ ] Select **Download & enable local AI** and confirm progress/status feedback appears.
- [ ] Confirm WebGPU is selected when supported; otherwise confirm the browser CPU/WASM fallback is used.
- [ ] Ask a general question and confirm the response is marked as generated locally.
- [ ] Upload a small text document and ask a question grounded in its contents; confirm the local model receives only the selected excerpts.
- [ ] Pause the local model and confirm the free fallback is used.
- [ ] Resume the loaded model and confirm local answers work again.
- [ ] Unload the model and confirm the in-memory model is released and the fallback still works.
- [ ] Reload the page and confirm the model is not automatically re-enabled or downloaded.
- [ ] Test with WebGPU unavailable, offline after model caching, and a failed model download.
- [ ] Check the browser Network panel: model/runtime downloads are expected after opt-in; prompts and document text must not be sent to an inference endpoint.

## Phase 7 — integration and regression

- [ ] Check desktop and mobile layouts at narrow and wide viewport sizes.
- [ ] Check keyboard-only operation, visible focus, button labels, and live status announcements.
- [ ] Confirm chat history, clear-history, feedback, and answer-length controls still work.
- [ ] Confirm PDF, DOCX, PPTX, XLSX, TXT, Markdown, CSV, JSON, and HTML extraction still works.
- [ ] Confirm document summaries, passage search, comparison, flashcards, and revision prompts still work with local AI disabled.
- [ ] Confirm calculator, unit conversion, word count, date/time, weather, currency, and Wikipedia routes still use their existing handlers.
- [ ] Confirm local-model failures return to the free assistant rather than blocking the chat.
- [ ] Confirm no API keys, paid inference endpoints, Supabase schema changes, or Edge Function changes are introduced.
- [ ] Review browser console for runtime/CDN/model errors.
- [ ] Test on at least one WebGPU-capable browser/device and one browser/device without WebGPU before release.

## Known limitations

- The first model download can be substantial and requires an internet connection. The browser may cache model files for later sessions.
- WebGPU availability and performance vary by browser, operating system, and GPU. The CPU/WASM fallback may be slow.
- The selected compact model can make mistakes and is not a substitute for checking important facts.
- Local inference is opt-in. The model is not loaded automatically.
- The model is downloaded from the public Hugging Face model repository; the Transformers.js runtime is loaded from jsDelivr. Inference itself runs in the browser.
- No browser end-to-end run has been completed as part of this source change. Complete the checklist in a preview deployment before merging or production deployment.
