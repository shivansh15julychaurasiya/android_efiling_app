
import * as SecureStore from 'expo-secure-store';

const USERNAME_KEY = 'efiling_username';
const AUTHENTICATED_KEY = 'efiling_authenticated';

export const saveAuthentication = async (
  username: string,
): Promise<void> => {
  const normalizedUsername = username.trim();

  if (!normalizedUsername) {
    throw new Error('Username is required.');
  }

  await SecureStore.setItemAsync(
    USERNAME_KEY,
    normalizedUsername,
  );

  await SecureStore.setItemAsync(
    AUTHENTICATED_KEY,
    'true',
  );
};

export const getStoredUsername =
  async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(USERNAME_KEY);
    } catch (error) {
      if (__DEV__) {
        console.log('[AUTH STORAGE READ ERROR]', error);
      }
      return null;
    }
  };

export const isAuthenticated =
  async (): Promise<boolean> => {
    try {
      const value = await SecureStore.getItemAsync(
        AUTHENTICATED_KEY,
      );

      return value === 'true';
    } catch (error) {
      if (__DEV__) {
        console.log('[AUTH STORAGE CHECK ERROR]', error);
      }
      return false;
    }
  };

export const clearAuthentication =
  async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(USERNAME_KEY);
      await SecureStore.deleteItemAsync(AUTHENTICATED_KEY);
    } catch (error) {
      if (__DEV__) {
        console.log('[AUTH STORAGE CLEAR ERROR]', error);
      }
      throw error;
    }
  };
