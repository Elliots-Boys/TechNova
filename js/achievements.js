'use strict';

const techNovaAchievementsClient = window.supabase.createClient(
  window.TECHNOVA_SUPABASE_URL,
  window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
);

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

  grid.innerHTML = '<p class="loading">Loading achievements…</p>';

  try {
    const { data: { user }, error: authError } =
      await techNovaAchievementsClient.auth.getUser();

    if (authError) throw authError;

    if (!user) {
      showAchievementMessage(
        grid,
        'Please sign in to view and unlock your TechNova achievements.'
      );
      return;
    }

    // One-time welcome reward. A duplicate achievement does not award XP twice.
    await techNovaAchievementsClient.rpc('award_xp', {
      p_amount: 0,
      p_achievement_slug: 'first-login'
    });

    let rows = null;

    const progressResult =
      await techNovaAchievementsClient.rpc('get_my_achievement_progress');

    if (!progressResult.error) {
      rows = progressResult.data || [];
    } else {
      console.warn(
        'Achievement progress RPC failed, using table fallback:',
        progressResult.error
      );

      const [achievementResult, xpResult, earnedResult] = await Promise.all([
        techNovaAchievementsClient
          .from('achievements')
          .select('id,slug,name,description,icon,xp_reward')
          .order('id', { ascending: true }),

        techNovaAchievementsClient
          .from('user_xp')
          .select('xp,level')
          .eq('user_id', user.id)
          .maybeSingle(),

        techNovaAchievementsClient
          .from('user_achievements')
          .select('achievement_id,earned_at')
          .eq('user_id', user.id)
      ]);

      if (achievementResult.error) throw achievementResult.error;
      if (xpResult.error) throw xpResult.error;
      if (earnedResult.error) throw earnedResult.error;

      const earnedMap = new Map(
        (earnedResult.data || []).map(item => [
          String(item.achievement_id),
          item.earned_at
        ])
      );

      const xp = Number(xpResult.data?.xp || 0);
      const level = Number(xpResult.data?.level || 1);

      rows = (achievementResult.data || []).map(item => ({
        ...item,
        earned: earnedMap.has(String(item.id)),
        earned_at: earnedMap.get(String(item.id)) || null,
        user_xp: xp,
        user_level: level
      }));
    }

    if (!rows.length) {
      showAchievementMessage(grid, 'No achievements are available yet.');
      return;
    }

    const xp = Number(rows[0]?.user_xp || 0);
    const level = Number(rows[0]?.user_level || 1);

    if (xpEl) xpEl.textContent = `${xp} XP`;
    if (levelEl) levelEl.textContent = `Level ${level}`;

    renderAchievementCards(grid, rows);
  } catch (error) {
    console.error('Achievement loading failed:', error);
    showAchievementMessage(
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
    const { data: { user }, error: authError } =
      await techNovaAchievementsClient.auth.getUser();

    if (authError) throw authError;

    if (!user) {
      showAchievementMessage(
        container,
        'Please sign in to view the TechNova leaderboard.'
      );
      return;
    }

    let scores = null;

    const leaderboardResult =
      await techNovaAchievementsClient.rpc('get_leaderboard', {
        limit_count: 25
      });

    if (!leaderboardResult.error) {
      scores = leaderboardResult.data || [];
    } else {
      console.warn(
        'Leaderboard RPC failed, using table fallback:',
        leaderboardResult.error
      );

      const xpResult = await techNovaAchievementsClient
        .from('user_xp')
        .select('user_id,xp,level')
        .order('xp', { ascending: false })
        .limit(25);

      if (xpResult.error) throw xpResult.error;

      const xpRows = xpResult.data || [];
      const ids = xpRows.map(row => row.user_id);

      let profileMap = new Map();

      if (ids.length) {
        const profileResult = await techNovaAchievementsClient
          .from('profiles')
          .select('id,display_name')
          .in('id', ids);

        if (!profileResult.error) {
          profileMap = new Map(
            (profileResult.data || []).map(profile => [
              profile.id,
              profile.display_name
            ])
          );
        }
      }

      scores = xpRows.map((row, index) => ({
        ...row,
        rank: index + 1,
        display_name:
          profileMap.get(row.user_id) ||
          `User ${String(row.user_id).slice(0, 8)}`
      }));
    }

    if (!scores.length) {
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
      points.textContent =
        `${Number(row.xp || 0)} XP · Level ${Number(row.level || 1)}`;

      item.append(rank, name, points);
      return item;
    }));
  } catch (error) {
    console.error('Leaderboard loading failed:', error);
    showAchievementMessage(
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
  await loadAchievementProgress();
  await loadLeaderboard();
});
