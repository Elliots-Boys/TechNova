/* TechNova CMS helpers
 * Generic CRUD for technology articles, news posts and site content.
 * Publish/unpublish is represented by a boolean `published` column.
 * Admin-only writes must be protected with Supabase RLS.
 */
(() => {
  'use strict';

  function client() {
    if (window.supabaseClient) return window.supabaseClient;
    window.supabaseClient = window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
    return window.supabaseClient;
  }

  const api = {
    async listArticles(table = 'technology_articles', publishedOnly = false) {
      let q = client().from(table).select('*').order('created_at', { ascending: false });
      if (publishedOnly) q = q.eq('published', true);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },

    async create(table, values) {
      const { data, error } = await client().from(table).insert(values).select().single();
      if (error) throw error;
      return data;
    },

    async update(table, id, values) {
      const { data, error } = await client().from(table).update(values).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },

    async remove(table, id) {
      const { error } = await client().from(table).delete().eq('id', id);
      if (error) throw error;
    },

    async publish(table, id, published) {
      return this.update(table, id, { published: !!published, published_at: published ? new Date().toISOString() : null });
    },

    async getSiteContent(key) {
      const { data, error } = await client().from('site_content').select('*').eq('content_key', key).maybeSingle();
      if (error) throw error;
      return data;
    },

    async setSiteContent(key, value) {
      const { data, error } = await client().from('site_content').upsert({ content_key: key, content_value: value, updated_at: new Date().toISOString() }, { onConflict: 'content_key' }).select().single();
      if (error) throw error;
      return data;
    }
  };

  window.TechNovaCMS = api;
})();
