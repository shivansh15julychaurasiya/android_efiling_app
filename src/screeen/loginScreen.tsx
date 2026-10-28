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

const LoginScreen: React.FC<LoginScreenProps> = ({
  navigation,
}) => {
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

  // --------------------------------------------------
  // CAPTCHA
  // --------------------------------------------------

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

  // --------------------------------------------------
  // SCROLL OTP SECTION WHEN IT APPEARS
  // --------------------------------------------------

  useEffect(() => {
    if (!otpSent) {
      return;
    }

    const timer = setTimeout(() => {
      scrollToOtp();
    }, 300);

    return () => clearTimeout(timer);
  }, [otpSent, scrollToOtp]);

  // --------------------------------------------------
  // KEEP OTP INPUT VISIBLE WHEN KEYBOARD OPENS
  // --------------------------------------------------

  useEffect(() => {
    const keyboardShowEvent =
      Platform.OS === 'ios'
        ? 'keyboardWillShow'
        : 'keyboardDidShow';

    const keyboardHideEvent =
      Platform.OS === 'ios'
        ? 'keyboardWillHide'
        : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(
      keyboardShowEvent,
      () => {
        if (otpSent) {
          setTimeout(() => {
            scrollToOtp();
          }, 150);
        }
      },
    );

    const hideSubscription = Keyboard.addListener(
      keyboardHideEvent,
      () => {
        // The ScrollView remains scrollable when the keyboard closes.
      },
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [otpSent, scrollToOtp]);

  // --------------------------------------------------
  // GENERATE OTP
  // --------------------------------------------------

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

    if (loadingOtp) {
      return;
    }

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

      Alert.alert(
        'Connection Error',
        getApiErrorMessage(error),
      );
    } finally {
      setLoadingOtp(false);
    }
  };

  // --------------------------------------------------
  // OTP CHANGE
  // --------------------------------------------------

  const handleOtpChange = (value: string) => {
    const numericValue = value
      .replace(/[^0-9]/g, '')
      .slice(0, 4);

    setOtp(numericValue);
  };

  // --------------------------------------------------
  // VERIFY OTP
  // --------------------------------------------------

  const handleVerifyOtp = async () => {
    if (otp.length !== 4) {
      Alert.alert(
        'Invalid OTP',
        'Please enter the 4-digit OTP.',
      );
      return;
    }

    if (loadingVerify) {
      return;
    }

    try {
      setLoadingVerify(true);
      Keyboard.dismiss();

      const response = await validateOtp(
        username.trim(),
        otp,
      );

      console.log('Validate OTP Response:', response);

      if (
        String(response?.response ?? '').toUpperCase() === 'TRUE'
      ) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'AdvocateDashboard',
            },
          ],
        });

        return;
      }

      const message =
        typeof response?.data === 'string'
          ? response.data
          : response?.message ||
          'Invalid OTP. Please try again.';

      Alert.alert('OTP Verification Failed', message);
    } catch (error) {
      console.log('Validate OTP Error:', error);

      Alert.alert(
        'Connection Error',
        getApiErrorMessage(error),
      );
    } finally {
      setLoadingVerify(false);
    }
  };

  // --------------------------------------------------
  // OTP BOXES
  // --------------------------------------------------

  const otpBoxes = Array.from({ length: 4 });

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
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
          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>⚖</Text>
            </View>

            <Text style={styles.title}>e-Filing Portal</Text>

            <Text style={styles.subtitle}>
              High Court of Judicature at Allahabad
            </Text>
          </View>

          {/* LOGIN CARD */}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Advocate Login</Text>

            <Text style={styles.cardSubtitle}>
              Sign in to continue to e-Filing
            </Text>

            {/* USERNAME */}

            <Text style={styles.label}>
              Username / Roll Number
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>👤</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter username or roll number"
                placeholderTextColor="#9AA3B2"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loadingOtp}
                returnKeyType="next"
              />
            </View>

            {/* PASSWORD */}

            <Text style={styles.label}>Password</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔒</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#9AA3B2"
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
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>

            {/* CAPTCHA */}

            <Text style={styles.label}>
              Security Verification
            </Text>

            <View style={styles.captchaRow}>
              <View style={styles.captchaBox}>
                <Text style={styles.captchaText}>
                  {captchaFirst} + {captchaSecond} = ?
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
                placeholderTextColor="#9AA3B2"
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
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.primaryButtonText}>
                  GENERATE OTP
                </Text>
              )}
            </Pressable>

            {/* OTP SECTION */}

            {otpSent && (
              <View style={styles.otpSection}>
                <View style={styles.separator} />

                <Text style={styles.otpTitle}>
                  Enter OTP
                </Text>

                <Text style={styles.otpSubtitle}>
                  Enter the 4-digit OTP sent to your
                  registered mobile number.
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
                          otp.length === index &&
                          styles.activeOtpBox,
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

                {/* VERIFY */}

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
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      VERIFY & LOGIN
                    </Text>
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

          <Text style={styles.footerText}>
            © High Court of Judicature at Allahabad
          </Text>

          <Text style={styles.footerSubText}>
            Secure e-Filing System
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#071A3D',
  },

  container: {
    flex: 1,
    backgroundColor: '#071A3D',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 35,
  },

  // HEADER

  header: {
    alignItems: 'center',
    marginBottom: 25,
  },

  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 8,
  },

  logoText: {
    fontSize: 36,
    color: '#071A3D',
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#D4AF37',
    textAlign: 'center',
    fontWeight: '600',
  },

  // CARD

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  cardTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#071A3D',
  },

  cardSubtitle: {
    marginTop: 5,
    marginBottom: 22,
    fontSize: 13,
    color: '#697386',
  },

  // LABEL

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#071A3D',
    marginBottom: 8,
    marginTop: 12,
  },

  // TEXT INPUT

  inputContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D8DEE8',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
  },

  inputIcon: {
    fontSize: 17,
    marginLeft: 14,
    marginRight: 8,
  },

  input: {
    flex: 1,
    height: '100%',
    color: '#172033',
    fontSize: 15,
    paddingHorizontal: 6,
  },

  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  eyeText: {
    color: '#B08D20',
    fontSize: 12,
    fontWeight: '800',
  },

  // CAPTCHA

  captchaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  captchaBox: {
    height: 52,
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#EEF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8DEE8',
  },

  captchaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#071A3D',
    letterSpacing: 1,
  },

  refreshButton: {
    width: 48,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#071A3D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  refreshText: {
    fontSize: 27,
    color: '#D4AF37',
    fontWeight: '700',
  },

  captchaInput: {
    width: 85,
    height: 52,
    borderWidth: 1,
    borderColor: '#D8DEE8',
    borderRadius: 12,
    backgroundColor: '#F9FAFC',
    textAlign: 'center',
    color: '#172033',
    fontSize: 15,
    fontWeight: '700',
  },

  // BUTTONS

  primaryButton: {
    height: 52,
    borderRadius: 12,
    marginTop: 22,
    backgroundColor: '#071A3D',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },

  verifyButton: {
    height: 52,
    borderRadius: 12,
    marginTop: 20,
    backgroundColor: '#071A3D',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },

  disabledButton: {
    opacity: 0.55,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // OTP

  otpSection: {
    marginTop: 5,
  },

  separator: {
    height: 1,
    backgroundColor: '#E5E9F0',
    marginTop: 24,
    marginBottom: 22,
  },

  otpTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#071A3D',
    textAlign: 'center',
  },

  otpSubtitle: {
    fontSize: 12,
    color: '#697386',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  otpInputWrapper: {
    position: 'relative',
    height: 58,
    marginTop: 20,
    justifyContent: 'center',
  },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },

  otpBox: {
    width: 55,
    height: 58,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D8DEE8',
    backgroundColor: '#F9FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeOtpBox: {
    borderColor: '#D4AF37',
    borderWidth: 2,
  },

  otpBoxText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#071A3D',
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
    marginTop: 18,
    paddingVertical: 8,
  },

  resendText: {
    fontSize: 13,
    color: '#697386',
  },

  resendHighlight: {
    color: '#B08D20',
    fontWeight: '800',
  },

  // FOOTER

  footerText: {
    textAlign: 'center',
    color: '#DCE3F0',
    fontSize: 11,
    marginTop: 24,
  },

  footerSubText: {
    textAlign: 'center',
    color: '#8FA0BD',
    fontSize: 10,
    marginTop: 4,
  },
});

export default LoginScreen;