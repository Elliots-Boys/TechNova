'use strict';

const TECHNOVA_FALLBACK_QUIZ = [
  { question:'What does CPU stand for?', options:['Central Processing Unit','Computer Power Utility','Core Program User','Central Program Upload'], correct:0, explanation:'CPU stands for Central Processing Unit.' },
  { question:'Which technology is primarily used to store data in a distributed ledger?', options:['Blockchain','Bluetooth','CSS','SMTP'], correct:0, explanation:'Blockchain stores records in a distributed, tamper-evident ledger.' },
  { question:'What does HTML primarily describe?', options:['Page structure','Database passwords','Wi-Fi signal strength','CPU temperature'], correct:0, explanation:'HTML defines the structure and meaning of web content.' },
  { question:'Which is an example of cloud computing?', options:['Using a remote online service to process data','Typing on a keyboard','Turning on a monitor','Installing a local mouse driver'], correct:0, explanation:'Cloud computing uses remote computing resources delivered over a network.' },
  { question:'What is an API?', options:['A way for software systems to communicate','A type of graphics card','A battery standard','A monitor connector'], correct:0, explanation:'An API defines how software components can interact.' }
];

document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('quiz');
  if (!root) return;

  let questions = TECHNOVA_FALLBACK_QUIZ;
  try {
    const { data, error } = await supabaseClient.from('quiz_questions').select('id,question,options,correct_answer,explanation,points').eq('published',true).limit(10);
    if (!error && data?.length) {
      questions = data.map(item => ({ id:item.id, question:item.question, options:Array.isArray(item.options) ? item.options : JSON.parse(item.options || '[]'), correct:Number(item.correct_answer), explanation:item.explanation || '', points:Number(item.points || 10) }));
    }
  } catch {}

  let index = 0;
  let score = 0;
  let selected = null;

  const render = () => {
    const item = questions[index];
    root.innerHTML = `<div class="q-meta">Question ${index + 1} of ${questions.length}</div><h2></h2><div class="q-options"></div><div class="q-actions"><button class="btn primary" id="nextBtn" type="button">${index === questions.length - 1 ? 'Finish quiz' : 'Next →'}</button></div>`;
    root.querySelector('h2').textContent = item.question;
    const options = root.querySelector('.q-options');
    item.options.forEach((option, optionIndex) => {
      const button = document.createElement('button');
      button.className = 'q-option';
      button.type = 'button';
      button.textContent = option;
      button.addEventListener('click', () => {
        selected = optionIndex;
        options.querySelectorAll('.q-option').forEach((el,i) => el.classList.toggle('selected', i === optionIndex));
      });
      options.appendChild(button);
    });
    root.querySelector('#nextBtn').addEventListener('click', finishQuestion);
  };

  const finishQuestion = async () => {
    if (selected === null) return;
    const item = questions[index];
    if (selected === item.correct) score += Number(item.points || 10);
    index += 1;
    selected = null;
    if (index < questions.length) return render();

    const percent = Math.round((score / questions.reduce((sum,q) => sum + Number(q.points || 10),0)) * 100);
    root.innerHTML = `<p class="eyebrow">RESULT</p><div class="q-result">${score} XP</div><h2>${percent >= 80 ? 'Excellent work!' : percent >= 60 ? 'Nice work!' : 'Keep learning!'}</h2><p class="q-meta">Your score was ${percent}%.</p><div class="q-actions"><button class="btn primary" id="again" type="button">Try again</button><a class="btn" href="achievements.html">View achievements</a></div>`;

    try {
      const { data:{user} } = await supabaseClient.auth.getUser();
      if (user) {
        await supabaseClient.from('quiz_attempts').insert({user_id:user.id,score,total_questions:questions.length});
        await supabaseClient.rpc('award_xp', { p_amount:score, p_achievement_key:null });
      }
    } catch {}

    root.querySelector('#again').addEventListener('click', () => { index=0; score=0; selected=null; render(); });
  };

  render();
});
