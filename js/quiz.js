'use strict';

function quizClient() {
  if (window.supabaseClient) return window.supabaseClient;
  if (!window.supabase || !window.TECHNOVA_SUPABASE_URL || !window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('TechNova Supabase configuration is unavailable.');
  }
  window.supabaseClient = window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);
  return window.supabaseClient;
}

document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('quiz');
  if (!root) return;
  let questions = [];
  let user = null;
  let client;

  try {
    client = quizClient();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    user = authData.user;
    if (!user) {
      root.textContent = 'Please sign in to take the quiz and earn XP.';
      return;
    }
    const { data, error } = await client.from('quiz_questions')
      .select('id,question,options,category,xp_reward')
      .order('id', { ascending: true })
      .limit(20);
    if (error) throw error;
    questions = (data || []).map(q => {
      let options = q.options;
      if (typeof options === 'string') { try { options = JSON.parse(options); } catch { options = []; } }
      return { id: q.id, question: q.question, options: Array.isArray(options) ? options.map(String) : [], points: Number(q.xp_reward || 0) };
    }).filter(q => q.question && q.options.length);
  } catch (error) {
    console.error('Quiz could not load:', error);
    root.textContent = 'The quiz is temporarily unavailable. Please try again later.';
    return;
  }

  if (!questions.length) {
    root.textContent = 'No quiz questions are available yet.';
    return;
  }

  let index = 0;
  let answers = [];

  function render() {
    const item = questions[index];
    root.innerHTML = '<div class="q-meta"></div><h2></h2><div class="q-options"></div><div class="q-actions"><button class="btn primary" id="nextBtn" type="button">Next →</button></div>';
    root.querySelector('.q-meta').textContent = `Question ${index + 1} of ${questions.length}`;
    root.querySelector('h2').textContent = item.question;
    const options = root.querySelector('.q-options');
    let selected = null;
    item.options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'q-option';
      button.type = 'button';
      button.textContent = option;
      button.addEventListener('click', () => {
        selected = option;
        options.querySelectorAll('.q-option').forEach(el => el.classList.toggle('selected', el === button));
      });
      options.appendChild(button);
    });
    root.querySelector('#nextBtn').textContent = index === questions.length - 1 ? 'Submit quiz' : 'Next →';
    root.querySelector('#nextBtn').addEventListener('click', async () => {
      if (selected === null) return;
      answers.push({ question_id: item.id, answer: selected });
      index++;
      if (index < questions.length) { render(); return; }
      await submit();
    });
  }

  async function submit() {
    root.textContent = 'Checking your answers securely…';
    try {
      const { data, error } = await client.rpc('submit_quiz_attempt', { p_answers: answers });
      if (error) throw error;
      const result = data || {};
      root.innerHTML = '<p class="eyebrow">RESULT</p><div class="q-result"></div><h2>Quiz complete</h2><p class="q-meta"></p><div class="q-actions"><button class="btn primary" id="again" type="button">Try again later</button><a class="btn" href="achievements.html">View achievements</a></div>';
      root.querySelector('.q-result').textContent = `${Number(result.xp_earned || 0)} XP earned`;
      root.querySelector('.q-meta').textContent = `${Number(result.correct_answers || 0)} of ${Number(result.total_questions || 0)} correct · ${Number(result.percentage || 0)}%`;
      root.querySelector('#again').addEventListener('click', () => {
        root.textContent = 'XP can be earned from another quiz attempt after the 10-minute cooldown.';
      });
    } catch (error) {
      root.textContent = error.message || 'Your quiz could not be submitted. Please try again later.';
    }
  }

  render();
});
