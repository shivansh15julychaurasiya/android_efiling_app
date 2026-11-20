
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';

import {
  getCaseDocuments,
  checkDocumentForInspection,
  CaseDocument,
} from '../api/caseDocumentApi';

import { getSessionCookie } from '../api/apiClient';
import PdfViewer from '../components/viewer/PdfViewer';

interface CaseDetails {
  case_no?: string | number;
  case_type?: string;
  case_year?: string | number;
  caseType?: string;
  caseYear?: string | number;
  Case_Type?: string;
  Case_Type_Name?: string;
  cause_reg_no?: string | number;
  cause_reg_year?: string | number;
  cause_type?: string;
  cino?: string;
  CINO?: string;
  [key: string]: unknown;
}

interface Props {
  navigation: {
    goBack: () => void;
  };
  route: {
    params?: {
      caseDetails?: CaseDetails;
    };
  };
}

const COLORS = {
  primary: '#E87500',
  primaryDark: '#B94D00',
  primaryLight: '#FFF0DC',
  saffron: '#FF9933',
  gold: '#FFC266',
  background: '#FFF7ED',
  card: '#FFFFFF',
  text: '#512500',
  secondaryText: '#986039',
  border: '#F3D2B1',
  divider: '#F5E6D6',
  error: '#B42318',
  success: '#26734D',
  pdfBackground: '#E9EDF3',
  pdfPrimary: '#071A3D',
};

const CaseDocumentsScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const caseDetails = route.params?.caseDetails ?? {};

  const caseNo =
    caseDetails.cause_reg_no ??
    caseDetails.case_no;

  const caseType =
    caseDetails.Case_Type_Name ??
    caseDetails.case_type ??
    caseDetails.caseType ??
    caseDetails.Case_Type ??
    caseDetails.cause_type;

  const caseYear =
    caseDetails.cause_reg_year ??
    caseDetails.case_year ??
    caseDetails.caseYear;

  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewLoadingId, setViewLoadingId] = useState<string | null>(null);

  const [pdfVisible, setPdfVisible] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [pdfDocumentTitle, setPdfDocumentTitle] = useState('');

  /* =====================================================
     FETCH CASE DOCUMENTS
     Developed by Vijay Chaurasiya
  ===================================================== */

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError('');
    setDocuments([]);

    try {
      console.log('==========vIJAY CHAURASIYA== CASE DOCUMENT REQUEST ==========');
      console.log({
        case_no: caseNo,
        case_type: caseType,
        case_year: caseYear,
      });
      console.log('============================================');

      if (
        caseNo === undefined ||
        caseNo === null ||
        String(caseNo).trim() === ''
      ) {
        throw new Error('Case number is missing.');
      }

      if (
        caseType === undefined ||
        caseType === null ||
        String(caseType).trim() === ''
      ) {
        throw new Error('Case type is missing.');
      }

      if (
        caseYear === undefined ||
        caseYear === null ||
        String(caseYear).trim() === ''
      ) {
        throw new Error('Case year is missing.');
      }

      const result = await getCaseDocuments({
        caseNo,
        caseType: String(caseType).trim(),
        caseYear,
      });

      console.log('Documents received:', result.length);

      if (result.length > 0) {
        console.log(
          'FIRST DOCUMENT RESPONSE:',
          JSON.stringify(result[0], null, 2),
        );
      }

      setDocuments(result);
    } catch (err: unknown) {
      console.error('Case Documents Error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load case documents. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [caseNo, caseType, caseYear]);

  useEffect(() => {
    console.log('==========VIJAY -CHAURASIYA: CASE DETAILS ==========');
    console.log(JSON.stringify(caseDetails, null, 2));
    console.log('==================================');

    fetchDocuments();
  }, [fetchDocuments]);

  /* =====================================================
    ========== Vijay Chaurasiya==========================
  ===================================================== */

  const handlePdfViewerDispose = useCallback(
    async (uri: string) => {
      console.log('[PDF] Viewer closed. Cleaning temporary file.');

      setPdfUri((currentUri) =>
        currentUri === uri ? null : currentUri,
      );

      try {
        const info = await FileSystem.getInfoAsync(uri);

        if (info.exists) {
          await FileSystem.deleteAsync(uri, {
            idempotent: true,
          });

          console.log('[PDF] Temporary PDF deleted.');
        }
      } catch (cleanupError) {
        console.warn(
          '[PDF] Temporary file cleanup failed:',
          cleanupError,
        );
      }
    },
    [],
  );

  /* =====================================================
     VIEW DOCUMENT PDF
     Local file URI - no Base64 conversion.
     Developed by  VIJAY-CHAURASIYA:
  ===================================================== */

  const handleViewDocument = useCallback(
    async (item: CaseDocument) => {
      const docId = item.sd_id;
      const serverType = item.serverTypeName;

      console.log('========== OPEN CASE DOCUMENT ==========');
      console.log('Document ID:', docId);
      console.log('Server Type:', serverType);
      console.log('========================================');

      if (
        docId === undefined ||
        docId === null ||
        String(docId).trim() === ''
      ) {
        Alert.alert(
          'Missing Document ID',
          `The document record does not contain sd_id.\nAvailable fields: ${Object.keys(item).join(', ')}`,
        );
        return;
      }

      let downloadedFileUri: string | null = null;
      let keepDownloadedFile = false;

      try {
        setViewLoadingId(String(docId));

       
        setPdfVisible(false);

        const documentUrl = await checkDocumentForInspection({
          docId,
          serverType,
        });

        if (
          !documentUrl ||
          typeof documentUrl !== 'string' ||
          !/^https?:\/\//i.test(documentUrl)
        ) {
          throw new Error(
            'Invalid document URL received from server.',
          );
        }

        console.log('[PDF] Document URL received.');

       

        const cookie = await getSessionCookie();

        
        if (!FileSystem.cacheDirectory) {
          throw new Error(
            'Application cache directory is unavailable.',
          );
        }

        const safeDocId = String(docId).replace(
          /[^a-zA-Z0-9_-]/g,
          '_',
        );

        const fileUri =
          `${FileSystem.cacheDirectory}case_document_${safeDocId}_${Date.now()}.pdf`;

        downloadedFileUri = fileUri;

        /*  VIJAY-CHAURASIYA: */

        console.log('[PDF] Downloading document...');

        const download = await FileSystem.downloadAsync(
          documentUrl,
          fileUri,
          {
            headers: {
              Accept: 'application/pdf',
              ...(cookie ? { Cookie: cookie } : {}),
            },
          },
        );

        console.log('[PDF] Download status:', download.status);

        if (download.status !== 200) {
          throw new Error(
            `Unable to download document. Server returned status ${download.status}.`,
          );
        }

        downloadedFileUri = download.uri;

        /*  VIJAY-CHAURASIYA: */

        const fileInfo = await FileSystem.getInfoAsync(
          download.uri,
        );

        if (
          !fileInfo.exists ||
          !('size' in fileInfo) ||
          !fileInfo.size ||
          fileInfo.size < 5
        ) {
          throw new Error('Downloaded PDF file is empty.');
        }

        console.log(
          '[PDF] Downloaded file size:',
          fileInfo.size,
          'bytes',
        );

        console.log('[PDF] Local URI:', download.uri);

        

        setPdfDocumentTitle(
          item.documentType || 'Case Document',
        );

        keepDownloadedFile = true;
        setPdfUri(download.uri);
        setPdfVisible(true);

        console.log('[PDF] Opening local PDF in WebView.');
      } catch (err: unknown) {
        console.error('[PDF] VIEW DOCUMENT ERROR:', err);

        Alert.alert(
          'Unable to View Document',
          err instanceof Error
            ? err.message
            : 'Something went wrong while opening the document.',
        );
      } finally {
        // Delete immediately only when the viewer was not opened.
        if (downloadedFileUri && !keepDownloadedFile) {
          try {
            await FileSystem.deleteAsync(
              downloadedFileUri,
              { idempotent: true },
            );
          } catch (cleanupError) {
            console.warn(
              '[PDF] Download cleanup failed:',
              cleanupError,
            );
          }
        }

        setViewLoadingId(null);
      }
    },
    [],
  );

  /* =====================================================
     CLOSE PDF VIEWER
  ===================================================== */

  const closePdfViewer = useCallback(() => {
    // Conditional rendering below unmounts PdfViewer.
    // Its onDispose callback then deletes the cached PDF.
    setPdfVisible(false);
    setPdfDocumentTitle('');
  }, []);

  /* =====================================================
      VIJAY-CHAURASIYA:
  ===================================================== */

  const renderDocument = useCallback(
    ({
      item,
      index,
    }: {
      item: CaseDocument;
      index: number;
    }) => {
      const isOpening =
        viewLoadingId === String(item.sd_id);

      return (
        <View style={styles.documentCard}>
          <View style={styles.documentCardHeader}>
            <View style={styles.documentIconContainer}>
              <Text style={styles.documentIcon}>▤</Text>
            </View>

            <View style={styles.documentHeading}>
              <Text style={styles.documentHeadingTitle}>
                Document {index + 1}
              </Text>

              <Text style={styles.documentHeadingSubtitle}>
                Case document details
              </Text>
            </View>

            <View style={styles.documentNumberBadge}>
              <Text style={styles.documentNumberText}>
                #{index + 1}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <Text style={styles.fieldLabel}>DOCUMENT TYPE</Text>

          <Text style={styles.documentType}>
  {item.documentType === 'ORDER'
    ? 'STAMP REPORT'
    : item.documentType || 'N/A'}
</Text>

          <View style={styles.separator} />

          <Text style={styles.fieldLabel}>DOCUMENT DATE</Text>

          <Text style={styles.documentDate}>
            {item.submittedDate || item.createdDate || 'N/A'}
          </Text>

          <TouchableOpacity
            style={[
              styles.viewDocumentButton,
              isOpening && styles.viewDocumentButtonDisabled,
            ]}
            onPress={() => handleViewDocument(item)}
            disabled={viewLoadingId !== null}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`View document ${index + 1}`}
          >
            {isOpening ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
                <Text style={styles.viewDocumentButtonText}>
                  Opening Document...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.viewDocumentIcon}>▣</Text>
                <Text style={styles.viewDocumentButtonText}>
                  View Document
                </Text>
                <Text style={styles.viewDocumentArrow}>→</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    },
    [viewLoadingId, handleViewDocument],
  );

  /* =====================================================
      VIJAY-CHAURASIYA:
  ===================================================== */

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={navigation.goBack}
        style={styles.backButton}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      <View style={styles.headerTextContainer}>
        <Text style={styles.headerEyebrow}>
          ALLAHABAD HIGH COURT
        </Text>

        <Text style={styles.headerTitle}>
          Case Documents
        </Text>

        <Text
          style={styles.headerSubtitle}
          numberOfLines={1}
        >
          Case No. {caseDetails.case_no ?? caseNo ?? 'N/A'}
        </Text>
      </View>

      <View style={styles.headerIconContainer}>
        <Text style={styles.headerIcon}>▤</Text>
      </View>
    </View>
  );

  /* =====================================================
     VIJAY-CHAURASIYA:: LOADING STATE
  ===================================================== */

  const renderLoading = () => (
    <View style={styles.centerContent}>
      <View style={styles.loadingIconContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.loadingTitle}>
        Loading Documents
      </Text>

      <Text style={styles.statusText}>
        Please wait while we fetch your case documents.
      </Text>
    </View>
  );

  /* =====================================================
      VIJAY-CHAURASIYA: ERROR STATE
  ===================================================== */

  const renderError = () => (
    <View style={styles.centerContent}>
      <View style={styles.errorIconContainer}>
        <Text style={styles.errorIcon}>!</Text>
      </View>

      <Text style={styles.errorTitle}>
        Unable to Load Documents
      </Text>

      <Text style={styles.errorText}>{error}</Text>

      <TouchableOpacity
        style={styles.retryButton}
        onPress={fetchDocuments}
        activeOpacity={0.8}
      >
        <Text style={styles.retryText}>↻ Retry</Text>
      </TouchableOpacity>
    </View>
  );

  /* =====================================================
     EMPTY STATE
  ===================================================== */

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>▤</Text>
      </View>

      <Text style={styles.emptyTitle}>
        No Documents Found
      </Text>

      <Text style={styles.emptyText}>
        No documents are currently available for this case.
      </Text>

      <TouchableOpacity
        style={styles.emptyRetryButton}
        onPress={fetchDocuments}
        activeOpacity={0.8}
      >
        <Text style={styles.emptyRetryText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        backgroundColor={COLORS.primaryDark}
        barStyle="light-content"
      />

      {renderHeader()}

      {loading ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item, index) =>
            String(item.sd_id ?? index)
          }
          renderItem={renderDocument}
          contentContainerStyle={[
            styles.listContent,
            documents.length === 0 && styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          windowSize={5}
          removeClippedSubviews
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <View>
                <Text style={styles.resultsTitle}>
                  Available Documents
                </Text>

                <Text style={styles.resultsSubtitle}>
                  Documents associated with this case
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countNumber}>
                  {documents.length}
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={renderEmpty}
        />
      )}

      <Modal
        visible={pdfVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closePdfViewer}
        statusBarTranslucent={false}
      >
        <SafeAreaView
          style={styles.pdfModalContainer}
          edges={['top', 'left', 'right', 'bottom']}
        >
          <View style={styles.pdfModalHeader}>
            <View style={styles.pdfModalHeaderLeft}>
              <Text
                style={styles.pdfModalTitle}
                numberOfLines={1}
              >
                {pdfDocumentTitle || 'Document Viewer'}
              </Text>

              <Text style={styles.pdfModalSubtitle}>
                ALLAHABAD HIGH COURT
              </Text>
            </View>

            <TouchableOpacity
              style={styles.pdfCloseButton}
              onPress={closePdfViewer}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Close PDF viewer"
            >
              <Text style={styles.pdfCloseText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pdfViewerContent}>
            {pdfVisible && pdfUri && (
              <PdfViewer
                pdfUri={pdfUri}
                onDispose={handlePdfViewerDispose}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default CaseDocumentsScreen;

/* =====================================================
   STYLES - BHAGWA
   Developed by Vijay Chaurasiya
===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 17,
    paddingTop: 13,
    paddingBottom: 17,
    marginTop: 5,
    borderBottomLeftRadius: 23,
    borderBottomRightRadius: 23,
    elevation: 5,
    shadowColor: '#9B4500',
    shadowOpacity: 0.15,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 35,
    lineHeight: 39,
    marginTop: -4,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerEyebrow: {
    color: '#FFE2BE',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: 4,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  headerSubtitle: {
    color: '#FFF0DE',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },

  headerIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  headerIcon: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '700',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 19,
    paddingBottom: 30,
    flexGrow: 1,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  resultsTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
  },

  resultsSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 4,
  },

  countBadge: {
    minWidth: 39,
    height: 35,
    borderRadius: 11,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
  },

  countNumber: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: '900',
  },

  documentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#8A4300',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  documentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  documentIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  documentIcon: {
    color: COLORS.primaryDark,
    fontSize: 25,
    fontWeight: '800',
  },

  documentHeading: {
    flex: 1,
    marginLeft: 11,
  },

  documentHeadingTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },

  documentHeadingSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 10,
    marginTop: 3,
  },

  documentNumberBadge: {
    backgroundColor: '#FFF5E8',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  documentNumberText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },

  fieldLabel: {
    color: COLORS.secondaryText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  documentType: {
    color: COLORS.primaryDark,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 7,
  },

  documentDate: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 7,
  },

  separator: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 14,
  },

  viewDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 11,
    marginTop: 17,
    elevation: 2,
    shadowColor: '#9B4500',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  viewDocumentButtonDisabled: {
    opacity: 0.7,
  },

  viewDocumentIcon: {
    color: '#FFFFFF',
    fontSize: 17,
    marginRight: 9,
  },

  viewDocumentButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  viewDocumentArrow: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginLeft: 10,
  },

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 27,
  },

  loadingIconContainer: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 17,
  },

  statusText: {
    color: COLORS.secondaryText,
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
  },

  errorIconContainer: {
    width: 62,
    height: 62,
    borderRadius: 21,
    backgroundColor: '#FDE9E7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorIcon: {
    color: COLORS.error,
    fontSize: 32,
    fontWeight: '900',
  },

  errorTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 15,
    textAlign: 'center',
  },

  errorText: {
    color: COLORS.error,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 11,
    paddingHorizontal: 27,
    paddingVertical: 12,
    marginTop: 19,
    elevation: 2,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 35,
  },

  emptyIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 23,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIcon: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: '800',
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 16,
  },

  emptyText: {
    color: COLORS.secondaryText,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 8,
  },

  emptyRetryButton: {
    marginTop: 17,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },

  emptyRetryText: {
    color: COLORS.primaryDark,
    fontWeight: '800',
    fontSize: 12,
  },

  pdfModalContainer: {
    flex: 1,
    backgroundColor: COLORS.pdfBackground,
  },

  pdfModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.pdfPrimary,
    paddingHorizontal: 17,
    paddingVertical: 12,
    elevation: 5,
  },

  pdfModalHeaderLeft: {
    flex: 1,
    minWidth: 0,
  },

  pdfModalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  pdfModalSubtitle: {
    color: '#D4AF37',
    fontSize: 10,
    marginTop: 3,
    fontWeight: '600',
    letterSpacing: 0.8,
  },

  pdfCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  pdfCloseText: {
    color: '#FFFFFF',
    fontSize: 29,
    lineHeight: 33,
    fontWeight: '400',
  },

  pdfViewerContent: {
    flex: 1,
    backgroundColor: COLORS.pdfBackground,
  },
});
