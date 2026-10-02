/*
  TechNova OAuth 2.1 public-client test.
  Authorization Code + PKCE (S256)
*/

(function () {

  const CLIENT_ID =
    'e378efe6-4f5e-43ed-832d-47738a0454ae';

  const AUTHORIZE_ENDPOINT =
    'https://maxlbgiomkdfynnjoghs.supabase.co/auth/v1/oauth/authorize';

  const REDIRECT_URI =
    'https://technova-bmm.pages.dev/pages/oauth-test-callback.html';

  const SCOPES =
    'openid profile email';


  function base64UrlEncode(bytes) {

    let binary = '';

    bytes.forEach(byte => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

  }


  function randomValue(size = 32) {

    const bytes =
      new Uint8Array(size);

    crypto.getRandomValues(bytes);

    return base64UrlEncode(bytes);

  }


  async function createChallenge(verifier) {

    const digest =
      await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(verifier)
      );

    return base64UrlEncode(
      new Uint8Array(digest)
    );

  }


  function showError(text) {

    const box =
      document.getElementById('oauthTestError');

    if (!box) {
      return;
    }

    box.textContent = text;
    box.classList.add('show');

  }


  async function startOAuth() {

    const button =
      document.getElementById(
        'startTechNovaOAuth'
      );

    if (button) {
      button.disabled = true;
      button.textContent =
        'Opening TechNova…';
    }

    try {

      const verifier =
        randomValue(64);

      const challenge =
        await createChallenge(verifier);

      const state =
        randomValue(32);

      const nonce =
        randomValue(32);

      sessionStorage.setItem(
        'technova_oauth_code_verifier',
        verifier
      );

      sessionStorage.setItem(
        'technova_oauth_state',
        state
      );

      sessionStorage.setItem(
        'technova_oauth_nonce',
        nonce
      );


      const url =
        new URL(AUTHORIZE_ENDPOINT);

      url.search =
        new URLSearchParams({
          response_type: 'code',
          client_id: CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          scope: SCOPES,
          state,
          nonce,
          code_challenge: challenge,
          code_challenge_method: 'S256'
        }).toString();

      location.href =
        url.toString();

    } catch (error) {

      console.error(
        'TechNova OAuth start error:',
        error
      );

      if (button) {
        button.disabled = false;
        button.textContent =
          '✦ Continue with TechNova';
      }

      showError(
        'The TechNova OAuth test could not be started.'
      );

    }

  }


  document
    .getElementById('startTechNovaOAuth')
    ?.addEventListener(
      'click',
      startOAuth
    );

})();
