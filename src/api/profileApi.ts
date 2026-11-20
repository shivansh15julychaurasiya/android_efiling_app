
import axios from 'axios';
import apiClient from './apiClient';

/* ============================================================
 * Vijay Chaurasiya - Profile Image Download
 * ============================================================ */
export interface UploadProfileImageResponse {
  success: boolean;
  message: string;
  imageName?: string;
  imageUrl?: string;
}

export interface ChangePasswordResponse {
  response?: string;
  message?: string;
  [key: string]: unknown;
}

export interface SelectedProfileImage {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  name?: string | null;
  type?: string | null;
  fileSize?: number;
}
/* ============================================================
 * Vijay Chaurasiya - Profile Image Download
 * ============================================================ */
const getImageExtension = (uri: string): string => {
  const cleanUri = uri.split('?')[0].split('#')[0];
  const extension = cleanUri.split('.').pop()?.toLowerCase();

  if (extension === 'png') return 'png';
  if (extension === 'jpg' || extension === 'jpeg') return 'jpg';

  return 'jpg';
};

const getImageMimeType = (
  image: SelectedProfileImage,
  extension: string,
): string => {
  const mimeType = image.mimeType || image.type;

  if (mimeType === 'image/png') return 'image/png';
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return 'image/jpeg';
  }

  return extension === 'png' ? 'image/png' : 'image/jpeg';
};

/**
 * Upload advocate profile image.
 *
 * Backend endpoint:
 * POST /uploadProfileImage
 *
 * Multipart parameter:
 * file
 */
export const uploadProfileImage = async (
  image: SelectedProfileImage,
): Promise<UploadProfileImageResponse> => {
  if (!image || !image.uri) {
    throw new Error('Profile image URI is missing.');
  }

  const extension = getImageExtension(image.uri);

  const fileName =
    image.fileName ||
    image.name ||
    `profile_${Date.now()}.${extension}`;

  const mimeType = getImageMimeType(image, extension);

  const formData = new FormData();

  formData.append(
    'file',
    {
      uri: image.uri,
      name: fileName,
      type: mimeType,
    } as any,
  );

  console.log('[UPLOAD DEBUG]', {
    uri: image.uri,
    name: fileName,
    type: mimeType,
    fileSize: image.fileSize,
    isFormData: formData instanceof FormData,
  });

  try {
    const response = await apiClient.post<UploadProfileImageResponse>(
      '/uploadProfileImage',
      formData,
      {
        headers: {
          Accept: 'application/json',
        },
        timeout: 60000,
      },
    );

    console.log('[UPLOAD SUCCESS]', {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.log('[UPLOAD FAILURE]', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        response: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });
    } else {
      console.log('[UPLOAD FAILURE]', error);
    }

    throw error;
  }
};
/* ============================================================
 * Vijay Chaurasiya 
 * ============================================================ */

/**
 * Change advocate password.
 */
export const changePasswordApi = async (
  payload: Record<string, unknown>,
): Promise<ChangePasswordResponse> => {
  const response = await apiClient.post(
    '/user/changePassword',
    payload,
  );

  if (typeof response.data === 'string') {
    try {
      return JSON.parse(response.data) as ChangePasswordResponse;
    } catch {
      return {
        response: response.data,
      };
    }
  }

  return response.data as ChangePasswordResponse;
};
/* ============================================================
 * Vijay Chaurasiya 
 * ============================================================ */
/**
 * Get profile image URL.
 */
export const getProfileImageUrl = (imageName: string): string => {
  if (!imageName) {
    return '';
  }

  return (
    `/profileImages/${encodeURIComponent(imageName)}?t=${Date.now()}`
  );
};
