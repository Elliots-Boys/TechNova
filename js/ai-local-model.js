/* TechNova optional on-device language model.
 * The model is downloaded only after an explicit user click.
 * Prompts and document excerpts are passed to the model in this browser;
 * no inference API or application server is used.
 */
(() => {
  'use strict';
  const MODEL = 'Xenova/flan-t5-small';
  const TRANSFORMERS_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2';
  let generator = null;
  let loading = null;
  let enabled = false;
  let busy = false;
  let backend = 'not loaded';

  function isEnabled() { return enabled && !!generator; }
  function isLoaded() { return !!generator; }
  function isBusy() { return busy || !!loading; }
  function getBackend() { return backend; }

  async function load(onProgress) {
    if (generator) { enabled = true; return { backend }; }
    if (loading) return loading;
    loading = (async () => {
      const lib = await import(TRANSFORMERS_URL);
      lib.env.allowLocalModels = false;
      lib.env.useBrowserCache = true;
      const report = (event) => {
        if (typeof onProgress === 'function' && event && event.status === 'progress') {
          const pct = Number.isFinite(event.progress) ? Math.round(event.progress) : null;
          onProgress({ file: event.file || 'model file', percent: pct });
        }
      };
      if (navigator.gpu) {
        try {
          generator = await lib.pipeline('text2text-generation', MODEL, {
            dtype: 'q8',
            device: 'webgpu',
            progress_callback: report
          });
          backend = 'WebGPU';
        } catch (gpuError) {
          generator = null;
          if (typeof onProgress === 'function') onProgress({ message: 'GPU setup was unavailable; trying the compatible browser CPU engine.' });
        }
      }
      if (!generator) {
        generator = await lib.pipeline('text2text-generation', MODEL, {
          dtype: 'q8',
          progress_callback: report
        });
        backend = 'browser CPU (WASM)';
      }
      enabled = true;
      return { backend };
    })();
    try {
      return await loading;
    } catch (error) {
      generator = null;
      enabled = false;
      backend = 'not loaded';
      throw error;
    } finally {
      loading = null;
    }
  }

  async function generate(prompt) {
    if (!isEnabled()) return null;
    if (busy) throw new Error('The local model is already answering. Please wait.');
    busy = true;
    try {
      const result = await generator(String(prompt).slice(0, 4200), {
        max_new_tokens: 128,
        do_sample: false
      });
      const answer = result && result[0] && result[0].generated_text;
      return typeof answer === 'string' && answer.trim() ? answer.trim() : null;
    } finally {
      busy = false;
    }
  }

  function pause() { enabled = false; }
  function resume() {
    if (!generator) return false;
    enabled = true;
    return true;
  }
  function unload() {
    enabled = false;
    generator = null;
    backend = 'not loaded';
  }

  window.TechNovaLocalAI = {
    load, generate, pause, resume, unload,
    isEnabled, isLoaded, isBusy, getBackend,
    model: MODEL
  };
})();