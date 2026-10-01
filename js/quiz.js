'use strict';

const TECHNOVA_FALLBACK_QUIZ = [
  { question:'What does CPU stand for?', options:['Central Processing Unit','Computer Power Utility','Core Program User','Central Program Upload'], correct:'Central Processing Unit', explanation:'CPU stands for Central Processing Unit.', points:10 },
  { question:'Which technology is primarily used to store data in a distributed ledger?', options:['Blockchain','Bluetooth','CSS','SMTP'], correct:'Blockchain', explanation:'Blockchain stores records in a distributed, tamper-evident ledger.', points:10 },
  { question:'What does HTML primarily describe?', options:['Page structure','Database passwords','Wi-Fi signal strength','CPU temperature'], correct:'Page structure', explanation:'HTML defines the structure and meaning of web content.', points:10 },
  { question:'Which is an example of cloud computing?', options:['Using a remote online service to process data','Typing on a keyboard','Turning on a monitor','Installing a local mouse driver'], correct:'Using a remote online service to process data', explanation:'Cloud computing uses remote computing resources delivered over a network.', points:10 },
  { question:'What is an API?', options:['A way for software systems to communicate','A type of graphics card','A battery standard','A monitor connector'], correct:'A way for software systems to communicate', explanation:'An API defines how software components can interact.', points:10 }
];

function quizClient(){
  if(window.supabaseClient) return window.supabaseClient;
  if(!window.supabase || !window.TECHNOVA_SUPABASE_URL || !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY){
    throw new Error('TechNova Supabase configuration is unavailable.');
  }
  window.supabaseClient=window.supabase.createClient(window.TECHNOVA_SUPABASE_URL,window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
  return window.supabaseClient;
}

function normaliseQuestion(item){
  let options=item?.options;
  if(typeof options==='string'){
    try{ options=JSON.parse(options); }catch{ options=[]; }
  }
  if(!Array.isArray(options)) options=[];

  return {
    id:item?.id,
    question:String(item?.question||''),
    options:options.map(String),
    correct:String(item?.correct_answer ?? ''),
    explanation:String(item?.explanation||''),
    points:Number(item?.xp_reward ?? item?.points ?? 10)
  };
}

document.addEventListener('DOMContentLoaded', async () => {
  const root=document.getElementById('quiz');
  if(!root) return;

  let questions=TECHNOVA_FALLBACK_QUIZ;

  try{
    const client=quizClient();
    const {data,error}=await client
      .from('quiz_questions')
      .select('id,question,options,correct_answer,category,xp_reward,created_at')
      .order('id',{ascending:true})
      .limit(20);

    if(error) throw error;

    if(data?.length){
      questions=data.map(normaliseQuestion).filter(item=>item.question && item.options.length);
    }
  }catch(error){
    console.warn('Could not load database quiz questions; using built-in questions:',error);
  }

  if(!questions.length) questions=TECHNOVA_FALLBACK_QUIZ;

  let index=0;
  let score=0;
  let selected=null;
  const totalPoints=questions.reduce((sum,q)=>sum+Number(q.points||10),0);

  const render=()=>{
    const item=questions[index];
    root.innerHTML=`<div class="q-meta">Question ${index+1} of ${questions.length}</div><h2></h2><div class="q-options"></div><div class="q-actions"><button class="btn primary" id="nextBtn" type="button">${index===questions.length-1?'Finish quiz':'Next →'}</button></div>`;
    root.querySelector('h2').textContent=item.question;

    const options=root.querySelector('.q-options');
    item.options.forEach(option=>{
      const button=document.createElement('button');
      button.className='q-option';
      button.type='button';
      button.textContent=option;
      button.addEventListener('click',()=>{
        selected=option;
        options.querySelectorAll('.q-option').forEach(el=>el.classList.toggle('selected',el===button));
      });
      options.appendChild(button);
    });

    root.querySelector('#nextBtn').addEventListener('click',finishQuestion);
  };

  const finishQuestion=async()=>{
    if(selected===null) return;

    const item=questions[index];
    const correct=String(item.correct).trim().toLowerCase()===String(selected).trim().toLowerCase();
    if(correct) score+=Number(item.points||10);

    index+=1;
    selected=null;

    if(index<questions.length){
      render();
      return;
    }

    const percent=totalPoints>0?Math.round((score/totalPoints)*100):0;
    root.innerHTML=`<p class="eyebrow">RESULT</p><div class="q-result">${score} XP</div><h2>${percent>=80?'Excellent work!':percent>=60?'Nice work!':'Keep learning!'}</h2><p class="q-meta">Your score was ${percent}%.</p><div class="q-actions"><button class="btn primary" id="again" type="button">Try again</button><a class="btn" href="achievements.html">View achievements</a></div>`;

    try{
      const client=quizClient();
      const {data:{user}}=await client.auth.getUser();
      if(user){
        await client.from('quiz_attempts').insert({
          user_id:user.id,
          score,
          total_questions:questions.length,
          xp_earned:score
        });
        await client.rpc('award_xp',{p_amount:score,p_achievement_slug:null});
      }
    }catch(error){
      console.warn('Could not save quiz result:',error);
    }

    root.querySelector('#again').addEventListener('click',()=>{
      index=0;
      score=0;
      selected=null;
      render();
    });
  };

  render();
});
