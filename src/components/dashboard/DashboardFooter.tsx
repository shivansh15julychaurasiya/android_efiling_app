import React from 'react';
import { Text, View } from 'react-native';
import styles from '../../styles/dashboardStyles';

const DashboardFooter: React.FC = () => (
  <View style={styles.footer}>
    <View style={styles.footerLine} />
    <Text style={styles.footerTitle}>e-Filing Portal</Text>
    <Text style={styles.footerText}>High Court of Judicature at Allahabad</Text>
    <Text style={styles.footerSmall}>Secure Digital Court Services</Text>
  </View>
);

export default DashboardFooter;
