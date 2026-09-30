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

function technovaClient() {
  if (window.supabaseClient) return window.supabaseClient;
  if (!window.supabase || !window.TECHNOVA_SUPABASE_URL || !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('TechNova Supabase configuration is unavailable.');
  }
  window.supabaseClient = window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
  return window.supabaseClient;
}

async function technovaAwardXP(amount, achievementKey = null) {
  try {
    const { data, error } = await technovaClient().rpc('award_xp', {
      p_amount: Number(amount) || 0,
      p_achievement_key: achievementKey
    });
    if (error) throw error;
    return Number(data || 0);
  } catch (error) {
    console.warn('XP award failed:', error);
    return null;
  }
}

async function technovaLoadAchievements() {
  const grid = document.getElementById('achievementGrid');
  const xpEl = document.getElementById('xpTotal');
  const levelEl = document.getElementById('levelText');
  const leaderboard = document.getElementById('leaderboard');
  if (!grid && leaderboard) return technovaLoadLeaderboard(leaderboard);
  if (!grid) return;

  try {
    const client = technovaClient();
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) {
      grid.innerHTML = '<p class="muted">Sign in to track achievements.</p>';
      return;
    }

    const [{ data: xpRow, error: xpError }, { data: unlocked, error: unlockError }, { data: achievements, error: achievementError }] = await Promise.all([
      client.from('user_xp').select('xp,level').eq('user_id', user.id).maybeSingle(),
      client.from('user_achievements').select('achievement_id,earned_at').eq('user_id', user.id),
      client.from('achievements').select('id,slug,name,description,icon,xp_reward').order('id')
    ]);

    if (xpError || unlockError || achievementError) {
      throw xpError || unlockError || achievementError;
    }

    const xp = Number(xpRow?.xp || 0);
    const level = Number(xpRow?.level || Math.max(1, Math.floor(xp / 100) + 1));
    if (xpEl) xpEl.textContent = `${xp} XP`;
    if (levelEl) levelEl.textContent = `Level ${level}`;

    const unlockedIds = new Set((unlocked || []).map(row => String(row.achievement_id)));
    const list = achievements?.length ? achievements : TECHNOVA_ACHIEVEMENTS.map((item, index) => ({
      id: index + 1, slug: item.key, name: item.title, description: item.description, icon: item.icon, xp_reward: item.xp
    }));

    grid.replaceChildren(...list.map(item => {
      const card = document.createElement('article');
      const isUnlocked = unlockedIds.has(String(item.id));
      card.className = `g-card${isUnlocked ? '' : ' locked'}`;
      card.innerHTML = `<div class="g-icon">${item.icon || '🏆'}</div><h3>${item.name || 'Achievement'}</h3><p>${item.description || ''}</p><p style="margin-top:10px"><strong>${isUnlocked ? 'Unlocked' : 'Locked'}</strong> · ${Number(item.xp_reward || 0)} XP</p>`;
      return card;
    }));

    if (leaderboard) await technovaLoadLeaderboard(leaderboard);
  } catch (error) {
    console.error('Achievement loading failed:', error);
    grid.innerHTML = `<p class="muted">Could not load achievements: ${error.message || 'Unknown error'}</p>`;
  }
}

async function technovaLoadLeaderboard(container) {
  if (!container) return;
  try {
    const client = technovaClient();
    const { data: scores, error } = await client
      .from('user_xp')
      .select('user_id,xp,level')
      .order('xp', { ascending: false })
      .limit(25);
    if (error) throw error;
    if (!scores?.length) {
      container.innerHTML = '<p class="muted">No leaderboard scores yet.</p>';
      return;
    }

    const ids = scores.map(row => row.user_id).filter(Boolean);
    const { data: profiles } = await client.from('profiles').select('id,display_name').in('id', ids);
    const names = new Map((profiles || []).map(profile => [profile.id, profile.display_name]));

    container.replaceChildren(...scores.map((row, index) => {
      const el = document.createElement('div');
      el.className = 'l-row';
      const name = names.get(row.user_id) || `User ${String(row.user_id || '').slice(0, 8)}`;
      el.innerHTML = `<span class="rank">#${index + 1}</span><span>${name}</span><span class="points">${Number(row.xp || 0)} XP</span>`;
      return el;
    }));
  } catch (error) {
    console.error('Leaderboard loading failed:', error);
    container.innerHTML = `<p class="muted">Could not load the leaderboard: ${error.message || 'Unknown error'}</p>`;
  }
}

window.TechNovaAchievements = {
  awardXP: technovaAwardXP,
  load: technovaLoadAchievements,
  loadLeaderboard: technovaLoadLeaderboard
};

document.addEventListener('DOMContentLoaded', technovaLoadAchievements);
