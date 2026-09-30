/* TechNova Reports navigation */
(function () {
  'use strict';

  function addReportsLink() {
    const nav = document.querySelector('header nav');
    if (!nav || nav.querySelector('[data-technova-reports-link]')) return;

    const isPagesPath = window.location.pathname.includes('/pages/');
    const href = isPagesPath ? 'admin-reports.html' : 'pages/admin-reports.html';

    const link = document.createElement('a');
    link.href = href;
    link.dataset.technovaReportsLink = 'true';
    link.textContent = 'Reports';

    const currentPath = window.location.pathname.replace(/\/$/, '');
    const reportsPath = new URL(href, window.location.href).pathname.replace(/\/$/, '');
    if (currentPath === reportsPath) link.classList.add('active');

    nav.appendChild(link);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addReportsLink);
  } else {
    addReportsLink();
  }
})();
