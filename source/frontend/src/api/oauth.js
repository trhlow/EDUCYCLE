/**
 * src/api/oauth.js
 *
 * Microsoft MSAL browser configuration.
 * Google OAuth is handled by @react-oauth/google (GoogleOAuthProvider in main.jsx).
 *
 * Usage:
 *   import { getMsalInstance, loginWithMicrosoft } from './oauth';
 *   const idToken = await loginWithMicrosoft();
 *   // Then send to BE: authApi.socialLogin({ provider: 'microsoft', token: idToken })
 */

import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';

const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';
const MICROSOFT_TENANT_ID = import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common';

// MSAL config
const msalConfig = {
  auth: {
    clientId: MICROSOFT_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// Scopes — openid + profile + email are needed to get an ID token with email claim
const LOGIN_SCOPES = ['openid', 'profile', 'email'];

let _msalInstance = null;

export async function getMsalInstance() {
  if (!_msalInstance) {
    if (!MICROSOFT_CLIENT_ID || MICROSOFT_CLIENT_ID === 'YOUR_AZURE_APPLICATION_CLIENT_ID') {
      throw new Error('Client ID của Microsoft chưa được cấu hình. Hãy thêm VITE_MICROSOFT_CLIENT_ID vào .env.local');
    }
    _msalInstance = new PublicClientApplication(msalConfig);
    await _msalInstance.initialize();
  }
  return _msalInstance;
}

/**
 * Opens Microsoft login popup and returns the ID token string.
 * @returns {Promise<string>} ID token
 */
export async function loginWithMicrosoft() {
  const msal = await getMsalInstance();

  try {
    const result = await msal.loginPopup({
      scopes: LOGIN_SCOPES,
      prompt: 'select_account',
    });
    return result.idToken;
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      // Try silent if interaction is needed
      const accounts = msal.getAllAccounts();
      if (accounts.length > 0) {
        const silentResult = await msal.acquireTokenSilent({
          scopes: LOGIN_SCOPES,
          account: accounts[0],
        });
        return silentResult.idToken;
      }
    }
    throw err;
  }
}
