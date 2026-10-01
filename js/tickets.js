'use strict';

function getTicketsClient() {
  if (window.supabaseClient) return window.supabaseClient;

  if (
    !window.supabase ||
    !window.TECHNOVA_SUPABASE_URL ||
    !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
  ) {
    throw new Error('TechNova Supabase configuration is unavailable.');
  }

  window.supabaseClient = window.supabase.createClient(
    window.TECHNOVA_SUPABASE_URL,
    window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
  );

  return window.supabaseClient;
}

function ticketText(value, fallback = '—') {
  return value === null || value === undefined || value === ''
    ? fallback
    : String(value);
}

function createTicketQr(ticketId) {
  const wrapper = document.createElement('div');
  wrapper.className = 'ticket-qr';
  wrapper.style.cssText =
    'background:white;padding:8px;border-radius:12px;width:130px;height:130px;box-sizing:border-box;display:grid;place-items:center;overflow:hidden';

  const canvas = document.createElement('canvas');
  canvas.width = 114;
  canvas.height = 114;
  canvas.setAttribute('aria-label', `QR code for ticket ${ticketId}`);

  wrapper.appendChild(canvas);

  const payload = `TechNova ticket:${ticketId}`;

  if (window.QRCode && typeof window.QRCode.toCanvas === 'function') {
    window.QRCode.toCanvas(
      canvas,
      payload,
      { width: 114, margin: 1 },
      error => {
        if (error) {
          console.warn('Ticket QR generation failed:', error);
          showQrFallback(wrapper, ticketId);
        }
      }
    );
  } else {
    showQrFallback(wrapper, ticketId);
  }

  return wrapper;
}

function showQrFallback(wrapper, ticketId) {
  wrapper.replaceChildren();

  const fallback = document.createElement('div');
  fallback.style.cssText =
    'background:#07101c;color:#dbe7f5;border:1px solid #29415e;border-radius:10px;padding:10px;text-align:center;font-size:12px;width:100%;box-sizing:border-box';

  const label = document.createElement('strong');
  label.textContent = 'Ticket ID';

  const code = document.createElement('code');
  code.textContent = String(ticketId);
  code.style.display = 'block';
  code.style.marginTop = '7px';
  code.style.wordBreak = 'break-all';

  fallback.append(label, code);
  wrapper.appendChild(fallback);
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('tickets');
  if (!container) return;

  container.innerHTML = '<p class="loading">Loading your tickets…</p>';

  try {
    const client = getTicketsClient();

    const {
      data: { user },
      error: authError
    } = await client.auth.getUser();

    if (authError) throw authError;

    if (!user) {
      container.innerHTML =
        '<p class="muted">Please sign in to view your tickets.</p>';
      return;
    }

    const { data: tickets, error } =
      await client.rpc('get_my_tickets');

    if (error) throw error;

    if (!tickets?.length) {
      container.innerHTML =
        '<p class="muted">You do not have any event tickets yet.</p>' +
        '<p style="margin-top:12px"><a class="btn primary" href="events.html">Browse events →</a></p>';
      return;
    }

    container.replaceChildren(...tickets.map(row => {
      const ticket = document.createElement('article');
      ticket.className = 'ticket';

      const info = document.createElement('div');

      const eyebrow = document.createElement('p');
      eyebrow.className = 'eyebrow';
      eyebrow.textContent = 'TECHNOVA EVENT TICKET';

      const title = document.createElement('h2');
      title.textContent = ticketText(row.title, 'Event');

      const date = document.createElement('p');
      const time = row.event_time
        ? String(row.event_time).slice(0, 5)
        : 'Time';

      date.textContent =
        `${ticketText(row.event_date, 'Date')} · ${time}`;

      const location = document.createElement('p');
      location.textContent = ticketText(row.location, 'Location');

      const type = document.createElement('p');
      type.textContent = ticketText(row.event_type, 'Event');

      const id = document.createElement('p');
      id.textContent = `Ticket #${row.registration_id}`;

      const registered = document.createElement('p');
      registered.textContent = row.registered_at
        ? `Registered ${new Date(row.registered_at).toLocaleString()}`
        : '';

      info.append(
        eyebrow,
        title,
        date,
        location,
        type,
        id,
        registered
      );

      ticket.append(
        info,
        createTicketQr(row.registration_id)
      );

      return ticket;
    }));
  } catch (error) {
    console.error('Ticket loading failed:', error);

    container.innerHTML =
      `<p class="muted">Could not load tickets: ${error?.message || 'Unknown error'}</p>` +
      '<p style="margin-top:12px"><button id="retryTickets" class="btn" type="button">Retry</button></p>';

    document.getElementById('retryTickets')?.addEventListener(
      'click',
      () => location.reload()
    );
  }
});
