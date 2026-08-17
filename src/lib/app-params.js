/**
 * App Parameters for Base44 Client
 * Adapted for Nuxt.js (SSR/CSR compatible)
 */

// Server-side check
const isServer = typeof window === 'undefined';

// Snake case conversion
const toSnakeCase = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

// Client-side only functions
const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
  if (isServer) {
    return defaultValue;
  }
  
  const storageKey = `base44_${toSnakeCase(paramName)}`;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);
  
  if (removeFromUrl) {
    urlParams.delete(paramName);
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
  
  if (searchParam) {
    localStorage.setItem(storageKey, searchParam);
    return searchParam;
  }
  
  const storedValue = localStorage.getItem(storageKey);
  if (storedValue && storedValue !== 'null' && storedValue !== 'undefined') {
    return storedValue;
  }
  
  if (defaultValue) {
    localStorage.setItem(storageKey, defaultValue);
    return defaultValue;
  }
  
  return defaultValue || null;
};

const getAppParams = () => {
  if (!isServer && getAppParamValue("clear_access_token") === 'true') {
    localStorage.removeItem('base44_access_token');
    localStorage.removeItem('token');
  }
  
  return {
    appId: getAppParamValue("app_id", { 
      defaultValue: process.env.NUXT_BASE44_APP_ID || "6a81f5e7f4adbf6a9523b9d8" 
    }),
    apiKey: getAppParamValue("api_key", { 
      defaultValue: process.env.NUXT_BASE44_API_KEY || null 
    }),
    token: getAppParamValue("access_token", { removeFromUrl: true }),
    fromUrl: getAppParamValue("from_url", { 
      defaultValue: isServer ? "/" : window.location.href 
    }),
    functionsVersion: getAppParamValue("functions_version", { 
      defaultValue: process.env.NUXT_BASE44_FUNCTIONS_VERSION || "v1" 
    }),
    appBaseUrl: getAppParamValue("app_base_url", { 
      defaultValue: process.env.NUXT_BASE44_APP_BASE_URL || "https://app.base44.com" 
    }),
  };
};

// Export as object (works in both SSR and CSR)
export const appParams = getAppParams();
