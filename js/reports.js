/* TechNova Reports
 * User-facing report submission helpers.
 * No database/schema changes are required by this file.
 */
(() => {
  'use strict';

  function client() {
    if (window.supabaseClient) return window.supabaseClient;

    if (!window.supabase || !window.TECHNOVA_SUPABASE_URL || !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY) {
      throw new Error('TechNova database connection is not configured.');
    }

    window.supabaseClient = window.supabase.createClient(
      window.TECHNOVA_SUPABASE_URL,
      window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
    );

    return window.supabaseClient;
  }

  const allowedTargetTypes = new Set([
    'comment',
    'event',
    'article',
    'user'
  ]);

  async function report(targetType, targetId, reason, details = '') {
    const supabaseClient = client();

    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error('You must be signed in to submit a report.');

    const type = String(targetType || '').trim().toLowerCase();
    const id = String(targetId ?? '').trim();
    const cleanReason = String(reason || '').trim();
    const cleanDetails = String(details || '').trim();

    if (!allowedTargetTypes.has(type)) {
      throw new Error('Choose what you are reporting: a comment, event, article, or user.');
    }

    if (!id) {
      throw new Error('Enter the ID of the item you are reporting.');
    }

    if (!cleanReason) {
      throw new Error('Choose a report reason.');
    }

    const { data, error } = await supabaseClient
      .from('reports')
      .insert({
        reporter_id: user.id,
        target_type: type,
        target_id: id,
        reason: cleanReason,
        details: cleanDetails || null,
        status: 'open'
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async function myReports() {
    const supabaseClient = client();

    const {
      data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabaseClient
      .from('reports')
      .select('*')
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  }

  window.TechNovaReports = {
    report,
    myReports
  };
})();
