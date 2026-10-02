/*
  TechNova OAuth 2.1 public-client callback.
  Exchanges the authorization code using the PKCE verifier
  created by oauth-test.js.
*/

(function () {

  const CLIENT_ID =
    'e378efe6-4f5e-43ed-832d-47738a0454ae';

  const TOKEN_ENDPOINT =
    'https://maxlbgiomkdfynnjoghs.supabase.co/auth/v1/oauth/token';

  const USERINFO_ENDPOINT =
    'https://maxlbgiomkdfynnjoghs.supabase.co/auth/v1/oauth/userinfo';

  const REDIRECT_URI =
    'https://technova-bmm.pages.dev/pages/oauth-test-callback.html';


  function setText(id, value) {

    const element =
      document.getElementById(id);

    if (element) {
      element.textContent =
        value || '—';
    }

  }


  function showError(text) {

    setText(
      'oauthResultTitle',
      'TechNova sign-in failed'
    );

    setText(
      'oauthResultStatus',
      'The OAuth flow could not be completed.'
    );

    const box =
      document.getElementById(
        'oauthResultError'
      );

    if (box) {
      box.textContent = text;
      box.classList.add('show');
    }

  }


  function clearPkceState() {

    sessionStorage.removeItem(
      'technova_oauth_code_verifier'
    );

    sessionStorage.removeItem(
      'technova_oauth_state'
    );

    sessionStorage.removeItem(
      'technova_oauth_nonce'
    );

  }


  async function completeOAuth() {

    const params =
      new URLSearchParams(location.search);

    const oauthError =
      params.get('error');

    if (oauthError) {

      const description =
        params.get('error_description');

      clearPkceState();

      showError(
        description ||
        `OAuth error: ${oauthError}`
      );

      return;

    }


    const code =
      params.get('code');

    const returnedState =
      params.get('state');

    const expectedState =
      sessionStorage.getItem(
        'technova_oauth_state'
      );

    const verifier =
      sessionStorage.getItem(
        'technova_oauth_code_verifier'
      );


    if (!code) {

      showError(
        'No authorization code was returned.'
      );

      return;

    }


    if (
      !returnedState ||
      !expectedState ||
      returnedState !== expectedState
    ) {

      clearPkceState();

      showError(
        'The OAuth state check failed. Start the sign-in again.'
      );

      return;

    }


    if (!verifier) {

      clearPkceState();

      showError(
        'The PKCE verifier is missing. Start the sign-in again in this browser.'
      );

      return;

    }


    try {

      const tokenResponse =
        await fetch(
          TOKEN_ENDPOINT,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/x-www-form-urlencoded'
            },
            body:
              new URLSearchParams({
                grant_type:
                  'authorization_code',
                code,
                client_id:
                  CLIENT_ID,
                redirect_uri:
                  REDIRECT_URI,
                code_verifier:
                  verifier
              })
          }
        );


      const tokens =
        await tokenResponse.json();


      if (
        !tokenResponse.ok ||
        !tokens.access_token
      ) {

        throw new Error(
          tokens.error_description ||
          tokens.error ||
          'The authorization code could not be exchanged.'
        );

      }


      /*
        Do not persist or display OAuth tokens.
        Use the short-lived access token only to request
        the authorised identity information.
      */
      const profileResponse =
        await fetch(
          USERINFO_ENDPOINT,
          {
            headers: {
              Authorization:
                `Bearer ${tokens.access_token}`
            }
          }
        );


      const profile =
        await profileResponse.json();


      if (!profileResponse.ok) {

        throw new Error(
          profile.error_description ||
          profile.error ||
          'TechNova could not retrieve the authorised profile.'
        );

      }


      clearPkceState();

      history.replaceState(
        {},
        document.title,
        location.pathname
      );


      setText(
        'oauthResultTitle',
        'Continue with TechNova works!'
      );

      setText(
        'oauthResultStatus',
        'The test client completed Authorization Code + PKCE and retrieved the authorised TechNova identity.'
      );

      setText(
        'resultName',
        profile.name ||
        profile.preferred_username ||
        'TechNova member'
      );

      setText(
        'resultEmail',
        profile.email ||
        'Not shared'
      );

      setText(
        'resultSubject',
        profile.sub ||
        'Not returned'
      );

      setText(
        'resultScopes',
        tokens.scope ||
        'Not returned'
      );

      setText(
        'resultIdToken',
        tokens.id_token
          ? 'Received'
          : 'Not received'
      );


      document
        .getElementById('oauthSuccess')
        ?.classList.add('show');

    } catch (error) {

      console.error(
        'TechNova OAuth callback error:',
        error
      );

      clearPkceState();

      showError(
        error?.message ||
        'The TechNova OAuth flow failed.'
      );

    }

  }


  completeOAuth();

})();
