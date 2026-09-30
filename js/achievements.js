'use strict';

const TECHNOVA_ACHIEVEMENTS = [
  { key:'first-login', icon:'👋', title:'Welcome to TechNova', description:'Create your TechNova profile.', xp:25 },
  { key:'first-event', icon:'🎟️', title:'Event Explorer', description:'Register for your first event.', xp:50 },
  { key:'saved-event', icon:'❤️', title:'Plan Ahead', description:'Save an event for later.', xp:25 },
  { key:'first-comment', icon:'💬', title:'Community Voice', description:'Leave your first approved comment.', xp:50 },
  { key:'first-article', icon:'📰', title:'Tech Reader', description:'Read your first technology article.', xp:25 },
  { key:'ai-chat', icon:'🤖', title:'AI Curious', description:'Ask TechNova AI your first question.', xp:50 },
  { key:'five-events', icon:'🏆', title:'Event Regular', description:'Register for five events.', xp:150 },
  { key:'ten-events', icon:'🚀', title:'TechNova Veteran', description:'Register for ten events.', xp:300 }
];

async function technovaLoadAchievements() {
  const grid = document.getElementById('achievementGrid');
  const xpEl = document.getElementById('xpTotal');
  const levelEl = document.getElementById('levelText');
  if (!grid) return;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      grid.innerHTML = '<p class="muted">Sign in to track achievements.</p>';
      return;
    }

    const [{ data: xpRows, error: xpError }, { data: unlocked, error: unlockError }] = await Promise.all([
      supabaseClient.from('user_xp').select('xp').eq('user_id', user.id).maybeSingle(),
      supabaseClient.from('user_achievements').select('achievement_key,unlocked_at').eq('user_id', user.id)
    ]);

    if (xpError || unlockError) {
      grid.innerHTML = '<p class="muted">Achievements need the TechNova gamification database migration before they can be saved.</p>';
      return;
    }

    const xp = Number(xpRows?.xp || 0);
    const unlockedSet = new Set((unlocked || []).map(row => row.achievement_key));
    const level = Math.max(1, Math.floor(xp / 100) + 1);
    if (xpEl) xpEl.textContent = `${xp} XP`;
    if (levelEl) levelEl.textContent = `Level ${level}`;

    grid.replaceChildren(...TECHNOVA_ACHIEVEMENTS.map(item => {
      const card = document.createElement('article');
      card.className = `g-card${unlockedSet.has(item.key) ? '' : ' locked'}`;
      card.innerHTML = `<div class="g-icon">${item.icon}</div><h3>${item.title}</h3><p>${item.description}</p><p style="margin-top:10px"><strong>${unlockedSet.has(item.key) ? 'Unlocked' : 'Locked'}</strong> · ${item.xp} XP</p>`;
      return card;
    }));

    const leaderboard = document.getElementById('leaderboard');
    if (leaderboard) await technovaLoadLeaderboard(leaderboard);
  } catch (error) {
    console.error('Achievement loading failed:', error);
    grid.innerHTML = '<p class="muted">Could not load achievements.</p>';
  }
}

async function technovaLoadLeaderboard(container) {
  const { data, error } = await supabaseClient
    .from('user_xp')
    .select('user_id,xp,profiles(display_name)')
    .order('xp', { ascending:false })
    .limit(25);

  if (error) {
    container.innerHTML = '<p class="muted">The leaderboard will appear after the gamification database migration is applied.</p>';
    return;
  }

  if (!data?.length) {
    container.innerHTML = '<p class="muted">No leaderboard scores yet.</p>';
    return;
  }

  container.replaceChildren(...data.map((row, index) => {
    const el = document.createElement('div');
    el.className = 'l-row';
    const name = row.profiles?.display_name || `User ${String(row.user_id).slice(0,8)}`;
    el.innerHTML = `<span class="rank">#${index + 1}</span><span>${name}</span><span class="points">${Number(row.xp || 0)} XP</span>`;
    return el;
  }));
}

document.addEventListener('DOMContentLoaded', technovaLoadAchievements);
