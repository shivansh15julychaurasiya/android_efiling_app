
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
  StyleSheet,
  Text,
  TextInput,
  View,
  StatusBar,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  generateOtp,
  validateOtp,
} from '../api/authApi';

import { getApiErrorMessage } from '../utils/errorHandler';

type LoginScreenProps = {
  navigation: any;
};

const COLORS = {
  bhagwa: '#C65D12',
  bhagwaDark: '#963F0B',
  bhagwaDeep: '#713008',
  saffron: '#E88728',
  saffronLight: '#FFF0DE',

  ivory: '#FFF9F0',
  ivoryDark: '#F8EFE2',

  white: '#FFFFFF',
  charcoal: '#252525',
  charcoalLight: '#414141',

  muted: '#77716B',
  border: '#E8D9C8',
  input: '#FFFCF7',

  green: '#247B5A',
  greenLight: '#EAF5EF',
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [captchaFirst, setCaptchaFirst] = useState(0);
  const [captchaSecond, setCaptchaSecond] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const otpInputRef = useRef<TextInput>(null);

  const scrollToOtp = useCallback(() => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    });
  }, []);

  // CAPTCHA
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

  // Scroll when OTP section appears
  useEffect(() => {
    if (!otpSent) return;

    const timer = setTimeout(scrollToOtp, 300);

    return () => clearTimeout(timer);
  }, [otpSent, scrollToOtp]);

  // Keyboard handling
  useEffect(() => {
    const keyboardShowEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';

    const keyboardHideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(
      keyboardShowEvent,
      () => {
        if (otpSent) {
          setTimeout(scrollToOtp, 150);
        }
      },
    );

    const hideSubscription = Keyboard.addListener(
      keyboardHideEvent,
      () => {},
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [otpSent, scrollToOtp]);

  // GENERATE OTP
  const handleGenerateOtp = async () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      Alert.alert(
        'Username Required',
        'Please enter your username or roll number.',
      );
      return;
    }

    if (!password.trim()) {
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
        'The CAPTCHA answer is incorrect.',
      );
      generateCaptcha();
      return;
    }

    if (loadingOtp) return;

    try {
      setLoadingOtp(true);

      console.log('[OTP] Calling Generate OTP API');

      const response = await generateOtp(trimmedUsername);

      console.log('[OTP] Generate OTP response:', response);

      const success =
        String(response?.response ?? '').toUpperCase() === 'TRUE';

      if (success) {
        setOtpSent(true);
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

      const message =
        typeof response?.data === 'string'
          ? response.data
          : response?.message ||
            'The server did not confirm OTP generation. Please try again.';

      Alert.alert('OTP Request Failed', message);
    } catch (error) {
      console.log('[OTP] Generate OTP error:', error);

      Alert.alert('Connection Error', getApiErrorMessage(error));
    } finally {
      setLoadingOtp(false);
    }
  };

  // OTP CHANGE
  const handleOtpChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    setOtp(numericValue);
  };

  // VERIFY OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 4) {
      Alert.alert('Invalid OTP', 'Please enter the 4-digit OTP.');
      return;
    }

    if (loadingVerify) return;

    try {
      setLoadingVerify(true);
      Keyboard.dismiss();

      const response = await validateOtp(username.trim(), otp);

      console.log('Validate OTP Response:', response);

      if (
        String(response?.response ?? '').toUpperCase() === 'TRUE'
      ) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdvocateDashboard' }],
        });

        return;
      }

      const message =
        typeof response?.data === 'string'
          ? response.data
          : response?.message || 'Invalid OTP. Please try again.';

      Alert.alert('OTP Verification Failed', message);
    } catch (error) {
      console.log('Validate OTP Error:', error);

      Alert.alert('Connection Error', getApiErrorMessage(error));
    } finally {
      setLoadingVerify(false);
    }
  };

  const otpBoxes = Array.from({ length: 4 });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={COLORS.bhagwaDark}
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

            <Text style={styles.heroCaption}>
              E-FILING SYSTEM
            </Text>

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
                <Text style={styles.cardEyebrow}>
                  ADVOCATE PORTAL
                </Text>

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

            <View style={styles.sectionLabelRow}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionLabel}>
                LOGIN CREDENTIALS
              </Text>
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
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loadingOtp}
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
                editable={!loadingOtp}
                returnKeyType="next"
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeText}>
                  {showPassword ? 'HIDE' : 'SHOW'}
                </Text>
              </Pressable>
            </View>

            {/* SECURITY VERIFICATION */}

            <View style={styles.sectionLabelRow}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionLabel}>
                SECURITY VERIFICATION
              </Text>
            </View>

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
                disabled={loadingOtp}
              >
                <Text style={styles.refreshText}>↻</Text>
              </Pressable>

              <TextInput
                style={styles.captchaInput}
                placeholder="Answer"
                placeholderTextColor={COLORS.muted}
                keyboardType="number-pad"
                value={captchaAnswer}
                onChangeText={(value) =>
                  setCaptchaAnswer(
                    value.replace(/[^0-9]/g, '').slice(0, 2),
                  )
                }
                editable={!loadingOtp}
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
              disabled={loadingOtp}
            >
              {loadingOtp ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.white}
                />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    GENERATE OTP
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

                {/* OTP INPUT */}

                <Pressable
                  style={styles.otpInputWrapper}
                  onPress={() => {
                    scrollToOtp();
                    otpInputRef.current?.focus();
                  }}
                >
                  <View style={styles.otpRow}>
                    {otpBoxes.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.otpBox,
                          otp.length === index && styles.activeOtpBox,
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

                {/* VERIFY BUTTON */}

                <Pressable
                  style={[
                    styles.verifyButton,
                    (otp.length !== 4 || loadingVerify) &&
                      styles.disabledButton,
                  ]}
                  onPress={handleVerifyOtp}
                  disabled={otp.length !== 4 || loadingVerify}
                >
                  {loadingVerify ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.white}
                    />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>
                        VERIFY & LOGIN
                      </Text>

                      <Text style={styles.buttonArrow}>→</Text>
                    </>
                  )}
                </Pressable>

                {/* RESEND */}

                <Pressable
                  style={styles.resendButton}
                  onPress={handleGenerateOtp}
                  disabled={loadingOtp}
                >
                  <Text style={styles.resendText}>
                    Didn't receive OTP?{' '}
                    <Text style={styles.resendHighlight}>
                      Resend OTP
                    </Text>
                  </Text>
                </Pressable>

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

            <View style={styles.footerBottom}>
              <Text style={styles.footerSubText}>
                © Allahabad High Court
              </Text>

              <Text style={styles.footerSubText}>
                SECURE ACCESS
              </Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ==================================================
// BHAGWA + IVORY + CHARCOAL THEME
// ==================================================

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bhagwaDark,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.ivory,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 24,
  },

  // HERO

  hero: {
    backgroundColor: COLORS.bhagwa,
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
    backgroundColor: COLORS.bhagwaDeep,
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
    borderColor: COLORS.ivory,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  emblemInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.ivory,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emblem: {
    fontSize: 37,
    color: COLORS.bhagwaDark,
  },

  courtName: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.1,
    textAlign: 'center',
  },

  courtLocation: {
    color: '#FFF0D9',
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
    backgroundColor: COLORS.ivory,
    opacity: 0.8,
  },

  heroDividerDiamond: {
    width: 7,
    height: 7,
    backgroundColor: COLORS.ivory,
    transform: [{ rotate: '45deg' }],
  },

  heroCaption: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginTop: 12,
  },

  dashboardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ivory,
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
    backgroundColor: COLORS.bhagwa,
  },

  dashboardPillText: {
    color: COLORS.bhagwaDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  // LOGIN CARD

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginTop: -12,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    elevation: 5,
    shadowColor: '#51351E',
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

  cardEyebrow: {
    color: COLORS.bhagwa,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginBottom: 5,
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

  // SECTION HEADINGS

  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
    marginBottom: 5,
  },

  sectionLine: {
    width: 4,
    height: 14,
    backgroundColor: COLORS.bhagwa,
    borderRadius: 3,
    marginRight: 8,
  },

  sectionLabel: {
    fontSize: 10,
    color: COLORS.charcoal,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  // LABELS

  label: {
    color: COLORS.charcoal,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 7,
  },

  // INPUTS

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
    color: COLORS.bhagwa,
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
    color: COLORS.bhagwaDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // CAPTCHA

  captchaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  captchaBox: {
    flex: 1,
    height: 62,
    borderRadius: 11,
    backgroundColor: COLORS.saffronLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAC7A3',
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
    color: COLORS.bhagwa,
  },

  refreshButton: {
    width: 47,
    height: 62,
    borderRadius: 11,
    backgroundColor: COLORS.bhagwa,
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

  // BUTTONS

  primaryButton: {
    height: 54,
    borderRadius: 11,
    marginTop: 23,
    backgroundColor: COLORS.bhagwa,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.bhagwaDark,
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
    backgroundColor: COLORS.bhagwa,
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
  },

  // OTP

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
    backgroundColor: COLORS.saffronLight,
    borderWidth: 1,
    borderColor: '#EAC7A3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  otpIcon: {
    color: COLORS.bhagwaDark,
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
    borderColor: COLORS.bhagwa,
    borderWidth: 2,
    backgroundColor: COLORS.saffronLight,
  },

  filledOtpBox: {
    backgroundColor: '#FFF0DE',
    borderColor: COLORS.bhagwa,
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

  // RESEND

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
    color: COLORS.bhagwa,
    fontWeight: '900',
  },

  // FOOTER

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

  footerBottom: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  footerSubText: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
  },

});

export default LoginScreen;
