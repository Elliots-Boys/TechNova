/* TechNova AI Writing Studio — local writing helpers; no AI API or upload. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fixes = [
    [/\bteh\b/gi, 'the'], [/\brecieve\b/gi, 'receive'],
    [/\bseperate\b/gi, 'separate'], [/\bdefinately\b/gi, 'definitely'],
    [/\boccured\b/gi, 'occurred'], [/\buntill\b/gi, 'until'],
    [/\bwich\b/gi, 'which'], [/\bthier\b/gi, 'their'],
    [/\bdont\b/gi, "don't"], [/\bcant\b/gi, "can't"],
    [/\bwont\b/gi, "won't"], [/\bdoesnt\b/gi, "doesn't"],
    [/\bdidnt\b/gi, "didn't"], [/\bisnt\b/gi, "isn't"],
    [/\bim\b/g, "I'm"], [/\b i \b/g, ' I ']
  ];
  function proofread(text) {
    let out = text.replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/ +([,.!?;:])/g, '$1').replace(/([,.!?])(?=\S)/g, '$1 ');
    fixes.forEach(([pattern, replacement]) => { out = out.replace(pattern, replacement); });
    out = out.replace(/\b([a-z]+)\s+\1\b/gi, '$1');
    out = out.replace(/(^|[.!?]\s+)([a-z])/g, (_, lead, letter) => lead + letter.toUpperCase());
    out = out.replace(/\bi\b/g, 'I').replace(/\s+([.!?])/g, '$1');
    if (out && !/[.!?]$/.test(out.trim())) out = out.trim() + '.';
    return out;
  }
  const replacements = {
    formal: [[/\blots of\b/gi, 'many '], [/\bkids\b/gi, 'children'], [/\bget\b/gi, 'obtain'], [/\ba bit\b/gi, 'some '], [/\bcan't\b/gi, 'cannot'], [/\bdon't\b/gi, 'do not'], [/\bwon't\b/gi, 'will not'], [/\bthing\b/gi, 'matter']],
    friendly: [[/\btherefore\b/gi, 'so'], [/\bhowever\b/gi, 'but'], [/\bcommence\b/gi, 'start'], [/\bassistance\b/gi, 'help']],
    simple: [[/\butilise\b/gi, 'use'], [/\butilize\b/gi, 'use'], [/\bdemonstrate\b/gi, 'show'], [/\bapproximately\b/gi, 'about'], [/\badditional\b/gi, 'more'], [/\bcommence\b/gi, 'start'], [/\bconsequently\b/gi, 'so'], [/\bpurchase\b/gi, 'buy'], [/\brequire\b/gi, ' need '], [/\bassist\b/gi, 'help']],
    concise: [[/\bin order to\b/gi, ' to '], [/\bdue to the fact that\b/gi, ' because '], [/\bat this point in time\b/gi, ' now '], [/\bit is important to note that\b/gi, ''], [/\bvery\b/gi, ' '], [/\breally\b/gi, ' '], [/\bbasically\b/gi, ' '], [/\bactually\b/gi, ' ']]
  };
  function transform(text, action) {
    if (action === 'proofread') return proofread(text);
    if (action === 'formal' || action === 'friendly' || action === 'simple' || action === 'concise') {
      let out = text;
      replacements[action].forEach(([pattern, value]) => { out = out.replace(pattern, value); });
      if (action === 'formal') out = out.replace(/\bI'm\b/g, 'I am').replace(/\bI've\b/g, 'I have');
      if (action === 'friendly' && out.trim()) out = out.trim();
      return out.replace(/\s{2,}/g, ' ').trim();
    }
    if (action === 'paraphrase') {
      const swaps = [[/\bimportant\b/gi, 'significant'], [/\bhelp\b/gi, 'support'], [/\buse\b/gi, 'make use of'], [/\bshow\b/gi, 'demonstrate'], [/\bstart\b/gi, 'begin'], [/\bend\b/gi, 'finish'], [/\bbecause\b/gi, 'since'], [/\babout\b/gi, 'regarding']];
      let out = text;
      swaps.forEach(([pattern, value]) => { out = out.replace(pattern, value); });
      return out;
    }
    if (action === 'expand') {
      const points = text.split(/(?<=[.!?])\s+/).filter(Boolean);
      return text.trim() + '\n\nIdeas to develop this draft (add only details you can verify):\n' +
        points.slice(0, 5).map((point, i) => (i + 1) + '. Explain why this point matters: ' + point.slice(0, 150) +
          '\n   Add an example, evidence or explanation that supports it.').join('\n');
    }
    return text;
  }
  function init() {
    const card = document.querySelector('.ai-card');
    const form = $('aiForm');
    if (!card || !form || $('tnWritingStudio')) return;
    const section = document.createElement('section');
    section.id = 'tnWritingStudio';
    section.className = 'tn-writing-studio';
    section.innerHTML = `
      <div class="tn-writing-heading">
        <div><p class="eyebrow">WRITING TOOLS</p><h2>Writing Studio</h2>
        <p>Improve and reshape a draft with quick, private browser-based tools.</p></div>
        <span class="tn-writing-local">🔒 Stays in this browser</span>
      </div>
      <label class="tn-writing-label" for="tnWritingInput">Your text</label>
      <textarea id="tnWritingInput" rows="7" maxlength="30000" placeholder="Paste or write your text here…"></textarea>
      <div class="tn-writing-controls">
        <label for="tnWritingAction">What would you like to do?</label>
        <select id="tnWritingAction">
          <option value="proofread">Basic spelling and punctuation check</option>
          <option value="formal">Make wording more formal</option>
          <option value="friendly">Make wording friendlier</option>
          <option value="simple">Simplify wording</option>
          <option value="concise">Make wording more concise</option>
          <option value="paraphrase">Paraphrase with simple word substitutions</option>
          <option value="expand">Expand with development prompts</option>
        </select>
        <button type="button" class="btn primary" id="tnWritingRun">Improve text</button>
      </div>
      <div class="tn-writing-meta"><span id="tnWritingCount">0 characters</span><span id="tnWritingStatus" role="status" aria-live="polite">Your text is processed locally.</span></div>
      <label class="tn-writing-label" for="tnWritingOutput">Result</label>
      <textarea id="tnWritingOutput" rows="7" readonly placeholder="Your improved text will appear here…"></textarea>
      <div class="tn-writing-actions">
        <button type="button" class="ai-prompt" id="tnWritingCopy">Copy result</button>
        <button type="button" class="ai-prompt" id="tnWritingDownload">Download as TXT</button>
        <button type="button" class="ai-prompt" id="tnWritingUse">Use result as input</button>
        <button type="button" class="ai-prompt" id="tnWritingClear">Clear</button>
      </div>
      <p class="tn-writing-note">These are rule-based text helpers, not a generative AI or a full grammar checker. They may miss mistakes or change nuance. Review the result before using it; the expand option provides prompts rather than inventing extra facts.</p>`;
    const style = document.createElement('style');
    style.textContent = `
      .tn-writing-studio{margin:22px 0;padding:20px;border:1px solid #29415e;border-radius:18px;background:#0b1726;display:grid;gap:11px}
      .tn-writing-heading{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}
      .tn-writing-heading h2{font-size:25px;margin:3px 0 6px;color:#e5f0ff}
      .tn-writing-heading p:not(.eyebrow),.tn-writing-note{color:#91a0b7;font-size:13px;line-height:1.5;margin:0}
      .tn-writing-local{font-size:12px;color:#9fc6d6}
      .tn-writing-label,.tn-writing-controls label{font-size:13px;color:#cfe0f2;font-weight:600}
      #tnWritingInput,#tnWritingOutput{width:100%;box-sizing:border-box;resize:vertical;min-height:130px;padding:12px;border:1px solid #29415e;border-radius:10px;background:#07101c;color:#e5f0ff;font:inherit;line-height:1.5}
      .tn-writing-controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
      .tn-writing-controls select{flex:1 1 260px;min-width:0;padding:10px;border:1px solid #29415e;border-radius:9px;background:#07101c;color:#e5f0ff}
      .tn-writing-meta,.tn-writing-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
      .tn-writing-meta{justify-content:space-between;color:#91a0b7;font-size:12px}
      .tn-writing-actions{gap:8px}
      @media(max-width:600px){.tn-writing-studio{padding:14px}.tn-writing-controls{align-items:stretch}.tn-writing-controls select{flex-basis:100%}}
    `;
    document.head.append(style);
    form.parentNode.insertBefore(section, form);
    const source = $('tnWritingInput'), output = $('tnWritingOutput'), status = $('tnWritingStatus');
    source.addEventListener('input', () => { $('tnWritingCount').textContent = source.value.length.toLocaleString() + ' characters'; });
    $('tnWritingRun').addEventListener('click', () => {
      if (!source.value.trim()) { status.textContent = 'Add some text first.'; source.focus(); return; }
      output.value = transform(source.value, $('tnWritingAction').value);
      status.textContent = 'Done. Review the result carefully before using it.';
    });
    $('tnWritingCopy').addEventListener('click', async () => {
      if (!output.value) { status.textContent = 'There is no result to copy yet.'; return; }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(output.value);
        else { output.focus(); output.select(); if (!document.execCommand('copy')) throw new Error('Copy is unavailable in this browser.'); }
        status.textContent = 'Result copied.';
      } catch (_) { status.textContent = 'Could not copy automatically. Select the result and copy it manually.'; }
    });
    $('tnWritingDownload').addEventListener('click', () => {
      if (!output.value) { status.textContent = 'There is no result to download yet.'; return; }
      const url = URL.createObjectURL(new Blob([output.value], {type:'text/plain;charset=utf-8'}));
      const link = document.createElement('a'); link.href = url; link.download = 'technova-writing-studio.txt';
      document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      status.textContent = 'TXT download prepared.';
    });
    $('tnWritingUse').addEventListener('click', () => { if (!output.value) { status.textContent = 'There is no result to use yet.'; return; } source.value = output.value; source.dispatchEvent(new Event('input')); status.textContent = 'Result copied into the input box.'; });
    $('tnWritingClear').addEventListener('click', () => { source.value = ''; output.value = ''; source.dispatchEvent(new Event('input')); status.textContent = 'Writing Studio cleared.'; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();