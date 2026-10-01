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

function technovaClient(){
  if(window.supabaseClient) return window.supabaseClient;
  if(!window.supabase || !window.TECHNOVA_SUPABASE_URL || !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY){
    throw new Error('TechNova Supabase configuration is unavailable.');
  }
  window.supabaseClient=window.supabase.createClient(window.TECHNOVA_SUPABASE_URL,window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
  return window.supabaseClient;
}

async function technovaAwardXP(amount,achievementKey=null){
  try{
    const client=technovaClient();
    const {data,error}=await client.rpc('award_xp',{
      p_amount:Number(amount)||0,
      p_achievement_slug:achievementKey
    });
    if(error) throw error;
    return Number(data||0);
  }catch(error){
    console.warn('XP award failed:',error);
    return null;
  }
}

function fallbackAchievements(){
  return TECHNOVA_ACHIEVEMENTS.map((item,index)=>({
    id:index+1,
    slug:item.key,
    name:item.title,
    description:item.description,
    icon:item.icon,
    xp_reward:item.xp
  }));
}

function renderAchievementCards(grid,list,unlockedIds){
  grid.replaceChildren(...list.map(item=>{
    const card=document.createElement('article');
    const unlocked=unlockedIds.has(String(item.id));
    card.className=`g-card${unlocked?'':' locked'}`;

    const icon=document.createElement('div');
    icon.className='g-icon';
    icon.textContent=item.icon||'🏆';

    const title=document.createElement('h3');
    title.textContent=item.name||'Achievement';

    const description=document.createElement('p');
    description.textContent=item.description||'';

    const status=document.createElement('p');
    status.style.marginTop='10px';
    const strong=document.createElement('strong');
    strong.textContent=unlocked?'Unlocked':'Locked';
    status.append(strong,document.createTextNode(` · ${Number(item.xp_reward||0)} XP`));

    card.append(icon,title,description,status);
    return card;
  }));
}

async function technovaLoadAchievements(){
  const grid=document.getElementById('achievementGrid');
  const xpEl=document.getElementById('xpTotal');
  const levelEl=document.getElementById('levelText');
  const leaderboard=document.getElementById('leaderboard');

  if(!grid){
    if(leaderboard) await technovaLoadLeaderboard(leaderboard);
    return;
  }

  try{
    const client=technovaClient();
    const {data:{user},error:authError}=await client.auth.getUser();

    if(authError||!user){
      grid.innerHTML='<p class="muted">Sign in to track your achievements.</p>';
      if(leaderboard) await technovaLoadLeaderboard(leaderboard);
      return;
    }

    const [xpResult,unlockedResult,achievementResult]=await Promise.all([
      client.from('user_xp').select('xp,level').eq('user_id',user.id).maybeSingle(),
      client.from('user_achievements').select('achievement_id,earned_at').eq('user_id',user.id),
      client.from('achievements').select('id,slug,name,description,icon,xp_reward').order('id')
    ]);

    if(xpResult.error) throw xpResult.error;
    if(unlockedResult.error) throw unlockedResult.error;

    const xp=Number(xpResult.data?.xp||0);
    const level=Number(xpResult.data?.level||Math.max(1,Math.floor(xp/100)+1));
    if(xpEl) xpEl.textContent=`${xp} XP`;
    if(levelEl) levelEl.textContent=`Level ${level}`;

    const unlockedIds=new Set((unlockedResult.data||[]).map(row=>String(row.achievement_id)));
    const list=achievementResult.error||!achievementResult.data?.length
      ? fallbackAchievements()
      : achievementResult.data;

    renderAchievementCards(grid,list,unlockedIds);

    if(leaderboard) await technovaLoadLeaderboard(leaderboard);
  }catch(error){
    console.error('Achievement loading failed:',error);
    grid.innerHTML=`<p class="muted">Could not load achievements: ${error.message||'Unknown error'}</p>`;
    if(leaderboard) await technovaLoadLeaderboard(leaderboard);
  }
}

async function technovaLoadLeaderboard(container){
  if(!container) return;

  container.innerHTML='<p class="loading">Loading leaderboard…</p>';

  try{
    const client=technovaClient();

    // Use the database function so leaderboard names and disabled-user filtering
    // do not depend on the public profiles RLS policy.
    const {data:scores,error}=await client.rpc('get_leaderboard',{limit_count:25});

    if(error) throw error;

    if(!scores?.length){
      container.innerHTML='<p class="muted">No leaderboard scores yet.</p>';
      return;
    }

    container.replaceChildren(...scores.map((row,index)=>{
      const el=document.createElement('div');
      el.className='l-row';

      const rank=document.createElement('span');
      rank.className='rank';
      const numericRank=Number(row.rank||index+1);
      rank.textContent=numericRank===1?'🥇':numericRank===2?'🥈':numericRank===3?'🥉':`#${numericRank}`;

      const name=document.createElement('span');
      name.textContent=row.display_name||'Unnamed user';

      const points=document.createElement('span');
      points.className='points';
      points.textContent=`${Number(row.xp||0)} XP · Level ${Number(row.level||1)}`;

      el.append(rank,name,points);
      return el;
    }));
  }catch(error){
    console.error('Leaderboard loading failed:',error);
    container.innerHTML=`<p class="muted">Could not load the leaderboard: ${error.message||'Unknown error'}</p>`;
  }
}

window.TechNovaAchievements={
  awardXP:technovaAwardXP,
  load:technovaLoadAchievements,
  loadLeaderboard:technovaLoadLeaderboard
};

document.addEventListener('DOMContentLoaded',technovaLoadAchievements);
