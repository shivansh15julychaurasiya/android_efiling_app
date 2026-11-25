
/*
 * ============================================================
 * Developer : Vijay Chaurasiya
 * Project   : Allahabad High Court eFiling Application
 * Module    : Advocate Login Screen
 * Features  : CAPTCHA, OTP Generation, OTP Verification,
 *             Password Validation and Dashboard Navigation
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

interface LoginScreenProps {
  navigation: any;
}

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

const LoginScreen: React.FC<LoginScreenProps> = ({
  navigation,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const otpInputRef = useRef<TextInput>(null);

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

  const scrollToOtp = useCallback(() => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    });
  }, []);

  const generateCaptcha = useCallback(() => {
    setCaptchaFirst(Math.floor(Math.random() * 9) + 1);
    setCaptchaSecond(Math.floor(Math.random() * 9) + 1);
    setCaptchaAnswer('');
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleUsernameChange = (value: string) => {
    setUsername(value);

    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
  };

  useEffect(() => {
    if (otpSent) {
      scrollToOtp();
    }
  }, [otpSent, scrollToOtp]);

  useEffect(() => {
    const keyboardEvent =
      Platform.OS === 'ios'
        ? 'keyboardWillShow'
        : 'keyboardDidShow';

    const subscription = Keyboard.addListener(
      keyboardEvent,
      () => {
        if (otpSent) {
          setTimeout(scrollToOtp, 150);
        }
      },
    );

    return () => subscription.remove();
  }, [otpSent, scrollToOtp]);

  const handleGenerateOtp = async () => {
    if (loadingOtp) return;

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      Alert.alert('Validation', 'Please enter your username.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Validation', 'Please enter your password.');
      return;
    }

    if (!captchaAnswer.trim()) {
      Alert.alert('Validation', 'Please enter the CAPTCHA answer.');
      return;
    }

    if (
      Number(captchaAnswer) !==
      captchaFirst + captchaSecond
    ) {
      Alert.alert(
        'Invalid CAPTCHA',
        'Please enter the correct CAPTCHA answer.',
      );

      generateCaptcha();
      return;
    }

    try {
      setLoadingOtp(true);
      Keyboard.dismiss();

      const result = await generateOtp(trimmedUsername);

      if (isApiSuccess(result)) {
        setOtpSent(true);
        setOtpVerified(false);
        setOtp('');

        Alert.alert(
          'OTP Sent',
          getResponseMessage(
            result,
            'OTP has been sent successfully.',
          ),
          [
            {
              text: 'OK',
              onPress: () => {
                scrollToOtp();

                setTimeout(() => {
                  otpInputRef.current?.focus();
                }, 350);
              },
            },
          ],
        );
      } else {
        Alert.alert(
          'OTP Failed',
          getResponseMessage(
            result,
            'Unable to generate OTP. Please try again.',
          ),
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        getApiErrorMessage(error),
      );
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleOtpChange = (value: string) => {
    const numericValue = value
      .replace(/[^0-9]/g, '')
      .slice(0, 4);

    setOtp(numericValue);
    setOtpVerified(false);
  };

  const handleVerifyOtp = async () => {
    if (loadingVerify) return;

    if (!otpSent) {
      Alert.alert('Validation', 'Please generate OTP first.');
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

      const result = await validateOtp(
        username.trim(),
        otp,
      );

      if (isApiSuccess(result)) {
        setOtpVerified(true);

        Alert.alert(
          'OTP Verified',
          getResponseMessage(
            result,
            'Your OTP has been verified successfully.',
          ),
        );
      } else {
        setOtpVerified(false);

        Alert.alert(
          'Verification Failed',
          getResponseMessage(
            result,
            'Invalid OTP. Please try again.',
          ),
        );
      }
    } catch (error: any) {
      setOtpVerified(false);

      Alert.alert(
        'Error',
        getApiErrorMessage(error),
      );
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleLogin = async () => {
    if (loadingLogin) return;

    if (!otpVerified) {
      Alert.alert(
        'Verification Required',
        'Please verify your OTP before login.',
      );
      return;
    }

    if (!username.trim()) {
      Alert.alert('Validation', 'Please enter your username.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Validation', 'Please enter your password.');
      return;
    }

    try {
      setLoadingLogin(true);
      Keyboard.dismiss();

      const result = await loginWithPassword(
        username.trim(),
        password,
      );

      if (isApiSuccess(result)) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'AdvocateDashboard',
            },
          ],
        });
      } else {
        Alert.alert(
          'Login Failed',
          getResponseMessage(
            result,
            'Invalid username or password.',
          ),
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Login Error',
        getApiErrorMessage(error),
      );
    } finally {
      setLoadingLogin(false);
    }
  };

  const otpBoxes = [0, 1, 2, 3];

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <StatusBar
        backgroundColor={COLORS.navyDark}
        barStyle="light-content"
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}

          <View style={styles.hero}>
            <View style={styles.emblem}>
              <Text style={styles.emblemText}>⚖</Text>
            </View>

            <Text style={styles.courtTitle}>
              HIGH COURT
            </Text>

            <Text style={styles.courtSubtitle}>
              AT ALLAHABAD
            </Text>

            <View style={styles.heroDivider} />

            <Text style={styles.heroDescription}>
              Advocate eFiling Portal
            </Text>

            <View style={styles.securePill}>
              <Text style={styles.securePillText}>
                SECURE DIGITAL ACCESS
              </Text>
            </View>
          </View>

          {/* LOGIN CARD */}

          <View style={styles.card}>
            <View style={styles.cardHeadingRow}>
              <View>
                <Text style={styles.heading}>
                  Welcome Back
                </Text>

                <Text style={styles.subHeading}>
                  Sign in to your advocate account
                </Text>
              </View>

              <View style={styles.lockBadge}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
            </View>

            {/* USERNAME */}

            <Text style={styles.inputLabel}>
              Username / Enrollment Number
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>👤</Text>

              <TextInput
                style={styles.textInput}
                placeholder="Enter your username"
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

            <Text style={styles.inputLabel}>
              Password
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔑</Text>

              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loadingLogin}
                returnKeyType="done"
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Text style={styles.passwordToggleText}>
                  {showPassword ? 'HIDE' : 'SHOW'}
                </Text>
              </Pressable>
            </View>

            {/* CAPTCHA */}

            <View style={styles.captchaHeading}>
              <Text style={styles.inputLabel}>
                Security Verification
              </Text>

              <Text style={styles.captchaHint}>
                Solve the calculation
              </Text>
            </View>

            <View style={styles.captchaRow}>
              <View style={styles.captchaQuestion}>
                <Text style={styles.captchaQuestionText}>
                  {captchaFirst} + {captchaSecond} = ?
                </Text>
              </View>

              <TextInput
                style={styles.captchaInput}
                placeholder="Answer"
                placeholderTextColor={COLORS.muted}
                keyboardType="number-pad"
                value={captchaAnswer}
                onChangeText={setCaptchaAnswer}
                maxLength={2}
              />

              <Pressable
                style={styles.refreshButton}
                onPress={generateCaptcha}
              >
                <Text style={styles.refreshIcon}>↻</Text>
              </Pressable>
            </View>

            {/* GENERATE OTP */}

            <Pressable
              style={[
                styles.primaryButton,
                loadingOtp && styles.disabledButton,
              ]}
              onPress={handleGenerateOtp}
              disabled={loadingOtp}
            >
              {loadingOtp ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.primaryButtonText}>
                    GENERATE OTP
                  </Text>

                  <Text style={styles.buttonArrow}>→</Text>
                </View>
              )}
            </Pressable>

            <Text style={styles.bottomHint}>
              OTP verification is required before login.
            </Text>

            {/* OTP SECTION */}

            {otpSent && (
              <View style={styles.otpSection}>
                <View style={styles.sectionDivider} />

                <View style={styles.otpHeading}>
                  <View style={styles.otpIconContainer}>
                    <Text style={styles.otpIcon}>✉</Text>
                  </View>

                  <View style={styles.otpHeadingText}>
                    <Text style={styles.otpTitle}>
                      OTP Verification
                    </Text>

                    <Text style={styles.otpSubtitle}>
                      Enter the 4-digit OTP sent to your registered mobile.
                    </Text>
                  </View>
                </View>

                {/* OTP INPUT BOXES */}

                <Pressable
                  style={styles.otpInputWrapper}
                  onPress={() => otpInputRef.current?.focus()}
                >
                  <View style={styles.otpBoxesContainer}>
                    {otpBoxes.map((item) => (
                      <View
                        key={item}
                        style={[
                          styles.otpBox,
                          otp.length === item && !otpVerified
                            ? styles.otpBoxActive
                            : null,
                          otpVerified
                            ? styles.otpBoxVerified
                            : null,
                        ]}
                      >
                        <Text style={styles.otpDigit}>
                          {otp[item] || ''}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <TextInput
                    ref={otpInputRef}
                    style={styles.hiddenOtpInput}
                    value={otp}
                    onChangeText={handleOtpChange}
                    keyboardType="number-pad"
                    maxLength={4}
                    textContentType="oneTimeCode"
                    autoComplete="sms-otp"
                    editable={!otpVerified}
                  />
                </Pressable>

                {/* VERIFY OTP BUTTON */}

                {!otpVerified && (
                  <>
                    <View style={styles.actionButtonWrapper}>
                      <Pressable
                        style={[
                          styles.verifyButton,
                          loadingVerify && styles.disabledButton,
                        ]}
                        onPress={handleVerifyOtp}
                        disabled={loadingVerify}
                      >
                        {loadingVerify ? (
                          <ActivityIndicator color={COLORS.white} />
                        ) : (
                          <View style={styles.buttonContent}>
                            <Text style={styles.primaryButtonText}>
                              VERIFY OTP
                            </Text>

                            <Text style={styles.buttonArrow}>
                              →
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    </View>

                    <Pressable
                      style={styles.resendButton}
                      onPress={handleGenerateOtp}
                      disabled={loadingOtp}
                    >
                      <Text style={styles.resendText}>
                        Didn't receive OTP? Resend OTP
                      </Text>
                    </Pressable>
                  </>
                )}

                {/* OTP VERIFIED */}

                {otpVerified && (
                  <>
                    <View style={styles.verifiedMessage}>
                      <Text style={styles.verifiedIcon}>✓</Text>

                      <Text style={styles.verifiedText}>
                        OTP Verified Successfully
                      </Text>
                    </View>

                    {/* LOGIN BUTTON */}

                    <View style={styles.actionButtonWrapper}>
                      <Pressable
                        style={[
                          styles.loginButton,
                          loadingLogin && styles.disabledButton,
                        ]}
                        onPress={handleLogin}
                        disabled={loadingLogin}
                      >
                        {loadingLogin ? (
                          <ActivityIndicator color={COLORS.white} />
                        ) : (
                          <View style={styles.buttonContent}>
                            <Text style={styles.primaryButtonText}>
                              LOGIN
                            </Text>

                            <Text style={styles.buttonArrow}>
                              →
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    </View>

                    <Text style={styles.loginHint}>
                      Your account is verified. You can now login securely.
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>

          {/* FOOTER */}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Allahabad High Court
            </Text>

            <Text style={styles.footerSubText}>
              Official Advocate eFiling Application
            </Text>

            <Text style={styles.versionText}>
              Version 1.0.0
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

/* ============================================================
   STYLES
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

  /* HEADER */

  hero: {
    backgroundColor: COLORS.navy,
    marginHorizontal: -20,
    paddingTop: 28,
    paddingBottom: 38,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  emblem: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emblemText: {
    color: '#F4D58D',
    fontSize: 34,
  },

  courtTitle: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: 2.5,
  },

  courtSubtitle: {
    color: '#D4DFEF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 3,
    marginTop: 4,
  },

  heroDivider: {
    width: 48,
    height: 2,
    backgroundColor: COLORS.teal,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 2,
  },

  heroDescription: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  securePill: {
    marginTop: 15,
    backgroundColor: 'rgba(32,184,166,0.16)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(32,184,166,0.35)',
  },

  securePillText: {
    color: '#8CE5D9',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  /* LOGIN CARD */

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginTop: -14,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 25,
    elevation: 5,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  cardHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  heading: {
    color: COLORS.charcoal,
    fontSize: 23,
    fontWeight: '800',
  },

  subHeading: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },

  lockBadge: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  lockIcon: {
    fontSize: 19,
  },

  /* INPUTS */

  inputLabel: {
    color: COLORS.charcoal,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 9,
  },

  inputContainer: {
    width: '100%',
    height: 54,
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 19,
  },

  inputIcon: {
    fontSize: 17,
    marginRight: 11,
  },

  textInput: {
    flex: 1,
    height: '100%',
    color: COLORS.charcoal,
    fontSize: 14,
    paddingVertical: 0,
  },

  passwordToggle: {
    paddingVertical: 10,
    paddingLeft: 8,
  },

  passwordToggleText: {
    color: COLORS.tealDark,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* CAPTCHA */

  captchaHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  captchaHint: {
    color: COLORS.muted,
    fontSize: 10,
    marginBottom: 9,
  },

  captchaRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 20,
  },

  captchaQuestion: {
    flex: 1,
    height: 48,
    backgroundColor: '#EEF2F8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  captchaQuestionText: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1,
  },

  captchaInput: {
    width: 88,
    height: 48,
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    textAlign: 'center',
    color: COLORS.charcoal,
    fontSize: 14,
    fontWeight: '700',
    padding: 0,
  },

  refreshButton: {
    width: 43,
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  refreshIcon: {
    color: COLORS.tealDark,
    fontSize: 27,
    fontWeight: '700',
  },

  /* BUTTONS */

  primaryButton: {
    width: '100%',
    alignSelf: 'stretch',
    height: 55,
    borderRadius: 11,
    backgroundColor: COLORS.navy,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },

  buttonContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  buttonArrow: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '600',
    marginLeft: 12,
    position: 'absolute',
    right: 18,
  },

  disabledButton: {
    opacity: 0.65,
  },

  bottomHint: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 13,
  },

  /* OTP SECTION */

  otpSection: {
    width: '100%',
    alignSelf: 'stretch',
    marginTop: 12,
    alignItems: 'center',
  },

  sectionDivider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 22,
  },

  otpHeading: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  otpIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: COLORS.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  otpIcon: {
    color: COLORS.tealDark,
    fontSize: 22,
  },

  otpHeadingText: {
    flex: 1,
  },

  otpTitle: {
    color: COLORS.charcoal,
    fontSize: 16,
    fontWeight: '800',
  },

  otpSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },

  /* OTP INPUT */

  otpInputWrapper: {
    width: '100%',
    alignSelf: 'stretch',
    marginTop: 18,
    marginBottom: 8,
    position: 'relative',
  },

  otpBoxesContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  otpBox: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.input,
    justifyContent: 'center',
    alignItems: 'center',
  },

  otpBoxActive: {
    borderColor: COLORS.tealDark,
    backgroundColor: COLORS.tealLight,
  },

  otpBoxVerified: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.greenLight,
  },

  otpDigit: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },

  hiddenOtpInput: {
    position: 'absolute',
    width: '100%',
    height: 56,
    opacity: 0,
    color: 'transparent',
  },

  /* VERIFY AND LOGIN BUTTON WRAPPER */

  actionButtonWrapper: {
    width: '100%',
    alignSelf: 'stretch',
    marginTop: 18,
  },

  verifyButton: {
    width: '100%',
    alignSelf: 'stretch',
    height: 56,
    borderRadius: 11,
    backgroundColor: COLORS.tealDark,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },

  loginButton: {
    width: '100%',
    alignSelf: 'stretch',
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.tealDark,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.tealDark,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  /* RESEND OTP */

  resendButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginTop: 5,
  },

  resendText: {
    color: COLORS.tealDark,
    fontSize: 12,
    fontWeight: '700',
  },

  /* VERIFIED MESSAGE */

  verifiedMessage: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.greenLight,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginTop: 17,
  },

  verifiedIcon: {
    color: COLORS.green,
    fontSize: 17,
    fontWeight: '900',
    marginRight: 8,
  },

  verifiedText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: '800',
  },

  loginHint: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 13,
    lineHeight: 17,
  },

  /* FOOTER */

  footer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 12,
  },

  footerText: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  footerSubText: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },

  versionText: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 8,
  },
});
