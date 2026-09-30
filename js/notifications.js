/* TechNova Notifications
 * Reusable notification helpers. Include this file on pages that need notifications.
 */
(() => {
  'use strict';

  function client() {
    if (window.supabaseClient) return window.supabaseClient;
    if (!window.supabase || !window.TECHNOVA_SUPABASE_URL || !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY) {
      throw new Error('Supabase has not been configured.');
    }
    window.supabaseClient = window.supabase.createClient(
      window.TECHNOVA_SUPABASE_URL,
      window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
    );
    return window.supabaseClient;
  }

  async function getNotifications(limit = 30) {
    const { data, error } = await client()
      .from('notifications')
      .select('id,title,message,type,is_read,created_at,link_url')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  async function markRead(id) {
    const { error } = await client().from('notifications').update({ is_read: true }).eq('id', id);
    if (error) throw error;
  }

  async function markAllRead() {
    const { data: { user } } = await client().auth.getUser();
    if (!user) throw new Error('You must be signed in.');
    const { error } = await client().from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    if (error) throw error;
  }

  async function unreadCount() {
    const { data: { user } } = await client().auth.getUser();
    if (!user) return 0;
    const { count, error } = await client().from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false);
    if (error) throw error;
    return count || 0;
  }

  window.TechNovaNotifications = { getNotifications, markRead, markAllRead, unreadCount };
})();
