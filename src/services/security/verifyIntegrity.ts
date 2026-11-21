import { Platform } from 'react-native';
import {
  prepareAndroidIntegrityProvider,
  requestAndroidIntegrityToken,
} from './androidIntegrity';

import apiClient from '../../api/apiClient';

export const generateIntegrityToken = async (
  requestHash: string,
): Promise<string> => {
  if (Platform.OS !== 'android') {
    throw new Error('Android only');
  }

  await prepareAndroidIntegrityProvider();

  const token = await requestAndroidIntegrityToken(requestHash);

  if (!token) {
    throw new Error('Unable to generate Integrity token');
  }

  return token;
};

export const verifyAndroidIntegrity = async () => {
  const requestHash = 'efiling-integrity-test-20261120';

  const integrityToken = await generateIntegrityToken(requestHash);

  const response = await apiClient.post(
    '/mobile/decode-integrity-token',
    { integrityToken },
  );

  return response.data;
};