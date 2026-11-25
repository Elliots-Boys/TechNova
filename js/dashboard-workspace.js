/* TechNova dashboard workspace extensions.
 * Calendar reminders, habits, notes, projects and analytics are browser-local.
 * Developer utilities run locally. Existing account data remains read-only.
 */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const KEYS = {
 calendar:'technova.dashboard.calendar.v1',
 habits:'technova.dashboard.habits.v1',
 notes:'technova.dashboard.notes.v1',
 projects:'technova.dashboard.projects.v1'
};
const read = (key, fallback) => {
 try { const raw=localStorage.getItem(key); return raw===null?fallback:JSON.parse(raw); }
 catch { return fallback; }
};
const write = (key,value,status) => {
 try { localStorage.setItem(key,JSON.stringify(value)); if(status)status.textContent='Saved on this device'; return true; }
 catch { if(status)status.textContent='Could not save in this browser'; return false; }
};
const makeId = () => (window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2);
const localISO = date => date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
const today = () => localISO(new Date());
const el = (tag, cls, value) => { const node=document.createElement(tag); if(cls)node.className=cls; if(value!==undefined)node.textContent=value; return node; };
const button = (label, cls, action, aria) => { const node=el('button',cls,label); node.type='button'; if(aria)node.setAttribute('aria-label',aria); node.addEventListener('click',action); return node; };
const empty = (container,message) => { container.replaceChildren(el('p','dashboard-empty',message)); };
const setStatus = (id,message) => { const node=$(id); if(node)node.textContent=message; };

function setupCalendar(){
 const grid=$('workspaceCalendarGrid'),heading=$('workspaceCalendarHeading'),list=$('workspaceCalendarList'),form=$('workspaceReminderForm'),title=$('workspaceReminderTitle'),dateInput=$('workspaceReminderDate'),status=$('workspaceCalendarStatus');
 if(!grid||!heading||!list||!form)return;
 let reminders=read(KEYS.calendar,[]);
 if(!Array.isArray(reminders))reminders=[];reminders=reminders.filter(x=>x&&typeof x.id==='string'&&typeof x.title==='string'&&typeof x.date==='string');
 let view=new Date();view.setDate(1);
 let selected=today();
 let registeredEvents=[];
 const taskItems=()=>{const tasks=read('technova.dashboard.tasks.v1',[]);return Array.isArray(tasks)?tasks.filter(t=>t&&t.dueDate&&!t.done):[];};
 const renderList=()=>{
  list.replaceChildren();
  const items=reminders.filter(x=>x.date===selected).map(x=>({kind:'Reminder',title:x.title,id:x.id}));
  taskItems().filter(x=>x.dueDate===selected).forEach(x=>items.push({kind:'Focus task',title:x.title}));
  registeredEvents.filter(x=>x.event_date===selected).forEach(x=>items.push({kind:'TechNova event',title:x.title||'TechNova event',href:x.id?'event.html?id='+encodeURIComponent(x.id):''}));
  if(!items.length){empty(list,'Nothing planned for this date yet. Add a reminder above.');return;}
  items.forEach(item=>{
   const row=el('div','workspace-list-item');
   const copy=el('div','workspace-list-copy');copy.append(el('strong','',item.title),el('small','',item.kind));row.append(copy);
   if(item.id)row.append(button('×','workspace-icon-button',()=>{reminders=reminders.filter(x=>x.id!==item.id);write(KEYS.calendar,reminders,status);render();},'Delete reminder: '+item.title));
   if(item.href){const link=el('a','dashboard-section-link','View');link.href=item.href;row.append(link);}
   list.append(row);
  });
 };
 const render=()=>{
  heading.textContent=new Intl.DateTimeFormat(undefined,{month:'long',year:'numeric'}).format(view);
  grid.replaceChildren();
  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(day=>grid.append(el('span','workspace-weekday',day)));
  const first=new Date(view.getFullYear(),view.getMonth(),1),offset=(first.getDay()+6)%7,days=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
  for(let i=0;i<offset;i++)grid.append(el('span','workspace-calendar-blank',''));
  const due=taskItems();
  for(let day=1;day<=days;day++){
   const date=localISO(new Date(view.getFullYear(),view.getMonth(),day));
   const marked=reminders.some(x=>x.date===date)||due.some(x=>x.dueDate===date)||registeredEvents.some(x=>x.event_date===date);
   const cell=button(String(day),'workspace-day'+(date===selected?' is-selected':'')+(date===today()?' is-today':''),()=>{selected=date;dateInput.value=date;render();},'Select '+date);
   if(marked)cell.append(el('span','workspace-day-dot',''));
   grid.append(cell);
  }
  dateInput.value=selected;
  renderList();
 };
 $('workspaceCalendarPrev')?.addEventListener('click',()=>{view.setMonth(view.getMonth()-1);render();});
 $('workspaceCalendarNext')?.addEventListener('click',()=>{view.setMonth(view.getMonth()+1);render();});
 $('workspaceCalendarToday')?.addEventListener('click',()=>{selected=today();view=new Date();view.setDate(1);render();});
 dateInput.addEventListener('change',()=>{if(dateInput.value){selected=dateInput.value;view=new Date(selected+'T12:00:00');view.setDate(1);render();}});
 window.addEventListener('technova:dashboard-events-loaded',event=>{registeredEvents=Array.isArray(event.detail)?event.detail.filter(item=>item&&typeof item.event_date==='string'):[];render();});
 form.addEventListener('submit',event=>{
  event.preventDefault();const value=title.value.trim();if(!value)return;
  if(reminders.length>=150){setStatus('workspaceCalendarStatus','You have reached the 150-reminder limit.');return;}
  reminders.push({id:makeId(),title:value.slice(0,100),date:dateInput.value||selected,createdAt:Date.now()});
  write(KEYS.calendar,reminders,status);title.value='';selected=dateInput.value||selected;view=new Date(selected+'T12:00:00');view.setDate(1);render();
 });
 render();
}

function setupHabits(){
 const form=$('workspaceHabitForm'),input=$('workspaceHabitName'),list=$('workspaceHabitList'),status=$('workspaceHabitStatus'),summary=$('workspaceHabitSummary');
 if(!form||!input||!list)return;
 let habits=read(KEYS.habits,[]);if(!Array.isArray(habits))habits=[];habits=habits.filter(h=>h&&typeof h.id==='string'&&typeof h.name==='string').map(h=>({...h,logs:Array.isArray(h.logs)?h.logs.filter(x=>typeof x==='string').slice(-366):[]}));
 const streakFor=logs=>{
  const set=new Set(logs||[]);let cursor=new Date();let count=0;
  if(!set.has(today()))cursor.setDate(cursor.getDate()-1);
  for(let i=0;i<366&&set.has(localISO(cursor));i++){count++;cursor.setDate(cursor.getDate()-1);}
  return count;
 };
 const render=()=>{
  list.replaceChildren();const done=habits.filter(h=>(h.logs||[]).includes(today())).length;
  if(summary)summary.textContent=habits.length?done+' of '+habits.length+' habits completed today':'Create a habit to start your routine tracker.';
  if(!habits.length){empty(list,'No habits yet. Add a small routine you want to practise.');return;}
  habits.forEach(h=>{
   const row=el('div','workspace-habit-row'),copy=el('div','workspace-list-copy');
   copy.append(el('strong','',h.name),el('small','',(streakFor(h.logs)||0)+' day streak'));
   const check=document.createElement('input');check.type='checkbox';check.checked=(h.logs||[]).includes(today());check.setAttribute('aria-label','Mark '+h.name+' complete today');
   check.addEventListener('change',()=>{const logs=new Set(h.logs||[]);if(check.checked)logs.add(today());else logs.delete(today());h.logs=[...logs].sort().slice(-366);save();render();});
   row.append(check,copy,button('×','workspace-icon-button',()=>{habits=habits.filter(x=>x.id!==h.id);save();render();},'Delete habit: '+h.name));list.append(row);
  });
 };
 const save=()=>write(KEYS.habits,habits,status);
 form.addEventListener('submit',event=>{event.preventDefault();const name=input.value.trim();if(!name)return;if(habits.length>=12){setStatus('workspaceHabitStatus','You can track up to 12 habits.');return;}habits.push({id:makeId(),name:name.slice(0,48),logs:[]});save();input.value='';render();});
 render();
}

function setupNotes(){
 const list=$('workspaceNotesList'),search=$('workspaceNotesSearch'),title=$('workspaceNoteTitle'),body=$('workspaceNoteBody'),status=$('workspaceNotesStatus'),add=$('workspaceAddNote'),remove=$('workspaceDeleteNote'),exportBtn=$('workspaceExportNote');
 if(!list||!title||!body)return;
 let notes=read(KEYS.notes,[]);if(!Array.isArray(notes))notes=[];notes=notes.filter(n=>n&&typeof n.id==='string').map(n=>({...n,title:String(n.title||'Untitled note'),body:String(n.body||''),updatedAt:Number(n.updatedAt)||Date.now()}));
 let active='';
 const save=()=>write(KEYS.notes,notes,status);
 const current=()=>notes.find(n=>n.id===active);
 const render=()=>{
  list.replaceChildren();
  const q=(search?.value||'').trim().toLowerCase();
  const filtered=notes.filter(n=>(n.title+' '+n.body).toLowerCase().includes(q)).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  if(!filtered.length)list.append(el('p','dashboard-empty',notes.length?'No notes match your search.':'Create your first private note.'));
  filtered.forEach(n=>{
   const item=button(n.title||'Untitled note','workspace-note-item'+(n.id===active?' is-active':''),()=>select(n.id));
   item.append(el('small','',new Date(n.updatedAt||Date.now()).toLocaleDateString()));list.append(item);
  });
  const note=current();title.disabled=!note;body.disabled=!note;remove.disabled=!note;exportBtn.disabled=!note;
  title.value=note?.title||'';body.value=note?.body||'';
  if(!note)setStatus('workspaceNotesStatus','Notes are saved only in this browser.');
 };
 const select=id=>{active=id;render();};
 const persistEditor=()=>{
  const note=current();if(!note)return;
  note.title=title.value.slice(0,80);note.body=body.value.slice(0,10000);note.updatedAt=Date.now();save();
  const cursor=body.selectionStart;render();body.focus();try{body.setSelectionRange(cursor,cursor);}catch{}
 };
 add.addEventListener('click',()=>{
  if(notes.length>=40){setStatus('workspaceNotesStatus','You can save up to 40 notes.');return;}
  const note={id:makeId(),title:'New note',body:'',updatedAt:Date.now()};notes.unshift(note);active=note.id;save();render();title.focus();title.select();
 });
 title.addEventListener('input',()=>{const note=current();if(!note)return;note.title=title.value.slice(0,80);note.updatedAt=Date.now();save();renderListOnly();});
 body.addEventListener('input',()=>{const note=current();if(!note)return;note.body=body.value.slice(0,10000);note.updatedAt=Date.now();save();renderListOnly();});
 const renderListOnly=()=>{
  const q=(search?.value||'').trim().toLowerCase();list.replaceChildren();
  const filtered=notes.filter(n=>(n.title+' '+n.body).toLowerCase().includes(q)).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  filtered.forEach(n=>{const item=button(n.title||'Untitled note','workspace-note-item'+(n.id===active?' is-active':''),()=>select(n.id));item.append(el('small','',new Date(n.updatedAt||Date.now()).toLocaleDateString()));list.append(item);});
  if(!filtered.length)list.append(el('p','dashboard-empty','No matching notes.'));
 };
 search?.addEventListener('input',renderListOnly);
 remove.addEventListener('click',()=>{if(!current())return;notes=notes.filter(n=>n.id!==active);active=notes[0]?.id||'';save();render();});
 exportBtn.addEventListener('click',()=>{
  const note=current();if(!note)return;
  const blob=new Blob([note.title+'\n\n'+note.body],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(note.title||'technova-note').replace(/[^a-z0-9-_]+/gi,'-').slice(0,60)+'.txt';a.click();URL.revokeObjectURL(url);
 });
 render();if(!notes.length){const first={id:makeId(),title:'Welcome to Notes',body:'Use this space for ideas, reminders and project notes.',updatedAt:Date.now()};notes.push(first);active=first.id;save();render();}
}

function setupProjects(){
 const form=$('workspaceProjectForm'),input=$('workspaceProjectName'),list=$('workspaceProjectList'),status=$('workspaceProjectStatus');
 if(!form||!input||!list)return;
 let projects=read(KEYS.projects,[]);if(!Array.isArray(projects))projects=[];projects=projects.filter(p=>p&&typeof p.id==='string'&&typeof p.name==='string').map(p=>({...p,stage:['Planning','In progress','On hold','Complete'].includes(p.stage)?p.stage:'Planning'}));
 const stages=['Planning','In progress','On hold','Complete'];
 const render=()=>{
  list.replaceChildren();if(!projects.length){empty(list,'Your projects will appear here.');return;}
  projects.forEach(project=>{
   const card=el('article','workspace-project-card'),head=el('div','workspace-project-head');
   head.append(el('strong','',project.name),button('×','workspace-icon-button',()=>{projects=projects.filter(p=>p.id!==project.id);save();render();},'Delete project: '+project.name));
   const select=document.createElement('select');select.setAttribute('aria-label','Project status for '+project.name);
   stages.forEach(stage=>{const option=el('option','',stage);option.value=stage;select.append(option);});select.value=stages.includes(project.stage)?project.stage:'Planning';
   select.addEventListener('change',()=>{project.stage=select.value;save();render();});
   const meter=el('div','workspace-project-meter');const fill=el('span','');fill.style.width=(select.value==='Complete'?100:select.value==='In progress'?55:select.value==='On hold'?25:10)+'%';meter.append(fill);
   card.append(head,select,meter);list.append(card);
  });
 };
 const save=()=>write(KEYS.projects,projects,status);
 form.addEventListener('submit',event=>{event.preventDefault();const name=input.value.trim();if(!name)return;if(projects.length>=20){setStatus('workspaceProjectStatus','You can track up to 20 projects.');return;}projects.push({id:makeId(),name:name.slice(0,70),stage:'Planning',createdAt:Date.now()});save();input.value='';render();});
 render();
}

function setupInsights(){
 const container=$('workspaceInsights');if(!container)return;
 const refresh=()=>{
  const tasks=read('technova.dashboard.tasks.v1',[]),habits=read(KEYS.habits,[]),reminders=read(KEYS.calendar,[]),projects=read(KEYS.projects,[]);
  const safeTasks=Array.isArray(tasks)?tasks.filter(t=>t&&typeof t.done==='boolean'):[];
  const safeHabits=Array.isArray(habits)?habits.filter(h=>h&&typeof h.name==='string'):[];
  const safeReminders=Array.isArray(reminders)?reminders.filter(r=>r&&typeof r.date==='string'):[];
  const safeProjects=Array.isArray(projects)?projects.filter(p=>p&&typeof p.stage==='string'):[];
  const done=safeTasks.filter(t=>t.done).length,open=safeTasks.filter(t=>!t.done).length;
  const habitsDone=safeHabits.filter(h=>Array.isArray(h.logs)&&h.logs.includes(today())).length;
  const upcoming=safeReminders.filter(r=>r.date>=today()).length;
  const completeProjects=safeProjects.filter(p=>p.stage==='Complete').length;
  const stats=[['Open tasks',open],['Tasks completed',done],['Habits today',habitsDone+' / '+safeHabits.length],['Upcoming reminders',upcoming],['Projects complete',completeProjects+' / '+safeProjects.length]];
  container.replaceChildren();
  stats.forEach(([label,value])=>{const card=el('div','workspace-insight');card.append(el('strong','',String(value)),el('small','',label));container.append(card);});
  const accountReg=$('dashboardRegistrationCount')?.textContent||'—',accountSaved=$('dashboardSavedCount')?.textContent||'—';
  const account=$('workspaceAccountInsight');if(account)account.textContent='TechNova account activity: '+accountReg+' registrations · '+accountSaved+' saved events. These totals come from your signed-in account.';
  const taskProgress=$('workspaceTaskProgress');if(taskProgress){const total=done+open;taskProgress.textContent=total?Math.round(done/total*100)+'% of your focus tasks completed':'No focus tasks yet';}
 };
 refresh();
 ['focusTaskList','workspaceHabitList','workspaceCalendarList','workspaceProjectList','dashboardRegistrationCount','dashboardSavedCount'].forEach(id=>{
  const node=$(id);if(node)new MutationObserver(refresh).observe(node,{childList:true,subtree:true,characterData:true});
 });
}
function setupDeveloperTools(){
 const input=$('workspaceJsonInput'),output=$('workspaceJsonOutput'),status=$('workspaceJsonStatus');
 $('workspaceJsonFormat')?.addEventListener('click',()=>{
  try{const parsed=JSON.parse(input.value);output.value=JSON.stringify(parsed,null,2);setStatus('workspaceJsonStatus','Valid JSON · formatted locally');}
  catch(error){output.value='';setStatus('workspaceJsonStatus','Invalid JSON: '+error.message);}
 });
 $('workspaceJsonMinify')?.addEventListener('click',()=>{
  try{output.value=JSON.stringify(JSON.parse(input.value));setStatus('workspaceJsonStatus','Valid JSON · minified locally');}
  catch(error){output.value='';setStatus('workspaceJsonStatus','Invalid JSON: '+error.message);}
 });
 $('workspaceJsonClear')?.addEventListener('click',()=>{input.value='';output.value='';setStatus('workspaceJsonStatus','Ready');});
 $('workspaceJsonCopy')?.addEventListener('click',async()=>{
  if(!output.value){setStatus('workspaceJsonStatus','There is no formatted output to copy.');return;}
  try{await navigator.clipboard.writeText(output.value);setStatus('workspaceJsonStatus','Copied to clipboard.');}
  catch{output.focus();output.select();setStatus('workspaceJsonStatus','Output selected. Use Ctrl+C to copy.');}
 });
 const colour=$('workspaceColour'),swatch=$('workspaceColourSwatch'),hex=$('workspaceColourHex');
 const syncColour=()=>{if(swatch)swatch.style.background=colour.value;if(hex)hex.textContent=colour.value.toUpperCase();};
 colour?.addEventListener('input',syncColour);syncColour();
 $('workspaceCopyColour')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(colour.value.toUpperCase());setStatus('workspaceColourStatus','Colour copied.');}catch{setStatus('workspaceColourStatus','Clipboard access is unavailable.');}});
}

function setupStudyLaunchers(){
 document.querySelectorAll('[data-study-prompt]').forEach(btn=>btn.addEventListener('click',()=>{
  const input=$('aiInput');if(!input){setStatus('workspaceStudyStatus','Open the full AI Assistant page to use this prompt.');return;}
  input.value=btn.dataset.studyPrompt||'';input.focus();input.scrollIntoView({behavior:'smooth',block:'center'});
  setStatus('workspaceStudyStatus','Prompt added to TechNova Assistant. Review it and press Ask.');
 }));
}

function setupAdminPanel(){
 const panel=$('workspaceAdminPanel'),link=$('adminLink');if(!panel||!link)return;
 const reveal=()=>{if(!link.classList.contains('dashboard-hidden'))panel.hidden=false;};
 reveal();const observer=new MutationObserver(reveal);observer.observe(link,{attributes:true,attributeFilter:['class']});
}

document.addEventListener('DOMContentLoaded',()=>{
 setupCalendar();setupHabits();setupNotes();setupProjects();setupInsights();setupDeveloperTools();setupStudyLaunchers();setupAdminPanel();
});
})();