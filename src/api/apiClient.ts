import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ENVIRONMENT } from '../config/environment';

const SESSION_COOKIE_KEY = 'JSESSIONID';

const apiClient = axios.create({
  baseURL: ENVIRONMENT.API_BASE_URL,
  timeout: ENVIRONMENT.API_TIMEOUT,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/* =======================================================
   REQUEST INTERCEPTOR
======================================================= */

apiClient.interceptors.request.use(
  async config => {
    try {
      const sessionCookie = await AsyncStorage.getItem(
        SESSION_COOKIE_KEY,
      );

      if (sessionCookie) {
        config.headers = config.headers || {};
        config.headers.Cookie = 'JSESSIONID=' + sessionCookie;

        if (__DEV__) {
          console.log('[API SESSION] Session cookie attached');
        }
      }
    } catch (error) {
      console.log('[API SESSION READ ERROR]', error);
    }

    if (__DEV__) {
      console.log('[API REQUEST]', {
        method: config.method?.toUpperCase(),
        baseURL: config.baseURL,
        url: config.url,
        timeout: config.timeout,
      });
    }

    return config;
  },
  error => Promise.reject(error),
);

/* =======================================================
   RESPONSE INTERCEPTOR
======================================================= */

apiClient.interceptors.response.use(
  async response => {
    if (__DEV__) {
      console.log('[API RESPONSE]', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    try {
      const setCookie = response.headers?.['set-cookie'];

      if (setCookie) {
        const cookieString = Array.isArray(setCookie)
          ? String(setCookie[0] || '')
          : String(setCookie);

        const cookieName = 'JSESSIONID=';
        const startIndex = cookieString.indexOf(cookieName);

        if (startIndex !== -1) {
          const valueStart = startIndex + cookieName.length;
          const endIndex = cookieString.indexOf(';', valueStart);

          const sessionId = (
            endIndex !== -1
              ? cookieString.substring(valueStart, endIndex)
              : cookieString.substring(valueStart)
          ).trim();

          if (sessionId) {
            await AsyncStorage.setItem(
              SESSION_COOKIE_KEY,
              sessionId,
            );

            if (__DEV__) {
              console.log('[API SESSION SAVED]');
            }
          }
        }
      }
    } catch (error) {
      console.log('[API SESSION SAVE ERROR]', error);
    }

    return response;
  },
  error => {
    if (__DEV__) {
      console.log('[API ERROR]', {
        message: error?.message,
        code: error?.code,
        baseURL: error?.config?.baseURL,
        url: error?.config?.url,
        method: error?.config?.method?.toUpperCase(),
        status: error?.response?.status,
        response: error?.response?.data,
      });
    }

    return Promise.reject(error);
  },
);

/* =======================================================
   CLEAR SESSION
======================================================= */

export const clearSessionCookie = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_COOKIE_KEY);

    if (__DEV__) {
      console.log('[API SESSION CLEARED]');
    }
  } catch (error) {
    console.log('[API SESSION CLEAR ERROR]', error);
  }
};

export default apiClient;
