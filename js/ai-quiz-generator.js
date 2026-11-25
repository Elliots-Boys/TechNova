/* TechNova AI Quiz Generator — deterministic, browser-only study tool.
   Questions are derived from text the visitor supplies; no AI API or upload. */
(() => {
'use strict';
if (document.getElementById('tnQuizStudio')) return;
const style = document.createElement('style');
style.textContent = `
#tnQuizStudio{margin:26px auto 0;max-width:1000px;background:linear-gradient(180deg,#101b2d,#09111d);border:1px solid #243955;border-radius:20px;padding:22px;color:#dbe7f5}
#tnQuizStudio h2{margin:0 0 8px;font-size:clamp(24px,4vw,34px)}
#tnQuizStudio p{color:#aabbd0;line-height:1.55}
#tnQuizStudio label{display:block;font-weight:600;margin:12px 0 6px}
#tnQuizStudio textarea,#tnQuizStudio select{box-sizing:border-box;width:100%;background:#07101c;color:#eaf4ff;border:1px solid #29415e;border-radius:10px;padding:11px;font:inherit}
#tnQuizStudio textarea{min-height:150px;resize:vertical}
#tnQuizStudio .tnq-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
#tnQuizStudio .tnq-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
#tnQuizStudio button{border:1px solid #31516f;border-radius:10px;padding:10px 15px;background:#123047;color:#eaf7ff;font:inherit;font-weight:650;cursor:pointer}
#tnQuizStudio button:hover{border-color:#32d6ff}
#tnQuizStudio button:focus-visible,#tnQuizStudio select:focus-visible,#tnQuizStudio textarea:focus-visible{outline:3px solid #32d6ff;outline-offset:2px}
#tnQuizStudio button:disabled{opacity:.5;cursor:not-allowed}
#tnQuizStudio .tnq-muted{font-size:13px;color:#91a0b7}
#tnQuizStudio .tnq-panel{margin-top:18px;padding:17px;border:1px solid #29415e;border-radius:14px;background:#07101c}
#tnQuizStudio .tnq-option{display:flex;gap:10px;align-items:flex-start;margin:9px 0;padding:11px;border:1px solid #29415e;border-radius:10px;cursor:pointer}
#tnQuizStudio .tnq-option:has(input:checked){border-color:#32d6ff;background:#10283a}
#tnQuizStudio .tnq-option input{margin-top:4px;accent-color:#32d6ff}
#tnQuizStudio .tnq-feedback{margin-top:14px;padding:12px;border-radius:10px;background:#10283a;line-height:1.5}
#tnQuizStudio .tnq-progress{height:7px;background:#1b2c40;border-radius:99px;overflow:hidden;margin:12px 0}
#tnQuizStudio .tnq-progress span{display:block;height:100%;background:#32d6ff;width:0}
@media(max-width:650px){#tnQuizStudio{padding:16px}#tnQuizStudio .tnq-grid{grid-template-columns:1fr}}
`;
document.head.append(style);
const root=document.createElement('section');root.id='tnQuizStudio';root.setAttribute('aria-labelledby','tnQuizTitle');
root.innerHTML = `
<h2 id="tnQuizTitle">Quiz Generator</h2>
<p>Create a practice quiz from your own notes. Everything is generated in this browser; your text is not uploaded or saved.</p>
<div id="tnqSetup">
<label for="tnqSource">Paste your notes or revision material</label>
<textarea id="tnqSource" maxlength="30000" placeholder="Paste a few paragraphs of notes here…"></textarea>
<div class="tnq-grid">
<div><label for="tnqType">Question type</label><select id="tnqType"><option value="mixed">Mixed</option><option value="mcq">Multiple choice</option><option value="tf">True or false</option></select></div>
<div><label for="tnqDifficulty">Difficulty</label><select id="tnqDifficulty"><option value="easy">Easy</option><option value="medium" selected>Medium</option><option value="hard">Hard</option></select></div>
<div><label for="tnqCount">Number of questions</label><select id="tnqCount"><option>5</option><option selected>10</option><option>15</option></select></div>
</div>
<div class="tnq-actions"><button type="button" id="tnqGenerate">Generate quiz</button></div>
<p class="tnq-muted">Questions use sentence and keyword patterns from your notes. This is a revision aid, not a generative AI tutor; check the source material if something looks unclear.</p>
<div id="tnqStatus" class="tnq-muted" role="status" aria-live="polite"></div>
</div>
<div id="tnqQuiz" hidden></div>`;
const page=document.querySelector('main.ai-page')||document.body;
page.append(root);
const $=id=>root.querySelector('#'+id);
const stop=new Set('the and for are but not you all any can had her was one our out day get has him his how man new now old see two way who boy did its let put say she too use that with from this have were they will what when where which your about would there their them then than into only over such some more most also very just like make made does doing explain tell please could should been this these those'.split(' '));
let quiz=[],index=0,score=0,answered=false,selected=null;
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
function cleanSentences(text){return text.replace(/\r/g,' ').split(/(?<=[.!?])\s+|\n+/).map(s=>s.trim().replace(/^[-*•]\s*/, '')).filter(s=>s.length>=35&&s.length<=280&&/[a-z]{3}/i.test(s))}
function words(sentence){return (sentence.match(/[A-Za-z][A-Za-z'-]{3,}/g)||[]).filter(w=>!stop.has(w.toLowerCase()))}
function pickWord(sentence,difficulty){const ws=words(sentence);if(!ws.length)return null;let candidates=ws;if(difficulty==='medium')candidates=ws.filter(w=>w.length>=5);if(difficulty==='hard')candidates=ws.filter(w=>w.length>=6);if(!candidates.length)candidates=ws;return candidates[Math.floor(Math.random()*candidates.length)]}
function buildQuestions(text,type,difficulty,count){
 const sentences=shuffle(cleanSentences(text));if(sentences.length<3)throw Error('Please paste at least three complete sentences (around 35 characters each) so there is enough material.');
 const vocabulary=[...new Set((text.match(/[A-Za-z][A-Za-z'-]{3,}/g)||[]).filter(w=>!stop.has(w.toLowerCase())))];
 if(vocabulary.length<5)throw Error('Please provide a little more varied text with at least five useful keywords.');
 const out=[],seen=new Set(),limit=Math.min(count,sentences.length*2);
 for(let i=0;i<sentences.length&&out.length<limit;i++){
  const sentence=sentences[i],word=pickWord(sentence,difficulty);if(!word)continue;
  const kind=type==='mixed'?(out.length%2?'tf':'mcq'):type;
  if(kind==='mcq'){
   const blank=sentence.replace(new RegExp('\\b'+word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i'),'________');
   if(blank===sentence)continue;
   const distractors=shuffle(vocabulary.filter(w=>w.toLowerCase()!==word.toLowerCase())).slice(0,3);
   if(distractors.length<3)continue;
   const options=shuffle([word,...distractors]).map((v,n)=>({id:String(n),text:v,correct:v.toLowerCase()===word.toLowerCase()}));
   out.push({kind:'mcq',prompt:'Choose the word that completes the sentence from your notes:',statement:blank,options,explanation:'Your notes state: “'+sentence+'”'});
  }else{
   const isTrue=Math.random()>.35;let statement=sentence;
   if(!isTrue){const replacement=shuffle(vocabulary.filter(w=>w.toLowerCase()!==word.toLowerCase()))[0];if(!replacement)continue;statement=sentence.replace(new RegExp('\\b'+word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i'),replacement);if(statement===sentence)continue}
   out.push({kind:'tf',prompt:'True or false — is this statement accurate according to your notes?',statement,options:[{id:'true',text:'True',correct:isTrue},{id:'false',text:'False',correct:!isTrue}],explanation:'The original wording in your notes is: “'+sentence+'”'});
  }
 }
 if(!out.length)throw Error('I could not make questions from that text. Try adding more complete sentences and varied keywords.');
 return shuffle(out).slice(0,count);
}
function generate(){try{quiz=buildQuestions($('tnqSource').value,$('tnqType').value,$('tnqDifficulty').value,+$('tnqCount').value);index=0;score=0;answered=false;selected=null;$('tnqSetup').hidden=true;$('tnqQuiz').hidden=false;renderQuestion()}catch(e){$('tnqStatus').textContent=e.message}}
function renderQuestion(){
 const q=quiz[index],panel=$('tnqQuiz');panel.replaceChildren();
 const heading=document.createElement('p');heading.className='tnq-muted';heading.textContent='Question '+(index+1)+' of '+quiz.length+' · '+(q.kind==='mcq'?'Multiple choice':'True or false');panel.append(heading);
 const bar=document.createElement('div');bar.className='tnq-progress';const fill=document.createElement('span');fill.style.width=(index/quiz.length*100)+'%';bar.append(fill);panel.append(bar);
 const prompt=document.createElement('h3');prompt.textContent=q.prompt;panel.append(prompt);
 const statement=document.createElement('p');statement.textContent=q.statement;panel.append(statement);
 const group=document.createElement('div');group.setAttribute('role','group');group.setAttribute('aria-label','Answer options');
 q.options.forEach(o=>{const label=document.createElement('label');label.className='tnq-option';const radio=document.createElement('input');radio.type='radio';radio.name='tnqAnswer';radio.value=o.id;radio.disabled=answered;radio.checked=selected===o.id;radio.addEventListener('change',()=>{selected=o.id;submit.disabled=false});const text=document.createElement('span');text.textContent=o.text;label.append(radio,text);group.append(label)});panel.append(group);
 const actions=document.createElement('div');actions.className='tnq-actions';const submit=document.createElement('button');submit.type='button';submit.textContent='Check answer';submit.disabled=answered||selected===null;submit.addEventListener('click',()=>checkAnswer());actions.append(submit);panel.append(actions);
 if(answered){const qf=document.createElement('div');qf.className='tnq-feedback';qf.setAttribute('role','status');const correct=q.options.find(o=>o.correct);qf.textContent=(q.options.find(o=>o.id===selected)?.correct?'Correct! ':'Not quite. Correct answer: '+correct.text+'. ')+q.explanation;panel.append(qf);const next=document.createElement('button');next.type='button';next.textContent=index===quiz.length-1?'See results':'Next question';next.addEventListener('click',nextQuestion);actions.append(next)}
}
function checkAnswer(){if(selected===null||answered)return;answered=true;if(quiz[index].options.find(o=>o.id===selected)?.correct)score++;renderQuestion()}
function nextQuestion(){if(index<quiz.length-1){index++;answered=false;selected=null;renderQuestion()}else renderResults()}
function renderResults(){const panel=$('tnqQuiz');panel.replaceChildren();const h=document.createElement('h3');h.textContent='Quiz complete';panel.append(h);const p=document.createElement('p');p.textContent='You scored '+score+' out of '+quiz.length+' ('+Math.round(score/quiz.length*100)+'%).';panel.append(p);const note=document.createElement('p');note.className='tnq-muted';note.textContent='Use the explanations to revisit the relevant parts of your notes. Your answers and source text have not been saved.';panel.append(note);const btn=document.createElement('button');btn.type='button';btn.textContent='Try again';btn.addEventListener('click',()=>{quiz=shuffle(quiz);index=0;score=0;answered=false;selected=null;renderQuestion()});panel.append(btn);const edit=document.createElement('button');edit.type='button';edit.textContent='Create another quiz';edit.style.marginLeft='8px';edit.addEventListener('click',()=>{$('tnqQuiz').hidden=true;$('tnqSetup').hidden=false});panel.append(edit)}
$('tnqGenerate').addEventListener('click',generate);
})();