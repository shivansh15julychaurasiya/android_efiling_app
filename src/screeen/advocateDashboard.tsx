
/*
 * ============================================================
 * Developer : Vijay Chaurasiya
 * Project   : Allahabad High Court eFiling Application
 * Module    : Advocate Dashboard
 * Features  : Profile Image, Dashboard, Cause List,
 *             Last Order PDF Viewer, Account Menu and Logout
 * ============================================================
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  clearSessionCookie,
} from '../api/apiClient';

import {
  getDashboard,
  getLoggedInUser,
  logoutApi,
} from '../api/authApi';

import {
  getCauseListDate,
  getSittingCourt,
} from '../api/advocateApi';

import {
  downloadProfileImage,
} from '../services/profileImageService';

import {
  downloadLastOrderPdf,
  deleteLastOrderPdf,
} from '../services/lastOrderPdfService';

import { getApiErrorMessage } from '../utils/errorHandler';

import PdfViewer from '../components/viewer/PdfViewer';

import ProfileCard from '../components/dashboard/ProfileCard';
import CauseListSection from '../components/dashboard/CauseListSection';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import DashboardServiceCards from '../components/dashboard/DashboardServiceCards';
import DashboardHeading from '../components/dashboard/DashboardHeading';

import {
  CauseListRow,
  DashboardCard,
  DashboardModel,
  LoggedInUser,
} from '../types/dashboard';

import styles, { GOLD, NAVY } from '../styles/dashboardStyles';

/* ============================================================
 * Vijay Chaurasiya - Application Logger
 * ============================================================ */

const APP_AUTHOR = 'Vijay Chaurasiya';

const appLog = (...args: unknown[]) => {
  if (__DEV__) {
    console.log(`[${APP_AUTHOR}]`, ...args);
  }
};

const appWarn = (...args: unknown[]) => {
  if (__DEV__) {
    console.warn(`[${APP_AUTHOR}]`, ...args);
  }
};

const appError = (...args: unknown[]) => {
  if (__DEV__) {
    console.error(`[${APP_AUTHOR}]`, ...args);
  }
};

/* ============================================================
 * Types and Constants
 * ============================================================ */

type AdvocateDashboardProps = {
  navigation: any;
};

type AdvocateCounts = {
  petitioner: number;
  respondent: number;
};

type UserWithProfileImage = LoggedInUser & {
  um_profile_image?: string | null;
};

const VISIBLE_DASHBOARD_CARD_INDICES = [2, 3, 6, 9];

const DASHBOARD_ICONS: Record<number, string> = {
  1: '▣',
  2: '▤',
  3: '◉',
  6: '▦',
  9: '▥',
};

const DASHBOARD_ICON_BACKGROUNDS: Record<number, string> = {
  1: '#E8F0FF',
  2: '#FFF3D9',
  3: '#E8F7EE',
  6: '#E5F4F4',
  9: '#E8F7EE',
};

const extractArray = <T,>(response: any): T[] => {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (Array.isArray(response?.data)) {
    return response.data as T[];
  }

  if (Array.isArray(response?.modelList)) {
    return response.modelList as T[];
  }

  return [];
};

/* ============================================================
 * Vijay Chaurasiya - Dashboard Response Parser
 * ============================================================ */

const parseDashboardResponse = (
  response: any,
): DashboardModel => {
  if (response === null || response === undefined) {
    throw new Error('Dashboard API returned an empty response.');
  }

  let parsedResponse: any = response;

  if (typeof response === 'string') {
    const responseText = response.trim();

    if (
      responseText.startsWith('{') ||
      responseText.startsWith('[')
    ) {
      try {
        parsedResponse = JSON.parse(responseText);
      } catch {
        throw new Error('The dashboard response is not valid JSON.');
      }
    } else if (
      responseText.toLowerCase().includes('<html') ||
      responseText.toLowerCase().includes('<!doctype')
    ) {
      throw new Error(
        'SESSION_EXPIRED: The server returned the login page. Your login session may have expired.',
      );
    } else {
      throw new Error(
        responseText.substring(0, 300) ||
          'Unable to load dashboard information.',
      );
    }
  }

  const responseStatus = String(
    parsedResponse?.response ?? '',
  ).toUpperCase();

  if (responseStatus === 'FALSE') {
    throw new Error(
      String(
        parsedResponse?.message ??
          'Unable to load dashboard information.',
      ),
    );
  }

  const modelData = parsedResponse?.modelData;

  if (
    modelData &&
    typeof modelData === 'object' &&
    !Array.isArray(modelData)
  ) {
    return modelData as DashboardModel;
  }

  if (
    parsedResponse &&
    typeof parsedResponse === 'object' &&
    !Array.isArray(parsedResponse) &&
    Object.keys(parsedResponse).some(
      key =>
        key.startsWith('parameter') ||
        key.startsWith('value'),
    )
  ) {
    return parsedResponse as DashboardModel;
  }

  throw new Error(
    'Unable to identify dashboard data in the API response.',
  );
};

/* ============================================================
 * Vijay Chaurasiya - Logged-in User Response Parser
 * ============================================================ */

const parseLoggedInUser = (response: any): LoggedInUser => {
  const candidate =
    response?.data?.user ??
    response?.data ??
    response?.user ??
    response;

  if (
    !candidate ||
    typeof candidate !== 'object' ||
    Array.isArray(candidate) ||
    !candidate.username
  ) {
    throw new Error(
      'Unable to identify logged-in user information.',
    );
  }

  return candidate as LoggedInUser;
};

/* ============================================================
 * Main Advocate Dashboard Component
 * ============================================================ */

const AdvocateDashboard: React.FC<AdvocateDashboardProps> = ({
  navigation,
}) => {
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);



  const [profileImage, setProfileImage] =
    useState<string | null>(null);

  /* ============================================================
   * Vijay Chaurasiya - PDF Viewer State
   * ============================================================ */

  const [pdfVisible, setPdfVisible] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const pdfRequestLock = useRef(false);
  const activePdfUri = useRef<string | null>(null);
  const dashboardMounted = useRef(true);

  const [accountMenuVisible, setAccountMenuVisible] =
    useState(false);

  /* ============================================================
   * Vijay Chaurasiya - Component Lifecycle and PDF Cleanup
   * ============================================================ */

  useEffect(() => {
    dashboardMounted.current = true;

    return () => {
      dashboardMounted.current = false;

      const currentUri = activePdfUri.current;
      activePdfUri.current = null;

      if (currentUri) {
        appLog('Dashboard unmounted. Cleaning PDF cache.');
        void deleteLastOrderPdf(currentUri);
      }
    };
  }, []);

  /* ============================================================
   * Vijay Chaurasiya - Logged-in User Query
   * ============================================================ */

  const userQuery = useQuery<LoggedInUser>({
    queryKey: ['advocate', 'loggedInUser'],

    queryFn: async () => {
      appLog('Fetching logged-in user.');

      const response = await getLoggedInUser();

      return parseLoggedInUser(response);
    },

    staleTime: 10 * 60 * 1000,
  });

  /* ============================================================
   * Vijay Chaurasiya - Dashboard Query
   * ============================================================ */

  const dashboardQuery = useQuery<DashboardModel>({
    queryKey: ['advocate', 'dashboard'],

    queryFn: async () => {
      appLog('Fetching dashboard.');

      const response = await getDashboard();

      return parseDashboardResponse(response);
    },

    staleTime: 60 * 1000,
  });

  /* ============================================================
   * Vijay Chaurasiya - Cause List Query
   * ============================================================ */

  const causeListQuery = useQuery<CauseListRow[]>({
    queryKey: ['advocate', 'causeList'],

    queryFn: async () => {
      try {
        const response = await getCauseListDate();

        return extractArray<CauseListRow>(response);
      } catch (error) {
        appWarn('Error getting cause list:', error);
        return [];
      }
    },

    staleTime: 2 * 60 * 1000,
  });

  /* ============================================================
   * Vijay Chaurasiya - Sitting Court Query
   * ============================================================ */

  const sittingCourtQuery = useQuery<any[]>({
    queryKey: ['advocate', 'sittingCourt'],

    queryFn: async () => {
      try {
        const response = await getSittingCourt();

        return extractArray<any>(response);
      } catch (error) {
        appWarn('Error getting sitting court:', error);
        return [];
      }
    },

    staleTime: 5 * 60 * 1000,
  });

  /* ============================================================
   * Vijay Chaurasiya - Query Data
   * ============================================================ */

  const user: LoggedInUser | null = userQuery.data ?? null;

  const dashboard: DashboardModel | null =
    dashboardQuery.data ?? null;

  const causeList: CauseListRow[] =
    causeListQuery.data ?? [];

  const loading =
    userQuery.isLoading || dashboardQuery.isLoading;

  const causeListLoading = causeListQuery.isLoading;

  /* ============================================================
   * Vijay Chaurasiya - Authenticated Profile Image Download
   *
   * IMPORTANT:
   * Download through Axios so the session cookie is included.
   * ProfileCard receives the local cached image URI.
   * ============================================================ */

  useEffect(() => {
    let cancelled = false;

    const loadDashboardProfileImage = async () => {
      const imageName = (
        user as UserWithProfileImage | null
      )?.um_profile_image;

      if (!imageName?.trim()) {
        setProfileImage(null);
        return;
      }

      try {
        appLog('Downloading dashboard profile image.');

        const localUri = await downloadProfileImage(imageName);

        if (!cancelled && dashboardMounted.current) {
          setProfileImage(localUri);
          appLog('Dashboard profile image loaded.');
        }
      } catch (error: unknown) {
        if (!cancelled && dashboardMounted.current) {
          setProfileImage(null);

          appWarn(
            'Dashboard profile image download failed:',
            error instanceof Error
              ? error.message
              : 'Image download failed.',
          );
        }
      }
    };

    void loadDashboardProfileImage();

    return () => {
      cancelled = true;
    };
  }, [
    (user as UserWithProfileImage | null)?.um_profile_image,
  ]);

  /* ============================================================
   * Vijay Chaurasiya - API Error Handling
   * ============================================================ */

  useEffect(() => {
    if (!dashboardQuery.isError) {
      return;
    }

    const message =
      dashboardQuery.error instanceof Error
        ? dashboardQuery.error.message
        : 'Unable to load dashboard information.';

    if (message.startsWith('SESSION_EXPIRED:')) {
      Alert.alert(
        'Session Error',
        message.replace('SESSION_EXPIRED: ', ''),
      );
    } else {
      Alert.alert('Dashboard Error', message);
    }
  }, [dashboardQuery.isError, dashboardQuery.error]);

  useEffect(() => {
    if (userQuery.isError) {
      Alert.alert(
        'Connection Error',
        getApiErrorMessage(userQuery.error),
      );
    }
  }, [userQuery.isError, userQuery.error]);

  /* ============================================================
   * Vijay Chaurasiya - Advocate Case Counts
   * ============================================================ */

  const getAdvocateCounts = useCallback((): AdvocateCounts => {
    if (!dashboard) {
      return {
        petitioner: 0,
        respondent: 0,
      };
    }

    const rawValue = dashboard.value2;

    if (
      rawValue === null ||
      rawValue === undefined ||
      rawValue === ''
    ) {
      return {
        petitioner: 0,
        respondent: 0,
      };
    }

    try {
      const parsed =
        typeof rawValue === 'string'
          ? JSON.parse(rawValue)
          : rawValue;

      return {
        petitioner:
          Number(parsed?.PetAdvocateCaseCount ?? 0) || 0,

        respondent:
          Number(parsed?.ResAdvocateCaseCount ?? 0) || 0,
      };
    } catch (error) {
      appWarn('Unable to parse advocate counts:', error);

      return {
        petitioner: 0,
        respondent: 0,
      };
    }
  }, [dashboard]);

  /* ============================================================
   * Vijay Chaurasiya - Dashboard Card Values
   * ============================================================ */

  const getCardValue = useCallback(
    (index: number): string => {
      if (!dashboard) {
        return '0';
      }

      const counts = getAdvocateCounts();

      if (index === 2) {
        return String(counts.petitioner);
      }

      if (index === 3) {
        return String(counts.respondent);
      }

      if (index === 6) {
        return String(causeList.length);
      }

      const value =
        dashboard[`value${index}` as keyof DashboardModel];

      if (
        value === null ||
        value === undefined ||
        value === ''
      ) {
        return '0';
      }

      return String(value);
    },
    [dashboard, getAdvocateCounts, causeList],
  );

  /* ============================================================
   * Vijay Chaurasiya - Close Last Order PDF
   * ============================================================ */

  const closePdfViewer = useCallback(() => {
    appLog('Closing Last Order PDF viewer.');

    const currentUri = activePdfUri.current;

    activePdfUri.current = null;

    setPdfVisible(false);
    setPdfUri(null);

    if (currentUri) {
      setTimeout(() => {
        void deleteLastOrderPdf(currentUri);
      }, 700);
    }
  }, []);

  /* ============================================================
   * Vijay Chaurasiya - Open Last Order PDF
   * ============================================================ */

  const openLastOrder = useCallback(
    async (
      lastOrder: string | number | null | undefined,
    ) => {
      if (pdfRequestLock.current) {
        appWarn('PDF request already running.');
        return;
      }

      if (
        lastOrder === null ||
        lastOrder === undefined ||
        String(lastOrder).trim() === ''
      ) {
        Alert.alert(
          'Last Order',
          'Last Order is not available.',
        );
        return;
      }

      pdfRequestLock.current = true;

      let downloadedUri: string | null = null;
      let keepDownloadedFile = false;

      try {
        setPdfLoading(true);
        setPdfVisible(false);
        setPdfUri(null);

        const previousUri = activePdfUri.current;
        activePdfUri.current = null;

        if (previousUri) {
          await deleteLastOrderPdf(previousUri);
        }

        appLog('Opening Last Order PDF.');

        const result = await downloadLastOrderPdf(lastOrder);

        downloadedUri = result.fileUri;

        appLog('Last Order PDF downloaded.');

        if (!dashboardMounted.current) {
          return;
        }

        activePdfUri.current = result.fileUri;
        keepDownloadedFile = true;

        setPdfUri(result.fileUri);
        setPdfVisible(true);
      } catch (error: unknown) {
        appError('Error opening Last Order PDF:', error);

        if (dashboardMounted.current) {
          Alert.alert(
            'Last Order',
            error instanceof Error
              ? error.message
              : 'Unable to open the Last Order PDF.',
          );
        }
      } finally {
        if (downloadedUri && !keepDownloadedFile) {
          await deleteLastOrderPdf(downloadedUri);
        }

        pdfRequestLock.current = false;

        if (dashboardMounted.current) {
          setPdfLoading(false);
        }
      }
    },
    [],
  );

  /* ============================================================
   * Vijay Chaurasiya - Refresh Dashboard
   * ============================================================ */

  const handleRefresh = useCallback(async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      await Promise.all([
        userQuery.refetch(),
        dashboardQuery.refetch(),
        causeListQuery.refetch(),
        sittingCourtQuery.refetch(),
      ]);

      appLog('Dashboard refreshed.');
    } catch (error) {
      appWarn('Dashboard refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [
    refreshing,
    userQuery.refetch,
    dashboardQuery.refetch,
    causeListQuery.refetch,
    sittingCourtQuery.refetch,
  ]);

  /* ============================================================
   * Vijay Chaurasiya - Logout
   * ============================================================ */

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',

          onPress: async () => {
            try {
              await logoutApi();
            } catch (error) {
              appWarn('Logout API error:', error);
            } finally {
              try {
                await clearSessionCookie();
              } catch (error) {
                appWarn(
                  'Unable to clear session cookie:',
                  error,
                );
              }

              const currentUri = activePdfUri.current;
              activePdfUri.current = null;

              setPdfVisible(false);
              setPdfUri(null);

              if (currentUri) {
                await deleteLastOrderPdf(currentUri);
              }

              queryClient.clear();

              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          },
        },
      ],
    );
  }, [navigation, queryClient]);

  /* ============================================================
   * Vijay Chaurasiya - Account Menu Navigation
   * ============================================================ */

  const openProfile = useCallback(() => {
    setAccountMenuVisible(false);
    navigation.navigate('Profile');
  }, [navigation]);

  const openChangePassword = useCallback(() => {
    setAccountMenuVisible(false);
    navigation.navigate('ChangePassword');
  }, [navigation]);

  const openLogoutConfirmation = useCallback(() => {
    setAccountMenuVisible(false);
    handleLogout();
  }, [handleLogout]);

  /* ============================================================
   * Vijay Chaurasiya - User Information
   * ============================================================ */

  const getUserName = useCallback(() => {
    if (user?.um_fullname && user.um_fullname.trim()) {
      return user.um_fullname.trim();
    }

    return 'Advocate';
  }, [user]);

  const getInitials = useCallback(() => {
    const name = user?.um_fullname?.trim();

    if (!name) {
      return 'A';
    }

    const parts = name.split(/\s+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 1).toUpperCase();
    }

    return (
      parts[0].substring(0, 1) +
      parts[parts.length - 1].substring(0, 1)
    ).toUpperCase();
  }, [user]);

  const getRole = useCallback(
    () =>
      user?.userroles?.[0]?.lk?.lk_longname || 'Advocate',
    [user],
  );

  const getLastLogin = useCallback(
    () => user?.um_last_login || 'Not available',
    [user],
  );

  /* ============================================================
   * Vijay Chaurasiya - Dashboard Cards
   * ============================================================ */

  const cards = useMemo((): DashboardCard[] => {
    if (!dashboard) {
      return [];
    }

    const result: DashboardCard[] = [];

    VISIBLE_DASHBOARD_CARD_INDICES.forEach(index => {
      const title =
        dashboard[
          `parameter${index}` as keyof DashboardModel
        ];

      const flag =
        dashboard[
          `flag${index}` as keyof DashboardModel
        ];

      const link =
        dashboard[
          `link${index}` as keyof DashboardModel
        ];

      if (
        Number(flag) !== 1 ||
        !title ||
        String(title).trim() === '' ||
        String(title) === '0'
      ) {
        return;
      }

      result.push({
        index,
        title: String(title),
        value: getCardValue(index),
        link: link ? String(link) : '',
        icon: DASHBOARD_ICONS[index] || '◆',
      });
    });

    return result;
  }, [dashboard, getCardValue]);

  /* ============================================================
   * Vijay Chaurasiya - Dashboard Card Navigation
   * ============================================================ */

  const handleCardPress = useCallback(
    (card: DashboardCard) => {
      const normalizedPath = (card.link || '')
        .trim()
        .replace(/^\/+/, '')
        .split('?')[0]
        .toLowerCase();

      const normalizedTitle = (card.title || '')
        .trim()
        .toLowerCase();

      if (
        normalizedTitle.includes('respondent') ||
        normalizedPath.endsWith('ecourt/casefilerespondent') ||
        normalizedPath.endsWith('ecourt/casefileasres')
      ) {
        navigation.navigate('CaseFileRespondent');
        return;
      }

      if (
        normalizedTitle.includes('case filed') ||
        normalizedTitle.includes('petitioner') ||
        normalizedPath.endsWith('ecourt/casefilepetition')
      ) {
        navigation.navigate('CaseFilePetition');
        return;
      }

      if (
        card.index === 1 ||
        normalizedPath.endsWith('ecourt/draftform')
      ) {
        navigation.navigate('DraftManagement');
        return;
      }

      if (
        card.index === 6 ||
        normalizedPath.endsWith('ecourt/advccauselist')
      ) {
        navigation.navigate('AdvCauseList');
        return;
      }

      if (
        card.index === 9 ||
        normalizedPath.endsWith(
          'application/applicationdraftform',
        )
      ) {
        navigation.navigate('ApplicationDraftForm');
        return;
      }

      Alert.alert(
        'Service Not Configured',
        `Card: ${card.title}\nPath: ${card.link || '(empty)'}`,
      );
    },
    [navigation],
  );

  /* ============================================================
   * Vijay Chaurasiya - Dashboard Icon Background
   * ============================================================ */

  const getIconBackground = useCallback(
    (index: number) => ({
      backgroundColor:
        DASHBOARD_ICON_BACKGROUNDS[index] || '#EEF2F7',
    }),
    [],
  );

  /* ============================================================
   * Vijay Chaurasiya - Case Status Navigation
   * ============================================================ */

  const openStatus = useCallback(
    async (row: CauseListRow) => {
      try {
        const caseId = row.Case_ID;

        if (caseId == null || caseId === 0) {
          Alert.alert(
            'Case Status',
            'Case ID is not available.',
          );
          return;
        }

        const encodedCaseId = encodeURIComponent(
          String(caseId),
        );

        const url =
          `https://www.allahabadhighcourt.in/apps/status_ccms/index.php/view-case-detail/${encodedCaseId}`;

        await Linking.openURL(url);
      } catch (error) {
        appError('Error opening case status:', error);

        Alert.alert(
          'Unable to Open',
          'Could not open the case status page. Please try again.',
        );
      }
    },
    [],
  );

  /* ============================================================
   * Vijay Chaurasiya - Loading Screen
   * ============================================================ */

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingSafeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={NAVY}
        />

        <View style={styles.loadingContainer}>
          <View style={styles.loadingLogo}>
            <Text style={styles.loadingLogoText}>⚖</Text>
          </View>

          <Text style={styles.loadingTitle}>
            Advocate Dashboard
          </Text>

          <ActivityIndicator
            size="large"
            color={GOLD}
            style={styles.loadingIndicator}
          />

          <Text style={styles.loadingText}>
            Loading your dashboard...
          </Text>

          <Text style={styles.loadingSubText}>
            Please wait
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ============================================================
   * Vijay Chaurasiya - Main Dashboard UI
   * ============================================================ */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={NAVY}
      />

      <View style={styles.container}>
        {/* TOP NAVIGATION BAR */}

        <View style={styles.topBar}>
          <View style={styles.brandContainer}>
            <View style={styles.brandLogo}>
              <Text style={styles.brandLogoText}>⚖</Text>
            </View>

            <View>
              <Text style={styles.brandTitle}>
                Advocate Dashboard
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutTopButton}
            onPress={() => setAccountMenuVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutTopText}>☰</Text>
          </TouchableOpacity>
        </View>

        {/* DASHBOARD CONTENT */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={NAVY}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          <ProfileCard
            user={user}
            profileImage={profileImage}
            getUserName={getUserName}
            getInitials={getInitials}
            getRole={getRole}
            getLastLogin={getLastLogin}
          />

          <CauseListSection
            causeList={causeList}
            loading={causeListLoading}
            openLastOrder={openLastOrder}
            openStatus={openStatus}
          />

          <DashboardHeading
            onRefresh={handleRefresh}
          />

          <DashboardServiceCards
            cards={cards}
            onCardPress={handleCardPress}
            getIconBackground={getIconBackground}
          />

          <DashboardFooter />
        </ScrollView>
      </View>

      {/* ============================================================
       * Vijay Chaurasiya - Account Menu Modal
       * ============================================================ */}

      <Modal
        visible={accountMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAccountMenuVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setAccountMenuVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.45)',
            alignItems: 'flex-end',
            paddingTop: 65,
            paddingRight: 12,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={{
              width: 275,
              backgroundColor: '#FFFFFF',
              borderRadius: 15,
              overflow: 'hidden',
              elevation: 12,
            }}
          >
            {/* USER INFORMATION */}

            <View
              style={{
                backgroundColor: NAVY,
                padding: 20,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 65,
                  height: 65,
                  borderRadius: 35,
                  backgroundColor: GOLD,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                }}
              >
                <Text
                  style={{
                    color: NAVY,
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}
                >
                  {getInitials()}
                </Text>
              </View>

              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginTop: 10,
                }}
              >
                {getUserName()}
              </Text>

              <Text
                style={{
                  color: '#D4AF37',
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {getRole()}
              </Text>

              <Text
                style={{
                  color: '#CBD5E1',
                  fontSize: 11,
                  marginTop: 5,
                }}
              >
                {user?.username || ''}
              </Text>
            </View>

            {/* MENU OPTIONS */}

            <View style={{ paddingVertical: 8 }}>
              <TouchableOpacity
                onPress={openProfile}
                style={accountMenuItemStyle}
              >
                <Text style={accountMenuIconStyle}>👤</Text>

                <Text style={accountMenuTextStyle}>
                  My Profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openChangePassword}
                style={accountMenuItemStyle}
              >
                <Text style={accountMenuIconStyle}>🔐</Text>

                <Text style={accountMenuTextStyle}>
                  Change Password
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  height: 1,
                  backgroundColor: '#E5E7EB',
                  marginHorizontal: 15,
                  marginVertical: 5,
                }}
              />

              <TouchableOpacity
                onPress={openLogoutConfirmation}
                style={accountMenuItemStyle}
              >
                <Text style={accountMenuIconStyle}>⇥</Text>

                <Text
                  style={{
                    color: '#DC2626',
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ============================================================
       * Vijay Chaurasiya - Last Order PDF Modal
       * ============================================================ */}

      <Modal
        visible={pdfVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closePdfViewer}
        onDismiss={() => {
          appLog('Last Order PDF modal dismissed.');
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#071A3D',
          }}
        >
          {/* PDF HEADER */}

          <View
            style={{
              height: 58,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              justifyContent: 'space-between',
              backgroundColor: '#071A3D',
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 17,
                fontWeight: 'bold',
              }}
            >
              Last Order
            </Text>

            <TouchableOpacity
              onPress={closePdfViewer}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 15,
                paddingVertical: 8,
                backgroundColor: '#D4AF37',
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: '#071A3D',
                  fontWeight: 'bold',
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>

          {/* EXISTING PDF VIEWER */}

          {pdfVisible && pdfUri ? (
            <View style={{ flex: 1 }}>
              <PdfViewer
                key={pdfUri}
                pdfUri={pdfUri}
              />
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#E9EDF3',
              }}
            >
              <Text style={{ color: '#071A3D' }}>
                PDF is not available.
              </Text>
            </View>
          )}
        </View>
      </Modal>

      {/* ============================================================
       * Vijay Chaurasiya - PDF Download Indicator
       * ============================================================ */}

      {pdfLoading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.45)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 28,
              paddingVertical: 24,
              borderRadius: 12,
              alignItems: 'center',
              minWidth: 190,
            }}
          >
            <ActivityIndicator
              size="large"
              color={NAVY}
            />

            <Text
              style={{
                marginTop: 14,
                color: NAVY,
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              Opening Last Order...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

/* ============================================================
 * Vijay Chaurasiya - Account Menu Styles
 * ============================================================ */

const accountMenuItemStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  paddingVertical: 14,
  paddingHorizontal: 20,
};

const accountMenuIconStyle = {
  fontSize: 19,
  width: 38,
};

const accountMenuTextStyle = {
  color: '#1E293B',
  fontSize: 14,
  fontWeight: '600' as const,
};

/* ============================================================
 * Vijay Chaurasiya - Export Advocate Dashboard
 * ============================================================ */

export default AdvocateDashboard;
