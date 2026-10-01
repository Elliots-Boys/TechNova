'use strict';

const techNovaAchievementsClient = window.supabase.createClient(
  window.TECHNOVA_SUPABASE_URL,
  window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
);

function showAchievementError(target, message) {
  if (!target) return;
  target.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'muted';
  p.textContent = message;
  target.appendChild(p);
}

function renderAchievementCards(grid, rows) {
  grid.replaceChildren(...rows.map(item => {
    const card = document.createElement('article');
    card.className = `g-card${item.earned ? '' : ' locked'}`;

    const icon = document.createElement('div');
    icon.className = 'g-icon';
    icon.textContent = item.icon || '🏆';

    const title = document.createElement('h3');
    title.textContent = item.name || 'Achievement';

    const description = document.createElement('p');
    description.textContent = item.description || '';

    const status = document.createElement('p');
    status.style.marginTop = '10px';

    const strong = document.createElement('strong');
    strong.textContent = item.earned ? 'Unlocked' : 'Locked';

    status.append(
      strong,
      document.createTextNode(` · ${Number(item.xp_reward || 0)} XP`)
    );

    if (item.earned_at) {
      const earned = document.createElement('small');
      earned.style.display = 'block';
      earned.style.marginTop = '6px';
      earned.style.color = '#91a0b7';
      earned.textContent = `Earned ${new Date(item.earned_at).toLocaleDateString()}`;
      status.appendChild(earned);
    }

    card.append(icon, title, description, status);
    return card;
  }));
}

async function loadAchievementProgress() {
  const grid = document.getElementById('achievementGrid');
  if (!grid) return;

  const xpEl = document.getElementById('xpTotal');
  const levelEl = document.getElementById('levelText');

  try {
    const {
      data: { user },
      error: authError
    } = await techNovaAchievementsClient.auth.getUser();

    if (authError) throw authError;

    if (!user) {
      showAchievementError(
        grid,
        'Please sign in to view and unlock your TechNova achievements.'
      );
      return;
    }

    // Award the one-time welcome achievement. The database function prevents
    // the same achievement reward from being added twice.
    await techNovaAchievementsClient.rpc('award_xp', {
      p_amount: 0,
      p_achievement_slug: 'first-login'
    });

    const { data, error } = await techNovaAchievementsClient
      .rpc('get_my_achievement_progress');

    if (error) throw error;

    const rows = data || [];

    if (!rows.length) {
      showAchievementError(grid, 'No achievements are available yet.');
      return;
    }

    const xp = Number(rows[0]?.user_xp || 0);
    const level = Number(rows[0]?.user_level || 1);

    if (xpEl) xpEl.textContent = `${xp} XP`;
    if (levelEl) levelEl.textContent = `Level ${level}`;

    renderAchievementCards(grid, rows);
  } catch (error) {
    console.error('Achievement loading failed:', error);
    showAchievementError(
      grid,
      `Could not load achievements: ${error?.message || 'Unknown error'}`
    );
  }
}

async function loadLeaderboard() {
  const container = document.getElementById('leaderboard');
  if (!container) return;

  container.innerHTML = '<p class="loading">Loading leaderboard…</p>';

  try {
    const {
      data: { user },
      error: authError
    } = await techNovaAchievementsClient.auth.getUser();

    if (authError) throw authError;

    if (!user) {
      showAchievementError(
        container,
        'Please sign in to view the TechNova leaderboard.'
      );
      return;
    }

    const { data, error } = await techNovaAchievementsClient.rpc(
      'get_leaderboard',
      { limit_count: 25 }
    );

    if (error) throw error;

    const scores = data || [];

    if (!scores.length) {
      showAchievementError(container, 'No leaderboard scores yet.');
      return;
    }

    container.replaceChildren(...scores.map((row, index) => {
      const item = document.createElement('div');
      item.className = 'l-row';

      const rank = document.createElement('span');
      rank.className = 'rank';

      const numericRank = Number(row.rank || index + 1);
      rank.textContent =
        numericRank === 1 ? '🥇' :
        numericRank === 2 ? '🥈' :
        numericRank === 3 ? '🥉' :
        `#${numericRank}`;

      const name = document.createElement('span');
      name.textContent = row.display_name || 'Unnamed user';

      const points = document.createElement('span');
      points.className = 'points';
      points.textContent =
        `${Number(row.xp || 0)} XP · Level ${Number(row.level || 1)}`;

      item.append(rank, name, points);
      return item;
    }));
  } catch (error) {
    console.error('Leaderboard loading failed:', error);
    showAchievementError(
      container,
      `Could not load the leaderboard: ${error?.message || 'Unknown error'}`
    );
  }
}

window.TechNovaAchievements = {
  load: loadAchievementProgress,
  loadLeaderboard
};

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadAchievementProgress(),
    loadLeaderboard()
  ]);
});
