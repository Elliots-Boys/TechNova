/* Load a single public article. Drafts are never requested by this page. */
document.addEventListener('DOMContentLoaded', async () => {
  const title = document.getElementById('articleTitle'), category = document.getElementById('articleCategory');
  const meta = document.getElementById('articleMeta'), excerpt = document.getElementById('articleExcerpt');
  const content = document.getElementById('articleContent'), image = document.getElementById('articleImage');
  const status = document.getElementById('articleStatus'), article = document.getElementById('article');
  const id = new URLSearchParams(location.search).get('id');
  const showError = message => { article.hidden = true; status.hidden = false; status.textContent = message; };
  if (!id || !/^\d+$/.test(id)) { showError('This article could not be found. It may have been removed or is not published.'); return; }
  try {
    if (!window.supabase || !window.TECHNOVA_SUPABASE_URL || !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY) throw new Error('The article service is unavailable.');
    const client = window.supabaseClient || window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
    const { data, error } = await client.from('articles').select('id,title,excerpt,content,image_url,category,created_at').eq('id', Number(id)).eq('published', true).maybeSingle();
    if (error) throw error;
    if (!data) { showError('This article could not be found. It may have been removed or is not published.'); return; }
    const cleanCategory = data.category === 'technology_articles' ? 'Technology' : data.category === 'news_posts' ? 'News' : data.category || 'Article';
    title.textContent = data.title || 'Untitled article'; document.title = title.textContent + ' · TechNova';
    category.textContent = cleanCategory.toUpperCase(); category.href = cleanCategory === 'Technology' ? 'technology.html' : 'news.html';
    const created = data.created_at ? new Date(data.created_at) : null;
    meta.textContent = created && !Number.isNaN(created.getTime()) ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(created) : '';
    excerpt.textContent = data.excerpt || ''; content.textContent = data.content || data.excerpt || 'This article does not have any additional content.';
    if (data.image_url) {
      try {
        const imageUrl = new URL(data.image_url, location.href);
        if (['https:', 'http:'].includes(imageUrl.protocol)) { image.src = imageUrl.href; image.alt = data.title ? 'Image accompanying ' + data.title : 'Article image'; image.hidden = false; }
      } catch {}
    }
  } catch (error) { console.error('TechNova article:', error); showError('This article is temporarily unavailable. Please try again later.'); }
});