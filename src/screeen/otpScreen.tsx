
/*
 * ============================================================
 * Developer : Vijay Chaurasiya
 * Project   : Allahabad High Court eFiling Application
 * Module    : OTP Verification Screen
 * Features  : OTP Verification, Resend OTP, Session Validation
 * ============================================================
 */

import React, {useEffect, useRef, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  RootStackParamList,
} from '../navigation/navigationTypes';

import {
  generateOtp,
  validateOtp,
} from '../api/authApi';

import {
  saveAuthentication,
} from '../storage/authStorage';

import {
  getApiErrorMessage,
} from '../utils/errorHandler';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Otp'
>;

const COLORS = {
  navy: '#071A3D',
  navyLight: '#0D2855',
  gold: '#D4AF37',
  teal: '#087F8C',
  tealDark: '#066B76',
  white: '#FFFFFF',
  text: '#172033',
  muted: '#6B7280',
  border: '#D9DEE8',
  background: '#F5F7FB',
};

const OtpScreen = ({
  route,
  navigation,
}: Props) => {
  const {username} = route.params;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(60);

  const inputRef = useRef<TextInput>(null);
  const verifyInProgress = useRef(false);

  /*
   * ============================================================
   * OTP RESEND TIMER
   * ============================================================
   */

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setSeconds(current => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds]);

  /*
   * ============================================================
   * VERIFY OTP
   * ============================================================
   */

  const handleVerify = async () => {
    if (verifyInProgress.current || loading) {
      return;
    }

    const normalizedOtp = otp.trim();

    if (!/^\d{4}$/.test(normalizedOtp)) {
      Alert.alert(
        'Invalid OTP',
        'Please enter a valid 4-digit OTP.',
      );
      return;
    }

    verifyInProgress.current = true;

    try {
      setLoading(true);

      const response = await validateOtp(
        username,
        normalizedOtp,
      );

      const isSuccess =
        response?.response?.toUpperCase() === 'TRUE';

      if (!isSuccess) {
        const message =
          typeof response?.data === 'string'
            ? response.data
            : response?.message ||
              'Incorrect OTP. Please try again.';

        Alert.alert(
          'Verification Failed',
          message,
        );

        return;
      }

      // Save local authentication state.
      await saveAuthentication(username);

      // Check actual server session separately.
      const {getSessionCookie} = await import(
        '../api/apiClient'
      );

      const cookie = await getSessionCookie();

      if (__DEV__) {
        console.log('[LOGIN SESSION RESULT]', {
          authenticated: true,
          sessionAvailable: !!cookie,
        });
      }

      // Navigate to dashboard.
      navigation.reset({
        index: 0,
        routes: [
          {name: 'AdvocateDashboard'},
        ],
      });

    } catch (error) {
      console.log(
        '[OTP VERIFICATION ERROR]',
        error,
      );

      Alert.alert(
        'Verification Error',
        getApiErrorMessage(error),
      );

    } finally {
      verifyInProgress.current = false;
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * RESEND OTP
   * ============================================================
   */

  const handleResend = async () => {
    if (seconds > 0 || resending) {
      return;
    }

    try {
      setResending(true);

      const response = await generateOtp(username);

      console.log(
        'Resend OTP Response:',
        response,
      );

      if (
        response?.response?.toUpperCase() === 'TRUE'
      ) {
        setOtp('');
        setSeconds(60);

        Alert.alert(
          'OTP Sent',
          'A new OTP has been sent to your registered mobile number.',
        );

        setTimeout(() => {
          inputRef.current?.focus();
        }, 300);

      } else {
        const message =
          typeof response?.data === 'string'
            ? response.data
            : response?.message ||
              'Unable to resend OTP.';

        Alert.alert(
          'OTP Request Failed',
          message,
        );
      }

    } catch (error) {
      console.log(
        'Resend OTP Error:',
        error,
      );

      Alert.alert(
        'Connection Error',
        getApiErrorMessage(error),
      );

    } finally {
      setResending(false);
    }
  };

  /*
   * ============================================================
   * SCREEN UI
   * ============================================================
   */

  return (
    <View style={styles.container}>

      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.navy}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* HEADER */}

          <View style={styles.header}>

            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>
                ‹
              </Text>
            </Pressable>

            <View style={styles.logo}>
              <Text style={styles.logoText}>
                AHC
              </Text>
            </View>

            <Text style={styles.heading}>
              Verify OTP
            </Text>

            <Text style={styles.subtitle}>
              Secure e-Filing Authentication
            </Text>

          </View>

          {/* OTP CARD */}

          <View style={styles.card}>

            {/* OTP ICON */}

            <View style={styles.otpIcon}>
              <Text style={styles.otpIconText}>
                ✉
              </Text>
            </View>

            {/* TITLE */}

            <Text style={styles.title}>
              Enter Verification Code
            </Text>

            <Text style={styles.description}>
              We have sent a 4-digit OTP to
              your registered mobile number
              associated with:
            </Text>

            <Text style={styles.username}>
              {username}
            </Text>

            {/* HIDDEN REAL INPUT */}

            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={value => {
                const numeric = value
                  .replace(/[^0-9]/g, '')
                  .slice(0, 4);

                setOtp(numeric);
              }}
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
              textContentType="oneTimeCode"
              style={styles.otpInput}
              placeholder="0000"
              placeholderTextColor="#B8BFCC"
              editable={!loading}
              onSubmitEditing={handleVerify}
            />

            {/* OTP BOXES */}

            <View style={styles.otpBoxes}>
              {Array.from({length: 4}).map((_, index) => (
                <Pressable
                  key={index}
                  onPress={() => inputRef.current?.focus()}
                  style={[
                    styles.otpBox,
                    otp[index] ? styles.otpBoxFilled : null,
                  ]}
                >
                  <Text style={styles.otpDigit}>
                    {otp[index] || ''}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* VERIFY OTP BUTTON */}

            

            {/* RESEND OTP */}

            <View style={styles.resendRow}>

              <Text style={styles.resendLabel}>
                Didn't receive the OTP?
              </Text>

              {seconds > 0 ? (
                <Text style={styles.timer}>
                  Resend in {seconds}s
                </Text>
              ) : (
                <Pressable
                  onPress={handleResend}
                  disabled={resending}
                >
                  <Text style={styles.resendButton}>
                    {resending
                      ? 'Sending...'
                      : 'Resend OTP'}
                  </Text>
                </Pressable>
              )}

            </View>

            {/* CHANGE USERNAME */}

            <Pressable
              onPress={() => navigation.navigate('Login')}
              style={styles.changeUser}
            >
              <Text style={styles.changeUserText}>
                ← Change username
              </Text>
            </Pressable>

          </View>

          {/* FOOTER */}

          <Text style={styles.footer}>
            Your OTP is confidential. Do not
            share it with anyone.
          </Text>

        </ScrollView>

      </KeyboardAvoidingView>

    </View>
  );
};

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles = StyleSheet.create({

  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  // HEADER

  header: {
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    paddingTop: 55,
    paddingBottom: 65,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },

  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    color: COLORS.white,
    fontSize: 30,
    lineHeight: 32,
  },

  logo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  logoText: {
    color: COLORS.navy,
    fontSize: 19,
    fontWeight: '900',
  },

  heading: {
    color: COLORS.white,
    fontSize: 27,
    fontWeight: '800',
  },

  subtitle: {
    color: '#D9E2F2',
    fontSize: 12,
    marginTop: 6,
  },

  // CARD

  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: -35,
    borderRadius: 20,
    padding: 24,

    // Full-width buttons with individually centered content.
    alignItems: 'stretch',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.12,
    shadowRadius: 18,

    elevation: 7,
  },

  otpIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F8F3DF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 15,
  },

  otpIconText: {
    fontSize: 25,
  },

  title: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
    alignSelf: 'center',
  },

  description: {
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 13,
    marginTop: 10,
    alignSelf: 'center',
  },

  username: {
    color: COLORS.navy,
    fontWeight: '800',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
    alignSelf: 'center',
  },

  // OTP INPUT

  otpInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },

  otpBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 25,
    marginBottom: 25,
  },

  otpBox: {
    width: 55,
    height: 58,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFBFD',
  },

  otpBoxFilled: {
    borderColor: COLORS.gold,
    backgroundColor: '#FFFCF1',
  },

  otpDigit: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: '800',
  },

  // VERIFY BUTTON - SAME DESIGN AS LOGIN

  verifyButton: {
    width: '100%',
    alignSelf: 'stretch',
    height: 56,
    borderRadius: 12,
    marginTop: 5,
    backgroundColor: COLORS.teal,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    elevation: 4,
    shadowColor: COLORS.teal,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  verifyText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  buttonArrow: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: '900',
    marginLeft: 12,
  },

  disabledButton: {
    opacity: 0.65,
  },

  buttonPressed: {
    backgroundColor: COLORS.tealDark,
    transform: [{scale: 0.98}],
  },

  // RESEND OTP

  resendRow: {
    flexDirection: 'row',
    marginTop: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  resendLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },

  timer: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 5,
  },

  resendButton: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 5,
  },

  // CHANGE USERNAME

  changeUser: {
    marginTop: 20,
    alignSelf: 'center',
  },

  changeUserText: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '700',
  },

  // FOOTER

  footer: {
    color: COLORS.muted,
    textAlign: 'center',
    fontSize: 11,
    marginTop: 25,
    paddingHorizontal: 30,
  },

});

export default OtpScreen;
