/* TechNova Phase 2 workspace upgrades. All personal records stay in this browser. */
(() => {
'use strict';
const $=id=>document.getElementById(id);
const K={tasks:'technova.dashboard.tasks.v1',notes:'technova.dashboard.notes.v1',reminders:'technova.dashboard.calendar.v1',timetable:'technova.os.timetable.v1',grades:'technova.os.grades.v1',sessions:'technova.os.focus-sessions.v1',recurring:'technova.phase2.recurring.v1',files:'technova.phase2.dev-files.v1',prefs:'technova.phase2.preferences.v1'};
const read=(k,f)=>{try{const v=localStorage.getItem(k);return v===null?f:JSON.parse(v)}catch{return f}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const id=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(36).slice(2);
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
const btn=(txt,fn)=>{const b=el('button','phase2-button',txt);b.type='button';b.addEventListener('click',fn);return b};
const dateISO=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const addDays=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return dateISO(d)};
function mount(){
 const root=el('section','dashboard-panel phase2-shell');root.id='phase2Workspace';root.innerHTML=`
 <div class="dashboard-panel-head"><div><div class="dashboard-eyebrow">PHASE 2 · WORKSPACE EXPANSION</div><h2>Power tools for your TechNova OS</h2><p>More control over projects, study, notes, development and the way your workspace looks.</p></div><span class="phase2-local">● Saved on this device</span></div>
 <div class="phase2-grid">
  <section class="phase2-card" aria-labelledby="p2TasksTitle"><h3 id="p2TasksTitle">Advanced productivity</h3><p>Filter your Kanban tasks, break work into subtasks and keep recurring task templates.</p>
   <div class="phase2-row"><input id="p2TaskSearch" type="search" placeholder="Search tasks…" aria-label="Search tasks"><select id="p2TaskFilter" aria-label="Filter task status"><option value="all">All statuses</option><option value="todo">To do</option><option value="doing">In progress</option><option value="done">Done</option></select><select id="p2PriorityFilter" aria-label="Filter priority"><option value="all">All priorities</option><option>High</option><option>Normal</option><option>Low</option></select></div>
   <div id="p2TaskList" class="phase2-list" aria-live="polite"></div>
   <form id="p2RepeatForm" class="phase2-form"><input id="p2RepeatTitle" required maxlength="120" placeholder="Recurring task title"><input id="p2RepeatDate" type="date" aria-label="First due date"><select id="p2RepeatCadence" aria-label="Repeat cadence"><option value="daily">Daily</option><option value="weekly" selected>Weekly</option><option value="monthly">Monthly</option></select><button class="phase2-button primary">Save repeat</button></form>
   <div id="p2RepeatList" class="phase2-list"></div>
  </section>
  <section class="phase2-card" aria-labelledby="p2AnalyticsTitle"><h3 id="p2AnalyticsTitle">Personal analytics</h3><p>Progress calculated from your actual local task, focus and grade records.</p><div id="p2Analytics" class="phase2-metrics"></div><div id="p2FocusChart" class="phase2-bars" aria-label="Focus minutes over the last seven days"></div><p class="phase2-muted" id="p2AnalyticsNote">Only sessions completed after this update are counted.</p></section>
  <section class="phase2-card" aria-labelledby="p2AgendaTitle"><h3 id="p2AgendaTitle">Smart agenda</h3><p>One upcoming view combining tasks, reminders and study timetable sessions.</p><div id="p2Agenda" class="phase2-list" aria-live="polite"></div></section>
  <section class="phase2-card" aria-labelledby="p2NotesTitle"><h3 id="p2NotesTitle">Notes organiser</h3><p>Give existing notes folders and tags, then filter your collection.</p><div class="phase2-row"><select id="p2FolderFilter" aria-label="Filter notes by folder"><option value="all">All folders</option></select><input id="p2TagFilter" placeholder="Filter by tag…" aria-label="Filter notes by tag"></div><div id="p2NotesList" class="phase2-list"></div><div class="phase2-row"><input id="p2NoteFolder" maxlength="40" placeholder="Folder for selected note"><input id="p2NoteTags" maxlength="120" placeholder="Tags, separated by commas"></div><button id="p2SaveNoteMeta" class="phase2-button" type="button">Save note organisation</button><p id="p2NotesStatus" class="phase2-muted" role="status">Choose a note to organise it.</p></section>
  <section class="phase2-card phase2-span" aria-labelledby="p2DevTitle"><h3 id="p2DevTitle">Professional developer studio</h3><p>Manage a small multi-file project, preview the HTML entry point in an isolated frame, and export your project files.</p>
   <div class="phase2-row"><input id="p2ProjectName" maxlength="60" value="My TechNova project" aria-label="Project name"><input id="p2NewFile" maxlength="60" placeholder="New file name e.g. about.html" aria-label="New file name"><button id="p2AddFile" class="phase2-button" type="button">＋ Add file</button></div>
   <div id="p2FileTabs" class="phase2-tabs" role="group" aria-label="Project files"></div><textarea id="p2FileEditor" class="phase2-editor" spellcheck="false" aria-label="Selected project file"></textarea>
   <div class="phase2-row"><button id="p2RunProject" class="phase2-button primary" type="button">Run index.html preview</button><button id="p2DownloadFile" class="phase2-button" type="button">Download current file</button><button id="p2ExportProject" class="phase2-button" type="button">Export project JSON</button></div>
   <iframe id="p2Preview" title="Isolated multi-file project preview" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe><p class="phase2-muted" id="p2DevStatus" role="status">Files are stored locally. Project JSON export is portable; it is not a ZIP archive.</p>
  </section>
  <section class="phase2-card" aria-labelledby="p2PersonalTitle"><h3 id="p2PersonalTitle">Personalisation centre</h3><p>Choose a workspace appearance and density. These settings apply only in this browser.</p>
   <label class="phase2-label">Colour theme<select id="p2Theme"><option value="midnight">Midnight</option><option value="aurora">Aurora</option><option value="light">Light</option></select></label>
   <label class="phase2-label">Accent colour<input id="p2Accent" type="color" value="#42d7ff"></label>
   <label class="phase2-label">Panel density<select id="p2Density"><option value="comfortable">Comfortable</option><option value="compact">Compact</option><option value="spacious">Spacious</option></select></label>
   <label class="phase2-label">Workspace width<select id="p2Width"><option value="standard">Standard</option><option value="wide">Wide</option></select></label>
   <div class="phase2-row"><button id="p2SavePrefs" class="phase2-button primary" type="button">Apply preferences</button><button id="p2ResetPrefs" class="phase2-button" type="button">Reset</button></div><p id="p2PrefsStatus" class="phase2-muted" role="status">Your choices are saved locally.</p>
  </section>
 </div>`;
 const anchor=document.querySelector('.os-shell');if(anchor)anchor.after(root);
}
function productivity(){
 const search=$('p2TaskSearch'),status=$('p2TaskFilter'),priority=$('p2PriorityFilter'),list=$('p2TaskList');
 const get=()=>{const a=read(K.tasks,[]);return Array.isArray(a)?a.filter(t=>t&&typeof t.id==='string'&&typeof t.title==='string'):[]};
 const render=()=>{list.replaceChildren();const q=search.value.toLowerCase().trim();const a=get().filter(t=>(status.value==='all'||(t.status|| (t.done?'done':'todo'))===status.value)&&(priority.value==='all'||(t.priority||'Normal')===priority.value)&&t.title.toLowerCase().includes(q));if(!a.length){list.append(el('p','phase2-muted','No tasks match these filters.'));return}a.slice(0,40).forEach(t=>{const row=el('div','phase2-list-item');const copy=el('div');copy.append(el('strong','',t.title),el('small','',(t.status|| (t.done?'done':'todo'))+' · '+(t.priority||'Normal')+(t.dueDate?' · '+t.dueDate:'')));const sub=Array.isArray(t.subtasks)?t.subtasks:[];copy.append(el('small','',sub.filter(x=>x.done).length+' / '+sub.length+' subtasks complete'));const add=btn('＋ Subtask',()=>{const title=prompt('Subtask title');if(!title||!title.trim())return;const all=get(),target=all.find(x=>x.id===t.id);target.subtasks=Array.isArray(target.subtasks)?target.subtasks:[];if(target.subtasks.length>=20)return;target.subtasks.push({id:id(),title:title.trim().slice(0,100),done:false});write(K.tasks,all);render()});row.append(copy,add);list.append(row)})};
 [search,status,priority].forEach(x=>x.addEventListener('input',render));[status,priority].forEach(x=>x.addEventListener('change',render));
 const repeatForm=$('p2RepeatForm'),repeatList=$('p2RepeatList');
 const repeats=()=>{const a=read(K.recurring,[]);return Array.isArray(a)?a:[]};
 const renderRepeats=()=>{repeatList.replaceChildren();const a=repeats();if(!a.length){repeatList.append(el('p','phase2-muted','No recurring templates yet.'));return}a.forEach(r=>{const row=el('div','phase2-list-item');const c=el('div');c.append(el('strong','',r.title),el('small','',r.cadence+' · next '+r.nextDate));row.append(c,btn('Create next task',()=>{const tasks=get();tasks.push({id:id(),title:r.title,status:'todo',done:false,priority:'Normal',dueDate:r.nextDate,createdAt:Date.now(),repeatTemplate:r.id,subtasks:[]});write(K.tasks,tasks);r.nextDate=r.cadence==='daily'?addDays(r.nextDate,1):r.cadence==='weekly'?addDays(r.nextDate,7):(()=>{const d=new Date(r.nextDate+'T12:00:00');d.setMonth(d.getMonth()+1);return dateISO(d)})();write(K.recurring,a);renderRepeats();render();}));row.append(btn('Delete',()=>{write(K.recurring,a.filter(x=>x.id!==r.id));renderRepeats()}));repeatList.append(row)})};
 repeatForm.addEventListener('submit',e=>{e.preventDefault();const title=$('p2RepeatTitle').value.trim();if(!title)return;const a=repeats();a.push({id:id(),title,cadence:$('p2RepeatCadence').value,nextDate:$('p2RepeatDate').value||dateISO(new Date())});write(K.recurring,a);repeatForm.reset();renderRepeats()});
 render();renderRepeats();
}
function analytics(){
 const box=$('p2Analytics'),chart=$('p2FocusChart');const tasks=read(K.tasks,[]),grades=read(K.grades,[]),sessions=read(K.sessions,[]);
 const safeTasks=Array.isArray(tasks)?tasks:[],safeGrades=Array.isArray(grades)?grades:[],safeSessions=Array.isArray(sessions)?sessions:[];
 const completed=safeTasks.filter(t=>t&&(t.done||t.status==='done')).length,open=safeTasks.length-completed;
 const avg=safeGrades.length?safeGrades.reduce((n,g)=>n+Number(g.score||0),0)/safeGrades.length:0;
 const mins=safeSessions.reduce((n,s)=>n+Number(s.minutes||0),0);
 box.replaceChildren();[['Completed tasks',completed],['Open tasks',open],['Average recorded grade',safeGrades.length?Math.round(avg)+'%':'—'],['Focus minutes logged',mins]].forEach(([k,v])=>{const c=el('div','phase2-metric');c.append(el('strong','',String(v)),el('small','',k));box.append(c)});
 chart.replaceChildren();const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const key=dateISO(d);return {key,label:d.toLocaleDateString(undefined,{weekday:'short'}),value:safeSessions.filter(s=>s.date===key).reduce((n,s)=>n+Number(s.minutes||0),0)}});const max=Math.max(25,...days.map(d=>d.value));days.forEach(d=>{const col=el('div','phase2-bar-col');const bar=el('span','phase2-bar');bar.style.height=Math.max(4,d.value/max*100)+'%';bar.title=d.value+' minutes';col.append(bar,el('small','',d.label));chart.append(col)});
}
function agenda(){
 const box=$('p2Agenda'),items=[],today=dateISO(new Date()),end=addDays(today,14);
 const tasks=read(K.tasks,[]),rem=read(K.reminders,[]),timetable=read(K.timetable,[]);
 (Array.isArray(tasks)?tasks:[]).filter(t=>t&&!t.done&&t.dueDate>=today&&t.dueDate<=end).forEach(t=>items.push({date:t.dueDate,label:'Task',title:t.title}));
 (Array.isArray(rem)?rem:[]).filter(r=>r&&r.date>=today&&r.date<=end).forEach(r=>items.push({date:r.date,label:'Reminder',title:r.title}));
 const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];const now=new Date();
 (Array.isArray(timetable)?timetable:[]).filter(s=>s&&s.day&&s.time).forEach(s=>{for(let i=0;i<14;i++){const d=new Date(now);d.setDate(now.getDate()+i);if(days[d.getDay()]===s.day)items.push({date:dateISO(d),time:s.time,label:'Study',title:s.title})}});
 items.sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));box.replaceChildren();if(!items.length)box.append(el('p','phase2-muted','Nothing scheduled in the next 14 days.'));items.slice(0,24).forEach(x=>{const row=el('div','phase2-list-item');row.append(el('strong','',x.title),el('small','',x.date+(x.time?' · '+x.time:'')+' · '+x.label));box.append(row)});
}
function notes(){
 const list=$('p2NotesList'),folderFilter=$('p2FolderFilter'),tagFilter=$('p2TagFilter');let active='';
 const get=()=>{const a=read(K.notes,[]);return Array.isArray(a)?a:[]};
 const folders=()=>[...new Set(get().map(n=>n.folder||'General'))].sort();
 const render=()=>{const all=get();folderFilter.replaceChildren();[['all','All folders'],...folders().map(f=>[f,f])].forEach(([v,t])=>{const o=el('option','',t);o.value=v;folderFilter.append(o)});list.replaceChildren();const tag=tagFilter.value.toLowerCase().trim();const filtered=all.filter(n=>(folderFilter.value==='all'||(n.folder||'General')===folderFilter.value)&&(!tag||(n.tags||[]).join(' ').toLowerCase().includes(tag)));if(!filtered.length)list.append(el('p','phase2-muted','No notes match.'));filtered.forEach(n=>{const b=btn(n.title||'Untitled',()=>{active=n.id;$('p2NoteFolder').value=n.folder||'General';$('p2NoteTags').value=(n.tags||[]).join(', ');renderActive()});b.classList.add('phase2-note-choice');b.append(el('small','',(n.folder||'General')+' · '+(n.tags||[]).join(', ')));list.append(b)})};
 const renderActive=()=>{const n=get().find(x=>x.id===active);$('p2NotesStatus').textContent=n?'Organising: '+(n.title||'Untitled'):'Choose a note to organise it.'};
 $('p2SaveNoteMeta').addEventListener('click',()=>{const a=get(),n=a.find(x=>x.id===active);if(!n){$('p2NotesStatus').textContent='Select a note first.';return}n.folder=$('p2NoteFolder').value.trim().slice(0,40)||'General';n.tags=$('p2NoteTags').value.split(',').map(x=>x.trim().slice(0,24)).filter(Boolean).slice(0,10);write(K.notes,a);$('p2NotesStatus').textContent='Folder and tags saved.';render()});
 folderFilter.addEventListener('change',render);tagFilter.addEventListener('input',render);render();
}
function developer(){
 const defaultFiles={'index.html':'<!doctype html>\n<html><head><meta charset="utf-8"><title>My project</title><link rel="stylesheet" href="style.css"></head><body><main><h1>Hello, TechNova!</h1><p>Build something brilliant.</p></main><script src="script.js"><\\/script></body></html>','style.css':'body{font-family:system-ui;padding:2rem;background:#0b1929;color:#eaf5ff}h1{color:#42d7ff}','script.js':"console.log('Project ready');"};
 let project=read(K.files,null);if(!project||typeof project!=='object'||!project.files)project={name:'My TechNova project',files:defaultFiles};
 let active='index.html';const name=$('p2ProjectName'),newFile=$('p2NewFile'),tabs=$('p2FileTabs'),editor=$('p2FileEditor');
 name.value=project.name||'My TechNova project';
 const save=()=>{project.name=name.value.slice(0,60);project.files[active]=editor.value;write(K.files,project)};
 const render=()=>{tabs.replaceChildren();Object.keys(project.files).forEach(file=>{const b=btn(file,()=>{save();active=file;editor.value=project.files[file];render()});b.setAttribute('aria-pressed',String(file===active));tabs.append(b)});editor.value=project.files[active]||''};
 name.addEventListener('input',save);editor.addEventListener('input',save);
 $('p2AddFile').addEventListener('click',()=>{const f=newFile.value.trim();if(!/^[a-zA-Z0-9._-]{1,60}$/.test(f)||project.files[f]){$('p2DevStatus').textContent='Use a unique filename with letters, numbers, dots, underscores or hyphens.';return}save();project.files[f]='';active=f;newFile.value='';write(K.files,project);render()});
 $('p2RunProject').addEventListener('click',()=>{save();const html=project.files['index.html'];if(typeof html!=='string'){$('p2DevStatus').textContent='Add an index.html file to run the preview.';return}const css=project.files['style.css']||'',js=(project.files['script.js']||'').replace(/<\\/script/gi,'<\\\\/script');$('p2Preview').srcdoc=html.replace(/<head([^>]*)>/i,'<head$1><style>'+css+'</style>').replace(/<\\/body>/i,'<script>'+js+'<\\/script></body>');$('p2DevStatus').textContent='Preview refreshed in a sandboxed frame.'});
 $('p2DownloadFile').addEventListener('click',()=>{save();const blob=new Blob([editor.value],{type:'text/plain'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=active;a.click();URL.revokeObjectURL(url)});
 $('p2ExportProject').addEventListener('click',()=>{save();const blob=new Blob([JSON.stringify({format:'technova-project',version:1,name:project.name,files:project.files},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='technova-project.json';a.click();URL.revokeObjectURL(url)});
 render();
}
function personalisation(){
 const prefs=read(K.prefs,{});$('p2Theme').value=prefs.theme||'midnight';$('p2Accent').value=prefs.accent||'#42d7ff';$('p2Density').value=prefs.density||'comfortable';$('p2Width').value=prefs.width||'standard';
 const apply=()=>{const p={theme:$('p2Theme').value,accent:$('p2Accent').value,density:$('p2Density').value,width:$('p2Width').value};write(K.prefs,p);document.documentElement.style.setProperty('--dash-cyan',p.accent);document.documentElement.style.setProperty('--phase2-accent',p.accent);document.body.dataset.phase2Theme=p.theme;document.body.dataset.phase2Density=p.density;document.querySelector('.dashboard-shell')?.classList.toggle('phase2-wide',p.width==='wide');$('p2PrefsStatus').textContent='Preferences applied and saved on this device.'};
 $('p2SavePrefs').addEventListener('click',apply);$('p2ResetPrefs').addEventListener('click',()=>{localStorage.removeItem(K.prefs);$('p2Theme').value='midnight';$('p2Accent').value='#42d7ff';$('p2Density').value='comfortable';$('p2Width').value='standard';apply()});apply();
}
document.addEventListener('DOMContentLoaded',()=>{mount();productivity();analytics();agenda();notes();developer();personalisation()});
})();