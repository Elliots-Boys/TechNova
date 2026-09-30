/* TechNova Saved Events
 * Save/unsave events for the signed-in user.
 */
(() => {
  'use strict';

  function client() {
    if (window.supabaseClient) return window.supabaseClient;
    window.supabaseClient = window.supabase.createClient(
      window.TECHNOVA_SUPABASE_URL,
      window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
    );
    return window.supabaseClient;
  }

  async function currentUser() {
    const { data: { user }, error } = await client().auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('You must be signed in.');
    return user;
  }

  async function save(eventId) {
    const user = await currentUser();
    const { error } = await client().from('saved_events').upsert({ user_id: user.id, event_id: eventId }, { onConflict: 'user_id,event_id' });
    if (error) throw error;
  }

  async function remove(eventId) {
    const user = await currentUser();
    const { error } = await client().from('saved_events').delete().eq('user_id', user.id).eq('event_id', eventId);
    if (error) throw error;
  }

  async function isSaved(eventId) {
    const user = await currentUser();
    const { data, error } = await client().from('saved_events').select('event_id').eq('user_id', user.id).eq('event_id', eventId).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async function list() {
    const user = await currentUser();
    const { data, error } = await client().from('saved_events').select('event_id,created_at,events(id,title,event_date,event_time,location,event_type)').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  window.TechNovaSavedEvents = { save, remove, isSaved, list };
})();
