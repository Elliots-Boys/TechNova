/* TechNova personal command-centre dashboard.
 * User-owned shortcuts, recent pages and scratchpad stay in this browser.
 * Supabase access is read-only and scoped to the authenticated user.
 */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const client = () => window.supabaseClient;
const STORAGE = {
 pins:'technova.dashboard.pins.v1',
 recent:'technova.dashboard.recent.v1',
 note:'technova.dashboard.note.v1',
 widgets:'technova.dashboard.widgets.v1'
};
const safeRead = (key,fallback) => { try { const value=localStorage.getItem(key); return value===null?fallback:JSON.parse(value); } catch { return fallback; } };
const safeWrite = (key,value) => { try { localStorage.setItem(key,JSON.stringify(value)); return true; } catch { return false; } };
const setCount = (id,value) => { const el=$(id); if(el) el.textContent=Number.isFinite(value)?value.toLocaleString():'—'; };
const showStatus = (message,isError=false) => { const el=$('dashboardStatus'); if(el){el.textContent=message;el.classList.toggle('error',isError);} };
const escapeText = value => String(value??'');
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
function emptyMessage(container,message){const empty=document.createElement('p');empty.className='dashboard-empty';empty.textContent=message;container.replaceChildren(empty);}
function makeEventItem(event,kind){
 const item=document.createElement('div');item.className='dashboard-event';
 const icon=document.createElement('span');icon.className='dashboard-event-icon';icon.setAttribute('aria-hidden','true');icon.textContent=kind==='saved'?'☆':'🎟️';
 const copy=document.createElement('div');copy.className='dashboard-event-copy';
 const title=document.createElement('strong');title.textContent=escapeText(event?.title||'TechNova event');
 const meta=document.createElement('small');meta.textContent=eventMeta(event);
 const date=document.createElement('span');date.className='dashboard-event-date';date.textContent=formatEventDate(event);
 copy.append(title,meta,date);item.append(icon,copy);
 if(event?.id){const link=document.createElement('a');link.href='event.html?id='+encodeURIComponent(event.id);link.textContent='View';item.append(link);}
 return item;
}
function appLinks(){return Array.from(document.querySelectorAll('[data-app-link]'));}
function getPins(){const value=safeRead(STORAGE.pins,[]);return Array.isArray(value)?value:[];}
function getRecent(){const value=safeRead(STORAGE.recent,[]);return Array.isArray(value)?value:[];}
function linkLabel(link){return link.dataset.title||link.querySelector('strong')?.textContent||'TechNova page';}
function renderLinkList(container,items,emptyText,removable=false){
 if(!container)return;container.replaceChildren();
 if(!items.length){emptyMessage(container,emptyText);return;}
 items.forEach(item=>{
  const row=document.createElement('div');row.className='dashboard-pinned-item';
  const link=document.createElement('a');link.href=item.href;link.textContent=item.title;
  row.append(link);
  if(removable){const button=document.createElement('button');button.type='button';button.textContent='×';button.setAttribute('aria-label','Unpin '+item.title);button.addEventListener('click',()=>togglePin(item.href));row.append(button);}
  container.append(row);
 });
}
function renderPins(){
 const pins=getPins();
 const items=pins.map(href=>{const link=appLinks().find(item=>item.dataset.href===href);return link?{href,title:linkLabel(link)}:null;}).filter(Boolean);
 renderLinkList($('pinnedApps'),items,'Pin the pages you use most with the ☆ buttons below.',true);
 renderLinkList($('pinnedAppsAside'),items,'Pin a page from Explore TechNova.',true);
 appLinks().forEach(link=>{const button=link.querySelector('.dashboard-pin');if(!button)return;const active=pins.includes(link.dataset.href);button.setAttribute('aria-pressed',String(active));button.textContent=active?'★':'☆';button.setAttribute('aria-label',(active?'Unpin ':'Pin ')+linkLabel(link));});
 const section=$('pinnedAppsSection');if(section)section.hidden=false;
}
function togglePin(href){const pins=getPins();const next=pins.includes(href)?pins.filter(item=>item!==href):[...pins,href];safeWrite(STORAGE.pins,next);renderPins();}
function recordRecent(link){
 const href=link.dataset.href;const item={href,title:linkLabel(link),time:Date.now()};
 const next=[item,...getRecent().filter(entry=>entry.href!==href)].slice(0,6);
 safeWrite(STORAGE.recent,next);renderRecent();
}
function renderRecent(){
 const valid=getRecent().filter(item=>typeof item.href==='string'&&typeof item.title==='string');
 renderLinkList($('recentApps'),valid.slice(0,5),'Pages you open from the dashboard will appear here.');
}
function setupDirectory(){
 const search=$('appSearch'),filters=Array.from(document.querySelectorAll('[data-filter]')),groups=Array.from(document.querySelectorAll('[data-app-group]')),links=appLinks(),noResults=$('noAppResults'),count=$('appSearchCount');
 let active='all';
 const apply=()=>{
  const query=(search?.value||'').trim().toLowerCase();let visible=0;
  links.forEach(link=>{
   const category=link.dataset.category||'';
   const haystack=[link.dataset.title,link.dataset.keywords,link.textContent].join(' ').toLowerCase();
   const match=(active==='all'||category===active)&&(!query||haystack.includes(query));
   link.hidden=!match;if(match)visible++;
  });
  groups.forEach(group=>{group.hidden=!Array.from(group.querySelectorAll('[data-app-link]')).some(link=>!link.hidden);});
  if(noResults)noResults.classList.toggle('show',visible===0);
  if(count)count.textContent=query||active!=='all'?visible+' found':'All';
 };
 search?.addEventListener('input',apply);
 filters.forEach(button=>button.addEventListener('click',()=>{
  active=button.dataset.filter||'all';filters.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));apply();
 }));
 links.forEach(link=>{
  link.addEventListener('click',event=>{
   if(event.target.closest('.dashboard-pin'))return;
   recordRecent(link);
  });
  link.querySelector('.dashboard-pin')?.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();togglePin(link.dataset.href);});
 });
 apply();renderPins();renderRecent();
}
function setupCommandPalette(){
 const dialog=$('dashboardCommandDialog'),trigger=$('openCommandPalette'),input=$('dashboardCommandSearch'),results=$('dashboardCommandResults'),close=$('closeCommandPalette');
 if(!dialog||!trigger||!input||!results||!close||typeof dialog.showModal!=='function')return;
 const entries=appLinks().map(link=>({
  link,
  title:linkLabel(link),
  category:link.dataset.category||'TechNova',
  keywords:link.dataset.keywords||'',
  href:link.querySelector('a')?.href||link.href
 }));
 let activeIndex=0,visible=[];
 const render=()=>{
  const query=input.value.trim().toLowerCase();
  visible=entries.filter(item=>[item.title,item.category,item.keywords].join(' ').toLowerCase().includes(query)).slice(0,12);
  results.replaceChildren();
  input.removeAttribute('aria-activedescendant');
  if(!visible.length){const empty=document.createElement('div');empty.className='dashboard-command-empty';empty.textContent='No matching TechNova pages. Try another search.';results.append(empty);activeIndex=0;return;}
  activeIndex=Math.min(activeIndex,visible.length-1);
  visible.forEach((item,index)=>{
   const button=document.createElement('button');button.type='button';button.id='dashboardCommandOption-'+index;button.className='dashboard-command-result';button.setAttribute('role','option');button.setAttribute('aria-selected',String(index===activeIndex));
   const copy=document.createElement('span');const title=document.createElement('strong');title.textContent=item.title;const meta=document.createElement('small');meta.textContent=item.category+' · '+item.keywords.split(' ').slice(0,4).join(' ');copy.append(title,meta);
   const key=document.createElement('kbd');key.textContent=index===0?'↵':'Open';button.append(copy,key);
   button.addEventListener('mouseenter',()=>{activeIndex=index;syncActive();});
   button.addEventListener('click',()=>openEntry(item));
   results.append(button);
  });
 };
 const syncActive=()=>{
  input.setAttribute('aria-activedescendant','dashboardCommandOption-'+activeIndex);
  Array.from(results.querySelectorAll('[role="option"]')).forEach((item,index)=>item.setAttribute('aria-selected',String(index===activeIndex)));
  results.querySelector('[aria-selected="true"]')?.scrollIntoView({block:'nearest'});
 };
 const openEntry=item=>{
  if(!item)return;
  recordRecent(item.link);
  window.location.assign(item.href);
 };
 const open=()=>{
  if(dialog.open)return;
  input.value='';activeIndex=0;render();dialog.showModal();input.focus();
 };
 trigger.addEventListener('click',open);
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>trigger.focus());
 input.addEventListener('input',()=>{activeIndex=0;render();});
 input.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   if(!visible.length)return;
   event.preventDefault();activeIndex=(activeIndex+(event.key==='ArrowDown'?1:-1)+visible.length)%visible.length;syncActive();
  }else if(event.key==='Enter'){
   event.preventDefault();openEntry(visible[activeIndex]);
  }
 });
 document.addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
   event.preventDefault();open();
  }
 });
}
function setupWidgets(){
 const button=$('customiseDashboard'),controls=$('widgetControls'),stored=safeRead(STORAGE.widgets,[]);
 const hidden=Array.isArray(stored)?stored:[];
 document.querySelectorAll('[data-widget-section]').forEach(section=>{
  const key=section.dataset.widgetSection;
  if(hidden.includes(key))section.hidden=true;
 });
 document.querySelectorAll('[data-widget-toggle]').forEach(input=>{
  const key=input.dataset.widgetToggle;input.checked=!hidden.includes(key);
  input.addEventListener('change',()=>{
   const section=document.querySelector('[data-widget-section="'+key+'"]');
   if(section)section.hidden=!input.checked;
   const next=Array.from(document.querySelectorAll('[data-widget-toggle]')).filter(item=>!item.checked).map(item=>item.dataset.widgetToggle);
   safeWrite(STORAGE.widgets,next);
  });
 });
 button?.addEventListener('click',()=>{
  const open=controls.classList.toggle('open');button.setAttribute('aria-expanded',String(open));
 });
}
const TASK_STORAGE='technova.dashboard.tasks.v1';
function setupFocusBoard(){
 const form=$('focusTaskForm'),input=$('focusTaskInput'),dateInput=$('focusTaskDate'),list=$('focusTaskList'),progress=$('focusProgressBar'),fill=$('focusProgressFill'),progressText=$('focusProgressText'),progressLabel=$('focusProgressLabel'),status=$('focusTaskStatus'),clear=$('clearCompletedTasks');
 if(!form||!input||!list)return;
 const readTasks=()=>{const tasks=safeRead(TASK_STORAGE,[]);return Array.isArray(tasks)?tasks.filter(task=>task&&typeof task.id==='string'&&typeof task.title==='string'&&typeof task.done==='boolean'):[];};
 let tasks=readTasks();
 const save=()=>{const saved=safeWrite(TASK_STORAGE,tasks);if(status)status.textContent=saved?'Saved only on this device':'Your browser could not save this list';return saved;};
 const localDate=()=>{const now=new Date();return now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');};
 const render=()=>{
  list.replaceChildren();
  const completed=tasks.filter(task=>task.done).length,remaining=tasks.length-completed,percent=tasks.length?Math.round(completed/tasks.length*100):0;
  if(progress)progress.setAttribute('aria-valuenow',String(percent));
  if(fill)fill.style.width=percent+'%';
  if(progressText)progressText.textContent=percent+'%';
  if(progressLabel)progressLabel.textContent=tasks.length?completed+' of '+tasks.length+' completed · '+remaining+' remaining': 'Add a task to set your priorities for today.';
  if(clear)clear.disabled=completed===0;
  if(!tasks.length){emptyMessage(list,'Your focus board is clear. Add a task above when you are ready.');return;}
  const today=localDate();
  const sorted=[...tasks].sort((a,b)=>Number(a.done)-Number(b.done)||(a.dueDate||'9999-12-31').localeCompare(b.dueDate||'9999-12-31')||a.createdAt-b.createdAt);
  sorted.forEach(task=>{
   const row=document.createElement('div');row.className='dashboard-focus-task'+(task.done?' is-complete':'')+(!task.done&&task.dueDate&&task.dueDate<today?' is-overdue':'');
   const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=task.done;checkbox.setAttribute('aria-label',(task.done?'Reopen ':'Complete ')+task.title);
   checkbox.addEventListener('change',()=>{tasks=tasks.map(item=>item.id===task.id?{...item,done:checkbox.checked}:item);save();render();});
   const copy=document.createElement('div');copy.className='dashboard-focus-task-copy';
   const title=document.createElement('strong');title.textContent=task.title;copy.append(title);
   if(task.dueDate){const meta=document.createElement('small');const due=new Date(task.dueDate+'T00:00:00');const formatted=new Intl.DateTimeFormat(undefined,{weekday:'short',day:'numeric',month:'short'}).format(due);meta.textContent=task.done?'Completed · Due '+formatted:task.dueDate<today?'Overdue · '+formatted:task.dueDate===today?'Due today': 'Due '+formatted;copy.append(meta);}
   const remove=document.createElement('button');remove.type='button';remove.className='dashboard-focus-remove';remove.textContent='×';remove.setAttribute('aria-label','Delete task: '+task.title);remove.addEventListener('click',()=>{tasks=tasks.filter(item=>item.id!==task.id);save();render();});
   row.append(checkbox,copy,remove);list.append(row);
  });
 };
 form.addEventListener('submit',event=>{
  event.preventDefault();const title=input.value.trim();if(!title){input.focus();return;}
  if(tasks.length>=50){if(status)status.textContent='You can keep up to 50 tasks here. Complete or remove one to add another.';return;}
  tasks.push({id:typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2),title,dueDate:dateInput.value||'',done:false,createdAt:Date.now()});
  save();input.value='';dateInput.value='';render();input.focus();
 });
 clear?.addEventListener('click',()=>{const completed=tasks.filter(task=>task.done).length;if(!completed)return;tasks=tasks.filter(task=>!task.done);save();render();});
 render();
}
function setupNote(){
 const note=$('dashboardNote'),status=$('noteSaveStatus'),count=$('noteCount');if(!note)return;
 try{note.value=localStorage.getItem(STORAGE.note)||'';}catch{note.value='';}
 const updateCount=()=>{if(count)count.textContent=note.value.length.toLocaleString()+' / 5000';};
 updateCount();
 note.addEventListener('input',()=>{
  try{localStorage.setItem(STORAGE.note,note.value);if(status)status.textContent='Saved on this device';}
  catch{if(status)status.textContent='Could not save in this browser';}
  updateCount();
 });
}
async function loadRegistrations(user){
 const container=$('myEvents'),activity=$('dashboardActivity');
 const {data,error}=await client().from('event_registrations').select('event_id,created_at,events(id,title,event_date,event_time,location)').eq('user_id',user.id).order('created_at',{ascending:false});
 if(error)throw error;
 const rows=(data||[]).map(row=>({row,event:Array.isArray(row.events)?row.events[0]:row.events})).filter(item=>item.event);
 const now=new Date();const upcoming=rows.filter(item=>{const date=eventDate(item.event);return date&&date>=now;}).sort((a,b)=>eventDate(a.event)-eventDate(b.event));
 setCount('dashboardUpcomingCount',upcoming.length);
 if(container){container.replaceChildren();const display=upcoming.length?upcoming:rows;if(!display.length)emptyMessage(container,'No registrations yet. Explore events and find something you would like to attend.');else display.slice(0,5).forEach(item=>container.append(makeEventItem(item.event,'registered')));}
 if(activity){activity.replaceChildren();if(!rows.length)emptyMessage(activity,'Your event activity will appear here when you register for something.');else rows.slice(0,5).forEach(({row,event})=>{const item=document.createElement('div');item.className='dashboard-activity-item';const dot=document.createElement('span');dot.className='dashboard-activity-dot';dot.setAttribute('aria-hidden','true');const copy=document.createElement('div');const title=document.createElement('strong');title.textContent='Registered for '+escapeText(event.title||'a TechNova event');const meta=document.createElement('small');const created=row.created_at?new Date(row.created_at):null;meta.textContent=created&&!Number.isNaN(created.getTime())?'Registered '+created.toLocaleDateString():'Registration saved';copy.append(title,meta);item.append(dot,copy);activity.append(item);});}
 return true;
}
async function loadSavedEvents(){
 const container=$('savedEventsUnused');if(!container)return true;
 try{const rows=await window.TechNovaSavedEvents.list();const valid=rows.filter(row=>row.events).slice(0,4);container.replaceChildren();if(!valid.length)emptyMessage(container,'No saved events yet.');else valid.forEach(row=>container.append(makeEventItem(row.events,'saved')));return true;}
 catch(error){console.warn('Dashboard saved events unavailable:',error?.message);return false;}
}
async function loadSavedEvents(){
 const container=$('dashboardSavedEvents');if(!container)return true;
 try{
  const rows=await window.TechNovaSavedEvents.list();
  const valid=(rows||[]).filter(row=>row.events).slice(0,4);
  container.replaceChildren();
  if(!valid.length)emptyMessage(container,'No saved events yet. Browse events and bookmark the ones you want to revisit.');
  else valid.forEach(row=>container.append(makeEventItem(row.events,'saved')));
  return true;
 }catch(error){
  emptyMessage(container,'Saved events could not be loaded right now.');
  console.warn('Dashboard saved events unavailable:',error?.message);
  return false;
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
 try{const {data,error}=await client().from('user_roles').select('role').eq('user_id',user.id).maybeSingle();if(!error&&data?.role==='admin')link.classList.remove('dashboard-hidden');}
 catch(error){console.warn('Admin shortcut role check unavailable:',error?.message);}
}
function syncProfile(user){
 const name=user?.user_metadata?.full_name||user?.user_metadata?.name||user?.email?.split('@')[0]||'TechNova member';
 const firstName=String(name).trim().split(/\s+/)[0]||'there';
 const nameEl=$('accountName');if(nameEl)nameEl.textContent=firstName;
 const email=$('accountEmail');if(email&&user?.email)email.textContent=user.email;
 const bio=$('accountBio');if(bio)bio.textContent=user?.user_metadata?.bio||'';
 const profile=$('dashboardProfileName');if(profile)profile.textContent=name;
 const avatar=$('dashboardAvatar');if(avatar)avatar.textContent=String(name).split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase()||'T';
 const status=$('accountStatus');if(status)status.textContent='Signed in · TechNova member';
 const membership=$('dashboardMembership');if(membership)membership.textContent='Active account';
 const accountState=$('dashboardAccountState');if(accountState)accountState.textContent='Verified session';
 const date=$('dashboardDate');if(date)date.textContent='✦ '+new Intl.DateTimeFormat(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
 const hour=new Date().getHours(),greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
 const title=$('dashboardTitle');if(title)title.firstChild.textContent=greeting+', ';
}
document.addEventListener('DOMContentLoaded',async()=>{
 setupDirectory();setupCommandPalette();setupWidgets();setupFocusBoard();setupNote();
 try{
  const {data:{user},error}=await client().auth.getUser();if(error)throw error;
  if(!user){location.href='login.html';return;}
  syncProfile(user);
  const results=await Promise.allSettled([loadStats(user),loadRegistrations(user),loadSavedEvents(),loadAdminShortcut(user)]);
  const failed=results.some((result,index)=>result.status==='rejected'||((index===0||index===2)&&result.value===false));
  if(failed)showStatus('Your workspace is ready, but some account information could not be loaded. You can refresh to try again.',true);
  else showStatus('Your TechNova workspace is up to date.');
 }catch(error){
  showStatus(error?.message||'Your dashboard could not load. Please refresh and try again.',true);
  console.error('TechNova dashboard initialisation failed:',error);
 }
});
})();