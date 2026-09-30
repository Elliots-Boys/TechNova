/* TechNova User Preferences */
(() => {
  'use strict';

  function client() {
    if (window.supabaseClient) return window.supabaseClient;
    window.supabaseClient = window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
    return window.supabaseClient;
  }

  async function user() {
    const { data: { user }, error } = await client().auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('You must be signed in.');
    return user;
  }

  async function get() {
    const current = await user();
    const { data, error } = await client().from('user_preferences').select('*').eq('user_id', current.id).maybeSingle();
    if (error) throw error;
    return data || { user_id: current.id, theme: 'system', email_notifications: true, event_reminders: true, newsletter: true };
  }

  async function save(values) {
    const current = await user();
    const payload = {
      user_id: current.id,
      theme: values.theme || 'system',
      email_notifications: values.email_notifications !== false,
      event_reminders: values.event_reminders !== false,
      newsletter: values.newsletter !== false,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await client().from('user_preferences').upsert(payload, { onConflict: 'user_id' }).select().single();
    if (error) throw error;
    applyTheme(payload.theme);
    return data;
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark' || theme === 'light') root.dataset.theme = theme;
    else root.removeAttribute('data-theme');
  }

  window.TechNovaPreferences = { get, save, applyTheme };
})();
