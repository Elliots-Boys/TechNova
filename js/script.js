document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const menu = document.querySelector('#menu');
  menu?.addEventListener('click', () => header?.classList.toggle('open'));

  // Keep the top navbar focused on primary destinations. Put secondary pages in a slide-out side drawer.
  const nav = document.querySelector('header nav');
  if (nav && !document.querySelector('.site-drawer')) {
    const inPages = location.pathname.includes('/pages/');
    const prefix = inPages ? '' : 'pages/';
    const groups = [
      {
        title: 'Explore',
        items: [
          ['🔎','Search','search.html'],
          ['✦','Discover','discover.html'],
          ['🌐','Community','community.html'],
          ['📚','Resources','resources.html'],
          ['💾','Saved','saved.html']
        ]
      },
      {
        title: 'Help & information',
        items: [
          ['❓','FAQ','faq.html'],
          ['💬','Support','support.html'],
          ['🧭','Sitemap','sitemap.html'],
          ['♿','Accessibility','accessibility.html']
        ]
      },
      {
        title: 'TechNova',
        items: [
          ['💼','Careers','careers.html'],
          ['🤝','Partners','partners.html'],
          ['🗺️','Roadmap','roadmap.html'],
          ['📝','Changelog','changelog.html']
        ]
      },
      {
        title: 'Account & legal',
        items: [
          ['⚙️','Settings','settings.html'],
          ['🔒','Privacy','privacy.html'],
          ['📄','Terms','terms.html']
        ]
      }
    ];

    const overlay = document.createElement('div');
    overlay.className = 'site-drawer-overlay';

    const drawer = document.createElement('aside');
    drawer.className = 'site-drawer';
    drawer.setAttribute('aria-hidden','true');

    const head = document.createElement('div');
    head.className = 'site-drawer-head';
    head.innerHTML = '<div><p class="eyebrow" style="margin:0 0 3px">MORE TECHNOVA</p><h2>Explore the site</h2></div><button class="site-drawer-close" type="button" aria-label="Close menu">×</button>';

    const content = document.createElement('div');
    content.className = 'site-drawer-content';

    const current = location.pathname.split('/').pop() || 'index.html';
    groups.forEach(group => {
      const section = document.createElement('section');
      section.className = 'drawer-section';
      section.innerHTML = '<h3 class="drawer-section-title"></h3><div class="drawer-links"></div>';
      section.querySelector('h3').textContent = group.title;
      const links = section.querySelector('.drawer-links');

      group.items.forEach(([icon,label,file]) => {
        const a = document.createElement('a');
        a.href = prefix + file;
        a.dataset.drawerPage = file;
        if (file === current) a.classList.add('active');
        a.innerHTML = '<span class="drawer-icon" aria-hidden="true"></span><span></span>';
        a.querySelector('.drawer-icon').textContent = icon;
        a.querySelector('span:last-child').textContent = label;
        links.appendChild(a);
      });
      content.appendChild(section);
    });

    const note = document.createElement('p');
    note.className = 'drawer-note';
    note.textContent = 'Primary navigation stays in the header. This panel keeps the rest of TechNova one click away without filling the navbar.';
    content.appendChild(note);

    drawer.append(head, content);
    document.body.append(overlay, drawer);

    const trigger = document.createElement('button');
    trigger.className = 'site-drawer-trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-expanded','false');
    trigger.setAttribute('aria-controls','technova-more-drawer');
    trigger.textContent = 'More';
    drawer.id = 'technova-more-drawer';

    const close = () => {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      drawer.setAttribute('aria-hidden','true');
      trigger.setAttribute('aria-expanded','false');
    };
    const open = () => {
      drawer.classList.add('open');
      overlay.classList.add('open');
      drawer.setAttribute('aria-hidden','false');
      trigger.setAttribute('aria-expanded','true');
    };

    trigger.addEventListener('click', () => drawer.classList.contains('open') ? close() : open());
    head.querySelector('.site-drawer-close').addEventListener('click', close);
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    document.body.appendChild(trigger);
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

    box.innerHTML = filtered.length ? filtered.map(e => {
      const params = new URLSearchParams({ event: e.title });
      return `
      <article class="panel event">
        <span class="badge">${escapeHtml(e.event_type)}</span>
        <h2>${escapeHtml(e.title)}</h2>
        <p class="muted">📅 ${escapeHtml(e.event_date)}${e.event_time ? ` · ${escapeHtml(String(e.event_time).slice(0,5))}` : ''}<br>📍 ${escapeHtml(e.location)}</p>
        <p class="muted">${escapeHtml(e.description || '')}</p>
        <a class="btn primary" href="register.html?${params.toString()}">Register →</a>
      </article>`;
    }).join('') : '<div class="panel">No matching events.</div>';
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