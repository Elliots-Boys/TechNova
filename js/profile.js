/* TechNova Enhanced Profiles */
(() => {
  'use strict';

  function client() {
    if (window.supabaseClient) return window.supabaseClient;
    window.supabaseClient = window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
    return window.supabaseClient;
  }

  async function currentUser() {
    const { data: { user }, error } = await client().auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('You must be signed in.');
    return user;
  }

  async function get(userId = null) {
    const id = userId || (await currentUser()).id;
    const { data, error } = await client().from('profiles').select('id,display_name,avatar_url,bio,created_at,updated_at').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async function update(values) {
    const user = await currentUser();
    const safe = {
      display_name: values.display_name ?? null,
      avatar_url: values.avatar_url ?? null,
      bio: values.bio ?? null,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await client().from('profiles').update(safe).eq('id', user.id).select().single();
    if (error) throw error;
    return data;
  }

  window.TechNovaProfile = { get, update };
})();
