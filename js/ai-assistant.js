'use strict';

const techNovaAIClient = window.supabase.createClient(
  window.TECHNOVA_SUPABASE_URL,
  window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
);

const techNovaAIHistory = [];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('aiForm');
  const input = document.getElementById('aiInput');
  const chat = document.getElementById('aiChat');
  const status = document.getElementById('aiStatus');

  if (!form || !input || !chat) return;

  const addMessage = (text, role) => {
    const el = document.createElement('div');
    el.className = `ai-msg ${role}`;
    el.textContent = text;
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
    return el;
  };

  const awardAIAchievement = async () => {
    try {
      const { data: { user } } = await techNovaAIClient.auth.getUser();
      if (!user) return;

      await techNovaAIClient.rpc('award_xp', {
        p_amount: 0,
        p_achievement_slug: 'ai-chat'
      });
    } catch (error) {
      console.debug('AI achievement was not awarded:', error);
    }
  };

  const ask = async message => {
    addMessage(message, 'user');
    status.textContent = 'TechNova AI is thinking…';
    input.disabled = true;

    try {
      const {
        data: { session },
        error: sessionError
      } = await techNovaAIClient.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.access_token) {
        throw new Error('Please sign in before using TechNova AI.');
      }

      const response = await fetch(
        `${window.TECHNOVA_SUPABASE_URL}/functions/v1/technova-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            message,
            history: techNovaAIHistory.slice(-12)
          })
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
          `TechNova AI returned HTTP ${response.status}.`
        );
      }

      const answer =
        String(data?.answer || '').trim() ||
        'I could not generate an answer.';

      addMessage(answer, 'assistant');

      techNovaAIHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: answer }
      );

      if (techNovaAIHistory.length > 24) {
        techNovaAIHistory.splice(
          0,
          techNovaAIHistory.length - 24
        );
      }

      await awardAIAchievement();
      status.textContent = '';
    } catch (error) {
      console.error('TechNova AI:', error);
      addMessage(
        `Sorry, I couldn't reach the AI assistant. ${error?.message || 'Unknown error'}`,
        'assistant'
      );
      status.textContent = '';
    } finally {
      input.disabled = false;
      input.focus();
    }
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    await ask(message);
  });

  document.querySelectorAll('.ai-prompt').forEach(button => {
    button.addEventListener('click', () => {
      input.value = button.textContent.trim();
      input.focus();
    });
  });
});
