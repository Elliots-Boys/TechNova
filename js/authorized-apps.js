/*
  User-facing management for apps authorised through
  TechNova's OAuth 2.1 / OpenID Connect identity provider.
*/

(function () {

  const list =
    document.getElementById('oauthAppsList');

  const message =
    document.getElementById('oauthAppsMessage');


  function showMessage(text) {

    if (!message) {
      return;
    }

    message.textContent = text;
    message.classList.add('show');

  }


  function formatDate(value) {

    if (!value) {
      return 'Unknown';
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Unknown';
    }

    return date.toLocaleDateString(
      'en-GB',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    );

  }


  function scopeLabel(scope) {

    const labels = {
      openid: 'Identity',
      profile: 'Profile',
      email: 'Email',
      phone: 'Phone'
    };

    return labels[scope] || scope;

  }


  async function getGrants() {

    const oauth =
      window.supabaseClient?.auth?.oauth;

    if (!oauth) {
      throw new Error(
        'TechNova OAuth management is unavailable.'
      );
    }

    /*
      Supabase has exposed this operation under both
      listGrants and getUserGrants during the OAuth server rollout.
      Prefer the current listGrants name, but keep compatibility.
    */
    if (typeof oauth.listGrants === 'function') {
      return oauth.listGrants();
    }

    if (typeof oauth.getUserGrants === 'function') {
      return oauth.getUserGrants();
    }

    throw new Error(
      'This version of the authentication library cannot list OAuth grants.'
    );

  }


  function renderEmpty() {

    list.innerHTML =
      '<div class="oauth-empty">You have not authorised any third-party apps yet.</div>';

  }


  function renderGrants(grants) {

    list.replaceChildren();

    if (!grants?.length) {
      renderEmpty();
      return;
    }


    grants.forEach(grant => {

      const card =
        document.createElement('article');

      card.className =
        'oauth-app';


      const icon =
        document.createElement('div');

      icon.className =
        'oauth-app-icon';

      icon.textContent =
        '✦';


      const copy =
        document.createElement('div');


      const title =
        document.createElement('h2');

      title.textContent =
        grant.client_name ||
        'OAuth application';


      const meta =
        document.createElement('div');

      meta.className =
        'oauth-meta';

      meta.textContent =
        `Authorised ${formatDate(grant.created_at)} · Client ${grant.client_id}`;


      const scopes =
        document.createElement('div');

      scopes.className =
        'oauth-scopes';

      const grantedScopes =
        Array.isArray(grant.scopes)
          ? grant.scopes
          : [];

      (
        grantedScopes.length
          ? grantedScopes
          : ['identity']
      ).forEach(scope => {

        const badge =
          document.createElement('span');

        badge.className =
          'oauth-scope';

        badge.textContent =
          scopeLabel(scope);

        scopes.appendChild(badge);

      });


      copy.append(
        title,
        meta,
        scopes
      );


      const revoke =
        document.createElement('button');

      revoke.type =
        'button';

      revoke.className =
        'oauth-revoke';

      revoke.textContent =
        'Revoke access';

      revoke.addEventListener(
        'click',
        async () => {

          const name =
            grant.client_name ||
            'this app';

          if (
            !confirm(
              `Revoke access for ${name}? The app will need your permission again to reconnect.`
            )
          ) {
            return;
          }

          revoke.disabled = true;
          revoke.textContent =
            'Revoking…';

          const { error } =
            await window.supabaseClient.auth.oauth
              .revokeGrant(
                grant.client_id
              );

          if (error) {

            revoke.disabled = false;
            revoke.textContent =
              'Revoke access';

            showMessage(
              error.message ||
              'TechNova could not revoke this app.'
            );

            return;
          }

          await loadGrants();

        }
      );


      card.append(
        icon,
        copy,
        revoke
      );

      list.appendChild(card);

    });

  }


  async function loadGrants() {

    message?.classList.remove('show');

    const {
      data: { user },
      error: userError
    } =
      await window.supabaseClient.auth.getUser();


    if (userError || !user) {

      const returnPath =
        location.pathname +
        location.search;

      location.replace(
        `login.html?redirect=${encodeURIComponent(returnPath)}`
      );

      return;

    }


    list.innerHTML =
      '<div class="oauth-loading">Loading your authorised apps…</div>';


    try {

      const result =
        await getGrants();

      if (result.error) {
        throw result.error;
      }

      const grants =
        Array.isArray(result.data)
          ? result.data
          : result.data?.grants ||
            [];

      renderGrants(grants);

    } catch (error) {

      console.error(
        'Could not load OAuth grants:',
        error
      );

      list.innerHTML = '';

      showMessage(
        error?.message ||
        'TechNova could not load your authorised apps.'
      );

    }

  }


  loadGrants();

})();
