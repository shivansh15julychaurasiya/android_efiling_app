
import apiClient from './apiClient';
import { AxiosError } from 'axios';

export interface CaseDocumentsParams {
  caseNo: string | number;
  caseType: string;
  caseYear: string | number;
}

export interface CaseDocument {
  sd_id?: number | string;
  sd_fd_mid?: number | string;
  sd_if_mid?: number | string;
  sd_document_id?: number | string | null;
  sd_document_name?: string;
  sd_document_no?: number | string;
  sd_document_year?: number | string;

  documentType?: string;
  submittedDate?: string | null;
  createdDate?: string | null;

  // Inherited from parent response.data.serverTypeName
  serverTypeName?: string | number | null;

  [key: string]: any;
}

interface CaseDocumentsResponse {
  response?: string;
  message?: string;
  data?: {
    serverTypeName?: string | number | null;
    subDocuments?: CaseDocument[];
  };
}

interface InspectionResponse {
  response?: string;
  message?: string;
  data?: any;
  dataList?: any;
  dataMapList?: any;
  modelData?: any;
}

export interface ViewDocumentParams {
  docId: string | number;
  serverType: string | number | null;
}

/**
 * Load case documents.
 * Inherit serverTypeName from parent data object
 * because subDocuments may contain serverTypeName: null.
 */
export const getCaseDocuments = async (
  params: CaseDocumentsParams,
): Promise<CaseDocument[]> => {
  const endpoint = 'searchcasefile/showFileForCauseList';

  const requestParams = {
    case_no: String(params.caseNo).trim(),
    case_type: String(params.caseType).trim(),
    case_year: String(params.caseYear).trim(),
  };

  console.log('========== DOCUMENT API ==========');
  console.log('BASE URL:', apiClient.defaults.baseURL);
  console.log('ENDPOINT:', endpoint);
  console.log('PARAMETERS:', requestParams);

  try {
    const response = await apiClient.get<CaseDocumentsResponse>(
      endpoint,
      {
        params: requestParams,
        timeout: 30000,
      },
    );

    console.log('DOCUMENT API STATUS:', response.status);
    console.log('DOCUMENT API RESPONSE:', response.data);

    const result = response.data;

    if (result?.response !== 'TRUE') {
      throw new Error(
        result?.message || 'The server could not load case documents.',
      );
    }

    // IMPORTANT:
    // serverTypeName is available in parent data,
    // not necessarily inside each subDocument.
    const parentServerType = result?.data?.serverTypeName;

    console.log('PARENT SERVER TYPE:', parentServerType);

    const subDocuments = result?.data?.subDocuments;

    if (!Array.isArray(subDocuments)) {
      console.warn('No subDocuments array found in API response.');
      return [];
    }

    // Copy parent server type into each document.
    const documents: CaseDocument[] = subDocuments.map((document) => ({
      ...document,
      serverTypeName:
        document.serverTypeName ?? parentServerType ?? null,
    }));

    console.log(
      'DOCUMENTS WITH SERVER TYPE:',
      documents.map((document) => ({
        sd_id: document.sd_id,
        documentType: document.documentType,
        serverTypeName: document.serverTypeName,
      })),
    );

    return documents;

  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('DOCUMENT API ERROR:', {
        status: error.response?.status,
        code: error.code,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        params: error.config?.params,
        response: error.response?.data,
        message: error.message,
      });
    } else {
      console.error('DOCUMENT API ERROR:', error);
    }

    throw error;
  }
};

/**
 * Verify whether a document is available for inspection.
 *
 * Preserves original AngularJS request:
 * getFileForInspection?id=docId&sourceServer=serverType
 */
export const checkDocumentForInspection = async (
  params: ViewDocumentParams,
): Promise<string> => {
  const endpoint = 'searchcasefile/getFileForInspection';

  const docId = String(params.docId).trim();

  if (!docId) {
    throw new Error('Document ID is missing.');
  }

  const serverType = String(params.serverType ?? '').trim();

  if (!serverType) {
    console.error('Missing sourceServer for document:', docId);

    throw new Error(
      'Document server type is missing. Please verify the sourceServer value.',
    );
  }

  const requestParams = {
    id: docId,
    sourceServer: serverType,
  };

  console.log('========== INSPECTION API ==========');
  console.log('DOCUMENT ID:', docId);
  console.log('SOURCE SERVER:', serverType);
  console.log('REQUEST PARAMETERS:', requestParams);

  try {
    const response = await apiClient.get<InspectionResponse>(
      endpoint,
      {
        params: requestParams,
        timeout: 30000,
      },
    );

    console.log('INSPECTION API STATUS:', response.status);
    console.log('INSPECTION API HEADERS:', response.headers);
    console.log('INSPECTION API RESPONSE:', response.data);

    const result = response.data;

    if (result?.response !== 'TRUE') {
      throw new Error(
        result?.message || 'Unable to open this document.',
      );
    }

    const baseURL = apiClient.defaults.baseURL;

    if (!baseURL) {
      throw new Error('API base URL is not configured.');
    }

    // Same PDF path used by the original AngularJS page.
    const normalizedBaseURL = baseURL.replace(/\/+$/, '');

    const pdfUrl =
      `${normalizedBaseURL}/uploads/${encodeURIComponent(docId)}.pdf`;

    console.log('DOCUMENT PDF URL:', pdfUrl);

    return pdfUrl;

  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('INSPECTION API ERROR:', {
        status: error.response?.status,
        code: error.code,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        params: error.config?.params,
        response: error.response?.data,
        message: error.message,
      });
    } else {
      console.error('INSPECTION API ERROR:', error);
    }

    throw error;
  }
};
