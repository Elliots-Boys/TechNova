'use strict';

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
      await supabaseClient.rpc('award_xp', { p_amount: 0, p_achievement_key: 'ai-chat' });
    } catch {}
  };

  const ask = async (message) => {
    addMessage(message, 'user');
    status.textContent = 'TechNova AI is thinking…';
    input.disabled = true;

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      const response = await fetch(`${window.TECHNOVA_SUPABASE_URL}/functions/v1/technova-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ message })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The AI assistant could not respond.');
      addMessage(data.answer || 'I could not generate an answer.', 'assistant');
      await awardAIAchievement();
      status.textContent = '';
    } catch (error) {
      console.error('TechNova AI:', error);
      addMessage(`Sorry, I couldn't reach the AI assistant. ${error.message}`, 'assistant');
      status.textContent = '';
    } finally {
      input.disabled = false;
      input.focus();
    }
  };

  form.addEventListener('submit', async (event) => {
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
