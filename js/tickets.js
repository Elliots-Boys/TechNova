'use strict';

const techNovaTicketsClient = window.supabase.createClient(
  window.TECHNOVA_SUPABASE_URL,
  window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
);

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('tickets');
  if (!container) return;

  try {
    const { data: { user }, error: authError } =
      await techNovaTicketsClient.auth.getUser();

    if (authError || !user) {
      container.innerHTML =
        '<p class="muted">Please sign in to view your tickets.</p>';
      return;
    }

    // Restored to the original ticket-loading method that generated
    // the QR codes directly from event_registrations.
    const { data, error } = await techNovaTicketsClient
      .from('event_registrations')
      .select(
        'id,event_id,created_at,events(id,title,event_date,event_time,location,event_type)'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data?.length) {
      container.innerHTML =
        '<p class="muted">You do not have any event tickets yet.</p>';
      return;
    }

    container.replaceChildren(...data.map(registration => {
      const event = registration.events;

      const ticket = document.createElement('article');
      ticket.className = 'ticket';

      const info = document.createElement('div');
      info.innerHTML =
        `<p class="eyebrow">TECHNOVA EVENT TICKET</p>
         <h2>${event?.title || 'Event'}</h2>
         <p>${event?.event_date || 'Date'} · ${event?.event_time || 'Time'}</p>
         <p>${event?.location || 'Location'}</p>
         <p>Ticket #${registration.id}</p>`;

      const canvas = document.createElement('canvas');
      canvas.className = 'qr';

      const payload = JSON.stringify({
        ticketId: registration.id,
        eventId: registration.event_id,
        userId: user.id
      });

      if (!window.QRCode || typeof window.QRCode.toCanvas !== 'function') {
        throw new Error('The QR-code library did not load.');
      }

      window.QRCode.toCanvas(
        canvas,
        payload,
        { width: 130, margin: 1 },
        qrError => {
          if (qrError) console.error('Ticket QR error:', qrError);
        }
      );

      ticket.append(info, canvas);
      return ticket;
    }));
  } catch (error) {
    console.error('Ticket loading failed:', error);
    container.innerHTML =
      `<p class="muted">Could not load tickets: ${error?.message || 'Unknown error'}</p>`;
  }
});
