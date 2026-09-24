document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const menu = document.querySelector('#menu');
  menu?.addEventListener('click', () => header?.classList.toggle('open'));

  const box = document.querySelector('#eventsGrid');
  if (!box) return;

  const draw = (events) => {
    const q = (document.querySelector('#eventSearch')?.value || '').toLowerCase();
    const type = document.querySelector('#eventType')?.value || '';
    const filtered = events.filter(e => {
      const text = `${e.title} ${e.location} ${e.event_type} ${e.description || ''}`.toLowerCase();
      return (!q || text.includes(q)) && (!type || e.event_type === type);
    });
    box.innerHTML = filtered.length ? filtered.map(e => `
      <article class="panel event">
        <span class="badge">${e.event_type}</span>
        <h2>${e.title}</h2>
        <p class="muted">📅 ${e.event_date}${e.event_time ? ` · ${String(e.event_time).slice(0,5)}` : ''}<br>📍 ${e.location}</p>
        <p class="muted">${e.description || ''}</p>
        <button class="btn primary event-register" data-event-id="${e.id}">Register to my account →</button>
      </article>`).join('') : '<div class="panel">No matching events.</div>';

    box.querySelectorAll('.event-register').forEach(button => {
      button.addEventListener('click', () => registerForEvent(Number(button.dataset.eventId)));
    });
  };

  const loadEvents = async () => {
    if (!window.supabase || !window.TECHNOVA_SUPABASE_URL) {
      box.innerHTML = '<div class="panel">The event service is not configured.</div>';
      return;
    }
    const { data, error } = await supabaseClient.from('events').select('id,title,event_date,event_time,location,event_type,description,capacity').order('event_date', { ascending: true });
    if (error) {
      box.innerHTML = `<div class="panel">Could not load events: ${error.message}</div>`;
      return;
    }
    draw(data || []);
  };

  document.querySelector('#eventSearch')?.addEventListener('input', loadEvents);
  document.querySelector('#eventType')?.addEventListener('change', loadEvents);
  loadEvents();
});
