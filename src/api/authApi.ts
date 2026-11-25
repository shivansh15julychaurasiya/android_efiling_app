
import apiClient, {
  clearSessionCookie,
  getSessionCookie,
} from './apiClient';

import {
  ApiResponse,
  GenerateOtpRequest,
  ValidateOtpRequest,
} from '../types/auth';

/* =======================================================
   SESSION DIAGNOSTICS
======================================================= */

const logSessionStatus = async (
  stage: string,
): Promise<void> => {
  const cookie = await getSessionCookie();

  if (__DEV__) {
    console.log(`[${stage}]`, {
      sessionAvailable: Boolean(cookie),
    });
  }
};

/* =======================================================
   GENERATE OTP
======================================================= */

export const generateOtp = async (
  username: string,
): Promise<ApiResponse> => {
  const normalizedUsername = username.trim();

  if (!normalizedUsername) {
    throw new Error('Username is required.');
  }

  const request: GenerateOtpRequest = {
    username: normalizedUsername,
  };

  if (__DEV__) {
    console.log('[OTP GENERATION] Starting request');
  }

  const response = await apiClient.post<ApiResponse>(
    '/generateOTPApp',
    request,
  );

  await logSessionStatus('AFTER GENERATE OTP');

  if (__DEV__) {
    console.log('[OTP GENERATION RESPONSE]', {
      status: response.status,
      response: response.data?.response,
      dataType: typeof response.data,
    });
  }

  return response.data;
};

/* =======================================================
   VALIDATE OTP
======================================================= */

export const validateOtp = async (
  username: string,
  otp: string,
): Promise<ApiResponse> => {
  const normalizedUsername = username.trim();
  const normalizedOtp = otp.trim();

  if (!normalizedUsername) {
    throw new Error('Username is required.');
  }

  if (!/^\d{4}$/.test(normalizedOtp)) {
    throw new Error('Please enter a valid 4-digit OTP.');
  }

  const request: ValidateOtpRequest = {
    username: normalizedUsername,
    um_otp: Number(normalizedOtp),
  };

  if (__DEV__) {
    console.log('[OTP VALIDATION] Starting request');
  }

  const response = await apiClient.post<ApiResponse>(
    '/validateOtp',
    request,
  );

  await logSessionStatus('AFTER VALIDATE OTP');

  if (__DEV__) {
    console.log('[OTP VALIDATION RESPONSE]', {
      status: response.status,
      response: response.data?.response,
      dataType: typeof response.data,
    });
  }

  return response.data;
};







/*
 * ============================================================
 * Developer : Vijay Chaurasiya
 * Project   : Allahabad High Court eFiling Application
 * Module    : Authentication API
 * Feature   : Final username and password validation
 * ============================================================
 */

export const loginWithPassword = async (
  username: string,
  password: string,
) => {
  const response = await apiClient.post('dms/userlogin', {
    username,
    password,
  });

  return response.data;
};

/* =======================================================
   GET LOGGED-IN USER
======================================================= */

export const getLoggedInUser = async (): Promise<any> => {
  const response = await apiClient.get(
    '/getLoggedInUser',
  );

  await logSessionStatus('AFTER GET LOGGED IN USER');

  if (__DEV__) {
    console.log('[GET LOGGED USER]', {
      status: response.status,
      dataType: typeof response.data,
      response: response.data?.response,
    });
  }

  return response.data;
};

/* =======================================================
   GET DASHBOARD
======================================================= */

export const getDashboard = async (): Promise<any> => {
  const response = await apiClient.get(
    '/ecourt/getDashboard',
  );

  if (__DEV__) {
    console.log('[GET DASHBOARD]', {
      status: response.status,
      contentType: response.headers?.['content-type'],
      dataType: typeof response.data,
    });
  }

  return response.data;
};

/* =======================================================
   LOGOUT
======================================================= */

export const logoutApi = async (): Promise<void> => {
  try {
    await apiClient.get('/dms/logout');
  } finally {
    await clearSessionCookie();
  }
};
