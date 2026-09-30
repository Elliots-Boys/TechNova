/*
 * TechNova Admin Tools launcher
 * Adds a dedicated Admin Tools card without modifying the existing
 * admin dashboard sections or data-loading code.
 */
(function () {
  'use strict';

  function initAdminTools() {
    if (!document.body || document.getElementById('technovaAdminTools')) return;

    const tabs = document.querySelector('.admin-tabs');
    const anchor = document.querySelector('.admin-page');
    if (!anchor) return;

    const style = document.createElement('style');
    style.textContent = `
      .technova-admin-tools {
        margin: 0 0 25px;
        background: linear-gradient(180deg,#101b2d,#09111d);
        border: 1px solid #243955;
        border-radius: 18px;
        padding: 22px;
        box-shadow: 0 15px 45px #0004;
      }
      .technova-admin-tools-header {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:15px;
        flex-wrap:wrap;
        margin-bottom:16px;
      }
      .technova-admin-tools h2 { margin:0; font-size:25px; }
      .technova-admin-tools p { margin:5px 0 0; color:#91a0b7; }
      .technova-admin-tools-grid {
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:12px;
      }
      .technova-admin-tool {
        display:flex;
        align-items:center;
        gap:12px;
        min-height:72px;
        box-sizing:border-box;
        padding:14px;
        border:1px solid #29415e;
        border-radius:12px;
        background:#08111e;
        color:#dbe7f5;
        text-decoration:none;
        transition:transform .15s ease,border-color .15s ease,background .15s ease;
      }
      .technova-admin-tool:hover {
        transform:translateY(-2px);
        border-color:#32d6ff;
        background:#0d1b2d;
        color:#32d6ff;
      }
      .technova-admin-tool-icon { font-size:25px; flex:none; }
      .technova-admin-tool-title { font-weight:800; }
      .technova-admin-tool-description { color:#91a0b7; font-size:12px; margin-top:3px; }
      @media(max-width:900px){
        .technova-admin-tools-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
      }
      @media(max-width:600px){
        .technova-admin-tools-grid { grid-template-columns:1fr; }
      }
    `;
    document.head.appendChild(style);

    const card = document.createElement('section');
    card.id = 'technovaAdminTools';
    card.className = 'technova-admin-tools';

    card.innerHTML = `
      <div class="technova-admin-tools-header">
        <div>
          <p class="eyebrow">ADMIN TOOLS</p>
          <h2>Administration centre</h2>
          <p>Quick access to the extra TechNova management pages.</p>
        </div>
      </div>
      <div class="technova-admin-tools-grid">
        <a class="technova-admin-tool" href="admin-cms.html">
          <span class="technova-admin-tool-icon">📰</span>
          <span><span class="technova-admin-tool-title">CMS</span><span class="technova-admin-tool-description">Manage website content</span></span>
        </a>
        <a class="technova-admin-tool" href="admin-reports.html">
          <span class="technova-admin-tool-icon">🚨</span>
          <span><span class="technova-admin-tool-title">Reports</span><span class="technova-admin-tool-description">Review submitted reports</span></span>
        </a>
        <a class="technova-admin-tool" href="analytics.html">
          <span class="technova-admin-tool-icon">📊</span>
          <span><span class="technova-admin-tool-title">Analytics</span><span class="technova-admin-tool-description">View website statistics</span></span>
        </a>
        <a class="technova-admin-tool" href="notifications.html">
          <span class="technova-admin-tool-icon">🔔</span>
          <span><span class="technova-admin-tool-title">Notifications</span><span class="technova-admin-tool-description">Check notification activity</span></span>
        </a>
        <a class="technova-admin-tool" href="#section-users" data-admin-tool-tab="users">
          <span class="technova-admin-tool-icon">👥</span>
          <span><span class="technova-admin-tool-title">User Management</span><span class="technova-admin-tool-description">Manage users and roles</span></span>
        </a>
        <a class="technova-admin-tool" href="#section-events" data-admin-tool-tab="events">
          <span class="technova-admin-tool-icon">📅</span>
          <span><span class="technova-admin-tool-title">Event Management</span><span class="technova-admin-tool-description">Create and manage events</span></span>
        </a>
      </div>
    `;

    if (tabs && tabs.parentNode) {
      tabs.parentNode.insertBefore(card, tabs.nextSibling);
    } else {
      anchor.insertBefore(card, anchor.firstChild);
    }

    card.querySelectorAll('[data-admin-tool-tab]').forEach(link => {
      link.addEventListener('click', event => {
        const section = link.dataset.adminToolTab;
        const tab = document.querySelector(`.admin-tab[data-section="${section}"]`);
        if (tab) {
          event.preventDefault();
          tab.click();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminTools);
  } else {
    initAdminTools();
  }
})();
