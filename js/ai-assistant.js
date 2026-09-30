'use strict';

/*
 * TechNova AI Assistant
 *
 * This file deliberately creates its own Supabase client. The AI page does
 * not load auth.js, so relying on a global `supabaseClient` causes:
 *   "supabaseClient is not defined"
 */

const techNovaSupabaseClient = window.supabase?.createClient(
  window.TECHNOVA_SUPABASE_URL,
  window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
);

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
    if (!techNovaSupabaseClient) return;

    try {
      const { data: { user } } = await techNovaSupabaseClient.auth.getUser();
      if (!user) return;

      // This is optional. If the RPC has not been installed yet, AI still works.
      await techNovaSupabaseClient.rpc('award_xp', {
        p_amount: 0,
        p_achievement_key: 'ai-chat'
      });
    } catch (error) {
      console.debug('AI achievement was not awarded:', error);
    }
  };

  const ask = async (message) => {
    addMessage(message, 'user');
    status.textContent = 'TechNova AI is thinking…';
    input.disabled = true;

    try {
      if (!techNovaSupabaseClient) {
        throw new Error('Supabase could not be initialised on this page.');
      }

      const { data: { session } } = await techNovaSupabaseClient.auth.getSession();

      const headers = {
        'Content-Type': 'application/json'
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(
        `${window.TECHNOVA_SUPABASE_URL}/functions/v1/technova-ai`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ message })
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
          `AI service returned HTTP ${response.status}.`
        );
      }

      addMessage(
        data.answer || 'I could not generate an answer.',
        'assistant'
      );

      await awardAIAchievement();
      status.textContent = '';
    } catch (error) {
      console.error('TechNova AI:', error);

      addMessage(
        `Sorry, I couldn't reach the AI assistant. ${error.message}`,
        'assistant'
      );

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
