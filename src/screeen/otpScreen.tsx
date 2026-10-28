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
  gold: '#D4AF37',
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

  /*
   * OTP resend timer
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(current => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  /*
   * Verify OTP
   */
  const handleVerify = async () => {
    if (otp.length !== 4) {
      Alert.alert(
        'Invalid OTP',
        'Please enter the 4-digit OTP.',
      );

      return;
    }

    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const response = await validateOtp(
        username,
        otp,
      );

      console.log(
        'Validate OTP Response:',
        response,
      );

      if (
        response?.response?.toUpperCase() ===
        'TRUE'
      ) {
        /*
         * Save authentication locally
         */
        await saveAuthentication(username);

        /*
         * OTP verified successfully.
         *
         * Reset navigation stack and open
         * Advocate Dashboard.
         *
         * Login and OTP will no longer be
         * present in the navigation stack.
         */
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
            'Incorrect OTP. Please try again.';

      Alert.alert(
        'Verification Failed',
        message,
      );
    } catch (error) {
      console.log(
        'Validate OTP Error:',
        error,
      );

      Alert.alert(
        'Verification Error',
        getApiErrorMessage(error),
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Resend OTP
   */
  const handleResend = async () => {
    if (seconds > 0 || resending) {
      return;
    }

    try {
      setResending(true);

      const response = await generateOtp(
        username,
      );

      console.log(
        'Resend OTP Response:',
        response,
      );

      if (
        response?.response?.toUpperCase() ===
        'TRUE'
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
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() =>
                navigation.goBack()
              }
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

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.otpIcon}>
              <Text style={styles.otpIconText}>
                ✉
              </Text>
            </View>

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

            {/* Hidden real input */}
            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={value => {
                const numeric =
                  value
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

            {/* OTP Boxes */}
            <View style={styles.otpBoxes}>
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <Pressable
                  key={index}
                  onPress={() =>
                    inputRef.current?.focus()
                  }
                  style={[
                    styles.otpBox,
                    otp[index] &&
                      styles.otpBoxFilled,
                  ]}
                >
                  <Text
                    style={styles.otpDigit}
                  >
                    {otp[index] || ''}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Verify Button */}
            <Pressable
              onPress={handleVerify}
              disabled={
                loading ||
                otp.length !== 4
              }
              style={[
                styles.verifyButton,
                (loading ||
                  otp.length !== 4) &&
                  styles.disabledButton,
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  color={COLORS.white}
                />
              ) : (
                <Text
                  style={styles.verifyText}
                >
                  Verify & Continue
                </Text>
              )}
            </Pressable>

            {/* Resend */}
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
                  <Text
                    style={
                      styles.resendButton
                    }
                  >
                    {resending
                      ? 'Sending...'
                      : 'Resend OTP'}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Change Username */}
            <Pressable
              onPress={() =>
                navigation.navigate('Login')
              }
              style={styles.changeUser}
            >
              <Text
                style={
                  styles.changeUserText
                }
              >
                ← Change username
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Your OTP is confidential. Do not
            share it with anyone.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

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
    borderColor:
      'rgba(255,255,255,0.25)',
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

  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: -35,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',

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
    marginBottom: 15,
  },

  otpIconText: {
    fontSize: 25,
  },

  title: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '800',
  },

  description: {
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 13,
    marginTop: 10,
  },

  username: {
    color: COLORS.navy,
    fontWeight: '800',
    fontSize: 14,
    marginTop: 5,
  },

  otpInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },

  otpBoxes: {
    flexDirection: 'row',
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

  verifyButton: {
    height: 54,
    width: '100%',
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.45,
  },

  verifyText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },

  resendRow: {
    flexDirection: 'row',
    marginTop: 22,
    alignItems: 'center',
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

  changeUser: {
    marginTop: 20,
  },

  changeUserText: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '700',
  },

  footer: {
    color: COLORS.muted,
    textAlign: 'center',
    fontSize: 11,
    marginTop: 25,
    paddingHorizontal: 30,
  },
});

export default OtpScreen;