
/*
 * ============================================================
 * Developer : Vijay Chaurasiya
 * Project   : Allahabad High Court eFiling Application
 * Module    : Advocate Login Screen
 * Feature   : CAPTCHA, OTP generation, OTP verification,
 *             password validation and dashboard navigation.
 * ============================================================
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Keyboard,
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

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  generateOtp,
  validateOtp,
  loginWithPassword,
} from '../api/authApi';

import { getApiErrorMessage } from '../utils/errorHandler';

type LoginScreenProps = {
  navigation: any;
};

/* ============================================================
   THEME
============================================================ */

const COLORS = {
  navy: '#101D35',
  navyDark: '#0A1428',

  teal: '#20B8A6',
  tealDark: '#128F83',
  tealLight: '#E5F7F4',

  ivory: '#F4F6FA',
  white: '#FFFFFF',

  charcoal: '#18263D',
  charcoalLight: '#536179',
  muted: '#8290A5',

  input: '#F8FAFC',
  border: '#DCE3ED',

  green: '#15966D',
  greenLight: '#E6F6EF',

  red: '#C0392B',
};

/*
 * Supports both common API response formats:
 * 1. { response: "TRUE" }
 * 2. Axios response: { data: { response: "TRUE" } }
 */
const isApiSuccess = (result: any): boolean => {
  const value =
    result?.response ??
    result?.data?.response ??
    result?.data?.data?.response;

  return String(value ?? '').trim().toUpperCase() === 'TRUE';
};

const getResponseMessage = (
  result: any,
  fallback: string,
): string => {
  const message =
    result?.message ??
    result?.data?.message ??
    result?.data?.data?.message ??
    result?.data;

  return typeof message === 'string' && message.trim()
    ? message
    : fallback;
};

/* ============================================================
   LOGIN SCREEN
============================================================ */

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [captchaFirst, setCaptchaFirst] = useState(0);
  const [captchaSecond, setCaptchaSecond] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const otpInputRef = useRef<TextInput>(null);

  /* ============================================================
     SCROLL TO OTP
  ============================================================ */

  const scrollToOtp = useCallback(() => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    });
  }, []);

  /* ============================================================
     CAPTCHA GENERATION
  ============================================================ */

  const generateCaptcha = useCallback(() => {
    const first = Math.floor(Math.random() * 9) + 1;
    const second = Math.floor(Math.random() * 9) + 1;

    setCaptchaFirst(first);
    setCaptchaSecond(second);
    setCaptchaAnswer('');
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  /* ============================================================
     RESET OTP WHEN USERNAME CHANGES
  ============================================================ */

  const handleUsernameChange = (value: string) => {
    setUsername(value);

    // OTP belongs to the username for which it was generated.
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
  };

  /* ============================================================
     SCROLL WHEN OTP SECTION APPEARS
  ============================================================ */

  useEffect(() => {
    if (!otpSent) {
      return;
    }

    const timer = setTimeout(scrollToOtp, 300);

    return () => clearTimeout(timer);
  }, [otpSent, scrollToOtp]);

  /* ============================================================
     KEYBOARD HANDLING
  ============================================================ */

  useEffect(() => {
    const keyboardShowEvent =
      Platform.OS === 'ios'
        ? 'keyboardWillShow'
        : 'keyboardDidShow';

    const subscription = Keyboard.addListener(
      keyboardShowEvent,
      () => {
        if (otpSent) {
          setTimeout(scrollToOtp, 150);
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [otpSent, scrollToOtp]);

  /* ============================================================
     GENERATE / RESEND OTP
     Developer : Vijay Chaurasiya
  ============================================================ */

  const handleGenerateOtp = async () => {
    const trimmedUsername = username.trim();

    if (loadingOtp || loadingVerify || loadingLogin) {
      return;
    }

    if (!trimmedUsername) {
      Alert.alert(
        'Username Required',
        'Please enter your username or roll number.',
      );
      return;
    }

    if (!password) {
      Alert.alert(
        'Password Required',
        'Please enter your password.',
      );
      return;
    }

    if (!captchaAnswer.trim()) {
      Alert.alert(
        'CAPTCHA Required',
        'Please solve the CAPTCHA.',
      );
      return;
    }

    const correctAnswer = captchaFirst + captchaSecond;

    if (Number(captchaAnswer) !== correctAnswer) {
      Alert.alert(
        'Invalid CAPTCHA',
        'The CAPTCHA answer is incorrect. Please try again.',
      );

      generateCaptcha();
      return;
    }

    try {
      setLoadingOtp(true);

      const response = await generateOtp(trimmedUsername);

      if (isApiSuccess(response)) {
        setOtpSent(true);
        setOtpVerified(false);
        setOtp('');

        Alert.alert(
          'OTP Sent',
          'OTP generation was successful. Please check your registered mobile number.',
          [
            {
              text: 'OK',
              onPress: () => {
                setTimeout(() => {
                  scrollToOtp();

                  setTimeout(() => {
                    otpInputRef.current?.focus();
                  }, 250);
                }, 150);
              },
            },
          ],
        );

        return;
      }

      Alert.alert(
        'OTP Request Failed',
        getResponseMessage(
          response,
          'The server did not confirm OTP generation. Please try again.',
        ),
      );
    } catch (error) {
      Alert.alert(
        'Connection Error',
        getApiErrorMessage(error),
      );
    } finally {
      setLoadingOtp(false);
    }
  };

  /* ============================================================
     OTP INPUT
  ============================================================ */

  const handleOtpChange = (value: string) => {
    const numericValue = value
      .replace(/[^0-9]/g, '')
      .slice(0, 4);

    setOtp(numericValue);
  };

  /* ============================================================
     VERIFY OTP
     Developer : Vijay Chaurasiya
  ============================================================ */

  const handleVerifyOtp = async () => {
    if (loadingVerify || loadingOtp || loadingLogin) {
      return;
    }

    if (!otpSent) {
      Alert.alert(
        'OTP Required',
        'Please generate an OTP first.',
      );
      return;
    }

    if (otp.length !== 4) {
      Alert.alert(
        'Invalid OTP',
        'Please enter the complete 4-digit OTP.',
      );
      return;
    }

    try {
      setLoadingVerify(true);
      Keyboard.dismiss();

      const response = await validateOtp(
        username.trim(),
        otp,
      );

      if (isApiSuccess(response)) {
        setOtpVerified(true);

        Alert.alert(
          'OTP Verified',
          'Your OTP has been verified successfully. Please tap LOGIN to continue.',
        );

        return;
      }

      setOtpVerified(false);

      Alert.alert(
        'OTP Verification Failed',
        getResponseMessage(
          response,
          'Invalid OTP. Please try again.',
        ),
      );
    } catch (error) {
      Alert.alert(
        'Connection Error',
        getApiErrorMessage(error),
      );
    } finally {
      setLoadingVerify(false);
    }
  };

  /* ============================================================
     FINAL LOGIN
     Developer : Vijay Chaurasiya
     Feature   : Password validation after OTP verification
  ============================================================ */

  const handleLogin = async () => {
    const trimmedUsername = username.trim();

    if (loadingLogin || loadingOtp || loadingVerify) {
      return;
    }

    if (!otpVerified) {
      Alert.alert(
        'OTP Verification Required',
        'Please verify your OTP before continuing.',
      );
      return;
    }

    if (!trimmedUsername) {
      Alert.alert(
        'Username Required',
        'Please enter your username.',
      );
      return;
    }

    if (!password) {
      Alert.alert(
        'Password Required',
        'Please enter your password.',
      );
      return;
    }

    try {
      setLoadingLogin(true);
      Keyboard.dismiss();

      const response = await loginWithPassword(
        trimmedUsername,
        password,
      );

      if (isApiSuccess(response)) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdvocateDashboard' }],
        });

        return;
      }

      Alert.alert(
        'Login Failed',
        getResponseMessage(
          response,
          'Invalid username or password.',
        ),
      );
    } catch (error) {
      Alert.alert(
        'Connection Error',
        getApiErrorMessage(error),
      );
    } finally {
      setLoadingLogin(false);
    }
  };

  const otpBoxes = Array.from({ length: 4 }, (_, index) => index);

  /* ============================================================
     SCREEN UI
  ============================================================ */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={COLORS.navyDark}
        barStyle="light-content"
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          showsVerticalScrollIndicator={false}
        >
          {/* COURT BRANDING */}

          <View style={styles.hero}>
            <View style={styles.topAccent} />
            <View style={styles.heroPattern} />

            <View style={styles.emblemOuter}>
              <View style={styles.emblemInner}>
                <Text style={styles.emblem}>⚖</Text>
              </View>
            </View>

            <Text style={styles.courtName}>
              HIGH COURT OF JUDICATURE
            </Text>

            <Text style={styles.courtLocation}>
              AT ALLAHABAD
            </Text>

            <View style={styles.heroDivider}>
              <View style={styles.heroDividerLine} />
              <View style={styles.heroDividerDiamond} />
              <View style={styles.heroDividerLine} />
            </View>

            <View style={styles.dashboardPill}>
              <View style={styles.dashboardDot} />
              <Text style={styles.dashboardPillText}>
                ADVOCATE DASHBOARD
              </Text>
            </View>
          </View>

          {/* MAIN LOGIN PANEL */}

          <View style={styles.card}>
            <View style={styles.cardHeadingRow}>
              <View style={styles.headingContent}>
                <Text style={styles.cardTitle}>
                  Welcome Back
                </Text>

                <Text style={styles.cardSubtitle}>
                  Sign in to access your advocate account
                </Text>
              </View>

              <View style={styles.secureBadge}>
                <Text style={styles.secureIcon}>✓</Text>
                <Text style={styles.secureText}>SECURE</Text>
              </View>
            </View>

            {/* USERNAME */}

            <Text style={styles.label}>
              Username / Roll Number
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>♙</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter username or roll number"
                placeholderTextColor={COLORS.muted}
                value={username}
                onChangeText={handleUsernameChange}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loadingOtp && !loadingVerify && !loadingLogin}
                returnKeyType="next"
              />
            </View>

            {/* PASSWORD */}

            <Text style={styles.label}>
              Password
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>⌑</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loadingOtp && !loadingVerify && !loadingLogin}
                returnKeyType="done"
              />

              <Pressable
                onPress={() => setShowPassword(previous => !previous)}
                style={styles.eyeButton}
                disabled={loadingLogin}
              >
                <Text style={styles.eyeText}>
                  {showPassword ? 'HIDE' : 'SHOW'}
                </Text>
              </Pressable>
            </View>

            {/* CAPTCHA */}

            <Text style={styles.label}>
              Solve the following calculation
            </Text>

            <View style={styles.captchaRow}>
              <View style={styles.captchaBox}>
                <Text style={styles.captchaSmallLabel}>
                  SECURITY CHECK
                </Text>

                <Text style={styles.captchaText}>
                  {captchaFirst}{' '}
                  <Text style={styles.captchaOperator}>+</Text>{' '}
                  {captchaSecond} = ?
                </Text>
              </View>

              <Pressable
                style={styles.refreshButton}
                onPress={generateCaptcha}
                disabled={loadingOtp || loadingVerify || loadingLogin}
              >
                <Text style={styles.refreshText}>↻</Text>
              </Pressable>

              <TextInput
                style={styles.captchaInput}
                placeholder="Answer"
                placeholderTextColor={COLORS.muted}
                keyboardType="number-pad"
                value={captchaAnswer}
                onChangeText={value =>
                  setCaptchaAnswer(
                    value.replace(/[^0-9]/g, '').slice(0, 2),
                  )
                }
                editable={!loadingOtp && !loadingVerify && !loadingLogin}
                returnKeyType="done"
              />
            </View>

            {/* GENERATE OTP BUTTON */}

            <Pressable
              style={[
                styles.primaryButton,
                loadingOtp && styles.disabledButton,
              ]}
              onPress={handleGenerateOtp}
              disabled={loadingOtp || loadingVerify || loadingLogin}
            >
              {loadingOtp ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.white}
                />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {otpSent ? 'RESEND OTP' : 'GENERATE OTP'}
                  </Text>

                  <Text style={styles.buttonArrow}>→</Text>
                </>
              )}
            </Pressable>

            <Text style={styles.buttonHint}>
              OTP will be sent to your registered mobile number
            </Text>

            {/* OTP SECTION */}

            {otpSent && (
              <View style={styles.otpSection}>
                <View style={styles.otpTopLine} />

                <View style={styles.otpIconCircle}>
                  <Text style={styles.otpIcon}>✉</Text>
                </View>

                <Text style={styles.otpTitle}>
                  Verify Your Identity
                </Text>

                <Text style={styles.otpSubtitle}>
                  Enter the 4-digit OTP sent to your registered mobile number.
                </Text>

                {/* FOUR-DIGIT OTP INPUT */}

                <Pressable
                  style={styles.otpInputWrapper}
                  onPress={() => {
                    if (!otpVerified) {
                      scrollToOtp();
                      otpInputRef.current?.focus();
                    }
                  }}
                  disabled={otpVerified}
                >
                  <View style={styles.otpRow}>
                    {otpBoxes.map(index => (
                      <View
                        key={index}
                        style={[
                          styles.otpBox,
                          otp.length === index && !otpVerified &&
                            styles.activeOtpBox,
                          otp.length > index && styles.filledOtpBox,
                        ]}
                      >
                        <Text style={styles.otpBoxText}>
                          {otp[index] || ''}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <TextInput
                    ref={otpInputRef}
                    style={styles.otpInput}
                    value={otp}
                    onChangeText={handleOtpChange}
                    keyboardType="number-pad"
                    maxLength={4}
                    editable={!otpVerified && !loadingVerify}
                    autoCapitalize="none"
                    autoCorrect={false}
                    caretHidden
                    contextMenuHidden
                    returnKeyType="done"
                    onFocus={() => {
                      setTimeout(scrollToOtp, 150);
                    }}
                    accessibilityLabel="Enter four-digit OTP"
                  />
                </Pressable>

                {/* VERIFY OTP OR FINAL LOGIN */}

                {!otpVerified ? (
                  <>
                    {/* STEP 1: VERIFY OTP */}

                    <Pressable
                      style={[
                        styles.verifyButton,
                        (otp.length !== 4 || loadingVerify) &&
                          styles.disabledButton,
                      ]}
                      onPress={handleVerifyOtp}
                      disabled={
                        otp.length !== 4 ||
                        loadingVerify ||
                        loadingOtp ||
                        loadingLogin
                      }
                    >
                      {loadingVerify ? (
                        <ActivityIndicator
                          size="small"
                          color={COLORS.white}
                        />
                      ) : (
                        <>
                          <Text style={styles.primaryButtonText}>
                            VERIFY OTP
                          </Text>

                          <Text style={styles.buttonArrow}>→</Text>
                        </>
                      )}
                    </Pressable>

                    {/* RESEND OTP - ONLY ONE BUTTON */}

                    <Pressable
                      style={styles.resendButton}
                      onPress={handleGenerateOtp}
                      disabled={
                        loadingOtp ||
                        loadingVerify ||
                        loadingLogin
                      }
                    >
                      <Text style={styles.resendText}>
                        Didn't receive OTP?{' '}
                        <Text style={styles.resendHighlight}>
                          Resend OTP
                        </Text>
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    {/* STEP 2: OTP VERIFIED */}

                    <View style={styles.verifiedMessage}>
                      <Text style={styles.verifiedIcon}>✓</Text>

                      <Text style={styles.verifiedText}>
                        OTP Verified Successfully
                      </Text>
                    </View>

                    {/* FINAL LOGIN BUTTON */}

                    <Pressable
                      style={[
                        styles.verifyButton,
                        loadingLogin && styles.disabledButton,
                      ]}
                      onPress={handleLogin}
                      disabled={
                        loadingLogin ||
                        loadingOtp ||
                        loadingVerify
                      }
                    >
                      {loadingLogin ? (
                        <ActivityIndicator
                          size="small"
                          color={COLORS.white}
                        />
                      ) : (
                        <>
                          <Text style={styles.primaryButtonText}>
                            LOGIN
                          </Text>

                          <Text style={styles.buttonArrow}>→</Text>
                        </>
                      )}
                    </Pressable>

                    <Text style={styles.buttonHint}>
                      Your OTP is verified. Tap LOGIN to continue to the Advocate Dashboard.
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>

          {/* FOOTER */}

          <View style={styles.footer}>
            <Text style={styles.footerTitle}>
              HIGH COURT OF JUDICATURE AT ALLAHABAD
            </Text>

            <Text style={styles.footerText}>
              Secure Digital Filing & Case Management
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* ============================================================
   STYLES
   Theme : Navy, Teal, Ivory and Charcoal
   Developer : Vijay Chaurasiya
============================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.navyDark,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.ivory,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  /* HERO */

  hero: {
    backgroundColor: COLORS.navy,
    marginHorizontal: -20,
    paddingTop: 24,
    paddingBottom: 28,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },

  topAccent: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 5,
    backgroundColor: COLORS.teal,
  },

  heroPattern: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    top: -115,
    right: -75,
  },

  emblemOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  emblemInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emblem: {
    fontSize: 37,
    color: COLORS.navy,
  },

  courtName: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.1,
    textAlign: 'center',
  },

  courtLocation: {
    color: '#B9EDE6',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 5,
  },

  heroDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 10,
  },

  heroDividerLine: {
    width: 43,
    height: 1,
    backgroundColor: COLORS.teal,
    opacity: 0.8,
  },

  heroDividerDiamond: {
    width: 7,
    height: 7,
    backgroundColor: COLORS.teal,
    transform: [{ rotate: '45deg' }],
  },

  dashboardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
    marginTop: 15,
    gap: 7,
  },

  dashboardDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.teal,
  },

  dashboardPillText: {
    color: COLORS.navy,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  /* LOGIN CARD */

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginTop: -12,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    elevation: 5,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.09,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  cardHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  headingContent: {
    flex: 1,
    paddingRight: 5,
  },

  cardTitle: {
    color: COLORS.charcoal,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.6,
  },

  cardSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },

  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },

  secureIcon: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: '900',
  },

  secureText: {
    color: COLORS.green,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  /* LABELS */

  label: {
    color: COLORS.charcoal,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 7,
  },

  /* INPUTS */

  inputContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
  },

  inputIcon: {
    width: 43,
    textAlign: 'center',
    color: COLORS.tealDark,
    fontSize: 22,
    fontWeight: '700',
  },

  input: {
    flex: 1,
    height: '100%',
    color: COLORS.charcoal,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 4,
  },

  eyeButton: {
    paddingHorizontal: 13,
    paddingVertical: 12,
  },

  eyeText: {
    color: COLORS.navy,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  /* CAPTCHA */

  captchaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  captchaBox: {
    flex: 1,
    height: 62,
    borderRadius: 11,
    backgroundColor: COLORS.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B8E7DF',
  },

  captchaSmallLabel: {
    color: COLORS.charcoalLight,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 3,
  },

  captchaText: {
    color: COLORS.charcoal,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 1,
  },

  captchaOperator: {
    color: COLORS.tealDark,
  },

  refreshButton: {
    width: 47,
    height: 62,
    borderRadius: 11,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },

  refreshText: {
    fontSize: 29,
    color: COLORS.white,
    fontWeight: '700',
  },

  captchaInput: {
    width: 83,
    height: 62,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    backgroundColor: COLORS.input,
    textAlign: 'center',
    color: COLORS.charcoal,
    fontSize: 15,
    fontWeight: '900',
  },

  /* BUTTONS */

  primaryButton: {
    height: 54,
    borderRadius: 11,
    marginTop: 23,
    backgroundColor: COLORS.navy,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.navyDark,
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  verifyButton: {
    height: 54,
    borderRadius: 11,
    marginTop: 22,
    backgroundColor: COLORS.tealDark,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  buttonArrow: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: '800',
    marginLeft: 13,
  },

  disabledButton: {
    opacity: 0.55,
  },

  buttonHint: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 10,
    lineHeight: 16,
  },

  /* OTP */

  otpSection: {
    marginTop: 7,
    alignItems: 'center',
  },

  otpTopLine: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 23,
    marginBottom: 20,
  },

  otpIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.tealLight,
    borderWidth: 1,
    borderColor: '#B8E7DF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  otpIcon: {
    color: COLORS.tealDark,
    fontSize: 22,
  },

  otpTitle: {
    color: COLORS.charcoal,
    fontSize: 20,
    fontWeight: '900',
  },

  otpSubtitle: {
    color: COLORS.charcoalLight,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 18,
    paddingHorizontal: 5,
  },

  otpInputWrapper: {
    position: 'relative',
    height: 59,
    width: '100%',
    marginTop: 20,
    justifyContent: 'center',
  },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },

  otpBox: {
    width: 54,
    height: 58,
    borderRadius: 11,
    borderWidth: 1.3,
    borderColor: COLORS.border,
    backgroundColor: COLORS.input,
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeOtpBox: {
    borderColor: COLORS.teal,
    borderWidth: 2,
    backgroundColor: COLORS.tealLight,
  },

  filledOtpBox: {
    backgroundColor: '#E5F7F4',
    borderColor: COLORS.tealDark,
  },

  otpBoxText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.charcoal,
  },

  otpInput: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    color: 'transparent',
    opacity: 0.02,
    fontSize: 1,
    padding: 0,
    textAlign: 'center',
  },

  /* RESEND */

  resendButton: {
    alignItems: 'center',
    marginTop: 17,
    paddingVertical: 9,
  },

  resendText: {
    fontSize: 12,
    color: COLORS.charcoalLight,
  },

  resendHighlight: {
    color: COLORS.tealDark,
    fontWeight: '900',
  },

  /* OTP VERIFIED */

  verifiedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.greenLight,
    borderWidth: 1,
    borderColor: '#B8E7D2',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 12,
    marginTop: 20,
    width: '100%',
  },

  verifiedIcon: {
    color: COLORS.green,
    fontSize: 19,
    fontWeight: '900',
    marginRight: 9,
  },

  verifiedText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: '900',
  },

  /* FOOTER */

  footer: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 5,
  },

  footerTitle: {
    fontSize: 9,
    color: COLORS.charcoalLight,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 6,
  },
});

export default LoginScreen;
