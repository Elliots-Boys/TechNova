/* TechNova CMS helpers backed by the existing public.articles table.
 * The category column separates Technology and News content.
 * Supabase RLS remains responsible for admin-only writes.
 */
(() => {
  'use strict';
  function client() {
    if (window.supabaseClient) return window.supabaseClient;
    if (!window.supabase || !window.TECHNOVA_SUPABASE_URL || !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY) {
      throw new Error('Supabase configuration is unavailable.');
    }
    window.supabaseClient = window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
    return window.supabaseClient;
  }
  const api = {
    async listArticles(category = 'Technology', publishedOnly = false) {
      let q = client().from('articles').select('*').eq('category', category).order('created_at', { ascending: false });
      if (publishedOnly) q = q.eq('published', true);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async create(category, values) {
      const payload = {
        title: values.title,
        slug: values.slug || values.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        excerpt: values.summary || '',
        content: values.content || '',
        image_url: values.image_url || null,
        category,
        published: !!values.published,
        updated_at: new Date().toISOString()
      };
      const { data, error } = await client().from('articles').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    async update(category, id, values) {
      const payload = {
        title: values.title,
        slug: values.slug || values.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        excerpt: values.summary || '',
        content: values.content || '',
        image_url: values.image_url || null,
        category,
        published: !!values.published,
        updated_at: new Date().toISOString()
      };
      const { data, error } = await client().from('articles').update(payload).eq('id', id).eq('category', category).select().single();
      if (error) throw error;
      return data;
    },
    async remove(category, id) {
      const { error } = await client().from('articles').delete().eq('id', id).eq('category', category);
      if (error) throw error;
    },
    async publish(category, id, published) {
      return this.update(category, id, { title: (await this.listArticles(category)).find(row => String(row.id) === String(id))?.title || 'Untitled', published });
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
