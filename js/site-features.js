/* TechNova feature launcher: additive only. It does not replace existing navigation. */
(function () {
  'use strict';

  const pageRoot = location.pathname.includes('/pages/') ? '' : 'pages/';
  const links = [
    ['🤖', 'AI Assistant', 'ai-assistant.html'],
    ['🏆', 'Achievements', 'achievements.html'],
    ['🥇', 'Leaderboard', 'leaderboard.html'],
    ['🎟️', 'My Tickets', 'tickets.html'],
    ['📅', 'My Calendar', 'calendar.html'],
    ['❤️', 'Saved Events', 'bookmarks.html'],
    ['🔔', 'Notifications', 'notifications.html'],
    ['🧠', 'Tech Quiz', 'quiz.html']
  ];

  function addDrawerLinks() {
    const drawerContent = document.querySelector('.site-drawer-content');
    if (!drawerContent || drawerContent.querySelector('.technova-feature-section')) return false;

    const section = document.createElement('section');
    section.className = 'drawer-section technova-feature-section';
    section.innerHTML = '<h3 class="drawer-section-title">TechNova Plus</h3><div class="drawer-links"></div>';
    const list = section.querySelector('.drawer-links');

    links.forEach(([icon, label, file]) => {
      const a = document.createElement('a');
      a.href = pageRoot + file;
      a.innerHTML = `<span class="drawer-icon" aria-hidden="true">${icon}</span><span>${label}</span>`;
      if (location.pathname.endsWith('/' + file)) a.classList.add('active');
      list.appendChild(a);
    });

    drawerContent.prepend(section);
    return true;
  }

  function addAIButton() {
    if (document.querySelector('.technova-ai-fab') || location.pathname.endsWith('ai-assistant.html')) return;
    const style = document.createElement('style');
    style.textContent = `.technova-ai-fab{position:fixed;right:22px;bottom:22px;z-index:999;background:linear-gradient(135deg,#9b6cff,#32d6ff);color:#06101d;border:0;border-radius:999px;padding:12px 16px;font-weight:900;box-shadow:0 12px 35px #0007;text-decoration:none}.technova-ai-fab:hover{transform:translateY(-2px);filter:brightness(1.08)}`;
    document.head.appendChild(style);
    const a = document.createElement('a');
    a.className = 'technova-ai-fab';
    a.href = pageRoot + 'ai-assistant.html';
    a.textContent = '🤖 Ask TechNova AI';
    a.setAttribute('aria-label', 'Open TechNova AI assistant');
    document.body.appendChild(a);
  }

  function init() {
    addAIButton();
    if (addDrawerLinks()) return;
    const observer = new MutationObserver(() => {
      if (addDrawerLinks()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
