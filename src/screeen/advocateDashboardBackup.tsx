import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Pressable, Linking,
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

type AdvocateDashboardProps = {
  navigation: any;
};

/* =========================================================
   LOGGED IN USER
========================================================= */

type LoggedInUser = {
  um_id?: number;
  username?: string;
  um_fullname?: string;
  um_email?: string;
  um_mobile?: string;
  um_gender?: string;
  um_profile_image?: string;
  um_last_login?: string | null;

  userroles?: Array<{
    ur_id?: number;
    ur_role_id?: number;
    lk?: {
      lk_longname?: string;
      lk_setname?: string;
    };
  }>;
};

/* =========================================================
   DASHBOARD MODEL
========================================================= */

type DashboardModel = {
  parameter1?: string;
  parameter2?: string;
  parameter3?: string;
  parameter4?: string;
  parameter5?: string;
  parameter6?: string;
  parameter7?: string;
  parameter8?: string;
  parameter9?: string;
  parameter10?: string;
  parameter11?: string;
  parameter12?: string;
  parameter13?: string;
  parameter14?: string;

  flag1?: number;
  flag2?: number;
  flag3?: number;
  flag4?: number;
  flag5?: number;
  flag6?: number;
  flag7?: number;
  flag8?: number;
  flag9?: number;
  flag10?: number;
  flag11?: number;
  flag12?: number;
  flag13?: number;
  flag14?: number;

  value1?: string;
  value2?: string;
  value3?: string;
  value4?: string;
  value5?: string;
  value6?: string;
  value7?: string;
  value8?: string;
  value9?: string;
  value10?: string;
  value11?: string;
  value12?: string;
  value13?: string | null;
  value14?: string | null;

  link1?: string;
  link2?: string;
  link3?: string;
  link4?: string;
  link5?: string;
  link6?: string;
  link7?: string;
  link8?: string;
  link9?: string;
  link10?: string;
  link11?: string;
  link12?: string;
  link13?: string;
  link14?: string;
};

type DashboardResponse = {
  response?: string;
  modelData?: DashboardModel;
};

type DashboardCard = {
  index: number;
  title: string;
  value: string;
  link: string;
  icon: string;
};

type CaseSummary = {
  PetAdvocateCaseCount?: string;
  ResAdvocateCaseCount?: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const NAVY = '#071A3D';
const NAVY_LIGHT = '#0D2855';
const GOLD = '#D4AF37';
const WHITE = '#FFFFFF';
const BACKGROUND = '#F4F6FA';
const TEXT_DARK = '#17233C';
const TEXT_MUTED = '#7C8799';
const BORDER = '#E8ECF2';

/*
 * IMPORTANT:
 *
 * Your API currently returns only:
 *
 * 1905_944b661e7c0e404b8cd5cf11f062448c.png
 *
 * Do not invent the image endpoint.
 *
 * Once you know your actual backend image URL,
 * put the base URL here.
 *
 * Example:
 *
 * const PROFILE_IMAGE_BASE_URL =
 *   'http://192.168.0.160:8080/onlinecasefiling/profile/';
 *
 * Leave empty for now and initials will be displayed.
 */
const PROFILE_IMAGE_BASE_URL = '';

/* =========================================================
   COMPONENT
========================================================= */

const AdvocateDashboard: React.FC<
  AdvocateDashboardProps
> = ({ navigation }) => {

  const [user, setUser] =
    useState<LoggedInUser | null>(null);

  const [dashboard, setDashboard] =
    useState<DashboardModel | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


  const [causeList, setCauseList] = useState<any[]>([]);
  const [sittingBenches, setSittingBenches] = useState<any[]>([]);

  const [causeListLoading, setCauseListLoading] =
    useState(false);

  const [sittingCourtLoading, setSittingCourtLoading] =
    useState(false);





  const openLastOrder = async (lastOrder: string | number | null | undefined) => {
    if (!lastOrder) {
      Alert.alert('Last Order', 'Last Order is not available.');
      return;
    }

    const url =
      'http://192.168.0.162:8080/elegalix_restapi2/api/judgment/' +
      encodeURIComponent(String(lastOrder));

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Unable to open the Last Order PDF.');
      console.error('Error opening Last Order:', error);
    }
  };







  //======================================================
  //==========load Causelist data=======================

  const loadCauseList = async () => {
    try {
      setCauseListLoading(true);

      const data = await getCauseListDate();

      console.log(
        '===== CAUSE LIST ==========',
        data,
      );

      if (Array.isArray(data)) {
        setCauseList(data);
      } else if (Array.isArray(data?.data)) {
        setCauseList(data.data);
      } else if (Array.isArray(data?.modelList)) {
        setCauseList(data.modelList);
      } else {
        setCauseList([]);
      }

    } catch (error) {
      console.log(
        'Error in getting cause list:',
        error,
      );

      setCauseList([]);
    } finally {
      setCauseListLoading(false);
    }
  };


  const loadSittingCourt = async () => {
    try {
      setSittingCourtLoading(true);

      const data = await getSittingCourt();

      console.log(
        '===== SITTING COURTS ==========',
        data,
      );

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
      console.log(
        'Error in getting sitting court:',
        error,
      );

      setSittingBenches([]);
    } finally {
      setSittingCourtLoading(false);
    }
  };







  /* =======================================================
     LOAD USER + DASHBOARD ;  Vijay chaurasiya
  ======================================================= */

  const loadDashboard = useCallback(
    async () => {
      try {
        setLoading(true);


        console.log(
          '============= Vijay Chaurasiya===================');

        console.log(
          'Hello Vijay ==LOADING LOGGED-IN USER...'
        );

        const userResponse =
          await getLoggedInUser();

        console.log(
          'GET LOGGED IN USER RESPONSE:',
          JSON.stringify(
            userResponse,
            null,
            2,
          ),
        );

        console.log(
          '================================'
        );

        if (userResponse) {
          setUser(userResponse);
        }

        /* =================================================
          Vijay : GET DASHBOARD
        ================================================= */

        console.log(
          'LOADING DASHBOARD...'
        );

        const dashboardResponse =
          await getDashboard();

        console.log(
          '================================'
        );

        console.log(
          'GET DASHBOARD RESPONSE:',
          JSON.stringify(
            dashboardResponse,
            null,
            2,
          ),
        );

        console.log(
          'DASHBOARD RESPONSE TYPE:',
          typeof dashboardResponse,
        );

        console.log(
          'DASHBOARD response FIELD:',
          dashboardResponse?.response,
        );

        console.log(
          'DASHBOARD modelData FIELD:',
          dashboardResponse?.modelData,
        );

        console.log(
          '================================'
        );

        /* =================================================
           EMPTY RESPONSE
        ================================================= */

        if (
          dashboardResponse === null ||
          dashboardResponse === undefined
        ) {
          Alert.alert(
            'Dashboard Error',
            'Dashboard API returned an empty response.',
          );

          return;
        }

        /* =================================================
           IF RESPONSE IS STRING
        ================================================= */

        if (
          typeof dashboardResponse === 'string'
        ) {

          console.log(
            'Dashboard returned STRING response'
          );

          const responseText =
            dashboardResponse.trim();

          /*
           * Try JSON parsing
           */

          if (
            responseText.startsWith('{') ||
            responseText.startsWith('[')
          ) {

            try {

              const parsedDashboard =
                JSON.parse(responseText);

              console.log(
                'PARSED DASHBOARD:',
                JSON.stringify(
                  parsedDashboard,
                  null,
                  2,
                ),
              );



              if (
                String(
                  parsedDashboard?.response || '',
                ).toUpperCase() === 'TRUE'
              ) {

                setDashboard(
                  parsedDashboard?.modelData ||
                  null,
                );

                return;
              }



              if (
                parsedDashboard?.modelData
              ) {

                setDashboard(
                  parsedDashboard.modelData,
                );

                return;
              }


              setDashboard(
                parsedDashboard,
              );

              return;

            } catch (parseError) {

              console.log(
                'DASHBOARD JSON PARSE ERROR:',
                parseError,
              );
            }
          }



          if (
            responseText.includes('<html') ||
            responseText.includes('<!DOCTYPE')
          ) {

            console.log(
              'DASHBOARD RETURNED HTML LOGIN PAGE'
            );

            Alert.alert(
              'Session Error',
              'The server returned the login page. Your login session may have expired.',
            );

            return;
          }

          Alert.alert(
            'Dashboard Error',
            responseText.substring(0, 300) ||
            'Unable to load dashboard information.',
          );

          return;
        }



        if (
          typeof dashboardResponse === 'object'
        ) {

          const dashboardStatus =
            String(
              dashboardResponse?.response ||
              '',
            ).toUpperCase();

          console.log(
            'Dashboard Status:',
            dashboardStatus,
          );


          if (
            dashboardStatus === 'TRUE'
          ) {

            console.log(
              'Dashboard response TRUE'
            );

            setDashboard(
              dashboardResponse?.modelData ||
              null,
            );

            return;
          }



          if (
            dashboardResponse?.modelData
          ) {

            console.log(
              'Dashboard modelData found'
            );

            setDashboard(
              dashboardResponse.modelData,
            );

            return;
          }


          if (
            Object.keys(
              dashboardResponse,
            ).length > 0
          ) {

            console.log(
              'Using direct dashboard object'
            );

            setDashboard(
              dashboardResponse,
            );

            return;
          }
        }



        console.log(
          'UNABLE TO IDENTIFY DASHBOARD RESPONSE'
        );

        Alert.alert(
          'Dashboard Error',
          'Unable to load dashboard information.',
        );

      } catch (error) {

        console.log(
          '================================'
        );

        console.log(
          'DASHBOARD LOAD ERROR:',
          error,
        );

        console.log(
          '================================'
        );

        Alert.alert(
          'Connection Error',
          getApiErrorMessage(error),
        );

      } finally {

        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );




  useEffect(() => {
    loadDashboard();
    loadCauseList();
    loadSittingCourt();
  }, []);




  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  /* =======================================================
     LOGOUT: Vijay|Chaurasiya|
  ======================================================= */

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
              console.log(
                'Logout API Error:',
                error,
              );
            }

            navigation.reset({
              index: 0,

              routes: [
                {
                  name: 'Login',
                },
              ],
            });
          },
        },
      ],
    );
  };



  const getUserName = () => {

    if (
      user?.um_fullname &&
      user.um_fullname.trim()
    ) {
      return user.um_fullname.trim();
    }

    return 'Advocate';
  };



  const getInitials = () => {

    const name =
      user?.um_fullname?.trim();

    if (!name) {
      return 'A';
    }

    const parts =
      name.split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 1)
        .toUpperCase();
    }

    return (
      parts[0].substring(0, 1) +
      parts[parts.length - 1]
        .substring(0, 1)
    ).toUpperCase();
  };



  const getRole = () => {

    const role =
      user?.userroles?.[0]?.lk?.lk_longname;

    return role || 'Advocate';
  };


  const getLastLogin = () => {
    return user?.um_last_login || 'Not available';
  };



  const getProfileImage = () => {

    if (
      !user?.um_profile_image ||
      !PROFILE_IMAGE_BASE_URL
    ) {
      return null;
    }

    return (
      PROFILE_IMAGE_BASE_URL +
      user.um_profile_image
    );
  };



  const getCardValue = (
    index: number,
  ): string => {

    if (!dashboard) {
      return '0';
    }

    const valueKey =
      `value${index}` as keyof DashboardModel;

    const value =
      dashboard[valueKey];

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '0';
    }

    /*
     * value2 contains:
     *
     * {
     *   PetAdvocateCaseCount:"2763",
     *   ResAdvocateCaseCount:"264"
     * }
     */

    if (index === 2) {

      try {

        const parsed =
          JSON.parse(String(value));

        const petitioner =
          Number(
            parsed.PetAdvocateCaseCount || 0,
          );

        const respondent =
          Number(
            parsed.ResAdvocateCaseCount || 0,
          );

        return String(
          petitioner + respondent,
        );

      } catch (error) {

        return String(value);
      }
    }

    return String(value);
  };

  /* =======================================================
     CREATE SERVICE CARDS
  ======================================================= */

  const createCards =
    (): DashboardCard[] => {

      if (!dashboard) {
        return [];
      }

      const cards:
        DashboardCard[] = [];

      const icons = [
        '▣',
        '▤',
        '◉',
        '⚖',
        '✎',
        '▦',
        '⌕',
        '▧',
        '▥',
        '▤',
        '!',
        '✉',
        '◫',
        '◆',
      ];

      for (
        let i = 1;
        i <= 14;
        i++
      ) {

        const parameterKey =
          `parameter${i}` as keyof DashboardModel;

        const flagKey =
          `flag${i}` as keyof DashboardModel;

        const linkKey =
          `link${i}` as keyof DashboardModel;

        const title =
          dashboard[parameterKey];

        const flag =
          dashboard[flagKey];

        const link =
          dashboard[linkKey];

        if (
          flag === 1 &&
          title
        ) {

          cards.push({
            index: i,
            title: String(title),
            value: getCardValue(i),
            link: link
              ? String(link)
              : '',
            icon:
              icons[i - 1] || '◆',
          });
        }
      }

      return cards;
    };

  const cards =
    createCards();

  /* =======================================================
     CARD PRESS
  ======================================================= */

  const handleCardPress = (
    card: DashboardCard,
  ) => {

    console.log(
      'Selected service:',
      card.title,
    );

    if (!card.link) {

      Alert.alert(
        card.title,
        'This service is currently not available.',
      );

      return;
    }

    /*
     * WebView navigation can be connected here.
     */

    Alert.alert(
      card.title,
      `Service path:\n${card.link}`,
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (
      <SafeAreaView
        style={styles.loadingSafeArea}>

        <StatusBar
          barStyle="light-content"
          backgroundColor={NAVY}
        />

        <View
          style={styles.loadingContainer}>

          <View
            style={styles.loadingLogo}>

            <Text
              style={styles.loadingLogoText}>
              ⚖
            </Text>

          </View>

          <Text
            style={styles.loadingTitle}>
            e-Filing Portal
          </Text>

          <ActivityIndicator
            size="large"
            color={GOLD}
            style={
              styles.loadingIndicator
            }
          />

          <Text
            style={styles.loadingText}>
            Loading your dashboard...
          </Text>

          <Text
            style={styles.loadingSubText}>
            Please wait
          </Text>

        </View>

      </SafeAreaView>
    );
  }

  /* =======================================================
     PROFILE IMAGE URL
  ======================================================= */

  const profileImage =
    getProfileImage();

  /* =======================================================
     DASHBOARD
  ======================================================= */

  return (
    <SafeAreaView
      style={styles.safeArea}>

      <StatusBar
        barStyle="light-content"
        backgroundColor={NAVY}
      />

      <View
        style={styles.container}>

        {/* =================================================
            TOP NAVBAR
        ================================================= */}

        <View
          style={styles.topBar}>

          <View
            style={styles.brandContainer}>

            <View
              style={styles.brandLogo}>

              <Text
                style={styles.brandLogoText}>
                ⚖
              </Text>

            </View>

            <View>

              <Text
                style={styles.brandTitle}>
                e-FILING
              </Text>

              <Text
                style={styles.brandSubtitle}>
                ADVOCATE PORTAL
              </Text>

            </View>

          </View>

          <TouchableOpacity
            style={styles.logoutTopButton}
            onPress={handleLogout}
            activeOpacity={0.8}>

            <Text
              style={
                styles.logoutTopText
              }>
              ⇥
            </Text>

          </TouchableOpacity>

        </View>

        {/* =================================================
            CONTENT
        ================================================= */}

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={NAVY}
            />
          }
          contentContainerStyle={
            styles.scrollContent
          }>

          {/* ===============================================
              PROFILE CARD
          =============================================== */}

          <View
            style={styles.profileCard}>

            <View
              style={styles.profileHeader}>

              {/* PROFILE IMAGE */}

              <View
                style={styles.profileImageWrapper}>

                {profileImage ? (

                  <Image
                    source={{
                      uri: profileImage,
                    }}
                    style={
                      styles.profileImage
                    }
                  />

                ) : (

                  <View
                    style={
                      styles.profileInitials
                    }>

                    <Text
                      style={
                        styles.profileInitialsText
                      }>
                      {getInitials()}
                    </Text>

                  </View>

                )}

                <View
                  style={styles.onlineDot}
                />

              </View>

              {/* USER INFORMATION */}

              <View
                style={styles.profileMainInfo}>

                <Text
                  style={styles.profileWelcome}>
                  Welcome back
                </Text>

                <Text
                  style={styles.profileName}
                  numberOfLines={1}>
                  {getUserName()}
                </Text>

                {/* ROLE AND LAST LOGIN - SAME ALIGNMENT */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    marginTop: 6,
                    gap: 8,
                  }}
                >
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>
                      {getRole()}
                    </Text>
                  </View>

                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>
                      Last Login: {getLastLogin()}
                    </Text>
                  </View>
                </View>


              </View>

            </View>

            {/* PROFILE DETAILS */}

            <View
              style={styles.profileDivider}
            />

            <View
              style={styles.profileDetailsRow}>

              <View
                style={styles.profileDetail}>

                <Text
                  style={
                    styles.profileDetailLabel
                  }>
                  USERNAME
                </Text>

                <Text
                  style={
                    styles.profileDetailValue
                  }
                  numberOfLines={1}>
                  {user?.username ||
                    'Not available'}
                </Text>

              </View>

              <View
                style={styles.detailSeparator}
              />

              <View
                style={styles.profileDetail}>

                <Text
                  style={
                    styles.profileDetailLabel
                  }>
                  MOBILE
                </Text>

                <Text
                  style={
                    styles.profileDetailValue
                  }>
                  {user?.um_mobile ||
                    'Not available'}
                </Text>

              </View>

            </View>

            <View
              style={styles.profileDetailsRow}>

              <View
                style={styles.profileDetail}>

                <Text
                  style={
                    styles.profileDetailLabel
                  }>
                  EMAIL
                </Text>

                <Text
                  style={
                    styles.profileDetailValue
                  }
                  numberOfLines={1}>
                  {user?.um_email ||
                    'Not available'}
                </Text>

              </View>

              <View
                style={styles.detailSeparator}
              />

              <View
                style={styles.profileDetail}>

                <Text
                  style={
                    styles.profileDetailLabel
                  }>
                  ROLE
                </Text>

                <Text
                  style={
                    styles.profileDetailValue
                  }>
                  {getRole()}
                </Text>

              </View>

            </View>

          </View>

{/* ==================================================== */}{/* NEW CASE FILING BANNER */}
<Pressable
  style={styles.newCaseFilingBanner}
  onPress={async () => {
    const url = 'http://192.168.0.160:8080/onlinecasefiling/';

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        'Unable to open',
        'Please check your network connection and try again.'
      );
    }
  }}
  accessibilityRole="link"
>
  <View style={styles.filingIconBox}>
    <Text style={styles.filingIcon}>📄</Text>
  </View>

  <View style={styles.filingTextContainer}>
    <Text style={styles.filingTitle}>
      New Case Filing
    </Text>

    <Text style={styles.filingSubtitle}>
      Tap here to access the e-Filing Portal
    </Text>
  </View>

  <View style={styles.filingArrowBox}>
    <Text style={styles.filingArrow}>›</Text>
  </View>
</Pressable>



          <View style={styles.sectionCardFullWidth}>

            <Text style={styles.sectionTitle}>
             Your Today's Listed Cases
            </Text>

            {causeListLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" />

                <Text style={styles.loaderText}>
                  Loading today's cause list...
                </Text>
              </View>
            ) : causeList.length > 0 ? (
              causeList.map((row, index) => (

                <Pressable
                  key={index}
                  style={styles.causeItem}
                  onPress={() => {
                    console.log(
                      'Selected Cause List:',
                      row,
                    );

                    // Later you can navigate to case details
                    // navigation.navigate('CaseDetails', { row });
                  }}
                >

                  {/* Serial Number */}
                  <View style={styles.causeNumber}>
                    <Text style={styles.causeNumberText}>
                      {index + 1}
                    </Text>
                  </View>

                  {/* Case Information */}
                  <View style={styles.causeInfo}>

                    <Text style={styles.caseNumber}>

                      {row.Case_Type_Name || 'CASE'}
                      {' / '}
                      {row.cause_reg_no ||
                        row.case_no ||
                        '-'}
                      {' / '}
                      {row.cause_reg_year || '-'}

                    </Text>

                    <Text style={styles.caseCourt}>

                      Court:{' '}
                      {row.court_no || '-'}

                      {'  |  '}

                      Current Sr:{' '}
                      {row.curSlno || '-'}

                      {'  |  '}

                      Serial No:{' '}
                      {row.sr_no || '-'}

                    </Text>

                    <Text style={styles.benchName}>

                      {row.Bench_Name || 'Court'}

                      {row.listing_date
                        ? ' • ' + row.listing_date
                        : ''}

                    </Text>
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation();
                        openLastOrder(row.lastOrder);
                      }}
                      hitSlop={8}
                      accessibilityRole="link"
                    >
                      <Text
                        style={{
                          color: '#1565C0',
                          textDecorationLine: 'underline',
                          fontSize: 14,
                          fontWeight: '600',
                          marginTop: 6,
                        }}
                      >
                        Last Order
                      </Text>
                    </Pressable>

                  </View>

                </Pressable>

              ))
            ) : (

              <View style={styles.emptyContainer}>

                <Text style={styles.emptyIcon}>
                  📅
                </Text>

                <Text style={styles.emptyText}>
                  No cases listed for today
                </Text>

              </View>

            )}

          </View>

          {/* ===============================================
              DASHBOARD TITLE
          =============================================== */}

          <View
            style={styles.dashboardHeading}>

            <View>

              <Text
                style={styles.dashboardTitle}>
                Your e-Filing Dashboard
              </Text>

              <Text
                style={styles.dashboardSubtitle}>
                Manage your cases and court
                services
              </Text>

            </View>

            <TouchableOpacity
              style={styles.refreshSmallButton}
              onPress={handleRefresh}
              activeOpacity={0.8}>

              <Text
                style={
                  styles.refreshSmallText
                }>
                ↻
              </Text>

            </TouchableOpacity>

          </View>

          {/* ===============================================
              STATISTICS
          =============================================== */}

          <View
            style={styles.statsContainer}>

            {/* E-FILED */}

            <View
              style={styles.statCard}>

              <View
                style={[
                  styles.statIcon,
                  {
                    backgroundColor:
                      '#E8F0FF',
                  },
                ]}>

                <Text
                  style={styles.statIconText}>
                  ▣
                </Text>

              </View>

              <Text
                style={styles.statValue}>
                {dashboard?.value1 ||
                  '0'}
              </Text>

              <Text
                style={styles.statLabel}>
                E-filed Cases
              </Text>

            </View>

            {/* APPLICATIONS */}

            <View
              style={styles.statCard}>

              <View
                style={[
                  styles.statIcon,
                  {
                    backgroundColor:
                      '#FFF5DA',
                  },
                ]}>

                <Text
                  style={styles.statIconText}>
                  ✎
                </Text>

              </View>

              <Text
                style={styles.statValue}>
                {dashboard?.value9 ||
                  '0'}
              </Text>

              <Text
                style={styles.statLabel}>
                Applications
              </Text>

            </View>

            {/* CASE FILED */}

            <View
              style={styles.statCard}>

              <View
                style={[
                  styles.statIcon,
                  {
                    backgroundColor:
                      '#E8F7EE',
                  },
                ]}>

                <Text
                  style={styles.statIconText}>
                  ⚖
                </Text>

              </View>

              <Text
                style={styles.statValue}>
                {getCardValue(2)}
              </Text>

              <Text
                style={styles.statLabel}>
                Case Filed
              </Text>

            </View>

          </View>

          {/* ===============================================
              CASE BREAKDOWN
          =============================================== */}

          {dashboard?.value2 && (
            <CaseSummary
              value={
                dashboard.value2
              }
            />
          )}

          {/* ===============================================
              SERVICES
          =============================================== */}

          <View
            style={styles.sectionHeader}>

            <View>

              <Text
                style={styles.sectionTitle}>
                Court Services
              </Text>

              <Text
                style={styles.sectionSubtitle}>
                Access your e-Filing services
              </Text>

            </View>

            <View
              style={styles.serviceCountBadge}>

              <Text
                style={
                  styles.serviceCountText
                }>
                {cards.length}
              </Text>

            </View>

          </View>

          {/* ===============================================
              SERVICE CARDS
          =============================================== */}

          <View
            style={styles.cardsGrid}>

            {cards.map(card => (

              <TouchableOpacity
                key={card.index}
                style={styles.serviceCard}
                onPress={() =>
                  handleCardPress(card)
                }
                activeOpacity={0.85}>

                <View
                  style={
                    styles.serviceTop
                  }>

                  <View
                    style={[
                      styles.serviceIcon,
                      getIconBackground(
                        card.index,
                      ),
                    ]}>

                    <Text
                      style={
                        styles.serviceIconText
                      }>
                      {card.icon}
                    </Text>

                  </View>

                  <Text
                    style={styles.serviceArrow}>
                    →
                  </Text>

                </View>

                <Text
                  style={styles.serviceValue}>
                  {card.value}
                </Text>

                <Text
                  style={styles.serviceTitle}
                  numberOfLines={2}>
                  {card.title}
                </Text>

                <View
                  style={
                    styles.serviceBottom
                  }>

                  <Text
                    style={
                      styles.serviceOpenText
                    }>
                    OPEN SERVICE
                  </Text>

                </View>

              </TouchableOpacity>

            ))}

          </View>

          {/* ===============================================
              FOOTER
          =============================================== */}

          <View
            style={styles.footer}>

            <View
              style={styles.footerLine}
            />

            <Text
              style={styles.footerTitle}>
              e-Filing Portal
            </Text>

            <Text
              style={styles.footerText}>
              High Court of Judicature at
              Allahabad
            </Text>

            <Text
              style={styles.footerSmall}>
              Secure Digital Court Services
            </Text>

          </View>

        </ScrollView>

      </View>

    </SafeAreaView>
  );
};

/* =========================================================
   CASE SUMMARY COMPONENT
========================================================= */

const CaseSummary = ({
  value,
}: {
  value: string;
}) => {

  try {

    const data:
      CaseSummary =
      JSON.parse(value);

    return (
      <View
        style={styles.caseSummaryCard}>

        <View
          style={
            styles.caseSummaryHeader
          }>

          <View>

            <Text
              style={
                styles.caseSummaryTitle
              }>
              Case Filing Summary
            </Text>

            <Text
              style={
                styles.caseSummarySubtitle
              }>
              Your active case distribution
            </Text>

          </View>

          <View
            style={
              styles.caseSummaryIcon
            }>

            <Text
              style={
                styles.caseSummaryIconText
              }>
              ⚖
            </Text>

          </View>

        </View>

        <View
          style={
            styles.caseSummaryDivider
          }
        />

        <View
          style={styles.caseSummaryRow}>

          <View
            style={
              styles.caseSummaryItem
            }>

            <Text
              style={
                styles.caseSummaryValue
              }>
              {
                data.PetAdvocateCaseCount ||
                '0'
              }
            </Text>

            <Text
              style={
                styles.caseSummaryLabel
              }>
              As Petitioner
            </Text>

          </View>

          <View
            style={styles.verticalDivider}
          />

          <View
            style={
              styles.caseSummaryItem
            }>

            <Text
              style={
                styles.caseSummaryValue
              }>
              {
                data.ResAdvocateCaseCount ||
                '0'
              }
            </Text>

            <Text
              style={
                styles.caseSummaryLabel
              }>
              As Respondent
            </Text>

          </View>

        </View>

      </View>
    );

  } catch (error) {

    return null;
  }
};

/* =========================================================
   ICON BACKGROUNDS
========================================================= */

const getIconBackground = (
  index: number,
) => {

  const backgrounds = [
    '#E8F0FF',
    '#FFF3D9',
    '#E8F7EE',
    '#F1E9FF',
    '#FFE9E9',
    '#E5F4F4',
    '#E8EEFF',
    '#FFF1DA',
    '#E8F7EE',
    '#F0EAFF',
    '#FFE8E8',
    '#E6F0FF',
    '#F0EBFF',
    '#FFF0DC',
  ];

  return {
    backgroundColor:
      backgrounds[index - 1] ||
      '#EEF2F7',
  };
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

 sectionCardFullWidth: {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 16,
  marginTop: 6,
  marginHorizontal: 0,
  width: '100%',
  elevation: 3,
  shadowColor: '#000000',
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: {
    width: 0,
    height: 3,
  },
},

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },

  loaderContainer: {
    paddingVertical: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loaderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },

  causeItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  causeNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    marginRight: 12,
  },

  causeNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  causeInfo: {
    flex: 1,
  },

  caseNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },

  caseCourt: {
    marginTop: 5,
    fontSize: 12,
    color: '#555555',
  },

  benchName: {
    marginTop: 5,
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '600',
  },

  emptyContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: '#777777',
  },




  safeArea: {
    flex: 1,
    backgroundColor: NAVY,
  },

  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  /* =====================================================
     LOADING
  ===================================================== */

  loadingSafeArea: {
    flex: 1,
    backgroundColor: NAVY,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NAVY,
  },

  loadingLogo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingLogoText: {
    fontSize: 37,
    color: NAVY,
  },

  loadingTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 17,
    letterSpacing: 0.5,
  },

  loadingIndicator: {
    marginTop: 25,
  },

  loadingText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
  },

  loadingSubText: {
    color: '#A8B5C9',
    fontSize: 11,
    marginTop: 5,
  },

  /* =====================================================
     TOP BAR
  ===================================================== */

  topBar: {
    height: 72,
    backgroundColor: NAVY,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandLogo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  brandLogoText: {
    color: NAVY,
    fontSize: 23,
  },

  brandTitle: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },

  brandSubtitle: {
    color: '#9EACC2',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginTop: 1,
  },

  logoutTopButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#405273',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutTopText: {
    color: GOLD,
    fontSize: 23,
    fontWeight: '700',
  },

  /* =====================================================
     SCROLL
  ===================================================== */

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  /* =====================================================
     PROFILE CARD
  ===================================================== */

  profileCard: {
    backgroundColor: WHITE,
    borderRadius: 22,
    padding: 17,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImageWrapper: {
    width: 78,
    height: 78,
    borderRadius: 39,
    position: 'relative',
  },

  profileImage: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: '#E8D48B',
  },

  profileInitials: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E8D48B',
  },

  profileInitialsText: {
    color: GOLD,
    fontSize: 26,
    fontWeight: '900',
  },

  onlineDot: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#27AE60',
    right: 1,
    bottom: 3,
    borderWidth: 3,
    borderColor: WHITE,
  },

  profileMainInfo: {
    flex: 1,
    marginLeft: 14,
  },

  profileWelcome: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: '600',
  },

  profileName: {
    color: NAVY,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },

  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7DD',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 7,
  },

  roleBadgeText: {
    color: '#8B6A00',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  profileDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 15,
  },

  profileDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 47,
  },

  profileDetail: {
    flex: 1,
  },

  profileDetailLabel: {
    color: '#9AA4B2',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  profileDetailValue: {
    color: TEXT_DARK,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },

  detailSeparator: {
    width: 1,
    height: 30,
    backgroundColor: BORDER,
    marginHorizontal: 13,
  },

  /* =====================================================
     DASHBOARD HEADING
  ===================================================== */

  dashboardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 13,
  },

  dashboardTitle: {
    color: NAVY,
    fontSize: 19,
    fontWeight: '900',
  },

  dashboardSubtitle: {
    color: TEXT_MUTED,
    fontSize: 11,
    marginTop: 4,
  },

  refreshSmallButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  refreshSmallText: {
    color: NAVY,
    fontSize: 23,
    fontWeight: '800',
  },

  /* =====================================================
     STATISTICS
  ===================================================== */

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statCard: {
    width: '31.7%',
    backgroundColor: WHITE,
    borderRadius: 17,
    padding: 12,
    elevation: 2,
    minHeight: 128,
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statIconText: {
    fontSize: 17,
    color: NAVY,
    fontWeight: '800',
  },

  statValue: {
    color: NAVY,
    fontSize: 21,
    fontWeight: '900',
    marginTop: 13,
  },

  statLabel: {
    color: TEXT_MUTED,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 3,
  },

  /* =====================================================
     CASE SUMMARY
  ===================================================== */

  caseSummaryCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 17,
    marginTop: 13,
    elevation: 2,
  },

  caseSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  caseSummaryTitle: {
    color: NAVY,
    fontSize: 14,
    fontWeight: '900',
  },

  caseSummarySubtitle: {
    color: TEXT_MUTED,
    fontSize: 9,
    marginTop: 3,
  },

  caseSummaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF6DC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  caseSummaryIconText: {
    color: '#8B6A00',
    fontSize: 19,
  },

  caseSummaryDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 14,
  },

  caseSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  caseSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  caseSummaryValue: {
    color: NAVY,
    fontSize: 25,
    fontWeight: '900',
  },

  caseSummaryLabel: {
    color: TEXT_MUTED,
    fontSize: 10,
    marginTop: 4,
  },

  verticalDivider: {
    width: 1,
    height: 42,
    backgroundColor: BORDER,
  },

  /* =====================================================
     SERVICES HEADER
  ===================================================== */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 13,
  },

  sectionTitle: {
    color: NAVY,
    fontSize: 18,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: TEXT_MUTED,
    fontSize: 10,
    marginTop: 4,
  },

  serviceCountBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  serviceCountText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '900',
  },

  /* =====================================================
     SERVICE CARDS
  ===================================================== */

  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  serviceCard: {
    width: '48.2%',
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    minHeight: 165,
    elevation: 2,
  },

  serviceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  serviceIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  serviceIconText: {
    fontSize: 20,
    color: NAVY,
    fontWeight: '800',
  },

  serviceArrow: {
    color: '#AAB2BF',
    fontSize: 19,
    fontWeight: '800',
  },

  serviceValue: {
    color: NAVY,
    fontSize: 21,
    fontWeight: '900',
    marginTop: 14,
  },

  serviceTitle: {
    color: TEXT_DARK,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    marginTop: 3,
    minHeight: 34,
  },

  serviceBottom: {
    borderTopWidth: 1,
    borderTopColor: '#EFF1F5',
    marginTop: 12,
    paddingTop: 9,
  },

  serviceOpenText: {
    color: '#A18A42',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  /* =====================================================
     FOOTER
  ===================================================== */

  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },

  footerLine: {
    width: 45,
    height: 3,
    borderRadius: 2,
    backgroundColor: GOLD,
    marginBottom: 14,
  },

  footerTitle: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '900',
  },

  footerText: {
    color: TEXT_MUTED,
    fontSize: 9,
    marginTop: 4,
  },

  footerSmall: {
    color: '#AAB1BC',
    fontSize: 8,
    marginTop: 3,
  },


newCaseFilingBanner: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F5F8FF',
  borderWidth: 1,
  borderColor: '#D7E3F5',
  borderLeftWidth: 4,
  borderLeftColor: '#D4AF37',
  borderRadius: 14,
  paddingVertical: 14,
  paddingHorizontal: 14,
  marginTop: 12,
  marginBottom: 16,

  shadowColor: '#102A56',
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
},

filingIconBox: {
  width: 44,
  height: 44,
  borderRadius: 12,
  backgroundColor: '#E4ECFA',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
},

filingIcon: {
  fontSize: 23,
},

filingTextContainer: {
  flex: 1,
  justifyContent: 'center',
},

filingTitle: {
  fontSize: 15,
  fontWeight: '700',
  color: '#102A56',
},

filingSubtitle: {
  fontSize: 12,
  color: '#64748B',
  marginTop: 4,
},

filingArrowBox: {
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: '#102A56',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 8,
},

filingArrow: {
  color: '#FFFFFF',
  fontSize: 25,
  lineHeight: 28,
  fontWeight: '500',
},


});

export default AdvocateDashboard;