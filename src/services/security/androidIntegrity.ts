import { NativeModules, Platform } from 'react-native';

const GOOGLE_CLOUD_PROJECT_NUMBER = '797206797195';

interface PlayIntegrityNativeModule {
  prepareProvider(projectNumber: string): Promise<boolean>;
  requestToken(requestHash: string): Promise<string>;
}

const PlayIntegrity =
  NativeModules.PlayIntegrity as PlayIntegrityNativeModule | undefined;

export const prepareAndroidIntegrityProvider = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    throw new Error('Play Integrity is supported only on Android.');
  }

  if (!PlayIntegrity) {
    throw new Error('Play Integrity native module is not available.');
  }

  await PlayIntegrity.prepareProvider(GOOGLE_CLOUD_PROJECT_NUMBER);
};

export const requestAndroidIntegrityToken = async (
  requestHash: string
): Promise<string> => {
  if (Platform.OS !== 'android') {
    throw new Error('Play Integrity is supported only on Android.');
  }

  if (!requestHash || requestHash.length > 500) {
    throw new Error('Invalid integrity request hash.');
  }

  if (!PlayIntegrity) {
    throw new Error('Play Integrity native module is not available.');
  }

  return PlayIntegrity.requestToken(requestHash);
};