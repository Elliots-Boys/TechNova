'use strict';

function getTechNovaTicketsClient() {
  if (window.TechNovaTicketsClient) return window.TechNovaTicketsClient;

  if (
    !window.supabase ||
    !window.TECHNOVA_SUPABASE_URL ||
    !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
  ) {
    throw new Error('TechNova Supabase configuration is unavailable.');
  }

  window.TechNovaTicketsClient = window.supabase.createClient(
    window.TECHNOVA_SUPABASE_URL,
    window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
  );

  return window.TechNovaTicketsClient;
}

function ticketText(value, fallback = '—') {
  return value === null || value === undefined || value === ''
    ? fallback
    : String(value);
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

async function loadTicketsFallback(client, userId) {
  const { data, error } = await client
    .from('event_registrations')
    .select(
      'id,event_id,created_at,events(id,title,event_date,event_time,location,event_type)'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    registration_id: row.id,
    event_id: row.event_id,
    registered_at: row.created_at,
    title: row.events?.title || 'Event',
    event_date: row.events?.event_date || null,
    event_time: row.events?.event_time || null,
    location: row.events?.location || null,
    event_type: row.events?.event_type || null
  }));
}

async function loadTickets() {
  const container = document.getElementById('tickets');
  if (!container) return;

  container.innerHTML = '<p class="loading">Loading your tickets…</p>';

  try {
    const client = getTechNovaTicketsClient();

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

    let tickets = null;
    const rpcResult = await client.rpc('get_my_tickets');

    if (!rpcResult.error) {
      tickets = rpcResult.data || [];
    } else {
      console.warn(
        'Ticket RPC failed, using direct-table fallback:',
        rpcResult.error
      );
      tickets = await loadTicketsFallback(client, user.id);
    }

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
      loadTickets
    );
  }
}

document.addEventListener('DOMContentLoaded', loadTickets);
