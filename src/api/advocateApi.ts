import apiClient from './apiClient';

/* =========================================================
   Vijay Chaurasiya
   CAUSE LIST, SITTING COURT & LAST ORDER API SERVICES
========================================================= */


export const getCauseListDate = async (
  selectedDate?: string,
): Promise<any> => {
const dateParameter = selectedDate
  ? selectedDate.toString()
  : new Date(2026, 10, 23).toString();

  console.log('CAUSE LIST REQUEST DATE:', dateParameter);

  const response = await apiClient.get(
    '/ecourt/getCauseListDate/' +
      encodeURIComponent(dateParameter),
  );

  console.log('GET CAUSE LIST STATUS:', response.status);

  console.log(
    'GET CAUSE LIST DATA:',
    typeof response.data === 'string'
      ? response.data.substring(0, 2000)
      : JSON.stringify(response.data, null, 2),
  );

  return response.data;
};


/* =========================================================
   Vijay Chaurasiya — SITTING COURT DETAILS
========================================================= */

export const getSittingCourt = async (): Promise<any> => {
  const date = new Date();

  const response = await apiClient.get(
    '/ecourt/getSittingCourt/' + date.toString(),
  );

  console.log('GET SITTING COURT STATUS:', response.status);

  console.log(
    'GET SITTING COURT DATA:',
    typeof response.data === 'string'
      ? response.data.substring(0, 2000)
      : JSON.stringify(response.data, null, 2),
  );

  return response.data;
};

/* =========================================================
   Vijay Chaurasiya — ELEGALIX LAST ORDER API
========================================================= */

export const getOrderFromElegalix = async (
  judgmentID: string | number,
): Promise<any> => {
  const response = await apiClient.get(
    '/ecourt/getOrderFromElegalix/' +
      encodeURIComponent(String(judgmentID)),
  );

  console.log('GET LAST ORDER STATUS:', response.status);

  console.log(
    'GET LAST ORDER DATA:',
    JSON.stringify(response.data, null, 2),
  );

  return response.data;
};