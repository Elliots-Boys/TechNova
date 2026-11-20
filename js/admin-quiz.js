'use strict';

(() => {
  const byId = id => document.getElementById(id);
  const root = byId('section-quiz');
  if (!root) return;

  const client = window.supabase.createClient(
    window.TECHNOVA_SUPABASE_URL,
    window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY
  );
  let questions = [];

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[char]));
  }

  function showError(message) {
    const box = byId('adminMessage');
    box.textContent = message;
    box.className = 'admin-message show error';
  }

  function showSuccess(message) {
    const box = byId('adminMessage');
    box.textContent = message;
    box.className = 'admin-message show good';
  }

  function syncAnswerOptions(selected = '') {
    const options = byId('quizOptions').value.split('\n').map(value => value.trim()).filter(Boolean);
    const select = byId('quizCorrectAnswer');
    select.replaceChildren();
    options.forEach(option => {
      const element = document.createElement('option');
      element.value = option;
      element.textContent = option;
      select.appendChild(element);
    });
    if (options.includes(selected)) select.value = selected;
    if (!options.length) {
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = 'Add options first';
      select.appendChild(empty);
    }
  }

  function renderQuestions() {
    const query = byId('quizQuestionSearch').value.trim().toLowerCase();
    const filtered = questions.filter(item =>
      [item.question, item.category, ...(Array.isArray(item.options) ? item.options : [])]
        .some(value => String(value ?? '').toLowerCase().includes(query))
    );
    const body = byId('quizQuestionsTable');
    if (!filtered.length) {
      body.innerHTML = '<tr><td colspan="5" class="loading">No quiz questions found.</td></tr>';
      return;
    }
    body.innerHTML = filtered.map(item => `
      <tr>
        <td>${escapeHtml(item.question)}</td>
        <td>${escapeHtml(item.category)}</td>
        <td>${Number(item.xp_reward) || 0}</td>
        <td>${escapeHtml(item.correct_answer)}</td>
        <td><div class="admin-actions-cell">
          <button class="admin-small-btn" type="button" data-edit="${Number(item.id)}">Edit</button>
          <button class="admin-small-btn admin-danger" type="button" data-delete="${Number(item.id)}">Delete</button>
        </div></td>
      </tr>`).join('');
  }

  async function loadQuestions() {
    const { data, error } = await client.rpc('admin_list_quiz_questions');
    if (error) throw error;
    questions = Array.isArray(data) ? data : [];
    renderQuestions();
    const { data: stats, error: statsError } = await client.rpc('admin_quiz_stats');
    if (statsError) throw statsError;
    const row = Array.isArray(stats) ? stats[0] : stats;
    byId('adminQuizAttempts').textContent = Number(row?.attempts_count || 0).toLocaleString();
    byId('adminQuizXp').textContent = Number(row?.xp_earned_total || 0).toLocaleString();
  }

  function openEditor(question = null) {
    byId('quizQuestionEditor').classList.add('show');
    byId('quizEditorTitle').textContent = question ? 'Edit question' : 'Add question';
    byId('quizQuestionId').value = question?.id || '';
    byId('quizQuestionText').value = question?.question || '';
    byId('quizOptions').value = Array.isArray(question?.options) ? question.options.join('\n') : '';
    byId('quizCategory').value = question?.category || 'Technology';
    byId('quizXpReward').value = question?.xp_reward ?? 10;
    syncAnswerOptions(question?.correct_answer || '');
    byId('quizQuestionEditor').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  byId('addQuizQuestionBtn').addEventListener('click', () => openEditor());
  byId('cancelQuizEdit').addEventListener('click', () => {
    byId('quizQuestionEditor').classList.remove('show');
    byId('quizQuestionForm').reset();
    syncAnswerOptions();
  });
  byId('quizOptions').addEventListener('input', () => syncAnswerOptions(byId('quizCorrectAnswer').value));
  byId('quizQuestionSearch').addEventListener('input', renderQuestions);

  byId('quizQuestionsTable').addEventListener('click', async event => {
    const editId = event.target.closest('[data-edit]')?.dataset.edit;
    const deleteId = event.target.closest('[data-delete]')?.dataset.delete;
    if (editId) {
      const item = questions.find(question => String(question.id) === editId);
      if (item) openEditor(item);
    }
    if (deleteId) {
      const item = questions.find(question => String(question.id) === deleteId);
      if (!item || !window.confirm('Delete this quiz question? Existing attempts will remain in the attempt history.')) return;
      try {
        const { error } = await client.rpc('admin_delete_quiz_question', { p_id: Number(deleteId) });
        if (error) throw error;
        const { data: authData } = await client.auth.getUser();
        await client.from('admin_activity_log').insert({ admin_user_id: authData.user.id, action: 'Admin deleted quiz question', target_type: 'quiz_question', target_id: String(deleteId), details: {} });
        await loadQuestions();
        showSuccess('Quiz question deleted.');
      } catch (error) {
        console.error(error);
        showError(error.message || 'Could not delete quiz question.');
      }
    }
  });

  byId('quizQuestionForm').addEventListener('submit', async event => {
    event.preventDefault();
    const options = byId('quizOptions').value.split('\n').map(value => value.trim()).filter(Boolean);
    const payload = {
      p_id: byId('quizQuestionId').value ? Number(byId('quizQuestionId').value) : null,
      p_question: byId('quizQuestionText').value.trim(),
      p_options: options,
      p_correct_answer: byId('quizCorrectAnswer').value,
      p_category: byId('quizCategory').value.trim(),
      p_xp_reward: Number(byId('quizXpReward').value)
    };
    try {
      const { data: savedId, error } = await client.rpc('admin_save_quiz_question', payload);
      if (error) throw error;
      const { data: authData } = await client.auth.getUser();
      await client.from('admin_activity_log').insert({ admin_user_id: authData.user.id, action: payload.p_id ? 'Admin updated quiz question' : 'Admin created quiz question', target_type: 'quiz_question', target_id: String(savedId), details: { category: payload.p_category } });
      byId('quizQuestionEditor').classList.remove('show');
      byId('quizQuestionForm').reset();
      syncAnswerOptions();
      await loadQuestions();
      showSuccess('Quiz question saved.');
    } catch (error) {
      console.error(error);
      showError(error.message || 'Could not save quiz question.');
    }
  });

  client.auth.getUser().then(async ({ data, error }) => {
    if (error || !data?.user) return;
    const { data: role, error: roleError } = await client.from('user_roles')
      .select('role').eq('user_id', data.user.id).maybeSingle();
    if (roleError || role?.role !== 'admin') return;
    try { await loadQuestions(); }
    catch (error) {
      console.error('Quiz administration could not load:', error);
      byId('quizQuestionsTable').innerHTML = '<tr><td colspan="5" class="loading">Quiz administration is unavailable. Check the migration has been applied.</td></tr>';
      showError(error.message || 'Could not load quiz administration.');
    }
  });
})();
