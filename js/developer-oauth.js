/*
  TechNova Developer Console
  Manages OAuth clients through the protected developer-oauth-apps Edge Function.
  Privileged OAuth administration remains server-side.
*/
(function () {
  const FUNCTION_NAME = 'developer-oauth-apps';

  function byId(id) {
    return document.getElementById(id);
  }

  function showMessage(text, good = false) {
    const el = byId('developerMessage');
    if (!el) return;
    el.textContent = text;
    el.className = 'developer-message show' + (good ? ' good' : '');
  }

  function clearMessage() {
    const el = byId('developerMessage');
    if (!el) return;
    el.textContent = '';
    el.className = 'developer-message';
  }

  async function requireSession() {
    const { data: { session }, error } =
      await window.supabaseClient.auth.getSession();

    if (error || !session) {
      const returnPath =
        location.pathname +
        location.search +
        location.hash;

      location.replace(
        'login.html?redirect=' +
        encodeURIComponent(returnPath)
      );

      return null;
    }

    return session;
  }

  async function api(action, payload = {}) {
    const session = await requireSession();
    if (!session) throw new Error('You need to sign in first.');

    const response = await fetch(
      window.TECHNOVA_SUPABASE_URL +
      '/functions/v1/' +
      FUNCTION_NAME,
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + session.access_token,
          apikey: window.TECHNOVA_SUPABASE_PUBLISHABLE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          ...payload
        })
      }
    );

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
        'TechNova could not complete that developer request.'
      );
    }

    return data;
  }

  function appCard(app) {
    const article = document.createElement('article');
    article.className = 'developer-app-card';

    const icon = document.createElement('div');
    icon.className = 'developer-app-icon';
    icon.textContent = '✦';

    const body = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = app.name || 'OAuth application';

    const description = document.createElement('p');
    description.className = 'muted';
    description.textContent =
      app.description ||
      'No description added yet.';

    const meta = document.createElement('div');
    meta.className = 'developer-meta';

    const type = document.createElement('span');
    type.textContent =
      (app.client_type || 'public') + ' client';

    const id = document.createElement('code');
    id.textContent = app.client_id || '';

    meta.append(type, id);

    body.append(title, description, meta);

    const manage = document.createElement('a');
    manage.className = 'btn primary';
    manage.href =
      'developer-app.html?client_id=' +
      encodeURIComponent(app.client_id);
    manage.textContent = 'Manage';

    article.append(icon, body, manage);
    return article;
  }

  async function loadApps() {
    const list = byId('developerAppsList');
    if (!list) return;

    clearMessage();

    try {
      const data = await api('list');
      const apps = data.apps || [];

      if (!apps.length) {
        const empty = document.createElement('div');
        empty.className = 'developer-empty';
        empty.textContent =
          'You have not created any TechNova OAuth applications yet.';
        list.replaceChildren(empty);
        return;
      }

      list.replaceChildren(
        ...apps.map(appCard)
      );
    } catch (error) {
      list.replaceChildren();
      showMessage(error.message);
    }
  }

  function formPayload(form) {
    const redirects =
      String(new FormData(form).get('redirect_uris') || '')
        .split(/\r?\n/)
        .map(value => value.trim())
        .filter(Boolean);

    const data = new FormData(form);

    return {
      name: String(data.get('name') || '').trim(),
      description: String(data.get('description') || '').trim(),
      website_url: String(data.get('website_url') || '').trim(),
      logo_url: String(data.get('logo_url') || '').trim(),
      privacy_url: String(data.get('privacy_url') || '').trim(),
      terms_url: String(data.get('terms_url') || '').trim(),
      client_type: String(data.get('client_type') || 'public'),
      redirect_uris: redirects
    };
  }

  function revealCredentials(clientId, secret) {
    const box = byId('developerCredentials');
    const client = byId('createdClientId');
    const secretRow = byId('createdSecretRow');
    const secretEl = byId('createdClientSecret');

    if (!box || !client) return;

    client.textContent = clientId || '';

    if (secret && secretEl && secretRow) {
      secretEl.textContent = secret;
      secretRow.hidden = false;
    } else if (secretRow) {
      secretRow.hidden = true;
    }

    box.hidden = false;

    const manage = byId('createdManageLink');
    if (manage) {
      manage.href =
        'developer-app.html?client_id=' +
        encodeURIComponent(clientId);
    }
  }

  async function createApp(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const submit = byId('createDeveloperApp');
    clearMessage();

    if (submit) {
      submit.disabled = true;
      submit.textContent = 'Creating application…';
    }

    try {
      const data = await api(
        'create',
        formPayload(form)
      );

      revealCredentials(
        data.app?.client_id,
        data.client_secret
      );

      form.reset();

      showMessage(
        data.client_secret
          ? 'Application created. Copy the client secret now — TechNova will not show this same secret again.'
          : 'Application created successfully.',
        true
      );
    } catch (error) {
      showMessage(error.message);
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = 'Create application';
      }
    }
  }

  function setValue(id, value) {
    const el = byId(id);
    if (el) el.value = value || '';
  }

  async function loadManagedApp() {
    const form = byId('manageDeveloperAppForm');
    if (!form) return;

    const clientId =
      new URLSearchParams(location.search)
        .get('client_id');

    if (!clientId) {
      showMessage('Missing OAuth client ID.');
      form.hidden = true;
      return;
    }

    clearMessage();

    try {
      const data = await api('get', {
        client_id: clientId
      });

      const app = data.app || {};

      byId('managedClientId').textContent =
        app.client_id || clientId;

      byId('managedClientType').textContent =
        (app.client_type || 'public') +
        ' client';

      setValue('manageName', app.name);
      setValue('manageDescription', app.description);
      setValue('manageWebsite', app.website_url);
      setValue('manageLogo', app.logo_url);
      setValue('managePrivacy', app.privacy_url);
      setValue('manageTerms', app.terms_url);
      setValue(
        'manageRedirects',
        (app.redirect_uris || []).join('\n')
      );

      const secretSection = byId('secretManagement');
      if (secretSection) {
        secretSection.hidden =
          app.client_type !== 'confidential';
      }

      form.dataset.clientId = clientId;
      form.hidden = false;

      const loading = byId('developerLoading');
      if (loading) loading.hidden = true;
    } catch (error) {
      const loading = byId('developerLoading');
      if (loading) loading.hidden = true;
      form.hidden = true;
      showMessage(error.message);
    }
  }

  async function updateApp(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const clientId = form.dataset.clientId;
    const submit = byId('saveDeveloperApp');

    if (!clientId) return;

    clearMessage();

    if (submit) {
      submit.disabled = true;
      submit.textContent = 'Saving…';
    }

    try {
      const payload = formPayload(form);
      delete payload.client_type;

      await api('update', {
        client_id: clientId,
        ...payload
      });

      showMessage(
        'Application settings saved.',
        true
      );
    } catch (error) {
      showMessage(error.message);
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = 'Save changes';
      }
    }
  }

  async function regenerateSecret() {
    const form = byId('manageDeveloperAppForm');
    const clientId = form?.dataset.clientId;
    if (!clientId) return;

    if (!confirm(
      'Generate a new client secret? The old secret will stop working.'
    )) {
      return;
    }

    clearMessage();

    try {
      const data = await api(
        'regenerate_secret',
        { client_id: clientId }
      );

      const box = byId('newSecretBox');
      const value = byId('newClientSecret');

      if (value) {
        value.textContent =
          data.client_secret || '';
      }

      if (box) box.hidden = false;

      showMessage(
        'New client secret generated. Copy it now and update your server configuration.',
        true
      );
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function deleteApp() {
    const form = byId('manageDeveloperAppForm');
    const clientId = form?.dataset.clientId;
    if (!clientId) return;

    if (!confirm(
      'Delete this OAuth application? Existing authorisation flows for this client will stop working.'
    )) {
      return;
    }

    clearMessage();

    try {
      await api(
        'delete',
        { client_id: clientId }
      );

      location.href =
        'developer-apps.html?deleted=1';
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function copyElement(id) {
    const el = byId(id);
    if (!el) return;

    try {
      await navigator.clipboard.writeText(
        el.textContent || ''
      );
      showMessage('Copied to clipboard.', true);
    } catch {
      showMessage(
        'Could not copy automatically. Select the value and copy it manually.'
      );
    }
  }

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      if (byId('developerAppsList')) {
        requireSession().then(session => {
          if (session) loadApps();
        });

        if (
          new URLSearchParams(location.search)
            .get('deleted') === '1'
        ) {
          showMessage(
            'OAuth application deleted.',
            true
          );
        }
      }

      byId('newDeveloperAppForm')
        ?.addEventListener(
          'submit',
          createApp
        );

      if (byId('newDeveloperAppForm')) {
        requireSession();
      }

      byId('manageDeveloperAppForm')
        ?.addEventListener(
          'submit',
          updateApp
        );

      if (byId('manageDeveloperAppForm')) {
        requireSession().then(session => {
          if (session) loadManagedApp();
        });
      }

      byId('regenerateClientSecret')
        ?.addEventListener(
          'click',
          regenerateSecret
        );

      byId('deleteDeveloperApp')
        ?.addEventListener(
          'click',
          deleteApp
        );

      byId('copyCreatedClientId')
        ?.addEventListener(
          'click',
          () => copyElement('createdClientId')
        );

      byId('copyCreatedClientSecret')
        ?.addEventListener(
          'click',
          () => copyElement('createdClientSecret')
        );

      byId('copyNewClientSecret')
        ?.addEventListener(
          'click',
          () => copyElement('newClientSecret')
        );
    }
  );
})();
