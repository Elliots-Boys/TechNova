document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const menu = document.querySelector('#menu');
  menu?.addEventListener('click', () => header?.classList.toggle('open'));

  // Keep the main navbar clean while making every new TechNova page easy to find.
  const nav = document.querySelector('header nav');
  if (nav && !nav.querySelector('.nav-more')) {
    const rootPrefix = location.pathname.includes('/pages/') || document.querySelector('link[href="../css/style.css"]') ? '' : 'pages/';
    const pagePrefix = rootPrefix ? 'pages/' : '';
    const links = [
      ['Discover', 'discover.html'],
      ['Community', 'community.html'],
      ['Resources', 'resources.html'],
      ['FAQ', 'faq.html'],
      ['Support', 'support.html'],
      ['Careers', 'careers.html'],
      ['Partners', 'partners.html'],
      ['Saved', 'saved.html'],
      ['Roadmap', 'roadmap.html'],
      ['Changelog', 'changelog.html'],
      ['Accessibility', 'accessibility.html'],
      ['Sitemap', 'sitemap.html'],
      ['Settings', 'settings.html'],
      ['Privacy', 'privacy.html'],
      ['Terms', 'terms.html']
    ];

    const wrapper = document.createElement('div');
    wrapper.className = 'nav-more';
    wrapper.innerHTML = '<button class="nav-more-btn" type="button" aria-expanded="false" aria-haspopup="true">More ▾</button><div class="nav-more-menu" aria-label="More TechNova pages"></div>';
    const menuBox = wrapper.querySelector('.nav-more-menu');

    links.forEach(([label, file], index) => {
      const a = document.createElement('a');
      a.href = pagePrefix + file;
      a.textContent = label;
      a.dataset.morePage = file;
      if (index === links.length - 1) a.classList.add('more-wide');
      menuBox.appendChild(a);
    });

    nav.appendChild(wrapper);

    const moreButton = wrapper.querySelector('.nav-more-btn');
    const closeMore = () => {
      wrapper.classList.remove('open');
      moreButton.setAttribute('aria-expanded', 'false');
    };

    moreButton.addEventListener('click', event => {
      event.stopPropagation();
      const open = wrapper.classList.toggle('open');
      moreButton.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('click', event => {
      if (!wrapper.contains(event.target)) closeMore();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMore();
    });

    // Highlight the page currently being viewed inside the More menu.
    const current = location.pathname.split('/').pop() || 'index.html';
    menuBox.querySelectorAll('a[data-more-page]').forEach(a => {
      if (a.dataset.morePage === current) a.classList.add('active');
    });
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