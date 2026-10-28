
import { CaseFilePetition } from '../types/caseFilePetition';
import apiClient from './apiClient';

export const getCasesAsPetitioner = async (): Promise<CaseFilePetition[]> => {
  console.log('Fetching cases as petitioner...');

  const response = await apiClient.get('/ecourt/getCaseAsPet');

  console.log('Cases as petitioner API response:', response.data);

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};


export const getCasesAsRespondent = async (): Promise<CaseFilePetition[]> => {
  console.log('>>> RESPONDENT API FUNCTION CALLED <<<');

  const response = await apiClient.get('/ecourt/getCaseAsRes');

  console.log('>>> RESPONDENT API URL:', response.config.url);
  console.log('>>> RESPONDENT API DATA:', response.data);

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};
