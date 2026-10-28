import React from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';
import styles from '../../styles/dashboardStyles';

const NewCaseFilingBanner: React.FC = () => {
  const openPortal = async () => {
    const url = 'http://192.168.0.160:8080/onlinecasefiling/';
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Unable to open', 'Please check your network connection and try again.');
    }
  };

  return (
    <Pressable style={styles.newCaseFilingBanner} onPress={openPortal} accessibilityRole="link">
      <View style={styles.filingIconBox}>
        <Text style={styles.filingIcon}>📄</Text>
      </View>
      <View style={styles.filingTextContainer}>
        <Text style={styles.filingTitle}>New Case Filing</Text>
        <Text style={styles.filingSubtitle}>Tap here to access the e-Filing Portal</Text>
      </View>
      <View style={styles.filingArrowBox}>
        <Text style={styles.filingArrow}>›</Text>
      </View>
    </Pressable>
  );
};

export default NewCaseFilingBanner;
