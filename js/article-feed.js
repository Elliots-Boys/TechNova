/* Public TechNova article feeds. Only published rows are requested; RLS provides a second layer of protection. */
(() => {
  'use strict';
  const aliases = { Technology: ['Technology', 'technology_articles'], News: ['News', 'news_posts'] };
  const canonical = value => value === 'technology_articles' ? 'Technology' : value === 'news_posts' ? 'News' : value;
  const client = () => {
    if (window.supabaseClient) return window.supabaseClient;
    if (!window.supabase || !window.TECHNOVA_SUPABASE_URL || !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY) throw new Error('The article service is not configured.');
    window.supabaseClient = window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
    return window.supabaseClient;
  };
  const articleUrl = id => (location.pathname.includes('/pages/') ? 'article.html' : 'pages/article.html') + '?id=' + encodeURIComponent(id);
  const dateLabel = value => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date);
  };
  async function load(container) {
    const category = container.dataset.cmsFeed || '';
    const limit = Math.min(12, Math.max(1, Number(container.dataset.limit) || 12));
    try {
      let query = client().from('articles').select('id,title,excerpt,image_url,category,created_at').eq('published', true).order('created_at', { ascending: false }).limit(limit);
      if (category) query = query.in('category', aliases[category] || [category]);
      const { data, error } = await query;
      if (error) throw error;
      if (!data || !data.length) { container.textContent = category ? 'No published posts yet.' : 'No published articles yet.'; return; }
      container.replaceChildren(...data.map(row => {
        const card = document.createElement('article'); card.className = 'panel cms-article-card';
        if (row.image_url) {
          try {
            const imageUrl = new URL(row.image_url, location.href);
            if (['https:', 'http:'].includes(imageUrl.protocol)) {
              const image = document.createElement('img'); image.src = imageUrl.href;
              image.alt = row.title ? 'Image accompanying ' + row.title : 'Article image'; image.loading = 'lazy';
              image.style.cssText = 'display:block;width:100%;max-height:220px;object-fit:cover;border-radius:12px;margin-bottom:12px'; card.append(image);
            }
          } catch {}
        }
        const tag = document.createElement('span'); tag.className = 'badge'; tag.textContent = canonical(row.category || category || 'Article');
        const heading = document.createElement('h3'); const titleLink = document.createElement('a'); titleLink.href = articleUrl(row.id); titleLink.textContent = row.title || 'Untitled article'; heading.append(titleLink);
        const summary = document.createElement('p'); summary.className = 'muted'; summary.textContent = row.excerpt || 'Open this article to read the full story.';
        const meta = document.createElement('p'); meta.className = 'muted'; meta.textContent = dateLabel(row.created_at);
        const link = document.createElement('a'); link.className = 'hub-link'; link.href = articleUrl(row.id); link.textContent = 'Read article →';
        card.append(tag, heading, summary); if (meta.textContent) card.append(meta); card.append(link); return card;
      }));
    } catch (error) { container.textContent = 'Published articles are temporarily unavailable.'; console.error('TechNova article feed:', error); }
  }
  function loadAll() { document.querySelectorAll('[data-cms-feed]').forEach(load); }
  window.TechNovaArticleFeed = { loadAll };
  document.addEventListener('DOMContentLoaded', loadAll);
})();