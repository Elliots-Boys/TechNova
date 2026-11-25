/* TechNova Browser — sandboxed web viewer for TechNova Desktop. */
(() => {
'use strict';
const $=id=>document.getElementById(id);
const STORAGE={bookmarks:'technova.browser.bookmarks.v1',history:'technova.browser.history.v1'};
const MAX_HISTORY=120,MAX_BOOKMARKS=80,MAX_TABS=8;
const safeRead=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key));return value===null?fallback:value}catch{return fallback}};
const safeWrite=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
const makeId=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(36).slice(2);
const cleanLabel=(value,max=120)=>String(value||'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max);
const engines={duckduckgo:q=>'https://duckduckgo.com/?q='+encodeURIComponent(q),bing:q=>'https://www.bing.com/search?q='+encodeURIComponent(q),google:q=>'https://www.google.com/search?q='+encodeURIComponent(q)};
let bookmarks=safeRead(STORAGE.bookmarks,[]),historyItems=safeRead(STORAGE.history,[]);
if(!Array.isArray(bookmarks))bookmarks=[];
if(!Array.isArray(historyItems))historyItems=[];
let tabs=[],activeId='',privateSession=false,libraryMode='';
const byId=id=>tabs.find(tab=>tab.id===id),active=()=>byId(activeId);
function parseAddress(raw){
 const value=String(raw||'').trim();if(!value||value.length>2048)return null;
 if(/^[a-z][a-z0-9+.-]*:/i.test(value)){let parsed;try{parsed=new URL(value)}catch{return null}if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password)return null;return parsed.href}
 if(value.includes(' ')||!value.includes('.'))return engines[$('browserSearchEngine').value](value);
 let parsed;try{parsed=new URL('https://'+value)}catch{return null}if(parsed.username||parsed.password)return null;return parsed.href;
}
function activeFrame(tab){
 if(!tab.frame){const frame=document.createElement('iframe');frame.className='tn-browser-frame';frame.title='Website content';frame.loading='lazy';frame.referrerPolicy='no-referrer';frame.setAttribute('sandbox','allow-forms allow-scripts allow-popups allow-popups-to-escape-sandbox allow-downloads');frame.addEventListener('load',()=>{if(activeId===tab.id)$('browserStatus').textContent='Page loaded · If content is missing, this website may block embedding.'});tab.frame=frame;$('browserViewport').append(frame)}
 return tab.frame;
}
function updateNavigation(){const tab=active();$('browserBack').disabled=!tab||tab.index<=0;$('browserForward').disabled=!tab||tab.index>=tab.entries.length-1;$('browserAddress').value=tab&&tab.index>=0?tab.entries[tab.index]:'';$('browserBookmark').disabled=!(tab&&tab.index>=0);$('browserExternal').disabled=!(tab&&tab.index>=0);$('browserBookmark').textContent=tab&&tab.index>=0&&bookmarks.some(b=>b.url===tab.entries[tab.index])?'★':'☆'}
function renderTabs(){const box=$('browserTabs');box.replaceChildren();tabs.forEach(tab=>{const button=document.createElement('button');button.type='button';button.className='tn-browser-tab';button.setAttribute('role','tab');button.setAttribute('aria-selected',String(tab.id===activeId));const label=document.createElement('span');label.textContent=tab.index>=0?tab.entries[tab.index].replace(/^https?:\/\//,'').slice(0,32):'New tab';const close=document.createElement('small');close.textContent='×';close.setAttribute('aria-label','Close tab');button.append(label,close);button.addEventListener('click',event=>{if(event.target===close)closeTab(tab.id);else activateTab(tab.id)});box.append(button)})}
function showTab(){const tab=active();if(!tab)return;const frame=activeFrame(tab);[...$('browserViewport').querySelectorAll('iframe')].forEach(item=>item.hidden=item!==frame);$('browserStartPage').hidden=tab.index>=0;if(tab.index>=0&&frame.src!==tab.entries[tab.index])frame.src=tab.entries[tab.index];updateNavigation();renderTabs();$('browserStatus').textContent=tab.index>=0?'Showing '+tab.entries[tab.index]:'Ready · New tab'}
function activateTab(id){if(!byId(id))return;activeId=id;showTab()}
function newTab(){if(tabs.length>=MAX_TABS){$('browserStatus').textContent='You can have up to '+MAX_TABS+' tabs open.';return}const tab={id:makeId(),entries:[],index:-1,frame:null};tabs.push(tab);activeId=tab.id;showTab();$('browserAddress').focus()}
function closeTab(id){const tab=byId(id);if(!tab)return;if(tab.frame)tab.frame.remove();tabs=tabs.filter(item=>item.id!==id);if(!tabs.length){newTab();return}if(activeId===id)activeId=tabs[Math.max(0,tabs.length-1)].id;showTab()}
function recordVisit(url){if(privateSession)return;historyItems=[{url,title:url,visited:Date.now()},...historyItems.filter(entry=>entry.url!==url)].slice(0,MAX_HISTORY);safeWrite(STORAGE.history,historyItems)}
function navigate(raw,replace=false){const url=parseAddress(raw);if(!url){$('browserStatus').textContent='Enter a valid HTTP or HTTPS address, or search phrase.';return}const tab=active();if(!tab)return;if(replace&&tab.index>=0)tab.entries[tab.index]=url;else{tab.entries=tab.entries.slice(0,tab.index+1);tab.entries.push(url);tab.index=tab.entries.length-1}const frame=activeFrame(tab);frame.hidden=false;frame.src=url;$('browserStartPage').hidden=true;recordVisit(url);updateNavigation();renderTabs();$('browserStatus').textContent='Opening '+url}
function goBack(){const tab=active();if(tab&&tab.index>0){tab.index--;showTab()}}
function goForward(){const tab=active();if(tab&&tab.index<tab.entries.length-1){tab.index++;showTab()}}
function reload(){const tab=active();if(tab&&tab.index>=0){activeFrame(tab).src=tab.entries[tab.index];$('browserStatus').textContent='Reloading page…'}}
function goHome(){const tab=active();if(!tab)return;tab.entries=[];tab.index=-1;if(tab.frame){tab.frame.remove();tab.frame=null}showTab()}
function openExternal(){const tab=active();if(tab&&tab.index>=0)window.open(tab.entries[tab.index],'_blank','noopener,noreferrer')}
function renderLibrary(mode){
 libraryMode=mode;$('browserLibrary').hidden=false;$('browserLibraryTitle').textContent=mode==='history'?'Browsing history':'Bookmarks';$('browserClearHistory').hidden=mode!=='history';const box=$('browserLibraryItems');box.replaceChildren();const items=mode==='history'?historyItems:bookmarks;
 if(!items.length){const empty=document.createElement('p');empty.className='tn-muted';empty.textContent=mode==='history'?'No saved browsing history.':'No bookmarks yet. Bookmark a page to save it here.';box.append(empty);return}
 items.forEach(item=>{const row=document.createElement('div');row.className='tn-stack-item';const copy=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('small');title.textContent=cleanLabel(item.title||item.url,100);detail.textContent=mode==='history'?new Date(item.visited).toLocaleString():item.url;copy.append(title,detail);const open=document.createElement('button');open.type='button';open.className='tn-button';open.textContent='Open';open.addEventListener('click',()=>{navigate(item.url);$('browserLibrary').hidden=true});row.append(copy,open);if(mode==='bookmarks'){const remove=document.createElement('button');remove.type='button';remove.className='tn-button tn-danger';remove.textContent='Remove';remove.addEventListener('click',()=>{bookmarks=bookmarks.filter(entry=>entry.id!==item.id);safeWrite(STORAGE.bookmarks,bookmarks);renderLibrary('bookmarks');updateNavigation()});row.append(remove)}box.append(row)});
}
function addBookmark(){const tab=active();if(!tab||tab.index<0)return;const url=tab.entries[tab.index],existing=bookmarks.find(item=>item.url===url);if(existing){bookmarks=bookmarks.filter(item=>item.url!==url);$('browserStatus').textContent='Bookmark removed.'}else if(bookmarks.length<MAX_BOOKMARKS){bookmarks.unshift({id:makeId(),url,title:url,added:Date.now()});$('browserStatus').textContent='Bookmark saved on this device.'}else{$('browserStatus').textContent='Bookmark limit reached.';return}safeWrite(STORAGE.bookmarks,bookmarks);updateNavigation();if(!$('browserLibrary').hidden&&libraryMode==='bookmarks')renderLibrary('bookmarks')}
function init(){
 if(!$('browserTabs'))return;
 tabs=[{id:makeId(),entries:[],index:-1,frame:null}];activeId=tabs[0].id;showTab();
 $('browserAddressForm').addEventListener('submit',event=>{event.preventDefault();navigate($('browserAddress').value)});
 $('browserBack').addEventListener('click',goBack);$('browserForward').addEventListener('click',goForward);$('browserReload').addEventListener('click',reload);$('browserHome').addEventListener('click',goHome);
 $('browserExternal').addEventListener('click',openExternal);$('browserBookmark').addEventListener('click',addBookmark);$('browserNewTab').addEventListener('click',newTab);
 $('browserShowBookmarks').addEventListener('click',()=>renderLibrary('bookmarks'));$('browserShowHistory').addEventListener('click',()=>renderLibrary('history'));
 $('browserLibraryClose').addEventListener('click',()=>$('browserLibrary').hidden=true);
 $('browserClearHistory').addEventListener('click',()=>{historyItems=[];safeWrite(STORAGE.history,historyItems);renderLibrary('history');$('browserStatus').textContent='Browsing history cleared from this browser.'});
 $('browserPrivate').addEventListener('change',event=>{privateSession=event.target.checked;$('browserStatus').textContent=privateSession?'Local history saving is paused for this session.':'Local history saving is enabled.'});
 document.querySelectorAll('[data-browser-url]').forEach(button=>button.addEventListener('click',()=>navigate(button.dataset.browserUrl)));
}
init();
})();