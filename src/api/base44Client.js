import { createClient } from '@base44/sdk';
import { appParams } from '../lib/app-params.js';

// Deaktivácia interného Base44 SDK analytics v guest / standalone režime
// Client-side only initialization
if (typeof window !== 'undefined') {
  if (!window.base44SharedInstances) {
    window.base44SharedInstances = {};
  }
  window.base44SharedInstances.analytics = {
    instance: {
      requestsQueue: [],
      isProcessing: false,
      isHeartBeatProcessing: false,
      wasInitializationTracked: true,
      sessionContext: {
        user_id: null,
        session_id: 'guest-session'
      },
      sessionStartTime: null,
      config: {
        enabled: false,
        maxQueueSize: 0,
        throttleTime: 999999,
        batchSize: 0,
        heartBeatInterval: 999999
      }
    }
  };
}

const { appId, apiKey, token, functionsVersion, appBaseUrl } = appParams;

// Create a client configured to communicate directly with Base44 platform
export const base44 = createClient({
  appId: appId || '6a81f5e7f4adbf6a9523b9d8',
  token,
  headers: apiKey ? { api_key: apiKey } : undefined,
  functionsVersion: functionsVersion || 'v1',
  serverUrl: appBaseUrl || 'https://app.base44.com',
  requiresAuth: false,
  appBaseUrl: appBaseUrl || 'https://app.base44.com'
});

// Bezpečný wrapper pre base44.auth.me — bez fake admin guest používateľa
const originalMe = base44.auth?.me ? base44.auth.me.bind(base44.auth) : null;
if (originalMe) {
  base44.auth.me = async () => {
    // Client-side only
    if (typeof window === 'undefined') {
      return null;
    }

    const storedToken = 
      localStorage.getItem('base44_access_token') || 
      localStorage.getItem('token') || 
      appParams?.token;

    if (!storedToken) {
      return null;
    }

    try {
      return await originalMe();
    } catch {
      return null;
    }
  };
}

// Export pre Nuxt plugins/composables
export default base44;
