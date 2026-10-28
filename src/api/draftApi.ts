
import apiClient from './apiClient';

export const getDraftDetails = async (): Promise<any> => {
  const response = await apiClient.get(
    '/ecourt/getDraftDetails',
  );

  console.log('GET DRAFT DETAILS STATUS:', response.status);

  console.log(
    'GET DRAFT DETAILS DATA:',
    typeof response.data === 'string'
      ? response.data.substring(0, 2000)
      : JSON.stringify(response.data, null, 2),
  );

  return response.data;
};

export const getPassedCaseDetails = async (): Promise<any> => {
  const response = await apiClient.get(
    '/ecourt/getPassedCaseDetails',
  );

  console.log('GET PASSED CASE DETAILS STATUS:', response.status);

  console.log(
    'GET PASSED CASE DETAILS DATA:',
    typeof response.data === 'string'
      ? response.data.substring(0, 2000)
      : JSON.stringify(response.data, null, 2),
  );

  return response.data;
};

export const getExpierdCaseDetails = async (): Promise<any> => {
  const response = await apiClient.get(
    '/ecourt/getExpierdCaseDetails',
  );

  console.log('GET EXPIRED CASE DETAILS STATUS:', response.status);

  console.log(
    'GET EXPIRED CASE DETAILS DATA:',
    typeof response.data === 'string'
      ? response.data.substring(0, 2000)
      : JSON.stringify(response.data, null, 2),
  );

  return response.data;
};
