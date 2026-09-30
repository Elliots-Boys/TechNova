'use strict';

function technovaTicketsClient() {
  if (window.supabaseClient) return window.supabaseClient;
  if (!window.supabase || !window.TECHNOVA_SUPABASE_URL || !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('TechNova Supabase configuration is unavailable.');
  }
  window.supabaseClient = window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
  return window.supabaseClient;
}

function ticketText(value, fallback = '—') {
  return value === null || value === undefined || value === '' ? fallback : String(value);
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('tickets');
  if (!container) return;

  try {
    const client = technovaTicketsClient();
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) {
      container.innerHTML = '<p class="muted">Please sign in to view your tickets.</p>';
      return;
    }

    const { data: registrations, error: registrationError } = await client
      .from('event_registrations')
      .select('id,event_id,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (registrationError) throw registrationError;

    if (!registrations?.length) {
      container.innerHTML = '<p class="muted">You do not have any event tickets yet.</p><p style="margin-top:12px"><a class="btn primary" href="events.html">Browse events →</a></p>';
      return;
    }

    const eventIds = [...new Set(registrations.map(row => row.event_id).filter(Boolean))];
    const { data: events, error: eventError } = await client
      .from('events')
      .select('id,title,event_date,event_time,location,event_type')
      .in('id', eventIds);

    if (eventError) throw eventError;
    const eventMap = new Map((events || []).map(event => [String(event.id), event]));

    container.replaceChildren(...registrations.map(registration => {
      const event = eventMap.get(String(registration.event_id));
      const ticket = document.createElement('article');
      ticket.className = 'ticket';

      const info = document.createElement('div');
      const eyebrow = document.createElement('p');
      eyebrow.className = 'eyebrow';
      eyebrow.textContent = 'TECHNOVA EVENT TICKET';

      const title = document.createElement('h2');
      title.textContent = ticketText(event?.title, 'Event');

      const date = document.createElement('p');
      date.textContent = `${ticketText(event?.event_date, 'Date')} · ${ticketText(event?.event_time, 'Time')}`;

      const location = document.createElement('p');
      location.textContent = ticketText(event?.location, 'Location');

      const id = document.createElement('p');
      id.textContent = `Ticket #${registration.id}`;
      info.append(eyebrow, title, date, location, id);

      const canvas = document.createElement('canvas');
      canvas.className = 'qr';
      const payload = JSON.stringify({ ticketId: registration.id, eventId: registration.event_id, userId: user.id });

      if (window.QRCode?.toCanvas) {
        window.QRCode.toCanvas(canvas, payload, { width: 130, margin: 1 }, qrError => {
          if (qrError) console.error('Ticket QR error:', qrError);
        });
        ticket.append(info, canvas);
      } else {
        const qrMessage = document.createElement('p');
        qrMessage.className = 'muted';
        qrMessage.textContent = 'QR code library could not be loaded.';
        ticket.append(info, qrMessage);
      }
      return ticket;
    }));
  } catch (error) {
    console.error('Ticket loading failed:', error);
    container.innerHTML = `<p class="muted">Could not load tickets: ${error.message || 'Unknown error'}</p>`;
  }
});
