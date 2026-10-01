'use strict';

function getTechNovaAchievementsClient() {
  if (window.supabaseClient) return window.supabaseClient;

  if (!window.supabase || !window.TECHNOVA_SUPABASE_URL || !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('TechNova Supabase configuration is unavailable.');
  }

  window.supabaseClient = window.supabase.createClient(
    window.TECHNOVA_SUPABASE_URL,
    window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
  );

  return window.supabaseClient;
}

function showAchievementMessage(target, message) {
  if (!target) return;
  target.replaceChildren();
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

    status.append(strong, document.createTextNode(` · ${Number(item.xp_reward || 0)} XP`));

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

async function getSignedInUser(client) {
  const { data: { session }, error } = await client.auth.getSession();
  if (error) throw error;
  return session?.user || null;
}

async function loadAchievementProgress() {
  const grid = document.getElementById('achievementGrid');
  if (!grid) return;

  const xpEl = document.getElementById('xpTotal');
  const levelEl = document.getElementById('levelText');
  grid.innerHTML = '<p class="loading">Loading achievements…</p>';

  try {
    const client = getTechNovaAchievementsClient();
    const user = await getSignedInUser(client);

    if (!user) {
      showAchievementMessage(grid, 'Please sign in to view and unlock your TechNova achievements.');
      return;
    }

    // Award the welcome badge once. The database function ignores duplicates.
    const welcome = await client.rpc('award_xp', {
      p_amount: 0,
      p_achievement_slug: 'first-login'
    });
    if (welcome.error) console.warn('Welcome achievement could not be awarded:', welcome.error);

    const { data: rows, error } = await client.rpc('get_my_achievement_progress');
    if (error) throw error;

    const progress = rows || [];
    if (!progress.length) {
      showAchievementMessage(grid, 'No achievements are available yet.');
      return;
    }

    const xp = Number(progress[0]?.user_xp || 0);
    const level = Number(progress[0]?.user_level || 1);

    if (xpEl) xpEl.textContent = `${xp} XP`;
    if (levelEl) levelEl.textContent = `Level ${level}`;

    renderAchievementCards(grid, progress);
  } catch (error) {
    console.error('Achievement loading failed:', error);
    showAchievementMessage(grid, `Could not load achievements: ${error?.message || 'Unknown error'}`);
  }
}

async function loadLeaderboard(target) {
  const container = target || document.getElementById('leaderboard');
  if (!container) return;

  container.innerHTML = '<p class="loading">Loading leaderboard…</p>';

  try {
    const client = getTechNovaAchievementsClient();
    const user = await getSignedInUser(client);

    if (!user) {
      showAchievementMessage(container, 'Please sign in to view the TechNova leaderboard.');
      return;
    }

    const { data: scores, error } = await client.rpc('get_leaderboard', {
      limit_count: 25
    });

    if (error) throw error;

    if (!scores?.length) {
      showAchievementMessage(container, 'No leaderboard scores yet.');
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
      points.textContent = `${Number(row.xp || 0)} XP · Level ${Number(row.level || 1)}`;

      item.append(rank, name, points);
      return item;
    }));
  } catch (error) {
    console.error('Leaderboard loading failed:', error);
    showAchievementMessage(container, `Could not load the leaderboard: ${error?.message || 'Unknown error'}`);
  }
}

window.TechNovaAchievements = {
  load: loadAchievementProgress,
  loadLeaderboard
};

document.addEventListener('DOMContentLoaded', () => {
  loadAchievementProgress();
  loadLeaderboard();
});
