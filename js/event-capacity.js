/* TechNova Event Capacity
 * Helpers for capacity, availability and registration counts.
 */
(() => {
  'use strict';

  function client() {
    if (window.supabaseClient) return window.supabaseClient;
    window.supabaseClient = window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
    return window.supabaseClient;
  }

  async function getEvent(eventId) {
    const { data, error } = await client().from('events').select('id,title,event_date,event_time,location,event_type,description,capacity').eq('id', eventId).single();
    if (error) throw error;
    return data;
  }

  async function registrationCount(eventId) {
    const { count, error } = await client().from('event_registrations').select('user_id', { count: 'exact', head: true }).eq('event_id', eventId);
    if (error) throw error;
    return count || 0;
  }

  async function availability(eventId) {
    const event = await getEvent(eventId);
    const registered = await registrationCount(eventId);
    const capacity = Number(event.capacity);
    return {
      event,
      registered,
      capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : null,
      remaining: Number.isFinite(capacity) && capacity > 0 ? Math.max(capacity - registered, 0) : null,
      full: Number.isFinite(capacity) && capacity > 0 ? registered >= capacity : false
    };
  }

  async function allEventCounts() {
    const { data: events, error } = await client().from('events').select('id,title,capacity,event_date').order('event_date', { ascending: true });
    if (error) throw error;
    return Promise.all((events || []).map(async event => ({ ...(await availability(event.id)) })));
  }

  window.TechNovaEventCapacity = { getEvent, registrationCount, availability, allEventCounts };
})();
