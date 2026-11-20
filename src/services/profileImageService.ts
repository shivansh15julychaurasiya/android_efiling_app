
import apiClient from '../api/apiClient';
import * as FileSystem from 'expo-file-system/legacy';
import { encode } from 'base64-arraybuffer';


export const downloadProfileImage = async (
  imageName: string,
): Promise<string> => {
  if (!imageName?.trim()) {
    throw new Error('Profile image filename is missing.');
  }

  if (!FileSystem.cacheDirectory) {
    throw new Error('App cache directory is unavailable.');
  }

  const response = await apiClient.get(
    `profileImages/${encodeURIComponent(imageName)}`,
    {
      responseType: 'arraybuffer',
      headers: {
        Accept: 'image/png, image/jpeg',
      },
    },
  );

  if (response.status !== 200 || !response.data) {
    throw new Error('Unable to download profile image.');
  }

  const imageData = response.data as ArrayBuffer;

  if (!(imageData instanceof ArrayBuffer) || imageData.byteLength === 0) {
    throw new Error('Invalid or empty profile image response.');
  }

  const base64Data = encode(imageData);

  const extension = imageName.toLowerCase().endsWith('.png')
    ? 'png'
    : 'jpg';

  const localUri =
    `${FileSystem.cacheDirectory}profile_${Date.now()}.${extension}`;

  await FileSystem.writeAsStringAsync(
    localUri,
    base64Data,
    {
      encoding: FileSystem.EncodingType.Base64,
    },
  );

  return localUri;
};
