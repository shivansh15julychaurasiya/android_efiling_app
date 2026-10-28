import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from '../../styles/dashboardStyles';

type Props = { onRefresh: () => void };

const DashboardHeading: React.FC<Props> = ({ onRefresh }) => (
  <View style={styles.dashboardHeading}>
    <View>
      <Text style={styles.dashboardTitle}>Your e-Filing Dashboard</Text>
      <Text style={styles.dashboardSubtitle}>Manage your cases and court services</Text>
    </View>
    <TouchableOpacity style={styles.refreshSmallButton} onPress={onRefresh} activeOpacity={0.8}>
      <Text style={styles.refreshSmallText}>↻</Text>
    </TouchableOpacity>
  </View>
);

export default DashboardHeading;
