/* TechNova Reports
 * User content reporting helpers. The database/RLS must validate who may create and review reports.
 */
(() => {
  'use strict';

  function client() {
    if (window.supabaseClient) return window.supabaseClient;
    window.supabaseClient = window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
    return window.supabaseClient;
  }

  async function report(targetType, targetId, reason, details = '') {
    const { data: { user }, error: userError } = await client().auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('You must be signed in.');
    if (!reason || !String(reason).trim()) throw new Error('Choose a report reason.');
    const { data, error } = await client().from('reports').insert({ reporter_id: user.id, target_type: targetType, target_id: targetId, reason: String(reason).trim(), details: String(details || '').trim(), status: 'open' }).select().single();
    if (error) throw error;
    return data;
  }

  async function myReports() {
    const { data: { user } } = await client().auth.getUser();
    if (!user) return [];
    const { data, error } = await client().from('reports').select('*').eq('reporter_id', user.id).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  window.TechNovaReports = { report, myReports };
})();
