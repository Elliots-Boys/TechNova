'use strict';

/* TechNova compatibility fixes for existing pages. */

(function () {
  function getClient() {
    if (window.supabaseClient) return window.supabaseClient;
    if (!window.supabase || !window.TECHNOVA_SUPABASE_URL || !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY) return null;
    window.supabaseClient = window.supabase.createClient(
      window.TECHNOVA_SUPABASE_URL,
      window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
    );
    return window.supabaseClient;
  }

  async function repairEventRegistrationLinks() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;

    const client = getClient();
    if (!client) return;

    try {
      const { data: events, error } = await client
        .from('events')
        .select('id,title');

      if (error) throw error;

      const byTitle = new Map((events || []).map(event => [String(event.title || '').trim().toLowerCase(), event.id]));

      const repair = () => {
        grid.querySelectorAll('a[href*="register.html"]').forEach(link => {
          try {
            const url = new URL(link.href, location.href);
            const params = new URLSearchParams(url.search);
            const title = params.get('event');
            const existingId = params.get('id');
            if (existingId || !title) return;

            const id = byTitle.get(title.trim().toLowerCase());
            if (id !== undefined) {
              link.href = `register.html?id=${encodeURIComponent(id)}`;
            }
          } catch (_) {}
        });
      };

      repair();
      new MutationObserver(repair).observe(grid, { childList: true, subtree: true });
    } catch (error) {
      console.warn('TechNova event registration link repair failed:', error);
    }
  }

  function improveTicketsPage() {
    const container = document.getElementById('tickets');
    if (!container) return;

    // tickets.js is responsible for the actual data. This only prevents a
    // stale loading message from remaining forever if its script failed.
    setTimeout(() => {
      if (container.querySelector('.loading')) {
        const hasContent = container.querySelector('.ticket');
        if (!hasContent) {
          const text = container.textContent || '';
          if (text.includes('Loading tickets')) {
            container.innerHTML = '<p class="muted">Tickets could not be loaded right now. Please refresh and try again.</p><p style="margin-top:12px"><a class="btn primary" href="events.html">Browse events →</a></p>';
          }
        }
      }
    }, 7000);
  }

  function improveAchievementsPage() {
    const grid = document.getElementById('achievementGrid');
    if (!grid) return;

    // Re-run the existing loader if it is available. This is deliberately
    // additive and does not replace the achievements implementation.
    setTimeout(() => {
      if (grid.querySelector('.loading') && window.TechNovaAchievements?.load) {
        window.TechNovaAchievements.load();
      }
    }, 1500);
  }

  function improveLeaderboardPage() {
    const leaderboard = document.getElementById('leaderboard');
    if (!leaderboard) return;

    setTimeout(() => {
      if (leaderboard.querySelector('.muted') && window.TechNovaAchievements?.loadLeaderboard) {
        window.TechNovaAchievements.loadLeaderboard(leaderboard);
      }
    }, 1500);
  }

  document.addEventListener('DOMContentLoaded', () => {
    repairEventRegistrationLinks();
    improveTicketsPage();
    improveAchievementsPage();
    improveLeaderboardPage();
  });
})();
