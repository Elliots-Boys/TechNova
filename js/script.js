document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const menuButton = document.querySelector('#menu');
  menuButton?.addEventListener('click', () => {
    const open = header?.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(!!open));
  });

  // Add useful browser-level polish on every page.
  const isPagesPath = location.pathname.includes('/pages/');
  const rootPrefix = isPagesPath ? '../' : '';
  const currentPage = location.pathname.split('/').pop() || 'index.html';

  // Manifest + favicon are injected once so every page behaves like one cohesive site.
  if (!document.querySelector('link[rel="manifest"]')) {
    const manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = rootPrefix + 'manifest.webmanifest';
    document.head.appendChild(manifest);
  }
  if (!document.querySelector('link[rel="icon"]')) {
    const icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/svg+xml';
    icon.href = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2216%22 fill=%22%230b1424%22/%3E%3Cpath d=%22M32 10l5.4 16.6H55L41 36.2 46.4 53 32 42.7 17.6 53 23 36.2 9 26.6h17.6z%22 fill=%22%2332d6ff%22/%3E%3C/svg%3E';
    document.head.appendChild(icon);
  }

  // Primary navigation: highlight the current route without requiring manual markup.
  const primaryLinks = document.querySelectorAll('header nav > a');
  primaryLinks.forEach(link => {
    try {
      const target = new URL(link.href, location.href);
      const isCurrent = target.pathname === location.pathname;
      if (isCurrent) link.classList.add('active');
    } catch {}
  });

  // Secondary pages live in a polished slide-out drawer instead of crowding the header.
  const nav = document.querySelector('header nav');
  if (nav && !document.querySelector('.site-drawer')) {
    const groups = [
      { title: 'Explore', items: [
        ['🔎','Search','search.html'],['✦','Discover','discover.html'],['🌐','Community','community.html'],
        ['📚','Resources','resources.html'],['💾','Saved','saved.html']
      ]},
      { title: 'Help & information', items: [
        ['❓','FAQ','faq.html'],['💬','Support','support.html'],['🧭','Sitemap','sitemap.html'],['♿','Accessibility','accessibility.html']
      ]},
      { title: 'TechNova', items: [
        ['💼','Careers','careers.html'],['🤝','Partners','partners.html'],['🗺️','Roadmap','roadmap.html'],['📝','Changelog','changelog.html']
      ]},
      { title: 'Account & legal', items: [
        ['⚙️','Settings','settings.html'],['🔒','Privacy','privacy.html'],['📄','Terms','terms.html']
      ]}
    ];

    const overlay = document.createElement('div');
    overlay.className = 'site-drawer-overlay';

    const drawer = document.createElement('aside');
    drawer.className = 'site-drawer';
    drawer.id = 'technova-more-drawer';
    drawer.setAttribute('aria-hidden', 'true');

    const head = document.createElement('div');
    head.className = 'site-drawer-head';
    head.innerHTML = '<div><p class="eyebrow" style="margin:0 0 3px">MORE TECHNOVA</p><h2>Explore the site</h2></div><button class="site-drawer-close" type="button" aria-label="Close menu">×</button>';

    const content = document.createElement('div');
    content.className = 'site-drawer-content';

    groups.forEach(group => {
      const section = document.createElement('section');
      section.className = 'drawer-section';
      section.innerHTML = '<h3 class="drawer-section-title"></h3><div class="drawer-links"></div>';
      section.querySelector('h3').textContent = group.title;
      const links = section.querySelector('.drawer-links');
      group.items.forEach(([icon,label,file]) => {
        const a = document.createElement('a');
        a.href = rootPrefix + 'pages/' + file;
        if (file === currentPage) a.classList.add('active');
        a.innerHTML = '<span class="drawer-icon" aria-hidden="true"></span><span></span>';
        a.querySelector('.drawer-icon').textContent = icon;
        a.querySelector('span:last-child').textContent = label;
        links.appendChild(a);
      });
      content.appendChild(section);
    });

    const utility = document.createElement('section');
    utility.className = 'drawer-section drawer-utility';
    utility.innerHTML = '<h3 class="drawer-section-title">Quick actions</h3><div class="drawer-utility-grid"></div>';
    const utilityGrid = utility.querySelector('.drawer-utility-grid');
    [
      ['⌘K','Search the site','command-palette'],
      ['↑','Back to top','back-top']
    ].forEach(([icon,label,type]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'drawer-utility-btn';
      button.dataset.action = type;
      button.innerHTML = '<strong></strong><span></span>';
      button.querySelector('strong').textContent = icon;
      button.querySelector('span').textContent = label;
      utilityGrid.appendChild(button);
    });
    content.appendChild(utility);

    const note = document.createElement('p');
    note.className = 'drawer-note';
    note.textContent = 'Primary navigation stays in the header. Everything else is one click away here.';
    content.appendChild(note);

    drawer.append(head, content);
    document.body.append(overlay, drawer);

    const trigger = document.createElement('button');
    trigger.className = 'site-drawer-trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-expanded','false');
    trigger.setAttribute('aria-controls','technova-more-drawer');
    trigger.setAttribute('aria-label','Open TechNova explorer');
    trigger.textContent = 'Explore';

    const closeDrawer = () => {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      drawer.setAttribute('aria-hidden','true');
      trigger.setAttribute('aria-expanded','false');
      document.body.classList.remove('drawer-open');
    };
    const openDrawer = () => {
      drawer.classList.add('open');
      overlay.classList.add('open');
      drawer.setAttribute('aria-hidden','false');
      trigger.setAttribute('aria-expanded','true');
      document.body.classList.add('drawer-open');
    };

    trigger.addEventListener('click', () => drawer.classList.contains('open') ? closeDrawer() : openDrawer());
    head.querySelector('.site-drawer-close').addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

    drawer.querySelector('[data-action="command-palette"]').addEventListener('click', () => {
      closeDrawer();
      openCommandPalette();
    });
    drawer.querySelector('[data-action="back-top"]').addEventListener('click', () => {
      closeDrawer();
      window.scrollTo({top:0, behavior:'smooth'});
    });

    document.body.appendChild(trigger);
  }

  // Reading polish: top progress bar + back-to-top control.
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  const backTop = document.createElement('button');
  backTop.type = 'button';
  backTop.className = 'back-top';
  backTop.textContent = '↑';
  backTop.setAttribute('aria-label','Back to top');
  document.body.appendChild(backTop);

  const updateScrollUI = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = max > 0 ? (window.scrollY / max * 100) + '%' : '0%';
    backTop.classList.toggle('show', window.scrollY > 500);
  };
  window.addEventListener('scroll', updateScrollUI, {passive:true});
  updateScrollUI();
  backTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  // Site-wide command palette: Ctrl/Cmd+K, or / when not typing.
  let palette = null;
  function openCommandPalette() {
    if (palette) {
      palette.classList.add('open');
      palette.querySelector('input')?.focus();
      return;
    }
    palette = document.createElement('div');
    palette.className = 'command-palette';
    palette.innerHTML = '<div class="command-box" role="dialog" aria-modal="true" aria-label="Search TechNova"><div class="command-head"><div><span class="eyebrow">TECHNOVA SEARCH</span><h2>Where do you want to go?</h2></div><button type="button" class="command-close" aria-label="Close search">×</button></div><input class="command-input" autocomplete="off" placeholder="Search pages and technology topics…"><div class="command-results"></div><p class="command-hint">Press Esc to close · Ctrl/Cmd+K to reopen</p></div>';
    document.body.appendChild(palette);
    const input = palette.querySelector('.command-input');
    const results = palette.querySelector('.command-results');
    const entries = [
      ['Search','Search events, topics and site content','search.html','🔎'],
      ['Discover','Open the TechNova hub','discover.html','✦'],
      ['Events','Browse upcoming TechNova events','events.html','🎟️'],
      ['Technology','Explore AI, cloud, security and more','technology.html','⚙️'],
      ['Innovation','Explore innovation themes and ideas','innovation.html','💡'],
      ['News','Read TechNova news and updates','news.html','📰'],
      ['Community','Explore community topics','community.html','🌐'],
      ['Resources','Open guides and checklists','resources.html','📚'],
      ['FAQ','Get quick answers','faq.html','❓'],
      ['Support','Get help with TechNova','support.html','💬'],
      ['My account','View your account dashboard','account.html','👤'],
      ['Settings','Update profile and preferences','settings.html','⚙️']
    ];
    const renderResults = query => {
      const q = query.trim().toLowerCase();
      const filtered = entries.filter(([title,desc]) => !q || (title+' '+desc).toLowerCase().includes(q)).slice(0,8);
      results.innerHTML = filtered.length ? filtered.map(([title,desc,file,icon]) => `<a class="command-result" href="${rootPrefix}pages/${file}"><span class="command-result-icon">${icon}</span><span><strong>${title}</strong><small>${desc}</small></span><span class="command-arrow">→</span></a>`).join('') : '<div class="command-empty">No TechNova pages matched that search.</div>';
    };
    input.addEventListener('input', () => renderResults(input.value));
    palette.querySelector('.command-close').addEventListener('click', closeCommandPalette);
    palette.addEventListener('click', e => { if (e.target === palette) closeCommandPalette(); });
    renderResults('');
    input.focus();
  }
  function closeCommandPalette() {
    palette?.classList.remove('open');
  }
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCommandPalette();
    }
    if (e.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      openCommandPalette();
    }
  });

  // Small global status/toast system used by site interactions.
  let toastTimer;
  const toast = message => {
    let el = document.querySelector('.site-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'site-toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  };
  window.TechNovaToast = toast;

  window.addEventListener('offline', () => toast('You are offline. Cached site content may still be available.'));
  window.addEventListener('online', () => toast('Connection restored.'));

  // Register the lightweight offline fallback where the site is served over HTTPS.
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    const swPath = rootPrefix + 'service-worker.js';
    navigator.serviceWorker.register(swPath).catch(() => {});
  }

  const box = document.querySelector('#eventsGrid');
  if (!box) return;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));

  const draw = events => {
    const q = (document.querySelector('#eventSearch')?.value || '').toLowerCase();
    const type = document.querySelector('#eventType')?.value || '';

    const filtered = events.filter(e => {
      const text = `${e.title} ${e.location} ${e.event_type} ${e.description || ''}`.toLowerCase();
      return (!q || text.includes(q)) && (!type || e.event_type === type);
    });

    const relativeDate = event => {
      const start = new Date(`${event.event_date}T${event.event_time || '00:00'}`);
      if (Number.isNaN(start.getTime())) return '';
      const diff = start.getTime() - Date.now();
      const days = Math.ceil(Math.abs(diff) / 86400000);
      if (Math.abs(diff) < 86400000) return diff >= 0 ? 'Today' : 'Finished today';
      return diff >= 0 ? `In ${days} day${days === 1 ? '' : 's'}` : `Ended ${days} day${days === 1 ? '' : 's'} ago`;
    };

    box.innerHTML = filtered.length ? filtered.map(e => {
      const params = new URLSearchParams({ event: e.title });
      const when = relativeDate(e);
      return `
      <article class="panel event">
        <div class="event-topline"><span class="badge">${escapeHtml(e.event_type)}</span><span class="event-countdown">${escapeHtml(when)}</span></div>
        <h2>${escapeHtml(e.title)}</h2>
        <p class="muted">📅 ${escapeHtml(e.event_date)}${e.event_time ? ` · ${escapeHtml(String(e.event_time).slice(0,5))}` : ''}<br>📍 ${escapeHtml(e.location)}</p>
        <p class="muted">${escapeHtml(e.description || '')}</p>
        <div class="event-card-actions"><a class="btn primary" href="register.html?${params.toString()}">Register →</a><button class="btn event-calendar" type="button" data-event-index="${events.indexOf(e)}">Add to calendar</button><button class="btn event-share" type="button" data-event="${escapeHtml(e.title)}">Share</button></div>
      </article>`;
    }).join('') : '<div class="panel">No matching events.</div>';

    box.querySelectorAll('.event-calendar').forEach(button => {
      button.addEventListener('click', () => {
        const event = events[Number(button.dataset.eventIndex)];
        if (!event) return;
        const pad = value => String(value).padStart(2,'0');
        const date = String(event.event_date || '').replace(/-/g,'');
        const time = String(event.event_time || '00:00').slice(0,5).split(':');
        const start = date + 'T' + pad(time[0]) + pad(time[1]) + '00';
        const endDate = new Date(`${event.event_date}T${event.event_time || '00:00'}`);
        endDate.setHours(endDate.getHours() + 2);
        const end = endDate.getFullYear() + pad(endDate.getMonth()+1) + pad(endDate.getDate()) + 'T' + pad(endDate.getHours()) + pad(endDate.getMinutes()) + '00';
        const clean = value => String(value || '').replace(/[\\,;]/g,' ').replace(/\r?\n/g,' ');
        const ics = [
          'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//TechNova//Events//EN','BEGIN:VEVENT',
          `UID:technova-${event.id || event.title}-${event.event_date}@technova`,
          `DTSTART:${start}`,`DTEND:${end}`,`SUMMARY:${clean(event.title)}`,
          `LOCATION:${clean(event.location)}`,`DESCRIPTION:${clean(event.description || 'TechNova event')}`,
          'END:VEVENT','END:VCALENDAR'
        ].join('\\r\\n');
        const url = URL.createObjectURL(new Blob([ics], {type:'text/calendar;charset=utf-8'}));
        const a = document.createElement('a'); a.href = url; a.download = `${clean(event.title).replace(/\\s+/g,'-')}.ics`; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast('Calendar file created.');
      });
    });

    box.querySelectorAll('.event-share').forEach(button => {
      button.addEventListener('click', async () => {
        const title = button.dataset.event || 'TechNova event';
        const shareData = {title, text:`Check out ${title} on TechNova.`, url:location.origin + location.pathname + '?event=' + encodeURIComponent(title)};
        try {
          if (navigator.share) await navigator.share(shareData);
          else {
            await navigator.clipboard.writeText(shareData.url);
            toast('Event link copied to your clipboard.');
          }
        } catch (error) {
          if (error?.name !== 'AbortError') toast('Could not share this event.');
        }
      });
    });
  };

  const loadEvents = async () => {
    if (!window.supabase || !window.TECHNOVA_SUPABASE_URL) {
      box.innerHTML = '<div class="panel">The event service is not configured.</div>';
      return;
    }
    const { data, error } = await supabaseClient
      .from('events')
      .select('id,title,event_date,event_time,location,event_type,description,capacity')
      .order('event_date', { ascending: true });
    if (error) {
      box.innerHTML = `<div class="panel">Could not load events: ${escapeHtml(error.message)}</div>`;
      return;
    }
    draw(data || []);
  };

  document.querySelector('#eventSearch')?.addEventListener('input', loadEvents);
  document.querySelector('#eventType')?.addEventListener('change', loadEvents);
  loadEvents();
});