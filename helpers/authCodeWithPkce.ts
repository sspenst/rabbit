const clientId = 'a16d23f0a5e34c73b8719bd006b90464';
const maxRetries = 5;

function getRedirectUri() {
  return `${location.protocol}//${location.host}/app`;
}

// https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
export async function redirectToAuthCodeFlow() {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem('verifier', verifier);
  // we are restarting the auth flow, make sure any old tokens are gone
  localStorage.removeItem('accessToken');
  localStorage.removeItem('accessTokenExpiresAt');
  localStorage.removeItem('refreshToken');

  document.location = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    client_id: clientId,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: 'user-library-read user-library-modify',
  })}`;
}

function generateCodeVerifier(length: number) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);

  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// update accessToken and refreshToken in localStorage
// if no code is provided, the existing token is refreshed
// redirects to auth flow if there is an error
export async function loadTokens(code?: string) {
  const body: Record<string, string> = {
    client_id: clientId,
  };

  // use the code or try to refresh the old token
  if (code) {
    const verifier = localStorage.getItem('verifier');

    if (!verifier) {
      await redirectToAuthCodeFlow();

      return;
    } else {
      localStorage.removeItem('verifier');
    }

    body.code = code;
    body.code_verifier = verifier;
    body.grant_type = 'authorization_code';
    body.redirect_uri = getRedirectUri();
  } else {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      await redirectToAuthCodeFlow();

      return;
    }

    body.grant_type = 'refresh_token';
    body.refresh_token = refreshToken;
  }

  const result = await fetch('https://accounts.spotify.com/api/token', {
    body: new URLSearchParams(body),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  });

  if (!result.ok) {
    await redirectToAuthCodeFlow();

    return;
  }

  const { access_token, expires_in, refresh_token } = await result.json();

  localStorage.setItem('accessToken', access_token);
  localStorage.setItem('accessTokenExpiresAt', String(Date.now() + (expires_in as number) * 1000));
  localStorage.setItem('refreshToken', refresh_token);
}

// spotifyFetch returns the API's json response or null if there is an error
// may also return undefined in some cases (eg successful requests that have no response json)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function spotifyFetch(input: RequestInfo | URL, init?: RequestInit | undefined, attempt = 0): Promise<any | null> {
  // subtract 10s from expiration time to account for any timing errors
  const refreshExpiresAt = Number(localStorage.getItem('accessTokenExpiresAt') ?? '0') - 10000;

  if (refreshExpiresAt < Date.now()) {
    await loadTokens();
  }

  const accessToken = localStorage.getItem('accessToken');
  const res = await fetch(input, {
    ...init,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    await redirectToAuthCodeFlow();
  } else if (res.status === 403) {
    // could be that the scopes have updated since originally being authenticated
    // or that the user doesn't have access to the app in dev mode
    // for now, silently ignore both
  } else if (res.status === 429) {
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, (2 ** attempt) * 1000));

      return await spotifyFetch(input, init, attempt + 1);
    }
  }

  let json;

  try {
    json = await res.json();
  } catch {
    // silently catch
  }

  if (!json) {
    return undefined;
  }

  if (json.error) {
    console.error(json.error);

    return null;
  }

  return json;
}

export function removeTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('accessTokenExpiresAt');
  localStorage.removeItem('refreshToken');
}
