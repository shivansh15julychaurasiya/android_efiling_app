
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import * as SecureStore from 'expo-secure-store';

import { ENVIRONMENT } from '../config/environment';

const SESSION_COOKIE_KEY = 'JSESSIONID';

/* =======================================================
   AXIOS INSTANCE
======================================================= */

const apiClient = axios.create({
  baseURL: ENVIRONMENT.API_BASE_URL,
  timeout: ENVIRONMENT.API_TIMEOUT,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
});

/* =======================================================
   SESSION STORAGE
======================================================= */

const getSessionId = async (): Promise<string | null> => {
  try {
    const sessionId = await SecureStore.getItemAsync(
      SESSION_COOKIE_KEY,
    );

    return sessionId?.trim() || null;
  } catch (error) {
    if (__DEV__) {
      console.log('[API SESSION READ ERROR]', error);
    }

    return null;
  }
};

const saveSessionId = async (
  sessionId: string,
): Promise<void> => {
  const cleanedSessionId = sessionId.trim();

  if (!cleanedSessionId) {
    return;
  }

  try {
    await SecureStore.setItemAsync(
      SESSION_COOKIE_KEY,
      cleanedSessionId,
    );

    if (__DEV__) {
      console.log('[API SESSION SAVED]', {
        available: true,
        length: cleanedSessionId.length,
      });
    }
  } catch (error) {
    if (__DEV__) {
      console.log('[API SESSION SAVE ERROR]', error);
    }

    throw error;
  }
};

/* =======================================================
   EXTRACT JSESSIONID
======================================================= */

const extractSessionId = (
  headers: unknown,
): string | null => {
  if (!headers || typeof headers !== 'object') {
    return null;
  }

  try {
    const responseHeaders = headers as Record<string, any>;

    let setCookie: unknown = null;

    // AxiosHeaders support
    if (typeof responseHeaders.get === 'function') {
      setCookie = responseHeaders.get('set-cookie');
    }

    // Case-insensitive fallback
    if (!setCookie) {
      const key = Object.keys(responseHeaders).find(
        name => name.toLowerCase() === 'set-cookie',
      );

      if (key) {
        setCookie = responseHeaders[key];
      }
    }

    if (__DEV__) {
      console.log('[SESSION HEADER DIAGNOSTIC]', {
        headerNames: Object.keys(responseHeaders),
        setCookiePresent: Boolean(setCookie),
      });
    }

    if (!setCookie) {
      return null;
    }

    const cookies = Array.isArray(setCookie)
      ? setCookie.map(String)
      : [String(setCookie)];

    for (const cookie of cookies) {
      const match = cookie.match(
        /(?:^|[,;]\s*)JSESSIONID=([^;,\s]+)/i,
      );

      if (match?.[1]) {
        return match[1].trim();
      }

      const fallback = cookie.match(
        /JSESSIONID=([^;,\s]+)/i,
      );

      if (fallback?.[1]) {
        return fallback[1].trim();
      }
    }

    return null;
  } catch (error) {
    if (__DEV__) {
      console.log('[SESSION EXTRACTION ERROR]', error);
    }

    return null;
  }
};

/* =======================================================
   REQUEST INTERCEPTOR
======================================================= */

apiClient.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    try {
      const isFormData =
        typeof FormData !== 'undefined' &&
        config.data instanceof FormData;

      // Important: Do not force JSON content type for file uploads.
      if (isFormData) {
        config.headers.delete('Content-Type');
      }

      const sessionId = await getSessionId();

      if (sessionId) {
        config.headers.set(
          'Cookie',
          `JSESSIONID=${sessionId}`,
        );
      }

      if (__DEV__) {
        console.log('[API REQUEST]', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          sessionAvailable: Boolean(sessionId),
          isFormData,
          contentType: config.headers.get('Content-Type'),
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.log('[API REQUEST SESSION ERROR]', error);
      }
    }

    return config;
  },

  (error: AxiosError) => {
    if (__DEV__) {
      console.log(
        '[API REQUEST INTERCEPTOR ERROR]',
        error.message,
      );
    }

    return Promise.reject(error);
  },
);

/* =======================================================
   RESPONSE SESSION PROCESSOR
======================================================= */

const processResponseSession = async (
  response: AxiosResponse,
): Promise<void> => {
  const sessionId = extractSessionId(response.headers);

  if (sessionId) {
    await saveSessionId(sessionId);
  } else if (__DEV__) {
    console.log('[API SESSION] No JSESSIONID extracted', {
      url: response.config.url,
      status: response.status,
    });
  }
};

/* =======================================================
   RESPONSE INTERCEPTORS
======================================================= */

apiClient.interceptors.response.use(
  async (response: AxiosResponse) => {
    try {
      await processResponseSession(response);
    } catch (error) {
      if (__DEV__) {
        console.log('[API SESSION PROCESS ERROR]', error);
      }
    }

    if (__DEV__) {
      console.log('[API RESPONSE]', {
        status: response.status,
        url: response.config.url,
      });
    }

    return response;
  },

  async (error: AxiosError) => {
    if (error.response) {
      try {
        await processResponseSession(error.response);
      } catch (sessionError) {
        if (__DEV__) {
          console.log('[API ERROR SESSION PROCESS ERROR]');
        }
      }
    }

    if (__DEV__) {
      console.log('[API ERROR]', {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: error.response?.status,
      });
    }

    return Promise.reject(error);
  },
);

/* =======================================================
   PUBLIC SESSION METHODS
======================================================= */

export const getSessionCookie = async (): Promise<string | null> => {
  const sessionId = await getSessionId();

  if (!sessionId) {
    if (__DEV__) {
      console.log('[API SESSION] No session cookie found');
    }

    return null;
  }

  if (__DEV__) {
    console.log('[API SESSION] Cookie retrieved successfully');
  }

  return `JSESSIONID=${sessionId}`;
};

export const hasSessionCookie = async (): Promise<boolean> => {
  return Boolean(await getSessionId());
};

export const clearSessionCookie = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(SESSION_COOKIE_KEY);

    if (__DEV__) {
      console.log('[API SESSION CLEARED]');
    }
  } catch (error) {
    if (__DEV__) {
      console.log('[API SESSION CLEAR ERROR]', error);
    }
  }
};

/* =======================================================
   EXPORT
======================================================= */

export default apiClient;
