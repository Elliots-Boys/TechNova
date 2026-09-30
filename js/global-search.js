/* TechNova Global Search
 * Searches public content across events, technology and news tables.
 */
(() => {
  'use strict';

  function client() {
    if (window.supabaseClient) return window.supabaseClient;
    window.supabaseClient = window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
    return window.supabaseClient;
  }

  async function searchTable(table, columns, query, limit = 20) {
    const c = client();
    const pattern = `%${query.replace(/[%_]/g, '\\$&')}%`;
    let request = c.from(table).select('*').limit(limit);
    columns.forEach((column, index) => {
      request = index === 0 ? request.ilike(column, pattern) : request.or(columns.map(col => `${col}.ilike.${pattern}`).join(','));
    });
    const { data, error } = await request;
    if (error) return [];
    return (data || []).map(item => ({ ...item, source: table }));
  }

  async function search(query, limit = 20) {
    const q = String(query || '').trim();
    if (!q) return [];
    const [events, technology, news] = await Promise.all([
      searchTable('events', ['title', 'description', 'location', 'event_type'], q, limit),
      searchTable('technology_articles', ['title', 'summary', 'content'], q, limit),
      searchTable('news_posts', ['title', 'summary', 'content'], q, limit)
    ]);
    return [...events, ...technology, ...news].slice(0, limit);
  }

  window.TechNovaSearch = { search };
})();
