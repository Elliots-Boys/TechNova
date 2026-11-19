/* TechNova CMS helpers backed by the existing public.articles table.
 * Legacy category values are supported for existing posts. New and edited posts
 * are saved with the canonical Technology or News category.
 * Supabase RLS remains responsible for admin-only writes and private drafts.
 */
(() => {
  'use strict';
  function client() {
    if (window.supabaseClient) return window.supabaseClient;
    if (!window.supabase || !window.TECHNOVA_SUPABASE_URL || !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY) throw new Error('Supabase configuration is unavailable.');
    window.supabaseClient = window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
    return window.supabaseClient;
  }
  const canonicalCategory = category => category === 'technology_articles' ? 'Technology' : category === 'news_posts' ? 'News' : category;
  const categoryValues = category => {
    const canonical = canonicalCategory(category);
    if (canonical === 'Technology') return ['Technology', 'technology_articles'];
    if (canonical === 'News') return ['News', 'news_posts'];
    return [canonical];
  };
  const withCategory = (query, category) => query.in('category', categoryValues(category));
  const api = {
    async listArticles(category = 'Technology', publishedOnly = false) {
      let query = withCategory(client().from('articles').select('*'), category).order('created_at', { ascending: false });
      if (publishedOnly) query = query.eq('published', true);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    async create(category, values) {
      const payload = { title: values.title, slug: values.slug || values.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), excerpt: values.summary || '', content: values.content || '', image_url: values.image_url || null, category: canonicalCategory(category), published: !!values.published, updated_at: new Date().toISOString() };
      const { data, error } = await client().from('articles').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    async update(category, id, values) {
      const payload = { title: values.title, slug: values.slug || values.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), excerpt: values.summary || '', content: values.content || '', image_url: values.image_url || null, category: canonicalCategory(category), published: !!values.published, updated_at: new Date().toISOString() };
      const { data, error } = await withCategory(client().from('articles').update(payload), category).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async remove(category, id) {
      const { error } = await withCategory(client().from('articles').delete(), category).eq('id', id);
      if (error) throw error;
    },
    async publish(category, id, published) {
      const { data, error } = await withCategory(client().from('articles').update({ published: !!published, updated_at: new Date().toISOString() }), category).eq('id', id).select().single();
      if (error) throw error;
      return data;
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