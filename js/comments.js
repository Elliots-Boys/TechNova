/* TechNova Comments
 * Comment creation, listing and deletion helpers. Moderation must be enforced by RLS.
 */
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

  async function list(targetType, targetId, limit = 50) {
    const { data, error } = await client().from('comments').select('id,user_id,content,created_at,updated_at,profiles(display_name,avatar_url)').eq('target_type', targetType).eq('target_id', targetId).order('created_at', { ascending: true }).limit(limit);
    if (error) throw error;
    return data || [];
  }

  async function add(targetType, targetId, content) {
    const current = await user();
    const text = String(content || '').trim();
    if (!text) throw new Error('Comment cannot be empty.');
    const { data, error } = await client().from('comments').insert({ target_type: targetType, target_id: targetId, user_id: current.id, content: text }).select().single();
    if (error) throw error;
    return data;
  }

  async function remove(commentId) {
    const { error } = await client().from('comments').delete().eq('id', commentId);
    if (error) throw error;
  }

  window.TechNovaComments = { list, add, remove };
})();
