/* TechNova personal dashboard — private, user-scoped workspace. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const client = () => window.supabaseClient;
const setCount = (id,value) => { const el=$(id); if(el) el.textContent=Number.isFinite(value)?value.toLocaleString():'—'; };
const showStatus = (message,isError=false) => { const el=$('dashboardStatus'); if(!el)return; el.textContent=message; el.classList.toggle('error',isError); };
const eventDate = event => {
 if(!event?.event_date)return null;
 const date=new Date(event.event_date+(event.event_time?'T'+event.event_time:'T23:59:00'));
 return Number.isNaN(date.getTime())?null:date;
};
const formatEventDate = event => {
 const date=eventDate(event);
 return date?new Intl.DateTimeFormat(undefined,{weekday:'short',day:'numeric',month:'short'}).format(date):'Date to be announced';
};
const eventMeta = event => [event?.event_time,event?.location].filter(Boolean).join(' · ')||'TechNova event';
function emptyMessage(container,message){
 const empty=document.createElement('p');empty.className='dashboard-empty';empty.textContent=message;container.replaceChildren(empty);
}
function makeEventItem(event,kind){
 const item=document.createElement('div');item.className='dashboard-event';
 const icon=document.createElement('span');icon.className='dashboard-event-icon';icon.setAttribute('aria-hidden','true');icon.textContent=kind==='saved'?'☆':'🎟️';
 const copy=document.createElement('div');copy.className='dashboard-event-copy';
 const title=document.createElement('strong');title.textContent=String(event?.title||'TechNova event');
 const meta=document.createElement('small');meta.textContent=eventMeta(event);
 const date=document.createElement('span');date.className='dashboard-event-date';date.textContent=formatEventDate(event);
 copy.append(title,meta,date);item.append(icon,copy);
 if(event?.id){const link=document.createElement('a');link.href='event.html?id='+encodeURIComponent(event.id);link.textContent='View';item.append(link);}
 return item;
}
async function loadRegistrations(user){
 const container=$('myEvents'),activity=$('dashboardActivity');
 const {data,error}=await client().from('event_registrations')
  .select('event_id,created_at,events(id,title,event_date,event_time,location)')
  .eq('user_id',user.id).order('created_at',{ascending:false});
 if(error)throw error;
 const rows=(data||[]).map(row=>({row,event:Array.isArray(row.events)?row.events[0]:row.events})).filter(item=>item.event);
 const now=new Date();
 const upcoming=rows.filter(item=>{const date=eventDate(item.event);return date&&date>=now;})
  .sort((a,b)=>eventDate(a.event)-eventDate(b.event));
 setCount('dashboardUpcomingCount',upcoming.length);
 if(container){
  container.replaceChildren();
  const display=upcoming.length?upcoming:rows;
  if(!display.length)emptyMessage(container,'You have not registered for an event yet. Explore TechNova events and find something interesting.');
  else display.slice(0,5).forEach(item=>container.append(makeEventItem(item.event,'registered')));
 }
 if(activity){
  activity.replaceChildren();
  if(!rows.length)emptyMessage(activity,'Your recent activity will appear here when you register for an event.');
  else rows.slice(0,5).forEach(({row,event})=>{
   const item=document.createElement('div');item.className='dashboard-activity-item';
   const dot=document.createElement('span');dot.className='dashboard-activity-dot';dot.setAttribute('aria-hidden','true');
   const copy=document.createElement('div');
   const title=document.createElement('strong');title.textContent='Registered for '+String(event.title||'a TechNova event');
   const meta=document.createElement('small');const created=row.created_at?new Date(row.created_at):null;
   meta.textContent=created&&!Number.isNaN(created.getTime())?'Joined '+created.toLocaleDateString():'Registration saved';
   copy.append(title,meta);item.append(dot,copy);activity.append(item);
  });
 }
 return true;
}
async function loadSavedEvents(){
 const container=$('dashboardSavedEvents');if(!container)return true;
 try{
  const rows=await window.TechNovaSavedEvents.list();container.replaceChildren();
  const valid=rows.filter(row=>row.events).slice(0,4);
  if(!valid.length)emptyMessage(container,'No saved events yet. Browse events and save the ones you want to revisit.');
  else valid.forEach(row=>container.append(makeEventItem(row.events,'saved')));
  return true;
 }catch(error){
  emptyMessage(container,'Your saved events could not be loaded right now.');
  console.warn('Dashboard saved events unavailable:',error?.message);return false;
 }
}
async function loadStats(user){
 const requests=[
  client().from('event_registrations').select('event_id',{count:'exact',head:true}).eq('user_id',user.id),
  client().from('saved_events').select('event_id',{count:'exact',head:true}).eq('user_id',user.id)
 ];
 const [registrations,saved]=await Promise.allSettled(requests);
 if(registrations.status==='fulfilled'&&!registrations.value.error)setCount('dashboardRegistrationCount',registrations.value.count??0);else setCount('dashboardRegistrationCount',NaN);
 if(saved.status==='fulfilled'&&!saved.value.error)setCount('dashboardSavedCount',saved.value.count??0);else setCount('dashboardSavedCount',NaN);
 return !(registrations.status==='rejected'||registrations.value?.error||saved.status==='rejected'||saved.value?.error);
}
async function loadAdminShortcut(user){
 const link=$('adminLink');if(!link)return;
 try{
  const {data,error}=await client().from('user_roles').select('role').eq('user_id',user.id).maybeSingle();
  if(!error&&data?.role==='admin')link.classList.remove('dashboard-hidden');
 }catch(error){console.warn('Admin shortcut role check unavailable:',error?.message);}
}
function syncProfile(user){
 const name=user?.user_metadata?.full_name||user?.user_metadata?.name||user?.email?.split('@')[0]||'TechNova member';
 const nameEl=$('accountName');if(nameEl)nameEl.textContent=name;
 const email=$('accountEmail');if(email&&user?.email)email.textContent=user.email;
 const bio=$('accountBio');if(bio)bio.textContent=user?.user_metadata?.bio||'Add a short introduction in your account settings.';
 const profile=$('dashboardProfileName');if(profile)profile.textContent=name;
 const avatar=$('dashboardAvatar');if(avatar)avatar.textContent=name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase()||'T';
 const status=$('accountStatus');if(status)status.textContent='Signed in · TechNova member';
 const membership=$('dashboardMembership');if(membership)membership.textContent='Active account';
 const date=$('dashboardDate');if(date)date.textContent='✦ '+new Intl.DateTimeFormat(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
}
document.addEventListener('DOMContentLoaded',async()=>{
 try{
  const {data:{user},error}=await client().auth.getUser();if(error)throw error;
  if(!user){location.href='login.html';return;}
  syncProfile(user);
  const hour=new Date().getHours(),greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  const title=$('dashboardTitle');if(title)title.firstChild.textContent=greeting+', ';
  const results=await Promise.allSettled([loadStats(user),loadRegistrations(user),loadSavedEvents(),loadAdminShortcut(user)]);
  const failed=results.some((result,index)=>result.status==='rejected'||(index===0&&result.value===false)||(index===2&&result.value===false));
  if(failed)showStatus('Your dashboard loaded, but some information is unavailable. Refresh to try again.',true);
  else showStatus('Everything is up to date. Welcome to your TechNova workspace.');
 }catch(error){
  showStatus(error?.message||'Your dashboard could not load. Please refresh and try again.',true);
  console.error('TechNova dashboard initialisation failed:',error);
 }
});
})();