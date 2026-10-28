





import apiClient from './apiClient';

import {
  ApiResponse,
  GenerateOtpRequest,
  ValidateOtpRequest,
} from '../types/auth';

export const generateOtp = async (
  username: string,
): Promise<ApiResponse> => {

  const request: GenerateOtpRequest = {
    username: username.trim(),
  };

  const response = await apiClient.post<ApiResponse>(
    '/generateOTP',
    request,
  );

  return response.data;
};

export const validateOtp = async (
  username: string,
  otp: string,
): Promise<ApiResponse> => {

  const request: ValidateOtpRequest = {
    username: username.trim(),
    um_otp: Number(otp),
  };

  const response = await apiClient.post<ApiResponse>(
    '/validateOtp',
    request,
  );

  return response.data;
};

export const getLoggedInUser = async (): Promise<any> => {

  const response = await apiClient.get(
    '/getLoggedInUser',
  );

  console.log(
    'GET LOGGED USER STATUS:',
    response.status,
  );

  console.log(
    'GET LOGGED USER DATA:',
    typeof response.data === 'string'
      ? response.data.substring(0, 500)
      : JSON.stringify(response.data, null, 2),
  );

  return response.data;
};

export const getDashboard = async (): Promise<any> => {

  const response = await apiClient.get(
    '/ecourt/getDashboard',
  );

  console.log(
    'GET DASHBOARD STATUS:',
    response.status,
  );

  console.log(
    'GET DASHBOARD CONTENT TYPE:',
    response.headers?.['content-type'],
  );

  console.log(
    'GET DASHBOARD DATA TYPE:',
    typeof response.data,
  );

  console.log(
    'GET DASHBOARD DATA:',
    typeof response.data === 'string'
      ? response.data.substring(0, 1000)
      : JSON.stringify(response.data, null, 2),
  );

  return response.data;
};

export const logoutApi = async (): Promise<void> => {
  await apiClient.get('/dms/logout');
};