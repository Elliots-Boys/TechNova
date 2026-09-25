const supabaseClient = window.supabase.createClient(window.TECHNOVA_SUPABASE_URL, window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY);

// Capture the Google provider token during the OAuth callback. Supabase documents
// that provider tokens are delivered through auth state events after OAuth redirects.
window.__technovaGoogleProviderToken = null;
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session?.provider_token) window.__technovaGoogleProviderToken = session.provider_token;
  if (event === 'SIGNED_OUT') window.__technovaGoogleProviderToken = null;
});

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

const GOOGLE_DRIVE_SCOPE = 'openid email profile https://www.googleapis.com/auth/drive.file';

async function signInWithGoogle(event) {
  event?.preventDefault();
  const button = document.querySelector('#googleLoginBtn, #googleSignupBtn');
  setBusy(button, true, 'Continue with Google');
  const next = new URLSearchParams(location.search).get('next');
  const destination = next === 'events.html' ? `${location.origin}/pages/events.html` : `${location.origin}/pages/account.html`;
  const { error } = await supabaseClient.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: destination, scopes: GOOGLE_DRIVE_SCOPE, queryParams: { access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true' } } });
  if (error) { setBusy(button, false, 'Continue with Google'); showAuthMessage(error.message || 'Google sign-in could not be started.'); }
}

async function connectGoogleDrive(event) {
  event?.preventDefault();
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) { location.href = 'login.html?next=google-drive.html'; return; }
  const button = document.querySelector('#connectDriveBtn');
  setBusy(button, true, 'Connecting…');
  const destination = `${location.origin}/pages/google-drive.html?connected=1`;
  const { error } = await supabaseClient.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: destination, scopes: GOOGLE_DRIVE_SCOPE, queryParams: { access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true' } } });
  if (error) { setBusy(button, false, 'Connect Google Drive'); const el = document.querySelector('#driveMessage'); if (el) { el.textContent = error.message || 'Google Drive could not be connected.'; el.classList.add('show'); } }
}

async function signUp(event) {
  event?.preventDefault();
  const name = document.querySelector('#name')?.value.trim() || '';
  const email = document.querySelector('#email')?.value.trim() || '';
  const password = document.querySelector('#password')?.value || '';
  const button = document.querySelector('#signupBtn');
  if (!email || password.length < 8) { showAuthMessage('Enter a valid email and a password of at least 8 characters.'); return; }
  setBusy(button, true, 'Create account');
  const { error } = await supabaseClient.auth.signUp({ email, password, options: { data: { display_name: name || email.split('@')[0] }, emailRedirectTo: `${location.origin}/pages/account.html` } });
  setBusy(button, false, 'Create account');
  if (error) { showAuthMessage(error.message); return; }
  showAuthMessage('Account created. Check your email to confirm your address, then log in.', true);
  document.querySelector('#signupForm')?.reset();
}

async function signIn(event) {
  event?.preventDefault();
  const email = document.querySelector('#email')?.value.trim() || '';
  const password = document.querySelector('#password')?.value || '';
  const button = document.querySelector('#loginBtn');
  if (!email || !password) { showAuthMessage('Enter your email address and password.'); return; }
  setBusy(button, true, 'Log in');
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  setBusy(button, false, 'Log in');
  if (error) { showAuthMessage(error.message); return; }
  const next = new URLSearchParams(location.search).get('next');
  location.href = next === 'events.html' ? 'events.html' : 'account.html';
}

async function resetPassword(event) {
  event?.preventDefault();
  const email = document.querySelector('#email')?.value.trim() || '';
  if (!email) { showAuthMessage('Enter your email address first, then choose Forgot password.'); return; }
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/pages/login.html?reset=1` });
  if (error) { showAuthMessage(error.message); return; }
  showAuthMessage('Password reset instructions have been sent to your email.', true);
}

async function finishPasswordReset() {
  if (!new URLSearchParams(location.search).has('reset')) return;
  const password = window.prompt('Enter your new TechNova password (at least 8 characters):');
  if (!password) return;
  if (password.length < 8) { showAuthMessage('Your new password must be at least 8 characters.'); return; }
  const { error } = await supabaseClient.auth.updateUser({ password });
  showAuthMessage(error ? error.message : 'Your password has been updated. You can now log in.', !error);
}

async function signOut(event) {
  event?.preventDefault();
  window.__technovaGoogleProviderToken = null;
  await supabaseClient.auth.signOut();
  location.href = '../index.html';
}

function setAccountMessage(message) {
  const el = document.querySelector('#accountMessage');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
}

async function loadAccount() {
  const list = document.querySelector('#myEvents');
  try {
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError) throw userError;
    if (!user) { location.href = 'login.html'; return; }
    const nameFallback = user.email?.split('@')[0] || 'TechNova member';
    document.querySelector('#accountEmail')?.replaceChildren(document.createTextNode(user.email || ''));
    document.querySelector('#accountName')?.replaceChildren(document.createTextNode(nameFallback));
    const { data: profile, error: profileError } = await supabaseClient.from('profiles').select('display_name,bio,created_at').eq('id', user.id).maybeSingle();
    if (profileError) console.warn('Profile could not be loaded:', profileError.message);
    const displayName = profile?.display_name || user.user_metadata?.display_name || user.user_metadata?.full_name || nameFallback;
    document.querySelector('#accountName')?.replaceChildren(document.createTextNode(displayName));
    document.querySelector('#accountBio')?.replaceChildren(document.createTextNode(profile?.bio || 'No bio added yet.'));
    const status = document.querySelector('#accountStatus');
    if (status) {
      const joined = profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { day:'numeric', month:'long', year:'numeric' }) : '';
      status.textContent = joined ? `Signed in · Member since ${joined}` : 'Signed in successfully';
    }
    if (!list) return;
    const { data: registrations, error: registrationError } = await supabaseClient.from('event_registrations').select('event_id,created_at,events(title,event_date,event_time,location,event_type)').eq('user_id', user.id).order('created_at', { ascending: false });
    if (registrationError) throw registrationError;
    if (!registrations?.length) { list.innerHTML = '<p class="loading">You have not registered for any events yet. <a href="events.html" style="color:#32d6ff">Browse events →</a></p>'; return; }
    list.replaceChildren(...registrations.map(r => {
      const item = document.createElement('div'); item.className = 'event-item';
      const icon = document.createElement('div'); icon.className = 'event-icon'; icon.textContent = '🎟️';
      const body = document.createElement('div'); const title = document.createElement('div'); title.className = 'event-title'; title.textContent = r.events?.title || 'TechNova event';
      const meta = document.createElement('div'); meta.className = 'event-meta'; meta.textContent = [r.events?.event_date, r.events?.event_time, r.events?.location].filter(Boolean).join(' · ') || 'Registration saved';
      const actions = document.createElement('div'); actions.className = 'event-actions'; const cancel = document.createElement('button'); cancel.className = 'cancel-event'; cancel.type = 'button'; cancel.textContent = 'Remove'; cancel.addEventListener('click', () => cancelEvent(r.event_id, item, r.events?.title || 'this event')); actions.append(cancel);
      body.append(title, meta); item.append(icon, body, actions); return item;
    }));
  } catch (error) {
    console.error('TechNova account error:', error);
    document.querySelector('#accountStatus')?.replaceChildren(document.createTextNode('Signed in, but some account data could not be loaded.'));
    if (list) list.innerHTML = '<p class="loading">We could not load your events right now. Refresh the page and try again.</p>';
    setAccountMessage(error?.message || 'There was a problem loading your account.');
  }
}

async function registerForEvent(eventId) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) { location.href = 'login.html?next=events.html'; return; }
  const { error } = await supabaseClient.rpc('register_for_event', { p_event_id: eventId });
  if (error) { alert(error.message || 'Registration could not be completed.'); return; }
  alert('Registration saved to your TechNova account.');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#signupForm')?.addEventListener('submit', signUp);
  document.querySelector('#loginForm')?.addEventListener('submit', signIn);
  document.querySelector('#googleLoginBtn, #googleSignupBtn')?.addEventListener('click', signInWithGoogle);
  document.querySelector('#connectDriveBtn')?.addEventListener('click', connectGoogleDrive);
  document.querySelector('#forgotPassword')?.addEventListener('click', resetPassword);
  document.querySelector('#logoutBtn')?.addEventListener('click', signOut);
  if (document.querySelector('#myEvents')) loadAccount();
  finishPasswordReset();
});

async function cancelEvent(eventId, item, eventTitle) {
  if (!confirm(`Remove your registration for "${eventTitle}"?`)) return;
  const button = item.querySelector('.cancel-event'); if (button) { button.disabled = true; button.textContent = 'Removing…'; }
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) { location.href = 'login.html'; return; }
  const { error } = await supabaseClient.from('event_registrations').delete().eq('event_id', eventId).eq('user_id', user.id);
  if (error) { if (button) { button.disabled = false; button.textContent = 'Remove'; } setAccountMessage(error.message || 'Could not remove the registration.'); return; }
  item.remove(); const list = document.querySelector('#myEvents'); if (list && !list.querySelector('.event-item')) list.innerHTML = '<p class="loading">You have not registered for any events yet. <a href="events.html" style="color:#32d6ff">Browse events →</a></p>';
}
