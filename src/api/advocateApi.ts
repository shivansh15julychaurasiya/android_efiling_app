import apiClient from './apiClient';

export const getCauseListDate = async (): Promise<any> => {
  const date = new Date();

  const response = await apiClient.get(
    '/ecourt/getCauseListDate/' + date.toString(),
  );

  console.log(
    'GET CAUSE LIST STATUS:',
    response.status,
  );

  console.log(
    'GET CAUSE LIST DATA:',
    typeof response.data === 'string'
      ? response.data.substring(0, 2000)
      : JSON.stringify(response.data, null, 2),
  );

  return response.data;
};

export const getSittingCourt = async (): Promise<any> => {
  const date = new Date();

  const response = await apiClient.get(
    '/ecourt/getSittingCourt/' + date.toString(),
  );

  console.log(
    'GET SITTING COURT STATUS:',
    response.status,
  );

  console.log(
    'GET SITTING COURT DATA:',
    typeof response.data === 'string'
      ? response.data.substring(0, 2000)
      : JSON.stringify(response.data, null, 2),
  );

  return response.data;
};