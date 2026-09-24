const supabaseClient = window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);

function showAuthMessage(message, good = false) {
  const el = document.querySelector('#authMessage');
  if (!el) return;
  el.textContent = message;
  el.className = `auth-message show${good ? ' good' : ''}`;
}

function setBusy(button, busy, label) {
  if (!button) return;
  button.disabled = busy;
  button.textContent = busy ? 'Please wait…' : label;
}

async function signUp(event) {
  event?.preventDefault();
  const name = document.querySelector('#name')?.value.trim() || '';
  const email = document.querySelector('#email')?.value.trim() || '';
  const password = document.querySelector('#password')?.value || '';
  const button = document.querySelector('#signupBtn');

  if (!email || password.length < 8) {
    showAuthMessage('Enter a valid email and a password of at least 8 characters.');
    return;
  }

  setBusy(button, true, 'Create account');
  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name || email.split('@')[0] },
      emailRedirectTo: `${location.origin}/pages/account.html`
    }
  });
  setBusy(button, false, 'Create account');

  if (error) {
    showAuthMessage(error.message);
    return;
  }
  showAuthMessage('Account created. Check your email to confirm your address, then log in.', true);
  document.querySelector('#signupForm')?.reset();
}

async function signIn(event) {
  event?.preventDefault();
  const email = document.querySelector('#email')?.value.trim() || '';
  const password = document.querySelector('#password')?.value || '';
  const button = document.querySelector('#loginBtn');

  if (!email || !password) {
    showAuthMessage('Enter your email address and password.');
    return;
  }

  setBusy(button, true, 'Log in');
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  setBusy(button, false, 'Log in');

  if (error) {
    showAuthMessage(error.message);
    return;
  }
  const next = new URLSearchParams(location.search).get('next');
  location.href = next === 'events.html' ? 'events.html' : 'account.html';
}

async function resetPassword(event) {
  event?.preventDefault();
  const email = document.querySelector('#email')?.value.trim() || '';
  if (!email) {
    showAuthMessage('Enter your email address first, then choose Forgot password.');
    return;
  }
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${location.origin}/pages/login.html`
  });
  if (error) {
    showAuthMessage(error.message);
    return;
  }
  showAuthMessage('Password reset instructions have been sent to your email.', true);
}

async function signOut(event) {
  event?.preventDefault();
  await supabaseClient.auth.signOut();
  location.href = '../index.html';
}

async function loadAccount() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    location.href = 'login.html';
    return;
  }
  const { data: profile } = await supabaseClient.from('profiles').select('display_name,bio').eq('id', user.id).maybeSingle();
  const emailEl = document.querySelector('#accountEmail');
  const nameEl = document.querySelector('#accountName');
  if (emailEl) emailEl.textContent = user.email || '';
  if (nameEl) nameEl.textContent = profile?.display_name || user.email?.split('@')[0] || 'TechNova member';

  const { data: registrations } = await supabaseClient
    .from('event_registrations')
    .select('event_id,events(title,event_date,location)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const list = document.querySelector('#myEvents');
  if (!list) return;
  list.innerHTML = registrations?.length
    ? registrations.map(r => `<div class="feature"><span class="icon">🎟️</span><div><b>${r.events?.title || 'Event'}</b><br><span class="muted">${r.events?.event_date || ''} · ${r.events?.location || ''}</span></div></div>`).join('')
    : '<p class="muted">You have not registered for any events yet.</p>';
}

async function registerForEvent(eventId) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    location.href = 'login.html?next=events.html';
    return;
  }
  const { error } = await supabaseClient.from('event_registrations').insert({ event_id: eventId, user_id: user.id });
  if (error && error.code !== '23505') throw error;
  alert(error?.code === '23505' ? 'You are already registered for this event.' : 'Registration saved to your TechNova account.');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#signupForm')?.addEventListener('submit', signUp);
  document.querySelector('#loginForm')?.addEventListener('submit', signIn);
  document.querySelector('#signupBtn')?.addEventListener('click', e => e.stopPropagation());
  document.querySelector('#loginBtn')?.addEventListener('click', e => e.stopPropagation());
  document.querySelector('#forgotPassword')?.addEventListener('click', resetPassword);
  document.querySelector('#logoutBtn')?.addEventListener('click', signOut);
  if (document.querySelector('#myEvents')) loadAccount();
});
