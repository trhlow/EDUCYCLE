/**
 * Microsoft MSAL (Azure AD) configuration cho EduCycle
 * SDK: @azure/msal-browser (đã có trong package.json)
 */
import { PublicClientApplication, LogLevel } from '@azure/msal-browser';

const TENANT_ID = import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common';
const CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';

export const msalConfig = {
  auth: {
    clientId:    CLIENT_ID,
    authority:   `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation:          'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (_level, message, containsPii) => {
        if (containsPii || !import.meta.env.DEV) return;
        console.log('[MSAL]', message);
      },
      logLevel: LogLevel.Warning,
    },
  },
};

// Scopes để lấy ID token chứa email
export const msalLoginRequest = {
  scopes:  ['openid', 'profile', 'email'],
  prompt:  'select_account',
};

let _instance = null;

export function getMsalInstance() {
  if (!CLIENT_ID) {
    console.warn('[MSAL] VITE_MICROSOFT_CLIENT_ID chưa được set. Xem .env.example');
    return null;
  }
  if (!_instance) {
    _instance = new PublicClientApplication(msalConfig);
  }
  return _instance;
}
