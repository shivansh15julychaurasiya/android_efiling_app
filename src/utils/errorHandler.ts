import axios from 'axios';

export const getApiErrorMessage = (
  error: unknown,
): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const responseData = error.response.data;

      if (
        responseData &&
        typeof responseData === 'object'
      ) {
        if (typeof responseData.message === 'string') {
          return responseData.message;
        }

        if (typeof responseData.data === 'string') {
          return responseData.data;
        }
      }

      return `Server error (${error.response.status}). Please try again.`;
    }

    if (error.request) {
      return 'Unable to connect to the server. Please check your network connection.';
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};