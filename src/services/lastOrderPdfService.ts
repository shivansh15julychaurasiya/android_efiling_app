import * as FileSystem from 'expo-file-system/legacy';

import apiClient, {
  getSessionCookie,
} from '../api/apiClient';

import {
  getOrderFromElegalix,
} from '../api/advocateApi';

export interface LastOrderPdfResult {
  documentId: string;
  fileUri: string;
  fileSize: number;
}

export class LastOrderPdfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LastOrderPdfError';
  }
}

/**
 * Delete a temporary Last Order PDF.
 * Developer: Vijay Chaurasiya
 */
export async function deleteLastOrderPdf(
  fileUri: string | null | undefined,
): Promise<void> {
  if (!fileUri) {
    return;
  }

  try {
    await FileSystem.deleteAsync(fileUri, {
      idempotent: true,
    });
  } catch (error) {
    console.warn(
      '[LastOrderPDF] File cleanup failed:',
      error,
    );
  }
}

/**
 * Fetch document ID and download Last Order PDF.
 * Developer: Vijay Chaurasiya
 */
export async function downloadLastOrderPdf(
  lastOrder: string | number,
): Promise<LastOrderPdfResult> {
  let temporaryUri: string | null = null;
  let transferOwnership = false;

  try {
    if (String(lastOrder).trim() === '') {
      throw new LastOrderPdfError(
        'Last Order information is missing.',
      );
    }

    // Developer: Vijay Chaurasiya
    console.log('[LastOrderPDF] Fetching document information.');

    const response = await getOrderFromElegalix(lastOrder);

    console.log('[LastOrderPDF] Response received.');

    const rawDocumentId = response?.modelData?.doc_id;

    if (
      rawDocumentId === null ||
      rawDocumentId === undefined ||
      String(rawDocumentId).trim() === ''
    ) {
      throw new LastOrderPdfError(
        'Last Order PDF document ID was not returned by the server.',
      );
    }

    const documentId = String(rawDocumentId).trim();

    console.log('[LastOrderPDF] Document ID:', documentId);

    // Developer: Vijay Chaurasiya
    const baseURL = apiClient.defaults.baseURL;

    if (!baseURL) {
      throw new LastOrderPdfError(
        'API base URL is not configured.',
      );
    }

    const normalizedBaseURL = baseURL.replace(/\/+$/, '');

    const pdfUrl =
      `${normalizedBaseURL}/uploads/` +
      `${encodeURIComponent(documentId)}.pdf`;

    console.log('[LastOrderPDF] PDF URL prepared.');

    // Developer: Vijay Chaurasiya
    const cookie = await getSessionCookie();

    console.log(
      '[LastOrderPDF] Session cookie available:',
      !!cookie,
    );

    // Developer: Vijay Chaurasiya
    const cacheDirectory = FileSystem.cacheDirectory;

    if (!cacheDirectory) {
      throw new LastOrderPdfError(
        'Device cache directory is unavailable.',
      );
    }

    const safeDocumentId = documentId.replace(
      /[^a-zA-Z0-9_-]/g,
      '_',
    );

    temporaryUri =
      `${cacheDirectory}last_order_${safeDocumentId}_${Date.now()}.pdf`;

    // Developer: Vijay Chaurasiya
    console.log('[LastOrderPDF] Starting PDF download.');

    const download = await FileSystem.downloadAsync(
      pdfUrl,
      temporaryUri,
      {
        headers: {
          Accept: 'application/pdf',
          ...(cookie ? { Cookie: cookie } : {}),
        },
      },
    );

    temporaryUri = download.uri;

    console.log(
      '[LastOrderPDF] Download HTTP status:',
      download.status,
    );

    if (download.status !== 200) {
      throw new LastOrderPdfError(
        `PDF download failed. HTTP status: ${download.status}`,
      );
    }

    // Developer: Vijay Chaurasiya
    const contentType = String(
      download.headers?.['content-type'] ??
      download.headers?.['Content-Type'] ??
      '',
    ).toLowerCase();

    console.log(
      '[LastOrderPDF] Content type:',
      contentType || 'Not provided',
    );

    if (contentType.includes('text/html')) {
      throw new LastOrderPdfError(
        'The server returned an HTML page instead of a PDF. The PDF URL or authentication needs checking.',
      );
    }

    const fileInfo = await FileSystem.getInfoAsync(
      download.uri,
    );

    if (
      !fileInfo.exists ||
      !('size' in fileInfo) ||
      !fileInfo.size ||
      fileInfo.size < 10
    ) {
      throw new LastOrderPdfError(
        'Downloaded Last Order PDF is empty or invalid.',
      );
    }

    console.log('[LastOrderPDF] Download successful:', {
      documentId,
      fileSize: fileInfo.size,
      fileUri: download.uri,
    });

    transferOwnership = true;

    return {
      documentId,
      fileUri: download.uri,
      fileSize: fileInfo.size,
    };
  } catch (error: unknown) {
    console.error('[LastOrderPDF] Download error:', error);

    if (error instanceof LastOrderPdfError) {
      throw error;
    }

    throw new LastOrderPdfError(
      error instanceof Error
        ? error.message
        : 'Unable to download Last Order PDF.',
    );
  } finally {
    // Developer: Vijay Chaurasiya
    if (temporaryUri && !transferOwnership) {
      await deleteLastOrderPdf(temporaryUri);
    }
  }
}