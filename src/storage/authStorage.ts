import * as SecureStore from 'expo-secure-store';

const USERNAME_KEY = 'efiling_username';
const AUTHENTICATED_KEY = 'efiling_authenticated';

export const saveAuthentication = async (
  username: string,
): Promise<void> => {
  await SecureStore.setItemAsync(USERNAME_KEY, username);

  await SecureStore.setItemAsync(
    AUTHENTICATED_KEY,
    'true',
  );
};

export const getStoredUsername =
  async (): Promise<string | null> => {
    return SecureStore.getItemAsync(USERNAME_KEY);
  };

export const isAuthenticated =
  async (): Promise<boolean> => {
    const value =
      await SecureStore.getItemAsync(
        AUTHENTICATED_KEY,
      );

    return value === 'true';
  };

export const clearAuthentication =
  async (): Promise<void> => {
    await SecureStore.deleteItemAsync(
      USERNAME_KEY,
    );

    await SecureStore.deleteItemAsync(
      AUTHENTICATED_KEY,
    );
  };