/* TechNova Analytics
 * Dashboard-friendly statistics helpers. Uses read-only aggregate queries where possible.
 */
(() => {
  'use strict';

  function client() {
    if (window.supabaseClient) return window.supabaseClient;
    window.supabaseClient = window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
    return window.supabaseClient;
  }

  function startOfDaysAgo(days) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  }

  async function exactCount(table, filter = null) {
    let q = client().from(table).select('*', { count: 'exact', head: true });
    if (filter) q = filter(q);
    const { count, error } = await q;
    if (error) throw error;
    return count || 0;
  }

  async function dashboardStats() {
    const [users, events, registrations, newUsersWeek, newUsersMonth] = await Promise.all([
      exactCount('profiles'),
      exactCount('events'),
      exactCount('event_registrations'),
      exactCount('profiles', q => q.gte('created_at', startOfDaysAgo(7))),
      exactCount('profiles', q => q.gte('created_at', startOfDaysAgo(30)))
    ]);

    const { data: popular, error: popularError } = await client()
      .from('event_registrations')
      .select('event_id,events(id,title)')
      .limit(1000);
    if (popularError) throw popularError;

    const counts = new Map();
    (popular || []).forEach(row => {
      const id = row.event_id;
      const current = counts.get(id) || { event_id: id, title: row.events?.title || 'Unknown event', registrations: 0 };
      current.registrations += 1;
      counts.set(id, current);
    });

    const mostPopular = [...counts.values()].sort((a, b) => b.registrations - a.registrations);

    const { data: upcoming, error: upcomingError } = await client()
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString().slice(0, 10))
      .order('event_date', { ascending: true })
      .limit(10);
    if (upcomingError) throw upcomingError;

    const { data: recentUsers, error: recentError } = await client()
      .from('profiles')
      .select('id,display_name,created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    if (recentError) throw recentError;

    return { users, events, registrations, newUsersWeek, newUsersMonth, mostPopular, upcoming: upcoming || [], recentUsers: recentUsers || [] };
  }

  window.TechNovaAnalytics = { dashboardStats };
})();
