/* TechNova OS Expansion — built-in applications and optional per-user cloud sync. */
(() => {
'use strict';
const $=id=>document.getElementById(id);
const PREFIX='technova.os.';
const STORE={
 workspaces:PREFIX+'workspaces.v1',
 whiteboard:PREFIX+'whiteboard.v1',
 documents:PREFIX+'documents.v1',
 spreadsheets:PREFIX+'spreadsheets.v1',
 api:PREFIX+'api-collections.v1',
 widgets:PREFIX+'widgets.v1',
 website:PREFIX+'website-projects.v1',
 mail:PREFIX+'mail-drafts.v1',
 media:PREFIX+'media-library.v1',
 cloud:PREFIX+'cloud-sync-enabled.v1'
};
const read=(key,fallback)=>{try{const value=localStorage.getItem(key);return value===null?fallback:JSON.parse(value)}catch{return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
const id=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(36).slice(2);
const text=(value,max=300)=>String(value??'').trim().slice(0,max);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtBytes=n=>n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(1)+' MB';
const apps=[
 ['workspaces','Virtual Desktops','▦','Create and switch between workspaces','System'],
 ['whiteboard','Whiteboard Studio','✎','Draw, map ideas and organise sticky notes','Create'],
 ['documents','Document Studio','▤','Write and export documents','Create'],
 ['spreadsheets','Spreadsheet Studio','▥','Work with cells, formulas and charts','Work'],
 ['api','API Studio','⌘','Test HTTP APIs and save request collections','Developer'],
 ['widgets','Desktop Widgets','◫','Customise your desktop widget board','System'],
 ['control','Control Centre','⚙','Manage appearance, privacy and sync','System'],
 ['media','Media Centre','♫','Play your local audio and video files','Media'],
 ['website','Website Designer','◇','Build simple websites visually','Create'],
 ['mail','Mail Centre','✉','Organise drafts and prepare email messages','Work'],
 ['storage2','Storage Manager 2.0','▧','Manage local and private cloud files','System']
];
const windows={};
let currentWorkspace='main',mediaDb=null,storageDb=null,mediaUrl=null;
function appWindow(id,title,body,tag){
 const section=document.createElement('section');
 section.className='tn-window tn-os-window is-floating';
 section.dataset.window=id;
 section.dataset.workspace=currentWorkspace;
 section.hidden=true;
 section.innerHTML='<div class="tn-window-bar"><div><span class="tn-window-dot"></span><strong>'+title+'</strong><small>'+tag+'</small></div><div class="tn-window-controls"><button data-minimize="'+id+'" aria-label="Minimise">−</button><button data-maximize="'+id+'" aria-label="Maximise">□</button><button data-close="'+id+'" aria-label="Close">×</button></div></div><div class="tn-window-content tn-os-content">'+body+'</div>';
 $('desktopWindows').append(section);windows[id]=section;
 const bar=section.querySelector('.tn-window-bar');let sx=0,sy=0,ox=0,oy=0,drag=false;bar.addEventListener('pointerdown',e=>{if(e.target.closest('button')||section.classList.contains('is-maximized')||innerWidth<650)return;drag=true;sx=e.clientX;sy=e.clientY;ox=section.offsetLeft;oy=section.offsetTop;bar.setPointerCapture(e.pointerId)});bar.addEventListener('pointermove',e=>{if(!drag)return;section.style.left=Math.max(0,Math.min(innerWidth-240,ox+e.clientX-sx))+'px';section.style.top=Math.max(0,Math.min(innerHeight-170,oy+e.clientY-sy))+'px'});bar.addEventListener('pointerup',()=>drag=false);bar.addEventListener('pointercancel',()=>drag=false);
}
function intro(eyebrow,title,desc,extra=''){return '<div class="tn-app-intro"><div><span class="tn-eyebrow">'+eyebrow+'</span><h2>'+title+'</h2><p>'+desc+'</p></div>'+extra+'</div>'}
function panel(title,content){return '<section class="tn-card tn-os-panel"><h3>'+title+'</h3>'+content+'</section>'}
function initWindows(){
 appWindow('workspaces','Virtual Desktops',intro('SWITCH CONTEXTS','Virtual Desktops','Keep separate workspaces for study, development and personal projects.')+'<div class="tn-os-toolbar"><button class="tn-button tn-primary" id="wsCreate">＋ New desktop</button><span class="tn-muted" id="wsStatus" role="status"></span></div><div id="wsList" class="tn-os-grid"></div>','WORKSPACES');
 appWindow('whiteboard','Whiteboard Studio',intro('THINK VISUALLY','Whiteboard Studio','Sketch ideas, place sticky notes and export your board.')+'<div class="tn-os-toolbar"><input id="wbTitle" maxlength="80" placeholder="Board title" aria-label="Board title"><button class="tn-button tn-primary" id="wbSave">Save board</button><button class="tn-button" id="wbExport">Export PNG</button><button class="tn-button" id="wbClear">Clear board</button><button class="tn-button" id="wbAddNote">＋ Sticky note</button><span id="wbStatus" class="tn-muted" role="status"></span></div><div class="tn-whiteboard-wrap"><canvas id="wbCanvas" width="1400" height="850" aria-label="Whiteboard drawing canvas"></canvas><div id="wbNotes" class="tn-whiteboard-notes"></div></div><p class="tn-muted">Draw with your pointer or touch. Notes and drawings are saved locally; cloud sync is optional.</p>','CREATE');
 appWindow('documents','Document Studio',intro('WRITE AND EXPORT','Document Studio','Create formatted notes and reports. Print to PDF or download an HTML/TXT copy.')+'<div class="tn-os-toolbar"><input id="docTitle" maxlength="120" placeholder="Document title" aria-label="Document title"><button class="tn-button tn-primary" id="docSave">Save</button><button class="tn-button" id="docNew">New</button><button class="tn-button" id="docPrint">Print / PDF</button><button class="tn-button" id="docHtml">Download HTML</button><button class="tn-button" id="docTxt">Download TXT</button></div><div class="tn-doc-layout"><aside><div id="docList" class="tn-os-list"></div></aside><section><div class="tn-os-toolbar"><button class="tn-button" data-doc-cmd="bold"><b>B</b></button><button class="tn-button" data-doc-cmd="italic"><i>I</i></button><button class="tn-button" data-doc-cmd="underline"><u>U</u></button><button class="tn-button" data-doc-cmd="insertUnorderedList">• List</button><select id="docFormat"><option value="p">Paragraph</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option></select></div><div id="docEditor" class="tn-document-editor" contenteditable="true" role="textbox" aria-label="Document content" aria-multiline="true"></div><span id="docStatus" class="tn-muted" role="status"></span></section></div>','CREATE');
 appWindow('spreadsheets','Spreadsheet Studio',intro('NUMBERS AND INSIGHTS','Spreadsheet Studio','Edit cells, use basic formulas and export your sheet as CSV.')+'<div class="tn-os-toolbar"><input id="sheetTitle" maxlength="80" value="My spreadsheet" aria-label="Spreadsheet title"><button class="tn-button tn-primary" id="sheetSave">Save</button><button class="tn-button" id="sheetAddRow">＋ Row</button><button class="tn-button" id="sheetAddCol">＋ Column</button><button class="tn-button" id="sheetCsv">Export CSV</button><span id="sheetStatus" class="tn-muted" role="status"></span></div><div class="tn-sheet-formula"><strong id="sheetCellLabel">A1</strong><input id="sheetFormula" placeholder="Value or formula, e.g. =SUM(A1:A5)" aria-label="Cell value or formula"><button id="sheetApply" class="tn-button">Apply</button></div><div id="sheetGrid" class="tn-sheet-scroll"></div><p class="tn-muted">Supported formulas: SUM, AVERAGE, MIN, MAX and basic arithmetic with cell references. This is a lightweight spreadsheet, not a full Excel replacement.</p>','WORK');
 appWindow('api','API Studio',intro('DEVELOPER WORKBENCH','API Studio','Send HTTP requests from your browser and inspect JSON or text responses. CORS rules still apply.')+'<form id="apiForm" class="tn-api-form"><select id="apiMethod"><option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option></select><input id="apiUrl" type="url" required placeholder="https://api.example.com/endpoint"><button class="tn-button tn-primary">Send request</button></form><div class="tn-os-toolbar"><textarea id="apiHeaders" placeholder="Headers as JSON, e.g. {&quot;Accept&quot;:&quot;application/json&quot;}" aria-label="Request headers"></textarea><textarea id="apiBody" placeholder="Request body (JSON or text)" aria-label="Request body"></textarea></div><div id="apiStatus" class="tn-muted" role="status">Requests are sent directly from this browser. Avoid placing sensitive API keys in saved collections.</div><pre id="apiResponse" class="tn-api-response">Response will appear here.</pre><div class="tn-os-toolbar"><input id="apiRequestName" maxlength="80" placeholder="Collection request name"><button class="tn-button" id="apiSave">Save request</button></div><div id="apiSaved" class="tn-os-list"></div>','DEVELOPER');
 appWindow('widgets','Desktop Widgets',intro('YOUR DESKTOP, YOUR WAY','Desktop Widgets','Choose the widgets you want to see. Their visibility and positions are stored locally.')+'<div class="tn-os-toolbar"><button class="tn-button tn-primary" id="widgetReset">Reset layout</button><span class="tn-muted">Drag a widget by its heading to rearrange it.</span></div><div id="widgetBoard" class="tn-widget-board"></div>','SYSTEM');
 appWindow('control','Control Centre',intro('SYSTEM PREFERENCES','Control Centre','Manage desktop appearance, optional cloud synchronisation and data portability.')+'<div class="tn-os-grid"><section class="tn-card"><h3>Appearance</h3><label class="tn-os-label">Theme<select id="osTheme"><option value="midnight">Midnight</option><option value="aurora">Aurora</option><option value="light">Light</option></select></label><label class="tn-os-label">Accent colour<input id="osAccent" type="color" value="#42d7ff"></label><label class="tn-os-label">Wallpaper<select id="osWallpaper"><option value="nebula">Nebula</option><option value="grid">Grid</option><option value="ocean">Ocean</option><option value="plain">Plain</option></select></label><label class="tn-os-label"><input id="osReduceMotion" type="checkbox"> Reduce motion</label><button id="osApply" class="tn-button tn-primary">Apply appearance</button></section><section class="tn-card"><h3>Cloud synchronisation</h3><p class="tn-muted">Optional sync for supported text and workspace data. Files use the existing private user-files bucket.</p><label class="tn-os-label"><input id="osCloudEnabled" type="checkbox"> Enable cloud autosave</label><button id="osCloudUpload" class="tn-button">Upload local workspace</button><button id="osCloudRestore" class="tn-button">Restore from cloud</button><span id="osCloudStatus" class="tn-muted" role="status">Cloud sync is optional.</span></section><section class="tn-card"><h3>Privacy & backup</h3><p class="tn-muted">Export or restore supported local workspace records. Keep backup files somewhere private.</p><button id="osBackup" class="tn-button">Export workspace backup</button><label class="tn-button">Import workspace backup<input id="osRestore" type="file" accept="application/json" hidden></label><button id="osClearLocal" class="tn-button tn-danger">Clear expansion data</button><span id="osPrivacyStatus" class="tn-muted" role="status"></span></section><section class="tn-card"><h3>About this desktop</h3><p>TechNova OS Expansion · browser-based applications</p><p class="tn-muted">Cloud sync uses the signed-in TechNova account and Row Level Security. No service-role credentials are sent to the browser.</p></section></div>','SYSTEM');
 appWindow('media','Media Centre',intro('YOUR LOCAL LIBRARY','Media Centre','Play audio and video files selected from your device. Files stay in this browser unless you export them.')+'<div class="tn-os-toolbar"><label class="tn-button tn-primary">＋ Add media<input id="mediaImport" type="file" accept="audio/*,video/*" multiple hidden></label><button class="tn-button" id="mediaClear">Clear library</button></div><div class="tn-media-layout"><div id="mediaList" class="tn-os-list"></div><section class="tn-card"><div id="mediaNow" class="tn-muted">Choose a media item to play it.</div><audio id="mediaAudio" controls hidden></audio><video id="mediaVideo" controls playsinline hidden></video></section></div><p class="tn-muted">Playback depends on the formats supported by your browser. DRM-protected streaming services are not supported.</p>','MEDIA');
 appWindow('website','Website Designer',intro('DESIGN WITHOUT STARTING FROM SCRATCH','Website Designer','Build a simple responsive page from editable sections, preview it and download the HTML.')+'<div class="tn-os-toolbar"><input id="siteTitle" maxlength="80" placeholder="Website title" value="My website"><input id="siteSubtitle" maxlength="180" placeholder="Short introduction"><input id="siteAccent" type="color" value="#42d7ff"><button class="tn-button tn-primary" id="siteAddSection">＋ Add section</button><button class="tn-button" id="sitePreview">Preview</button><button class="tn-button" id="siteDownload">Download HTML</button></div><div id="siteSections" class="tn-os-list"></div><iframe id="sitePreviewFrame" class="tn-site-preview" title="Website preview" sandbox="allow-scripts"></iframe><p class="tn-muted">The builder exports a standalone static HTML page. It does not publish or host websites.</p>','CREATE');
 appWindow('mail','Mail Centre',intro('MESSAGE WORKSPACE','Mail Centre','Prepare and organise drafts. This version does not connect to an inbox; sending opens your configured email application.')+'<div class="tn-mail-layout"><aside><button id="mailNew" class="tn-button tn-primary">＋ New draft</button><div id="mailDrafts" class="tn-os-list"></div></aside><section class="tn-card"><label class="tn-os-label">To<input id="mailTo" type="email" placeholder="recipient@example.com"></label><label class="tn-os-label">Subject<input id="mailSubject" maxlength="180" placeholder="Subject"></label><label class="tn-os-label">Message<textarea id="mailBody" rows="10" placeholder="Write your message…"></textarea></label><div class="tn-os-toolbar"><button id="mailSave" class="tn-button tn-primary">Save draft</button><button id="mailOpen" class="tn-button">Open in email app</button><button id="mailDelete" class="tn-button tn-danger">Delete draft</button></div><span id="mailStatus" class="tn-muted" role="status"></span></section></div>','WORK');
 appWindow('storage2','Storage Manager 2.0',intro('LOCAL AND PRIVATE CLOUD FILES','Storage Manager 2.0','Organise files stored in this browser and your existing private TechNova cloud bucket.')+'<div class="tn-os-toolbar"><label class="tn-button tn-primary">＋ Import local files<input id="storageImport" type="file" multiple hidden></label><button class="tn-button" id="storageRefresh">↻ Refresh cloud</button><input id="storageSearch" type="search" placeholder="Search files…"></div><div class="tn-os-grid"><section class="tn-card"><h3>Local library</h3><div id="storageLocal" class="tn-os-list"></div></section><section class="tn-card"><h3>Private TechNova cloud</h3><div id="storageCloud" class="tn-os-list"></div></section></div><p id="storageStatus" class="tn-muted" role="status">Local files are kept in IndexedDB. Cloud files use the existing private user-files bucket.</p>','SYSTEM');
}
function loadDb(name,store){return new Promise((resolve,reject)=>{const req=indexedDB.open(name,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(store))req.result.createObjectStore(store,{keyPath:'id'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function dbReq(db,store,mode,fn){return new Promise((resolve,reject)=>{const tx=db.transaction(store,mode),s=tx.objectStore(store);let req;try{req=fn(s)}catch(e){reject(e);return}req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function download(name,content,type){const blob=new Blob([content],{type:type||'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200)}
function setStatus(id,message){const node=$(id);if(node)node.textContent=message}
function appState(key,def){return read(key,def)}
function saveState(key,value,appKey){if(!write(key,value))return false;if(appKey)cloudAutosave(appKey,value);return true}
function cloudClient(){return window.supabaseClient||null}
async function cloudAutosave(appKey,payload){
 if(!read(STORE.cloud,false))return;
 const sb=cloudClient();if(!sb)return;
 try{const auth=await sb.auth.getUser();if(!auth.data.user)return;
  const result=await sb.from('desktop_sync_records').upsert({user_id:auth.data.user.id,app_key:appKey,record_key:'workspace',payload,updated_at:new Date().toISOString()},{onConflict:'user_id,app_key,record_key'});
  if(result.error)throw result.error;
 }catch(e){console.warn('TechNova cloud autosave unavailable:',e.message)}
}
const cloudKeys=[
 ['workspaces',STORE.workspaces],['whiteboard',STORE.whiteboard],['documents',STORE.documents],
 ['spreadsheets',STORE.spreadsheets],['api',STORE.api],['widgets',STORE.widgets],['website',STORE.website],['mail',STORE.mail]
];
async function cloudTransfer(mode){
 const sb=cloudClient();if(!sb)throw new Error('Supabase client is unavailable.');
 const auth=await sb.auth.getUser();if(auth.error)throw auth.error;if(!auth.data.user)throw new Error('Please sign in again.');
 if(mode==='upload'){
  for(const [appKey,key] of cloudKeys){const payload=read(key,null);if(payload===null)continue;const r=await sb.from('desktop_sync_records').upsert({user_id:auth.data.user.id,app_key:appKey,record_key:'workspace',payload,updated_at:new Date().toISOString()},{onConflict:'user_id,app_key,record_key'});if(r.error)throw r.error}
  return 'Local workspace uploaded to your TechNova account.';
 }
 const r=await sb.from('desktop_sync_records').select('app_key,payload').eq('user_id',auth.data.user.id);
 if(r.error)throw r.error;
 (r.data||[]).forEach(row=>{const entry=cloudKeys.find(x=>x[0]===row.app_key);if(entry&&row.payload!==null)localStorage.setItem(entry[1],JSON.stringify(row.payload))});
 renderAll();return 'Cloud workspace restored. Local records for supported apps were replaced by the saved cloud copies.';
}
function renderAll(){renderWorkspaces();renderWhiteboard();renderDocuments();renderSheet();renderApiSaved();renderWidgets();renderMedia();renderMail();renderStorageLocal();refreshStorageCloud()}
function onOpen(id){
 const win=windows[id];if(win){win.dataset.workspace=currentWorkspace;win.hidden=false;win.style.left=(18+(apps.findIndex(a=>a[0]===id)%6)*24)+'px';win.style.top=(12+(apps.findIndex(a=>a[0]===id)%5)*18)+'px'}
 const render={workspaces:renderWorkspaces,whiteboard:renderWhiteboard,documents:renderDocuments,spreadsheets:renderSheet,api:renderApiSaved,widgets:renderWidgets,control:loadControl,media:renderMedia,website:renderWebsite,mail:renderMail,storage2:renderStorageLocal};
 if(render[id])render[id]();
}
function getWorkspaces(){let a=appState(STORE.workspaces,null);if(!Array.isArray(a)||!a.length){a=[{id:'main',name:'Main',created:Date.now()}];write(STORE.workspaces,a)}return a}
function renderWorkspaces(){
 const box=$('wsList');if(!box)return;box.replaceChildren();
 getWorkspaces().forEach(w=>{const card=document.createElement('article');card.className='tn-card tn-workspace-card';const h=document.createElement('h3');h.textContent=w.name;const p=document.createElement('p');p.textContent=(w.id===currentWorkspace?'Current workspace':'Workspace')+' · '+[...document.querySelectorAll('.tn-window:not([data-window="home"])')].filter(x=>!x.hidden&&x.dataset.workspace===w.id).length+' open windows';const row=document.createElement('div');row.className='tn-os-toolbar';const use=document.createElement('button');use.className='tn-button tn-primary';use.textContent=w.id===currentWorkspace?'Current':'Switch to';use.disabled=w.id===currentWorkspace;use.onclick=()=>switchWorkspace(w.id);const rename=document.createElement('button');rename.className='tn-button';rename.textContent='Rename';rename.onclick=()=>{const value=prompt('Workspace name',w.name);if(value&&text(value,40)){w.name=text(value,40);saveState(STORE.workspaces,getWorkspaces(),'workspaces');renderWorkspaces()}};row.append(use,rename);if(w.id!=='main'){const del=document.createElement('button');del.className='tn-button tn-danger';del.textContent='Delete';del.onclick=()=>{if(!confirm('Delete this workspace? Its windows will move to Main.'))return;document.querySelectorAll('.tn-window[data-workspace="'+w.id+'"]').forEach(x=>x.dataset.workspace='main');saveState(STORE.workspaces,getWorkspaces().filter(x=>x.id!==w.id),'workspaces');if(currentWorkspace===w.id)switchWorkspace('main');renderWorkspaces()};row.append(del)}card.append(h,p,row);box.append(card)});
}
function switchWorkspace(next){
 if(!getWorkspaces().some(w=>w.id===next))return;currentWorkspace=next;
 document.querySelectorAll('.tn-window:not([data-window="home"])').forEach(w=>w.hidden=w.dataset.workspace!==next);
 const home=document.querySelector('[data-window="home"]');if(home){const hasVisible=[...document.querySelectorAll('.tn-window:not([data-window="home"])')].some(w=>!w.hidden);home.hidden=hasVisible;}
 setStatus('wsStatus','Switched workspace.');renderWorkspaces();
}
function setupWorkspaces(){
 $('wsCreate').onclick=()=>{const name=text(prompt('Name your new desktop','New workspace'),40);if(!name)return;const list=getWorkspaces();const item={id:id(),name,created:Date.now()};list.push(item);saveState(STORE.workspaces,list,'workspaces');switchWorkspace(item.id)};
 document.addEventListener('keydown',e=>{if(e.altKey&&e.ctrlKey&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const list=getWorkspaces(),i=list.findIndex(w=>w.id===currentWorkspace),next=list[(i+(e.key==='ArrowRight'?1:list.length-1))%list.length];switchWorkspace(next.id)}});
}
function drawBoard(){
 const canvas=$('wbCanvas'),ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#0a1726';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#29415b';ctx.lineWidth=1;for(let x=0;x<canvas.width;x+=35){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke()}for(let y=0;y<canvas.height;y+=35){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke()}
 const state=appState(STORE.whiteboard,{title:'My board',strokes:[],notes:[]});ctx.lineCap='round';ctx.lineJoin='round';(state.strokes||[]).forEach(st=>{ctx.strokeStyle=st.color||'#42d7ff';ctx.lineWidth=st.width||3;ctx.beginPath();(st.points||[]).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke()});
 $('wbTitle').value=state.title||'My board';const box=$('wbNotes');box.replaceChildren();(state.notes||[]).forEach(note=>{const n=document.createElement('div');n.className='tn-sticky-note';n.style.left=note.x+'px';n.style.top=note.y+'px';n.style.background=note.color||'#ffe58a';const area=document.createElement('textarea');area.value=note.text||'';area.setAttribute('aria-label','Sticky note');area.onchange=()=>{note.text=area.value;saveState(STORE.whiteboard,state,'whiteboard')};const del=document.createElement('button');del.textContent='×';del.setAttribute('aria-label','Delete sticky note');del.onclick=()=>{state.notes=state.notes.filter(x=>x.id!==note.id);saveState(STORE.whiteboard,state,'whiteboard');renderWhiteboard()};n.append(del,area);box.append(n)});
}
function renderWhiteboard(){if(!$('wbCanvas'))return;drawBoard()}
function setupWhiteboard(){
 const canvas=$('wbCanvas'),ctx=canvas.getContext('2d');let drawing=false,stroke=null,boardState=null;
 const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
 canvas.addEventListener('pointerdown',e=>{drawing=true;canvas.setPointerCapture(e.pointerId);stroke={color:'#6ce3ff',width:4,points:[point(e)]};boardState=appState(STORE.whiteboard,{title:'My board',strokes:[],notes:[]});boardState.strokes.push(stroke);});
 canvas.addEventListener('pointermove',e=>{if(!drawing)return;const p=point(e);stroke.points.push(p);ctx.strokeStyle=stroke.color;ctx.lineWidth=stroke.width;ctx.lineCap='round';const a=stroke.points;ctx.beginPath();ctx.moveTo(a[a.length-2].x,a[a.length-2].y);ctx.lineTo(p.x,p.y);ctx.stroke()});
 const stop=()=>{if(drawing){drawing=false;if(boardState)saveState(STORE.whiteboard,boardState,'whiteboard');drawBoard()}};canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);
 $('wbSave').onclick=()=>{const state=appState(STORE.whiteboard,{title:'My board',strokes:[],notes:[]});state.title=text($('wbTitle').value,80)||'My board';saveState(STORE.whiteboard,state,'whiteboard');setStatus('wbStatus','Board saved locally.')};
 $('wbAddNote').onclick=()=>{const state=appState(STORE.whiteboard,{title:'My board',strokes:[],notes:[]});state.notes.push({id:id(),text:'New idea…',x:40+(state.notes.length%4)*230,y:40+Math.floor(state.notes.length/4)*150,color:['#ffe58a','#b8f2d0','#c9d4ff'][state.notes.length%3]});saveState(STORE.whiteboard,state,'whiteboard');renderWhiteboard()};
 $('wbClear').onclick=()=>{if(!confirm('Clear this board?'))return;saveState(STORE.whiteboard,{title:text($('wbTitle').value,80)||'My board',strokes:[],notes:[]},'whiteboard');renderWhiteboard()};
 $('wbExport').onclick=()=>{const a=document.createElement('a');a.download='technova-whiteboard.png';a.href=canvas.toDataURL('image/png');a.click()};
}
let currentDoc='';
function getDocs(){return appState(STORE.documents,[])}
function renderDocuments(){
 const docs=getDocs(),list=$('docList');if(!list)return;list.replaceChildren();docs.forEach(d=>{const b=document.createElement('button');b.className='tn-os-list-item';b.textContent=d.title||'Untitled document';b.onclick=()=>loadDoc(d.id);list.append(b)});if(!currentDoc&&docs.length)loadDoc(docs[0].id)
}
function loadDoc(docId){const d=getDocs().find(x=>x.id===docId);if(!d)return;currentDoc=docId;$('docTitle').value=d.title;$('docEditor').innerHTML=sanitizeHtml(d.html||'');}
function sanitizeHtml(html){
 const doc=new DOMParser().parseFromString(String(html||''),'text/html'),allowed=new Set(['P','BR','B','STRONG','I','EM','U','UL','OL','LI','H1','H2','H3','BLOCKQUOTE','A']);
 const clean=node=>{[...node.childNodes].forEach(child=>{if(child.nodeType===1){if(!allowed.has(child.tagName)){clean(child);child.replaceWith(...child.childNodes);return}const href=child.tagName==='A'?child.getAttribute('href'):null;[...child.attributes].forEach(a=>child.removeAttribute(a.name));if(href&&/^(https?:|mailto:)/i.test(href))child.setAttribute('href',href);clean(child)}else if(child.nodeType!==3)child.remove()})};clean(doc.body);return doc.body.innerHTML;
}
function setupDocuments(){
 $('docNew').onclick=()=>{currentDoc='';$('docTitle').value='';$('docEditor').textContent='';$('docEditor').focus()};
 document.querySelectorAll('[data-doc-cmd]').forEach(b=>b.onclick=()=>{ $('docEditor').focus();document.execCommand(b.dataset.docCmd,false,null)});
 $('docFormat').onchange=()=>{ $('docEditor').focus();document.execCommand('formatBlock',false,$('docFormat').value)};
 $('docSave').onclick=()=>{const docs=getDocs(),d={id:currentDoc||id(),title:text($('docTitle').value,120)||'Untitled document',html:sanitizeHtml($('docEditor').innerHTML),updated:Date.now()};const i=docs.findIndex(x=>x.id===d.id);if(i<0)docs.unshift(d);else docs[i]=d;currentDoc=d.id;saveState(STORE.documents,docs,'documents');renderDocuments();setStatus('docStatus','Saved locally'+(read(STORE.cloud,false)?' · cloud sync queued':'')+'.')};
 $('docPrint').onclick=()=>{const w=window.open('','_blank');if(!w)return setStatus('docStatus','Allow pop-ups to print this document.');w.document.write('<!doctype html><meta charset="utf-8"><title>'+esc($('docTitle').value)+'</title><style>body{font:16px/1.6 system-ui;max-width:850px;margin:40px auto;padding:0 20px}</style>'+sanitizeHtml($('docEditor').innerHTML));w.document.close();w.print()};
 $('docHtml').onclick=()=>download((text($('docTitle').value,80)||'document')+'.html','<!doctype html><meta charset="utf-8"><title>'+esc($('docTitle').value)+'</title>'+sanitizeHtml($('docEditor').innerHTML),'text/html');
 $('docTxt').onclick=()=>download((text($('docTitle').value,80)||'document')+'.txt',$('docEditor').innerText);
}
function getSheet(){return appState(STORE.spreadsheets,{title:'My spreadsheet',rows:12,cols:8,cells:{}})}
function cellRef(r,c){let s='';for(c++;c;c=Math.floor((c-1)/26))s=String.fromCharCode(65+(c-1)%26)+s;return s+(r+1)}
function parseRef(ref){const m=/^([A-Z]+)([1-9]\d*)$/i.exec(ref);if(!m)return null;let c=0;for(const ch of m[1].toUpperCase())c=c*26+ch.charCodeAt(0)-64;return{r:Number(m[2])-1,c:c-1}}
function evalFormula(expr,cells,depth=0){
 if(depth>8)throw new Error('Formula nesting is too deep.');
 expr=String(expr).trim().replace(/^=/,'');
 const fn=/^(SUM|AVERAGE|MIN|MAX)\(([A-Z]+\d+):([A-Z]+\d+)\)$/i.exec(expr);
 if(fn){const a=parseRef(fn[2]),b=parseRef(fn[3]);if(!a||!b)throw new Error('Invalid cell range.');const vals=[];for(let r=Math.min(a.r,b.r);r<=Math.max(a.r,b.r);r++)for(let c=Math.min(a.c,b.c);c<=Math.max(a.c,b.c);c++){const v=Number(resolveCell(cells,cellRef(r,c),depth+1));if(Number.isFinite(v))vals.push(v)}if(!vals.length)return 0;const kind=fn[1].toUpperCase();return kind==='SUM'?vals.reduce((x,y)=>x+y,0):kind==='AVERAGE'?vals.reduce((x,y)=>x+y,0)/vals.length:kind==='MIN'?Math.min(...vals):Math.max(...vals)}
 const tokens=expr.match(/[A-Z]+\d+|\d+(?:\.\d+)?|[()+*/-]/gi);if(!tokens||tokens.join('')!==expr.replace(/\s+/g,''))throw new Error('Use cell references, numbers and + − × ÷, or a supported range function.');
 let pos=0;function primary(){const t=tokens[pos++];if(t==='('){const v=add();if(tokens[pos++]!==')')throw new Error('Missing closing bracket.');return v}if(t==='-')return-primary();if(/^[A-Z]+\d+$/i.test(t))return Number(resolveCell(cells,t,depth+1))||0;const n=Number(t);if(!Number.isFinite(n))throw new Error('Invalid formula.');return n}
 function mul(){let v=primary();while(tokens[pos]==='*'||tokens[pos]==='/'){const op=tokens[pos++],n=primary();v=op==='*'?v*n:v/n}return v}
 function add(){let v=mul();while(tokens[pos]==='+'||tokens[pos]==='-'){const op=tokens[pos++],n=mul();v=op==='+'?v+n:v-n}return v}
 const result=add();if(pos!==tokens.length||!Number.isFinite(result))throw new Error('Formula could not be calculated.');return result;
}
function resolveCell(cells,ref,depth=0){const raw=cells[ref]??'';if(String(raw).startsWith('='))return evalFormula(raw,cells,depth+1);return raw}
function safeResolveCell(cells,ref){try{return resolveCell(cells,ref)}catch{return '#ERROR'}}
function renderSheet(){
 const grid=$('sheetGrid');if(!grid)return;const s=getSheet();$('sheetTitle').value=s.title||'My spreadsheet';grid.replaceChildren();const table=document.createElement('table');table.className='tn-sheet';const head=document.createElement('tr');head.append(document.createElement('th'));for(let c=0;c<s.cols;c++){const th=document.createElement('th');th.textContent=cellRef(0,c).replace(/\d/g,'');head.append(th)}table.append(head);
 for(let r=0;r<s.rows;r++){const tr=document.createElement('tr'),th=document.createElement('th');th.textContent=String(r+1);tr.append(th);for(let c=0;c<s.cols;c++){const ref=cellRef(r,c),td=document.createElement('td'),input=document.createElement('input');input.value=s.cells[ref]??'';input.dataset.cell=ref;input.setAttribute('aria-label',ref);input.onfocus=()=>{$('sheetCellLabel').textContent=ref;$('sheetFormula').value=input.value};input.onchange=()=>{s.cells[ref]=input.value;saveState(STORE.spreadsheets,s,'spreadsheets');renderSheet()};input.title=String(safeResolveCell(s.cells,ref));td.append(input);tr.append(td)}table.append(tr)}grid.append(table);
}
function setupSheet(){
 $('sheetApply').onclick=()=>{const s=getSheet(),ref=$('sheetCellLabel').textContent;s.cells[ref]=$('sheetFormula').value;saveState(STORE.spreadsheets,s,'spreadsheets');renderSheet()};
 $('sheetSave').onclick=()=>{const s=getSheet();s.title=text($('sheetTitle').value,80)||'My spreadsheet';saveState(STORE.spreadsheets,s,'spreadsheets');setStatus('sheetStatus','Saved locally.')};
 $('sheetAddRow').onclick=()=>{const s=getSheet();if(s.rows<100)s.rows++;saveState(STORE.spreadsheets,s,'spreadsheets');renderSheet()};
 $('sheetAddCol').onclick=()=>{const s=getSheet();if(s.cols<26)s.cols++;saveState(STORE.spreadsheets,s,'spreadsheets');renderSheet()};
 $('sheetCsv').onclick=()=>{const s=getSheet(),rows=[];for(let r=0;r<s.rows;r++){const row=[];for(let c=0;c<s.cols;c++){const v=String(safeResolveCell(s.cells,cellRef(r,c)));row.push('"'+v.replace(/"/g,'""')+'"')}rows.push(row.join(','))}download((s.title||'spreadsheet')+'.csv',rows.join('\r\n'),'text/csv')};
}
function getApi(){return appState(STORE.api,[])}
function renderApiSaved(){
 const box=$('apiSaved');if(!box)return;box.replaceChildren();getApi().forEach(item=>{const b=document.createElement('button');b.className='tn-os-list-item';b.textContent=item.name+' · '+item.method+' '+item.url;b.onclick=()=>{$('apiMethod').value=item.method;$('apiUrl').value=item.url;$('apiHeaders').value=item.headers||'{}';$('apiBody').value=item.body||''};box.append(b)});
}
function setupApi(){
 $('apiForm').onsubmit=async e=>{e.preventDefault();const url=$('apiUrl').value.trim();let parsed;try{parsed=new URL(url)}catch{return setStatus('apiStatus','Enter a valid URL.')};if(!['http:','https:'].includes(parsed.protocol))return setStatus('apiStatus','Only HTTP and HTTPS requests are supported.');let headers;try{headers=JSON.parse($('apiHeaders').value||'{}');if(!headers||Array.isArray(headers)||typeof headers!=='object')throw 0}catch{return setStatus('apiStatus','Headers must be a JSON object.')};const method=$('apiMethod').value,body=$('apiBody').value;setStatus('apiStatus','Sending request…');$('apiResponse').textContent='';const start=performance.now();try{const response=await fetch(url,{method,headers,body:['GET','HEAD'].includes(method)?undefined:body||undefined,mode:'cors',credentials:'omit',redirect:'follow'});const content=await response.text();let output=content;try{output=JSON.stringify(JSON.parse(content),null,2)}catch{}$('apiResponse').textContent=output.slice(0,200000);setStatus('apiStatus','HTTP '+response.status+' '+response.statusText+' · '+Math.round(performance.now()-start)+' ms · '+content.length+' characters')}catch(err){setStatus('apiStatus','Request failed: '+err.message+' · The API may block browser CORS requests.')}};
 $('apiSave').onclick=()=>{const list=getApi();list.unshift({id:id(),name:text($('apiRequestName').value,80)||'Saved request',method:$('apiMethod').value,url:$('apiUrl').value,headers:$('apiHeaders').value,body:$('apiBody').value});saveState(STORE.api,list.slice(0,100),'api');renderApiSaved()};
}
function renderWidgets(){
 const board=$('widgetBoard');if(!board)return;const state=appState(STORE.widgets,{order:['clock','calendar','tasks','notes'],hidden:[]}),defs=[['clock','Clock','Current local time'],['calendar','Calendar','Today and upcoming reminders'],['tasks','Tasks','Your existing task list'],['notes','Quick note','A small scratchpad']];board.replaceChildren();
 defs.filter(d=>!state.hidden.includes(d[0])).sort((a,b)=>state.order.indexOf(a[0])-state.order.indexOf(b[0])).forEach(d=>{const card=document.createElement('article');card.className='tn-card tn-widget';card.draggable=true;card.dataset.widget=d[0];const head=document.createElement('div');head.className='tn-widget-head';const title=document.createElement('strong');title.textContent=d[1];const hide=document.createElement('button');hide.className='tn-button';hide.textContent='Hide';hide.onclick=()=>{state.hidden.push(d[0]);saveState(STORE.widgets,state,'widgets');renderWidgets()};head.append(title,hide);card.append(head);
  const content=document.createElement('div');content.className='tn-widget-body';
  if(d[0]==='clock'){content.textContent=new Date().toLocaleString(undefined,{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}
  if(d[0]==='calendar'){const events=read('technova.dashboard.calendar.v1',[]).filter(x=>x.date>=new Date().toISOString().slice(0,10)).slice(0,3);content.textContent=events.length?events.map(x=>x.title+' · '+x.date).join('\n'):'No upcoming reminders.'}
  if(d[0]==='tasks'){const tasks=read('technova.dashboard.tasks.v1',[]);content.textContent=Array.isArray(tasks)?tasks.filter(x=>!x.completed&&x.status!=='done').slice(0,4).map(x=>x.title||x.text||'Task').join('\n')||'No open tasks.':'Task list unavailable.'}
  if(d[0]==='notes'){const area=document.createElement('textarea');area.placeholder='Quick note…';area.value=read(PREFIX+'widget-note.v1','');area.onchange=()=>write(PREFIX+'widget-note.v1',area.value);content.append(area)}
  card.append(content);card.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',d[0]));card.addEventListener('dragover',e=>e.preventDefault());card.addEventListener('drop',e=>{e.preventDefault();const moving=e.dataTransfer.getData('text/plain');const order=state.order.filter(x=>x!==moving);order.splice(Math.max(0,order.indexOf(d[0])),0,moving);state.order=order;saveState(STORE.widgets,state,'widgets');renderWidgets()});board.append(card)
 });
}
function setupWidgets(){$('widgetReset').onclick=()=>{saveState(STORE.widgets,{order:['clock','calendar','tasks','notes'],hidden:[]},'widgets');renderWidgets()}}
function loadControl(){
 const settings=read('technova.desktop.settings.v1',{theme:'midnight',accent:'#42d7ff',wallpaper:'nebula',density:'comfortable',reduceMotion:false});
 $('osTheme').value=settings.theme||'midnight';$('osAccent').value=settings.accent||'#42d7ff';$('osWallpaper').value=settings.wallpaper||'nebula';$('osReduceMotion').checked=!!settings.reduceMotion;$('osCloudEnabled').checked=!!read(STORE.cloud,false);
}
function setupControl(){
 $('osApply').onclick=()=>{$('settingTheme').value=$('osTheme').value;$('settingAccent').value=$('osAccent').value;$('settingWallpaper').value=$('osWallpaper').value;$('settingReduceMotion').checked=$('osReduceMotion').checked;$('settingsApply').click();setStatus('osPrivacyStatus','Appearance settings applied.')};
 $('osCloudEnabled').onchange=e=>{write(STORE.cloud,e.target.checked);setStatus('osCloudStatus',e.target.checked?'Cloud autosave enabled. The desktop_sync_records migration must be applied before cloud sync can work.':'Cloud autosave disabled.')};
 $('osCloudUpload').onclick=async()=>{setStatus('osCloudStatus','Uploading…');try{setStatus('osCloudStatus',await cloudTransfer('upload'))}catch(e){setStatus('osCloudStatus','Cloud upload unavailable: '+e.message)}};
 $('osCloudRestore').onclick=async()=>{if(!confirm('Restore cloud copies over local copies for supported applications?'))return;setStatus('osCloudStatus','Restoring…');try{setStatus('osCloudStatus',await cloudTransfer('restore'))}catch(e){setStatus('osCloudStatus','Cloud restore unavailable: '+e.message)}};
 $('osBackup').onclick=()=>{const data={version:1,created_at:new Date().toISOString(),records:cloudKeys.map(([app,key])=>({app,payload:read(key,null)})).filter(x=>x.payload!==null)};download('technova-os-backup.json',JSON.stringify(data,null,2),'application/json')};
 $('osRestore').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());if(data.version!==1||!Array.isArray(data.records))throw new Error('Unsupported backup format.');data.records.forEach(x=>{const entry=cloudKeys.find(y=>y[0]===x.app);if(entry)localStorage.setItem(entry[1],JSON.stringify(x.payload))});renderAll();setStatus('osPrivacyStatus','Backup restored.')}catch(err){setStatus('osPrivacyStatus','Could not restore backup: '+err.message)}e.target.value=''};
 $('osClearLocal').onclick=async()=>{if(!confirm('Clear TechNova OS Expansion local records and its local media/file libraries from this browser? Existing Desktop projects and notes will remain.'))return;Object.values(STORE).forEach(k=>localStorage.removeItem(k));try{if(!mediaDb)mediaDb=await loadDb('technova-os-media','items');if(!storageDb)storageDb=await loadDb('technova-os-storage','items');await dbReq(mediaDb,'items','readwrite',s=>s.clear());await dbReq(storageDb,'items','readwrite',s=>s.clear())}catch(e){console.warn('Could not clear an IndexedDB library',e)}renderAll();setStatus('osPrivacyStatus','Expansion data cleared from this browser.')};
}
async function renderMedia(){
 const list=$('mediaList');if(!list)return;list.replaceChildren();try{if(!mediaDb)mediaDb=await loadDb('technova-os-media','items');const all=await dbReq(mediaDb,'items','readonly',s=>s.getAll());all.sort((a,b)=>b.added-a.added).forEach(item=>{const b=document.createElement('button');b.className='tn-os-list-item';b.textContent=(item.type.startsWith('video/')?'🎬 ':'♫ ')+item.name+' · '+fmtBytes(item.size);b.onclick=()=>playMedia(item);list.append(b)});if(!all.length)list.textContent='Your media library is empty.'}catch(e){list.textContent='Media library unavailable: '+e.message}
}
async function playMedia(item){if(mediaUrl)URL.revokeObjectURL(mediaUrl);mediaUrl=URL.createObjectURL(item.blob);$('mediaNow').textContent=item.name;const video=item.type.startsWith('video/');$('mediaVideo').hidden=!video;$('mediaAudio').hidden=video;const player=video?$('mediaVideo'):$('mediaAudio');player.src=mediaUrl;player.load();player.play().catch(()=>{})}
function setupMedia(){
 $('mediaImport').onchange=async e=>{if(!mediaDb)mediaDb=await loadDb('technova-os-media','items');for(const f of e.target.files)await dbReq(mediaDb,'items','readwrite',s=>s.put({id:id(),name:f.name,type:f.type||'application/octet-stream',size:f.size,added:Date.now(),blob:f}));e.target.value='';renderMedia()};
 $('mediaClear').onclick=async()=>{if(!confirm('Remove all local media from this library?'))return;if(!mediaDb)mediaDb=await loadDb('technova-os-media','items');await dbReq(mediaDb,'items','readwrite',s=>s.clear());renderMedia()};
}
function getWebsite(){return appState(STORE.website,{title:'My website',subtitle:'A simple introduction',accent:'#42d7ff',sections:[]})}
function renderWebsite(){
 const box=$('siteSections');if(!box)return;const state=getWebsite();$('siteTitle').value=state.title||'My website';$('siteSubtitle').value=state.subtitle||'';$('siteAccent').value=state.accent||'#42d7ff';box.replaceChildren();(state.sections||[]).forEach((section,i)=>{const card=document.createElement('article');card.className='tn-card tn-site-section';const h=document.createElement('strong');h.textContent='Section '+(i+1);const title=document.createElement('input');title.maxLength=100;title.value=section.title||'';title.placeholder='Section heading';const body=document.createElement('textarea');body.maxLength=3000;body.value=section.body||'';body.placeholder='Section text';const remove=document.createElement('button');remove.className='tn-button tn-danger';remove.textContent='Remove';remove.onclick=()=>{state.sections.splice(i,1);saveState(STORE.website,state,'website');renderWebsite()};[title,body].forEach(x=>x.onchange=()=>{section.title=title.value;section.body=body.value;saveState(STORE.website,state,'website')});card.append(h,title,body,remove);box.append(card)});
}
function buildSiteHtml(){
 const s=getWebsite();s.title=text($('siteTitle').value,80)||'My website';s.subtitle=text($('siteSubtitle').value,180);s.accent=$('siteAccent').value;saveState(STORE.website,s,'website');
 return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(s.title)+'</title><style>*{box-sizing:border-box}body{margin:0;font:16px/1.6 system-ui;color:#14243a;background:#f4f8fc}header{padding:70px 8vw;background:#0b1c30;color:white;border-bottom:5px solid '+s.accent+'}main{max-width:900px;margin:35px auto;padding:0 20px}section{padding:24px;margin:18px 0;background:white;border-radius:16px;box-shadow:0 8px 28px #10243a12}h1{font-size:clamp(36px,7vw,64px);margin:0}h2{color:'+s.accent+'}</style><header><h1>'+esc(s.title)+'</h1><p>'+esc(s.subtitle)+'</p></header><main>'+(s.sections||[]).map(x=>'<section><h2>'+esc(x.title)+'</h2><p>'+esc(x.body).replace(/\n/g,'<br>')+'</p></section>').join('')+'</main></html>';
}
function setupWebsite(){
 $('siteAddSection').onclick=()=>{const s=getWebsite();s.sections.push({id:id(),title:'New section',body:'Add your content here.'});saveState(STORE.website,s,'website');renderWebsite()};
 $('sitePreview').onclick=()=>{$('sitePreviewFrame').srcdoc=buildSiteHtml()};
 $('siteDownload').onclick=()=>download((text($('siteTitle').value,60)||'website').toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.html',buildSiteHtml(),'text/html');
}
let selectedDraft='';
function getDrafts(){return appState(STORE.mail,[])}
function renderMail(){const box=$('mailDrafts');if(!box)return;box.replaceChildren();getDrafts().forEach(d=>{const b=document.createElement('button');b.className='tn-os-list-item';b.textContent=(d.subject||'No subject')+' · '+(d.to||'No recipient');b.onclick=()=>{selectedDraft=d.id;$('mailTo').value=d.to||'';$('mailSubject').value=d.subject||'';$('mailBody').value=d.body||''};box.append(b)})}
function setupMail(){
 $('mailNew').onclick=()=>{selectedDraft='';$('mailTo').value='';$('mailSubject').value='';$('mailBody').value=''};
 $('mailSave').onclick=()=>{const drafts=getDrafts(),d={id:selectedDraft||id(),to:text($('mailTo').value,254),subject:text($('mailSubject').value,180),body:String($('mailBody').value||'').slice(0,20000),updated:Date.now()};const i=drafts.findIndex(x=>x.id===d.id);if(i<0)drafts.unshift(d);else drafts[i]=d;selectedDraft=d.id;saveState(STORE.mail,drafts,'mail');renderMail();setStatus('mailStatus','Draft saved locally.')};
 $('mailOpen').onclick=()=>{const to=encodeURIComponent($('mailTo').value),subject=encodeURIComponent($('mailSubject').value),body=encodeURIComponent($('mailBody').value);location.href='mailto:'+to+'?subject='+subject+'&body='+body};
 $('mailDelete').onclick=()=>{if(!selectedDraft)return;saveState(STORE.mail,getDrafts().filter(x=>x.id!==selectedDraft),'mail');selectedDraft='';$('mailTo').value='';$('mailSubject').value='';$('mailBody').value='';renderMail();setStatus('mailStatus','Draft deleted.')};
}
async function renderStorageLocal(){
 const box=$('storageLocal');if(!box)return;box.replaceChildren();try{if(!storageDb)storageDb=await loadDb('technova-os-storage','items');const all=await dbReq(storageDb,'items','readonly',s=>s.getAll());all.sort((a,b)=>b.added-a.added).forEach(f=>{const row=document.createElement('div');row.className='tn-os-list-item';const name=document.createElement('span');name.textContent=f.name+' · '+fmtBytes(f.size);const actions=document.createElement('div');const dl=document.createElement('button');dl.className='tn-button';dl.textContent='Download';dl.onclick=()=>downloadBlob(f.blob,f.name);const cloud=document.createElement('button');cloud.className='tn-button';cloud.textContent='Upload to cloud';cloud.onclick=()=>uploadCloudFile(f);const del=document.createElement('button');del.className='tn-button tn-danger';del.textContent='Delete';del.onclick=async()=>{await dbReq(storageDb,'items','readwrite',s=>s.delete(f.id));renderStorageLocal()};actions.append(dl,cloud,del);row.append(name,actions);box.append(row)});if(!all.length)box.textContent='No local files yet.'}catch(e){box.textContent='Local storage unavailable: '+e.message}
}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function uploadCloudFile(file){
 const sb=cloudClient();if(!sb)return setStatus('storageStatus','Supabase is not available.');const auth=await sb.auth.getUser();if(!auth.data.user)return setStatus('storageStatus','Sign in to use cloud storage.');const safeName=text(file.name,140).replace(/[\/\\]/g,'-');const path=auth.data.user.id+'/desktop/'+id()+'-'+safeName;const result=await sb.storage.from('user-files').upload(path,file.blob,{contentType:file.type||'application/octet-stream',upsert:false});if(result.error)return setStatus('storageStatus','Upload failed: '+result.error.message);setStatus('storageStatus','Uploaded '+file.name+' to your private cloud.');refreshStorageCloud();
}
async function refreshStorageCloud(){
 const box=$('storageCloud');if(!box)return;box.replaceChildren();const sb=cloudClient();if(!sb){box.textContent='Supabase is unavailable.';return}try{const auth=await sb.auth.getUser();if(!auth.data.user){box.textContent='Sign in to access cloud files.';return}const folder=auth.data.user.id+'/desktop';const result=await sb.storage.from('user-files').list(folder,{limit:500,sortBy:{column:'created_at',order:'desc'}});if(result.error)throw result.error;(result.data||[]).filter(x=>x.name).forEach(file=>{const row=document.createElement('div');row.className='tn-os-list-item';const name=document.createElement('span');name.textContent=file.name+' · '+fmtBytes(file.metadata?.size||0);const dl=document.createElement('button');dl.className='tn-button';dl.textContent='Download';dl.onclick=async()=>{const r=await sb.storage.from('user-files').download(folder+'/'+file.name);if(r.error)return setStatus('storageStatus',r.error.message);downloadBlob(r.data,file.name)};const del=document.createElement('button');del.className='tn-button tn-danger';del.textContent='Delete';del.onclick=async()=>{if(!confirm('Delete this cloud file?'))return;const r=await sb.storage.from('user-files').remove([folder+'/'+file.name]);if(r.error)setStatus('storageStatus',r.error.message);refreshStorageCloud()};row.append(name,dl,del);box.append(row)});if(!box.children.length)box.textContent='No cloud files in the Desktop folder.'}catch(e){box.textContent='Cloud files unavailable: '+e.message}
}
function setupStorage(){
 $('storageImport').onchange=async e=>{if(!storageDb)storageDb=await loadDb('technova-os-storage','items');for(const f of e.target.files)await dbReq(storageDb,'items','readwrite',s=>s.put({id:id(),name:f.name,type:f.type||'application/octet-stream',size:f.size,added:Date.now(),blob:f}));e.target.value='';renderStorageLocal()};
 $('storageRefresh').onclick=refreshStorageCloud;$('storageSearch').oninput=()=>{const q=$('storageSearch').value.toLowerCase();document.querySelectorAll('#storageLocal .tn-os-list-item,#storageCloud .tn-os-list-item').forEach(n=>n.hidden=!n.textContent.toLowerCase().includes(q))};
}
function init(){
 initWindows();setupWorkspaces();setupWhiteboard();setupDocuments();setupSheet();setupApi();setupWidgets();setupControl();setupMedia();setupWebsite();setupMail();setupStorage();
 const main=getWorkspaces();currentWorkspace=read(STORE.workspaces,main)[0]?.id||'main';
 renderAll();
}
window.TNExpansion={init,onOpen,switchWorkspace};
})();