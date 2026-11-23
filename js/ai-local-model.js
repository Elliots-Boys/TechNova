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

      // A non-isolated page cannot use SharedArrayBuffer. Force ONNX Runtime
      // to use its single-threaded WASM path instead of trying a threaded worker.
      const wasm = lib.env.backends && lib.env.backends.onnx && lib.env.backends.onnx.wasm;
      if (!wasm) throw new Error('The ONNX Runtime WASM configuration is unavailable.');
      if (!window.crossOriginIsolated || typeof SharedArrayBuffer === 'undefined') {
        wasm.numThreads = 1;
        wasm.proxy = false;
      }

      const report = (event) => {
        if (typeof onProgress === 'function' && event && event.status === 'progress') {
          const pct = Number.isFinite(event.progress) ? Math.round(event.progress) : null;
          onProgress({ file: event.file || 'model file', percent: pct });
        }
      };

      let gpuFailure = null;
      // navigator.gpu can exist even when the browser cannot provide an adapter.
      if (navigator.gpu && typeof navigator.gpu.requestAdapter === 'function') {
        try {
          const adapter = await navigator.gpu.requestAdapter();
          if (adapter) {
            generator = await lib.pipeline('text2text-generation', MODEL, {
              dtype: 'q8',
              device: 'webgpu',
              progress_callback: report
            });
            backend = 'WebGPU';
          } else {
            gpuFailure = new Error('The browser did not provide a WebGPU adapter.');
          }
        } catch (error) {
          gpuFailure = error;
          generator = null;
        }
      } else {
        gpuFailure = new Error('WebGPU is not available in this browser context.');
      }

      if (!generator) {
        if (typeof onProgress === 'function') {
          onProgress({ message: 'Using single-threaded browser CPU/WASM mode.' });
        }
        try {
          generator = await lib.pipeline('text2text-generation', MODEL, {
            dtype: 'q8',
            progress_callback: report
          });
          backend = 'browser CPU (single-threaded WASM)';
        } catch (wasmError) {
          const gpuMessage = gpuFailure && gpuFailure.message ? gpuFailure.message : 'unavailable';
          throw new Error('WebGPU: ' + gpuMessage + ' CPU/WASM: ' +
            (wasmError && wasmError.message ? wasmError.message : String(wasmError)));
        }
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
