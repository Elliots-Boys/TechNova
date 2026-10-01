'use strict';

const techNovaTicketsClient = window.supabase.createClient(
  window.TECHNOVA_SUPABASE_URL,
  window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
);

function ticketText(value, fallback = '—') {
  return value === null || value === undefined || value === ''
    ? fallback
    : String(value);
}

function formatTicketDate(value) {
  if (!value) return 'Date TBC';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
}

function formatTicketTime(value) {
  if (!value) return 'Time TBC';
  return String(value).slice(0, 5);
}

function createQr(ticketId) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText =
    'background:white;padding:8px;border-radius:12px;width:130px;height:130px;box-sizing:border-box;display:grid;place-items:center';

  const canvas = document.createElement('canvas');
  canvas.width = 114;
  canvas.height = 114;
  canvas.setAttribute('aria-label', `QR code for TechNova ticket ${ticketId}`);
  wrapper.appendChild(canvas);

  const payload = `TECHNOVA-TICKET:${ticketId}`;

  try {
    if (window.QRCode && typeof window.QRCode.toCanvas === 'function') {
      window.QRCode.toCanvas(
        canvas,
        payload,
        { width: 114, margin: 1 },
        error => {
          if (error) renderQrFallback(wrapper, ticketId);
        }
      );
    } else {
      renderQrFallback(wrapper, ticketId);
    }
  } catch (error) {
    console.warn('QR generation failed:', error);
    renderQrFallback(wrapper, ticketId);
  }

  return wrapper;
}

function renderQrFallback(wrapper, ticketId) {
  wrapper.replaceChildren();

  const fallback = document.createElement('div');
  fallback.style.cssText =
    'background:#07101c;color:#dbe7f5;border:1px solid #29415e;border-radius:10px;padding:10px;text-align:center;font-size:12px;width:100%;box-sizing:border-box';

  const strong = document.createElement('strong');
  strong.textContent = 'Ticket ready';

  const label = document.createElement('div');
  label.style.color = '#91a0b7';
  label.style.marginTop = '6px';
  label.textContent = 'Ticket ID';

  const code = document.createElement('code');
  code.style.wordBreak = 'break-all';
  code.textContent = String(ticketId);

  fallback.append(strong, label, code);
  wrapper.appendChild(fallback);
}

function buildTicket(ticketData) {
  const ticket = document.createElement('article');
  ticket.className = 'ticket';

  const info = document.createElement('div');

  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'TECHNOVA EVENT TICKET';

  const title = document.createElement('h2');
  title.textContent = ticketText(ticketData.title, 'TechNova Event');

  const dateTime = document.createElement('p');
  dateTime.textContent =
    `📅 ${formatTicketDate(ticketData.event_date)} · ${formatTicketTime(ticketData.event_time)}`;

  const location = document.createElement('p');
  location.textContent = `📍 ${ticketText(ticketData.location, 'Location TBC')}`;

  const type = document.createElement('p');
  type.textContent = `🏷 ${ticketText(ticketData.event_type, 'Event')}`;

  const id = document.createElement('p');
  id.textContent = `Ticket #${ticketData.registration_id}`;

  info.append(eyebrow, title, dateTime, location, type, id);
  ticket.append(info, createQr(ticketData.registration_id));

  return ticket;
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('tickets');
  if (!container) return;

  try {
    const {
      data: { user },
      error: authError
    } = await techNovaTicketsClient.auth.getUser();

    if (authError) throw authError;

    if (!user) {
      container.innerHTML =
        '<p class="muted">Please sign in to view your tickets.</p>' +
        '<p style="margin-top:12px"><a class="btn primary" href="login.html">Sign in →</a></p>';
      return;
    }

    const { data, error } = await techNovaTicketsClient.rpc('get_my_tickets');

    if (error) throw error;

    const tickets = data || [];

    if (!tickets.length) {
      container.innerHTML =
        '<p class="muted">You do not have any event tickets yet.</p>' +
        '<p style="margin-top:12px"><a class="btn primary" href="events.html">Browse events →</a></p>';
      return;
    }

    container.replaceChildren(...tickets.map(buildTicket));
  } catch (error) {
    console.error('Ticket loading failed:', error);
    container.innerHTML = '';

    const message = document.createElement('p');
    message.className = 'muted';
    message.textContent =
      `Could not load tickets: ${error?.message || 'Unknown error'}`;

    container.appendChild(message);
  }
});
