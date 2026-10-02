/*
  TechNova OAuth 2.1 consent screen.
  Supabase Auth handles authorization codes and tokens.
*/

(function () {

  const params =
    new URLSearchParams(location.search);

  const authorizationId =
    params.get('authorization_id');

  const loading =
    document.getElementById('oauthLoading');

  const content =
    document.getElementById('oauthContent');

  const idle =
    document.getElementById('oauthIdle');

  const message =
    document.getElementById('oauthMessage');

  const approveButton =
    document.getElementById('oauthApprove');

  const denyButton =
    document.getElementById('oauthDeny');


  function showError(text) {

    if (loading) {
      loading.classList.add('oauth-hidden');
    }

    if (content) {
      content.classList.add('oauth-hidden');
    }

    if (message) {
      message.textContent = text;
      message.classList.add('show');
    }

  }


  function setBusy(busy) {

    if (approveButton) {
      approveButton.disabled = busy;
      approveButton.textContent =
        busy ? 'Authorising…' : 'Authorise';
    }

    if (denyButton) {
      denyButton.disabled = busy;
      denyButton.textContent =
        busy ? 'Please wait…' : 'Cancel';
    }

  }


  function scopeDescription(scope) {

    const descriptions = {
      openid: 'Identify your TechNova account',
      profile: 'View your basic TechNova profile',
      email: 'View your email address and verification status',
      phone: 'View your phone number, when available'
    };

    return (
      descriptions[scope] ||
      `Permission: ${scope}`
    );

  }


  async function loadConsent() {

    if (!authorizationId) {

      loading?.classList.add(
        'oauth-hidden'
      );

      message?.classList.remove(
        'show'
      );

      content?.classList.add(
        'oauth-hidden'
      );

      idle?.classList.remove(
        'oauth-hidden'
      );

      return;

    }


    if (
      !window.supabaseClient ||
      !window.supabaseClient.auth?.oauth
    ) {

      showError(
        'TechNova OAuth is not available in this browser. Refresh the page and try again.'
      );

      return;

    }


    const {
      data: { user },
      error: userError
    } =
      await window.supabaseClient.auth.getUser();


    if (userError) {

      showError(
        userError.message ||
        'TechNova could not check your account.'
      );

      return;

    }


    if (!user) {

      const returnPath =
        location.pathname +
        location.search;

      location.replace(
        `login.html?redirect=${encodeURIComponent(returnPath)}`
      );

      return;

    }


    const {
      data: details,
      error
    } =
      await window.supabaseClient.auth.oauth
        .getAuthorizationDetails(
          authorizationId
        );


    if (error || !details) {

      showError(
        error?.message ||
        'This authorisation request is invalid or has expired.'
      );

      return;

    }


    /*
      Supabase may return a redirect_url without a new authorization_id
      when this user has already granted the requested access.
    */
    if (
      !('authorization_id' in details) &&
      details.redirect_url
    ) {

      location.replace(
        details.redirect_url
      );

      return;

    }


    const clientName =
      details.client?.name ||
      'this application';

    document
      .getElementById('oauthClientName')
      ?.replaceChildren(
        document.createTextNode(clientName)
      );


    const displayName =
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.preferred_username ||
      user.email?.split('@')[0] ||
      'TechNova member';

    document
      .getElementById('oauthUserName')
      ?.replaceChildren(
        document.createTextNode(displayName)
      );


    const email =
      document.getElementById('oauthUserEmail');

    if (email && user.email) {
      email.textContent =
        ` · ${user.email}`;
    }


    const list =
      document.getElementById('oauthScopes');

    const scopes =
      (details.scope || '')
        .split(/\s+/)
        .filter(Boolean);

    if (list) {

      list.replaceChildren(
        ...(scopes.length
          ? scopes
          : ['openid']
        ).map(scope => {

          const item =
            document.createElement('li');

          const check =
            document.createElement('span');

          check.className =
            'oauth-check';

          check.textContent =
            '✓';

          const text =
            document.createElement('span');

          text.textContent =
            scopeDescription(scope);

          item.append(
            check,
            text
          );

          return item;

        })
      );

    }


    const returnHost =
      document.getElementById('oauthReturnHost');

    if (returnHost) {

      try {

        const redirect =
          new URL(details.redirect_uri);

        returnHost.textContent =
          redirect.hostname;

      } catch {

        returnHost.textContent =
          'the requesting application';

      }

    }


    loading?.classList.add(
      'oauth-hidden'
    );

    content?.classList.remove(
      'oauth-hidden'
    );

  }


  async function decide(approve) {

    if (!authorizationId) {
      return;
    }

    setBusy(true);

    if (message) {
      message.classList.remove('show');
    }


    const method =
      approve
        ? window.supabaseClient.auth.oauth
            .approveAuthorization
            .bind(window.supabaseClient.auth.oauth)
        : window.supabaseClient.auth.oauth
            .denyAuthorization
            .bind(window.supabaseClient.auth.oauth);


    const {
      data,
      error
    } =
      await method(
        authorizationId
      );


    if (
      error ||
      !data?.redirect_url
    ) {

      setBusy(false);

      if (message) {

        message.textContent =
          error?.message ||
          'TechNova could not complete this authorisation request.';

        message.classList.add('show');

      }

      return;

    }


    location.href =
      data.redirect_url;

  }


  approveButton
    ?.addEventListener(
      'click',
      () => decide(true)
    );

  denyButton
    ?.addEventListener(
      'click',
      () => decide(false)
    );


  loadConsent();

})();
