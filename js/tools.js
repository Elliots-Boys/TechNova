'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const tool = document.body.dataset.tool;
  const set = (id, value) => { const el = $(id); if (el) el.textContent = value; };
  const units = {
    length: { mm:0.001, cm:0.01, m:1, km:1000, in:0.0254, ft:0.3048, mi:1609.344 },
    weight: { mg:0.000001, g:0.001, kg:1, oz:0.028349523125, lb:0.45359237 },
    volume: { ml:0.001, l:1, cup:0.2365882365, gal:3.785411784 }
  };

  if (tool === 'catalogue') {
    const grid = $('toolGrid'), search = $('toolSearch');
    let cards = [...grid.querySelectorAll('.tool-card')], filter = 'all';
    let filterButtons = [...document.querySelectorAll('[data-filter]')];
    function update() {
      const query = search.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const matches = (filter === 'all' || card.dataset.category === filter) &&
          (!query || (card.dataset.search || '').includes(query));
        card.hidden = !matches;
        if (matches) visible++;
      });
      set('toolResultCount', visible + (visible === 1 ? ' tool found' : ' tools found'));
      $('noTools').hidden = visible !== 0;
    }
    function bindFilters(categories) {
      const wrap = document.querySelector('.tool-filters');
      wrap.replaceChildren();
      const values = ['all', ...categories];
      values.forEach(value => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'btn' + (value === filter ? ' active' : '');
        button.dataset.filter = value;
        button.textContent = value === 'all' ? 'All' : value;
        button.addEventListener('click', () => {
          filter = value;
          filterButtons.forEach(item => item.classList.toggle('active', item === button));
          update();
        });
        wrap.appendChild(button);
      });
      filterButtons = [...wrap.querySelectorAll('[data-filter]')];
    }
    async function loadDatabaseCatalogue() {
      if (!window.supabase || !window.TECHNOVA_SUPABASE_URL || !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY) return;
      try {
        const client = window.supabaseClient || window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
        const { data, error } = await client.from('tool_catalog')
          .select('slug,name,description,category,page_path,icon,featured,sort_order')
          .eq('enabled', true).order('sort_order', { ascending: true });
        if (error || !Array.isArray(data)) return;
        grid.replaceChildren();
        data.forEach(item => {
          const card = document.createElement('article');
          card.className = 'tool-card';
          card.dataset.category = String(item.category || 'Everyday').toLowerCase();
          card.dataset.search = [item.name,item.description,item.category].join(' ').toLowerCase();
          const top = document.createElement('div'); top.className = 'tool-card-top';
          const category = document.createElement('span'); category.className = 'tool-category'; category.textContent = item.category || 'Tools';
          const icon = document.createElement('span'); icon.textContent = item.icon || '🛠️'; icon.setAttribute('aria-hidden','true');
          top.append(category,icon);
          const heading = document.createElement('h2'); heading.textContent = item.name;
          const description = document.createElement('p'); description.textContent = item.description || '';
          const link = document.createElement('a'); link.className = 'btn primary';
          link.href = String(item.page_path || '').replace(/^pages\//,'');
          link.textContent = 'Open tool →';
          if (item.featured) { const badge=document.createElement('span'); badge.className='tool-category'; badge.textContent='Featured'; top.appendChild(badge); }
          card.append(top,heading,description,link); grid.appendChild(card);
        });
        cards = [...grid.querySelectorAll('.tool-card')];
        const categories = [...new Set(data.map(item=>String(item.category||'Everyday').toLowerCase()))];
        bindFilters(categories);
      } catch (error) {
        console.warn('TechNova tool catalogue could not refresh; using the built-in catalogue.', error);
      }
    }
    search.addEventListener('input', update);
    bindFilters([...new Set(cards.map(card => card.dataset.category))]);
    loadDatabaseCatalogue().then(update);
    update();
  }
  if (tool === 'qr') {
    $('qrGenerate').addEventListener('click', () => {
      const value = $('qrText').value.trim(), output = $('qrOutput');
      output.replaceChildren();
      if (!value) { output.textContent = 'Enter some text or a URL first.'; return; }
      if (typeof QRCode === 'undefined') { output.textContent = 'The QR library could not load. Check your connection and try again.'; return; }
      const holder = document.createElement('div');
      holder.className = 'qr-holder';
      output.appendChild(holder);
      new QRCode(holder, { text:value, width:Number($('qrSize').value), height:Number($('qrSize').value), correctLevel:QRCode.CorrectLevel.M });
      const note = document.createElement('p');
      note.textContent = 'The QR code is generated in this browser.';
      output.appendChild(note);
    });
  }

  if (tool === 'password') {
    const input = $('passwordInput'), output = $('passwordStrength');
    $('passwordShow').addEventListener('change', () => { input.type = $('passwordShow').checked ? 'text' : 'password'; });
    input.addEventListener('input', () => {
      const value = input.value;
      if (!value) { output.textContent = 'Checked locally; never sent or saved.'; output.className = 'tool-result'; return; }
      let score = 0;
      if (value.length >= 12) score++;
      if (value.length >= 16) score++;
      if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
      if (/\d/.test(value)) score++;
      if (/[^A-Za-z0-9]/.test(value)) score++;
      const labels = ['Very weak','Weak','Fair','Good','Strong','Very strong'];
      output.textContent = labels[score] + ' · ' + value.length + ' characters. Use a long, unique password and avoid reused or predictable phrases.';
      output.className = 'tool-result ' + (score >= 4 ? 'tool-good' : score >= 2 ? 'tool-warning' : 'tool-bad');
    });
  }

  if (tool === 'unit') {
    const category = $('unitCategory'), from = $('unitFrom'), to = $('unitTo');
    const names = { length:['mm','cm','m','km','in','ft','mi'], weight:['mg','g','kg','oz','lb'], temperature:['°C','°F','K'], volume:['ml','l','cup','gal'] };
    function refresh() {
      from.replaceChildren(); to.replaceChildren();
      names[category.value].forEach((unit, index) => {
        [from,to].forEach(select => { const option=document.createElement('option'); option.value=unit; option.textContent=unit; select.appendChild(option); });
      });
      to.selectedIndex = names[category.value].length > 1 ? 1 : 0;
    }
    category.addEventListener('change', refresh);
    refresh();
    $('unitConvert').addEventListener('click', () => {
      const value = Number($('unitValue').value);
      if (!Number.isFinite(value)) { set('unitOutput','Enter a valid number.'); return; }
      let result;
      if (category.value === 'temperature') {
        const celsius = from.value === '°C' ? value : from.value === '°F' ? (value - 32) * 5 / 9 : value - 273.15;
        result = to.value === '°C' ? celsius : to.value === '°F' ? celsius * 9 / 5 + 32 : celsius + 273.15;
      } else {
        result = value * units[category.value][from.value] / units[category.value][to.value];
      }
      set('unitOutput', value + ' ' + from.value + ' = ' + Number(result.toPrecision(10)) + ' ' + to.value);
    });
  }

  if (tool === 'filesize') {
    $('fileConvert').addEventListener('click', () => {
      const value=Number($('fileValue').value), unit=Number($('fileUnit').value);
      if (!Number.isFinite(value) || value < 0) { set('fileOutput','Enter a valid non-negative file size.'); return; }
      const bytes=value*Math.pow(1024,unit), labels=['Bytes','KiB','MiB','GiB','TiB'];
      set('fileOutput',labels.map((name,index)=>(bytes/Math.pow(1024,index)).toLocaleString('en-GB',{maximumFractionDigits:4})+' '+name).join('\n'));
    });
  }

  if (tool === 'palette') {
    function makeColour() {
      const values = new Uint8Array(3);
      crypto.getRandomValues(values);
      return '#' + Array.from(values, value => value.toString(16).padStart(2,'0')).join('').toUpperCase();
    }
    $('paletteGenerate').addEventListener('click', () => {
      const grid=$('paletteGrid'); grid.replaceChildren();
      for (let i=0;i<5;i++) {
        const hex=makeColour(), card=document.createElement('div'), colour=document.createElement('div'), button=document.createElement('button');
        card.className='palette-swatch'; colour.className='palette-colour'; colour.style.background=hex;
        button.type='button'; button.textContent=hex;
        button.addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(hex); button.textContent='Copied '+hex; }
          catch { button.textContent=hex+' — copy manually'; }
        });
        card.append(colour,button); grid.appendChild(card);
      }
    });
    $('paletteGenerate').click();
  }

  if (tool === 'playground') {
    $('playgroundRun').addEventListener('click', () => {
      const html=$('playgroundHtml').value, css=$('playgroundCss').value;
      $('playgroundPreview').srcdoc='<!doctype html><html><head><meta charset="utf-8"><style>'+css+'</style></head><body>'+html+'</body></html>';
    });
    $('playgroundRun').click();
  }

  if (tool === 'json') {
    function parseInput() {
      try { return { valid:true, value:JSON.parse($('jsonInput').value) }; }
      catch (error) { set('jsonOutput','Invalid JSON: '+error.message); return { valid:false }; }
    }
    $('jsonFormat').addEventListener('click', () => { const parsed=parseInput(); if(parsed.valid){$('jsonInput').value=JSON.stringify(parsed.value,null,2);set('jsonOutput','Valid JSON. Formatted with 2-space indentation.');} });
    $('jsonMinify').addEventListener('click', () => { const parsed=parseInput(); if(parsed.valid){$('jsonInput').value=JSON.stringify(parsed.value);set('jsonOutput','Valid JSON. Minified.');} });
    $('jsonValidate').addEventListener('click', () => { const parsed=parseInput(); if(parsed.valid)set('jsonOutput','Valid JSON.'); });
  }

  if (tool === 'ip') {
    function ipv4(value) {
      const parts=value.split('.');
      return parts.length===4 && parts.every(part=>/^\d{1,3}$/.test(part)&&Number(part)<=255);
    }
    function ipv6(value) {
      if(!value.includes(':')||!/^[0-9a-f:]+$/i.test(value)||value.includes(':::'))return false;
      const sections=value.split('::');
      if(sections.length>2)return false;
      const count=value.split(':').filter(Boolean).length;
      if(sections.length===2)return count<8;
      return count===8&&value.split(':').every(part=>part.length>=1&&part.length<=4);
    }
    $('ipCheck').addEventListener('click', () => {
      const ip=$('ipInput').value.trim(), output=$('ipOutput');
      let type='Invalid IP address', classification='Enter a valid IPv4 or IPv6 address.';
      if(ipv4(ip)) {
        const p=ip.split('.').map(Number); type='IPv4';
        if(ip==='0.0.0.0')classification='Unspecified address';
        else if(p[0]===10||(p[0]===172&&p[1]>=16&&p[1]<=31)||(p[0]===192&&p[1]===168))classification='Private IPv4 address';
        else if(p[0]===127)classification='Loopback address';
        else if(p[0]===169&&p[1]===254)classification='Link-local address';
        else if(p[0]>=224&&p[0]<=239)classification='Multicast address';
        else if(p[0]>=240||ip==='255.255.255.255')classification='Reserved or broadcast address';
        else classification='Likely public IPv4 address';
      } else if(ipv6(ip)) {
        type='IPv6'; const lower=ip.toLowerCase();
        classification=lower==='::'?'Unspecified address':lower==='::1'?'Loopback address':/^(fc|fd)/.test(lower)?'Unique-local (private) address':/^fe[89ab]/.test(lower)?'Link-local address':/^ff/.test(lower)?'Multicast address':'Likely public IPv6 address';
      }
      output.textContent=type+'\n'+classification+'\nLocal classification only; no location or network owner lookup is performed.';
    });
  }

  if (tool === 'pc') {
    $('pcCheck').addEventListener('click', () => {
      const issues=[];
      if($('cpuSocket').value!==$('boardSocket').value)issues.push('CPU and motherboard sockets do not match.');
      if($('ramType').value!==$('boardRam').value)issues.push('RAM generation does not match the motherboard.');
      const supported={'ATX':['ATX','Micro-ATX','Mini-ITX'],'Micro-ATX':['Micro-ATX','Mini-ITX'],'Mini-ITX':['Mini-ITX']};
      if(!supported[$('caseSize').value].includes($('boardSize').value))issues.push('The selected motherboard may not fit the case.');
      const suggested=Math.ceil((Number($('gpuPower').value)+200)/50)*50;
      const result=$('pcResult'); result.replaceChildren();
      const heading=document.createElement('strong'); heading.textContent=issues.length?'Potential compatibility issues':'Basic compatibility checks passed'; result.appendChild(heading);
      const list=document.createElement('ul');
      (issues.length?issues:['The selected socket, memory generation and case size pass these basic checks.']).forEach(message=>{const li=document.createElement('li');li.textContent=message;list.appendChild(li);});
      const power=document.createElement('p');power.textContent='Suggested PSU capacity: at least '+suggested+' W, as a rough planning estimate.';
      result.append(list,power);
    });
  }

  if (tool === 'text') {
    const input=$('textInput');
    function updateStats() {
      const value=input.value;
      set('wordCount',(value.trim()?value.trim().split(/\s+/).length:0)+' words');
      set('charCount',value.length+' characters');
      set('charNoSpaces',value.replace(/\s/g,'').length+' characters without spaces');
    }
    input.addEventListener('input',updateStats); updateStats();
    $('textUpper').addEventListener('click',()=>{input.value=input.value.toUpperCase();updateStats();});
    $('textLower').addEventListener('click',()=>{input.value=input.value.toLowerCase();updateStats();});
    $('textTitle').addEventListener('click',()=>{input.value=input.value.toLowerCase().replace(/\b\p{L}/gu,char=>char.toUpperCase());updateStats();});
    $('textTrim').addEventListener('click',()=>{input.value=input.value.replace(/\s+/g,' ').trim();updateStats();});
  }

  const toolSlug = document.body.dataset.toolSlug;
  if (toolSlug && window.supabase && window.TECHNOVA_SUPABASE_URL && window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY) {
    (async () => {
      try {
        const client = window.supabaseClient || window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
        const { data, error } = await client.from('tool_catalog').select('slug').eq('slug', toolSlug).maybeSingle();
        if (!error && !data) {
          const workspace = document.querySelector('.tool-workspace');
          if (workspace) workspace.hidden = true;
          const message = document.createElement('p');
          message.className = 'tool-result'; message.setAttribute('role','status');
          message.textContent = 'This tool is currently unavailable.';
          document.querySelector('.tool-page')?.appendChild(message);
          return;
        }
        if (error) return;
        const key = 'technova_tool_used_' + toolSlug;
        if (!sessionStorage.getItem(key)) {
          const { error: usageError } = await client.rpc('record_tool_usage', { p_slug: toolSlug });
          if (!usageError) sessionStorage.setItem(key, '1');
        }
      } catch (error) {
        console.warn('Tool usage could not be recorded:', error);
      }
    })();
  }
});
