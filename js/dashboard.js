/* TechNova personal dashboard — read-only overview of the signed-in user's data. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const client = () => window.supabaseClient;
const escapeText = value => String(value ?? '');
function setCount(id,value){const el=$(id);if(el)el.textContent=Number.isFinite(value)?value.toLocaleString():'—';}
function showStatus(message,isError=false){const el=$('dashboardStatus');if(!el)return;el.textContent=message;el.classList.toggle('error',isError);}
function eventMeta(event){return [event?.event_date,event?.event_time,event?.location].filter(Boolean).join(' · ')||'Saved to your TechNova account';}
function makeEventItem(event,kind){
 const item=document.createElement('div');item.className='dashboard-event';
 const icon=document.createElement('span');icon.className='dashboard-event-icon';icon.setAttribute('aria-hidden','true');icon.textContent=kind==='saved'?'☆':'🎟️';
 const copy=document.createElement('div');copy.className='dashboard-event-copy';
 const title=document.createElement('strong');title.textContent=escapeText(event?.title||'TechNova event');
 const meta=document.createElement('small');meta.textContent=eventMeta(event);
 copy.append(title,meta);item.append(icon,copy);
 if(event?.id){const link=document.createElement('a');link.href='event.html?id='+encodeURIComponent(event.id);link.textContent='View';item.append(link);}
 return item;
}
async function loadSavedEvents(user){
 const container=$('dashboardSavedEvents');if(!container)return;
 try{
  const rows=await window.TechNovaSavedEvents.list();
  setCount('dashboardSavedCount',rows.length);
  container.replaceChildren();
  if(!rows.length){const empty=document.createElement('p');empty.className='dashboard-empty';empty.textContent='No saved events yet. Browse events and save the ones you want to revisit.';container.append(empty);return;}
  rows.slice(0,4).forEach(row=>container.append(makeEventItem(row.events,'saved')));
 }catch(error){setCount('dashboardSavedCount',NaN);container.textContent='Your saved events could not be loaded right now.';console.warn('Dashboard saved events unavailable:',error?.message);}
}
async function loadStats(user){
 const requests=[
  client().from('event_registrations').select('event_id',{count:'exact',head:true}).eq('user_id',user.id),
  client().from('saved_events').select('event_id',{count:'exact',head:true}).eq('user_id',user.id)
 ];
 const [registrations,saved]=await Promise.allSettled(requests);
 if(registrations.status==='fulfilled'&&!registrations.value.error)setCount('dashboardRegistrationCount',registrations.value.count??0);
 else setCount('dashboardRegistrationCount',NaN);
 if(saved.status==='fulfilled'&&!saved.value.error)setCount('dashboardSavedCount',saved.value.count??0);
 else setCount('dashboardSavedCount',NaN);
 if(registrations.status==='rejected'||registrations.value?.error||saved.status==='rejected'||saved.value?.error)showStatus('Some overview totals are unavailable. Your account and event list may still be accessible.',true);
 else showStatus('Your dashboard is up to date.');
}
async function loadAdminShortcut(user){
 const link=$('adminLink');if(!link)return;
 try{const {data,error}=await client().from('user_roles').select('role').eq('user_id',user.id).maybeSingle();if(!error&&data?.role==='admin')link.classList.remove('dashboard-hidden');}
 catch(error){console.warn('Admin shortcut role check unavailable:',error?.message);}
}
function syncProfile(){
 const name=$('accountName')?.textContent?.trim()||'TechNova member';
 const profile=$('dashboardProfileName');if(profile)profile.textContent=name;
 const avatar=$('dashboardAvatar');if(avatar){const initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase();avatar.textContent=initials||'T';}
 const status=$('accountStatus')?.textContent?.trim()||'Member';
 const membership=$('dashboardMembership');if(membership)membership.textContent=status;
}
document.addEventListener('DOMContentLoaded',async()=>{
 const name=$('accountName');
 if(name){new MutationObserver(syncProfile).observe(name,{childList:true,subtree:true,characterData:true});}
 syncProfile();
 try{
  const {data:{user},error}=await client().auth.getUser();
  if(error)throw error;
  if(!user){location.href='login.html';return;}
  await Promise.all([loadStats(user),loadSavedEvents(user),loadAdminShortcut(user)]);
  syncProfile();
 }catch(error){showStatus(error?.message||'Your dashboard could not load. Please refresh and try again.',true);console.error('TechNova dashboard initialisation failed:',error);}
});
})();