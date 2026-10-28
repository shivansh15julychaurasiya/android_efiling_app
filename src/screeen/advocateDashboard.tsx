
import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getDashboard,
  getLoggedInUser,
  logoutApi,
} from '../api/authApi';
import {
  getCauseListDate,
  getSittingCourt,
} from '../api/advocateApi';
import { getApiErrorMessage } from '../utils/errorHandler';

import ProfileCard from '../components/dashboard/ProfileCard';
import NewCaseFilingBanner from '../components/dashboard/NewCaseFilingBanner';
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

type AdvocateDashboardProps = {
  navigation: any;
};

type AdvocateCounts = {
  petitioner: number;
  respondent: number;
};

const PROFILE_IMAGE_BASE_URL = '';

const LAST_ORDER_BASE_URL =
  'http://192.168.0.162:8080/elegalix_restapi2/api/judgment/';

/**
 * Only these dashboard service cards should be displayed.
 *
 * 1 = E-filed Cases
 * 2 = Case filed
 * 3 = Counsel As Respondent
 * 6 = Cause List
 * 9 = Application e-Filed
 */
const VISIBLE_DASHBOARD_CARD_INDICES = [ 2, 3, 6, 9];

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

const AdvocateDashboard: React.FC<AdvocateDashboardProps> = ({
  navigation,
}) => {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [dashboard, setDashboard] = useState<DashboardModel | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [causeList, setCauseList] = useState<CauseListRow[]>([]);
  const [sittingBenches, setSittingBenches] = useState<any[]>([]);

  const [causeListLoading, setCauseListLoading] = useState(false);
  const [sittingCourtLoading, setSittingCourtLoading] = useState(false);

  /**
   * The backend stores advocate counts inside value2 as JSON:
   * {
   *   "PetAdvocateCaseCount": "2781",
   *   "ResAdvocateCaseCount": "268",
   *   "CustomMessage": ""
   * }
   */
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
      console.warn(
        'Unable to parse advocate counts from dashboard.value2:',
        error,
      );

      return {
        petitioner: 0,
        respondent: 0,
      };
    }
  }, [dashboard]);

  /**
   * Card 2 -> PetAdvocateCaseCount
   * Card 3 -> ResAdvocateCaseCount
   * Other cards -> their corresponding valueN field.
   */
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
    [dashboard, getAdvocateCounts],
  );

  const openLastOrder = async (
    lastOrder: string | number | null | undefined,
  ) => {
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

    const url =
      LAST_ORDER_BASE_URL +
      encodeURIComponent(String(lastOrder));

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to open the Last Order PDF.',
      );

      console.error('Error opening Last Order:', error);
    }
  };

  const loadCauseList = async () => {
    try {
      setCauseListLoading(true);

      const data: any = await getCauseListDate();

      console.log('===== CAUSE LIST =====', data);

      if (Array.isArray(data)) {
        setCauseList(data as CauseListRow[]);
      } else if (Array.isArray(data?.data)) {
        setCauseList(data.data as CauseListRow[]);
      } else if (Array.isArray(data?.modelList)) {
        setCauseList(data.modelList as CauseListRow[]);
      } else {
        setCauseList([]);
      }
    } catch (error) {
      console.log('Error getting cause list:', error);
      setCauseList([]);
    } finally {
      setCauseListLoading(false);
    }
  };

  const loadSittingCourt = async () => {
    try {
      setSittingCourtLoading(true);

      const data: any = await getSittingCourt();

      console.log('===== SITTING COURTS =====', data);

      if (Array.isArray(data)) {
        setSittingBenches(data);
      } else if (Array.isArray(data?.data)) {
        setSittingBenches(data.data);
      } else if (Array.isArray(data?.modelList)) {
        setSittingBenches(data.modelList);
      } else {
        setSittingBenches([]);
      }
    } catch (error) {
      console.log('Error getting sitting court:', error);
      setSittingBenches([]);
    } finally {
      setSittingCourtLoading(false);
    }
  };

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const userResponse: any = await getLoggedInUser();

      console.log(
        'GET LOGGED IN USER RESPONSE:',
        userResponse,
      );

      if (userResponse) {
        setUser(userResponse);
      }

      const dashboardResponse: any = await getDashboard();

      console.log(
        'GET DASHBOARD RESPONSE:',
        JSON.stringify(dashboardResponse, null, 2),
      );

      if (
        dashboardResponse === null ||
        dashboardResponse === undefined
      ) {
        setDashboard(null);

        Alert.alert(
          'Dashboard Error',
          'Dashboard API returned an empty response.',
        );

        return;
      }

      let parsedResponse: any = dashboardResponse;

      if (typeof dashboardResponse === 'string') {
        const responseText = dashboardResponse.trim();

        if (
          responseText.startsWith('{') ||
          responseText.startsWith('[')
        ) {
          try {
            parsedResponse = JSON.parse(responseText);
          } catch (parseError) {
            console.error(
              'Dashboard JSON parse error:',
              parseError,
            );

            setDashboard(null);

            Alert.alert(
              'Dashboard Error',
              'The dashboard response is not valid JSON.',
            );

            return;
          }
        } else if (
          responseText.toLowerCase().includes('<html') ||
          responseText.toLowerCase().includes('<!doctype')
        ) {
          setDashboard(null);

          Alert.alert(
            'Session Error',
            'The server returned the login page. Your login session may have expired.',
          );

          return;
        } else {
          setDashboard(null);

          Alert.alert(
            'Dashboard Error',
            responseText.substring(0, 300) ||
              'Unable to load dashboard information.',
          );

          return;
        }
      }

      const responseStatus = String(
        parsedResponse?.response ?? '',
      ).toUpperCase();

      if (responseStatus === 'FALSE') {
        setDashboard(null);

        Alert.alert(
          'Dashboard Error',
          String(
            parsedResponse?.message ??
              'Unable to load dashboard information.',
          ),
        );

        return;
      }

      const modelData = parsedResponse?.modelData;

      if (
        modelData &&
        typeof modelData === 'object' &&
        !Array.isArray(modelData)
      ) {
        setDashboard(modelData as DashboardModel);
      } else if (
        typeof parsedResponse === 'object' &&
        !Array.isArray(parsedResponse) &&
        Object.keys(parsedResponse).some(
          key =>
            key.startsWith('parameter') ||
            key.startsWith('value'),
        )
      ) {
        // Also support APIs returning the model fields directly.
        setDashboard(parsedResponse as DashboardModel);
      } else {
        setDashboard(null);

        Alert.alert(
          'Dashboard Error',
          'Unable to identify dashboard data in the API response.',
        );
      }
    } catch (error) {
      console.error('DASHBOARD LOAD ERROR:', error);

      Alert.alert(
        'Connection Error',
        getApiErrorMessage(error),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    loadCauseList();
    loadSittingCourt();
  }, [loadDashboard]);

  const handleRefresh = () => {
    setRefreshing(true);

    loadDashboard();
    loadCauseList();
    loadSittingCourt();
  };

  const handleLogout = () => {
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
              console.log('Logout API error:', error);
            }

            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ],
    );
  };

  const getUserName = () => {
    if (user?.um_fullname && user.um_fullname.trim()) {
      return user.um_fullname.trim();
    }

    return 'Advocate';
  };

  const getInitials = () => {
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
  };

  const getRole = () =>
    user?.userroles?.[0]?.lk?.lk_longname || 'Advocate';

  const getLastLogin = () =>
    user?.um_last_login || 'Not available';

  const getProfileImage = () => {
    if (!user?.um_profile_image || !PROFILE_IMAGE_BASE_URL) {
      return null;
    }

    return PROFILE_IMAGE_BASE_URL + user.um_profile_image;
  };

  /**
   * Build only the five requested dashboard cards.
   * The backend flag must also equal 1.
   */
  const createCards = (): DashboardCard[] => {
    if (!dashboard) {
      return [];
    }

    const cards: DashboardCard[] = [];

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

      cards.push({
        index,
        title: String(title),
        value: getCardValue(index),
        link: link ? String(link) : '',
        icon: DASHBOARD_ICONS[index] || '◆',
      });
    });

    return cards;
  };

  const handleCardPress = (card: DashboardCard) => {
    console.log('========== CARD CLICKED ==========');
    console.log('Selected service:', card.title);
    console.log('Selected service index:', card.index);
    console.log('Selected service path:', card.link);

    const normalizedPath = (card.link || '')
      .trim()
      .replace(/^\/+/, '')
      .split('?')[0]
      .toLowerCase();

    const normalizedTitle = (card.title || '')
      .trim()
      .toLowerCase();

    // Counsel As Respondent
    if (
      normalizedTitle.includes('respondent') ||
      normalizedPath.endsWith('ecourt/casefilerespondent') ||
      normalizedPath.endsWith('ecourt/casefileasres')
    ) {
      navigation.navigate('CaseFileRespondent');
      return;
    }

    // Case filed / Petitioner
    if (
      normalizedTitle.includes('case filed') ||
      normalizedTitle.includes('petitioner') ||
      normalizedPath.endsWith('ecourt/casefilepetition')
    ) {
      navigation.navigate('CaseFilePetition');
      return;
    }

    // E-filed Cases / Draft Management
    if (
      card.index === 1 ||
      normalizedPath.endsWith('ecourt/draftform')
    ) {
      navigation.navigate('DraftManagement');
      return;
    }

    // Cause List
    if (
      card.index === 6 ||
      normalizedPath.endsWith('ecourt/advc causelist'.replace(' ', ''))
    ) {
      navigation.navigate('AdvCauseList');
      return;
    }

    // Application e-Filed
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
  };

  const getIconBackground = (index: number) => ({
    backgroundColor:
      DASHBOARD_ICON_BACKGROUNDS[index] || '#EEF2F7',
  });

  const cards = createCards();
  const profileImage = getProfileImage();

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
            e-Filing Portal
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={NAVY}
      />

      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.brandContainer}>
            <View style={styles.brandLogo}>
              <Text style={styles.brandLogoText}>⚖</Text>
            </View>

            <View>
              <Text style={styles.brandTitle}>
                e-FILING
              </Text>

              <Text style={styles.brandSubtitle}>
                ADVOCATE PORTAL
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutTopButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutTopText}>⇥</Text>
          </TouchableOpacity>
        </View>

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

          {/* <NewCaseFilingBanner /> */}

          <CauseListSection
            causeList={causeList}
            loading={causeListLoading}
            openLastOrder={openLastOrder}
          />

          <DashboardHeading onRefresh={handleRefresh} />

          <DashboardServiceCards
            cards={cards}
            onCardPress={handleCardPress}
            getIconBackground={getIconBackground}
          />

          <DashboardFooter />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AdvocateDashboard;
