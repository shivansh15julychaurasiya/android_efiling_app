import React from 'react';
import { Text, View } from 'react-native';
import styles from '../../styles/dashboardStyles';

type Props = {
  eFiledCases: string | number;
  applications: string | number;
  caseFiled: string | number;
};

const DashboardStats: React.FC<Props> = ({ eFiledCases, applications, caseFiled }) => (
  <View style={styles.statsContainer}>
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: '#E8F0FF' }]}>
        <Text style={styles.statIconText}>▣</Text>
      </View>
      <Text style={styles.statValue}>{eFiledCases || '0'}</Text>
      <Text style={styles.statLabel}>E-filed Cases</Text>
    </View>

    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: '#FFF5DA' }]}>
        <Text style={styles.statIconText}>✎</Text>
      </View>
      <Text style={styles.statValue}>{applications || '0'}</Text>
      <Text style={styles.statLabel}>Applications</Text>
    </View>

    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: '#E8F7EE' }]}>
        <Text style={styles.statIconText}>⚖</Text>
      </View>
      <Text style={styles.statValue}>{caseFiled || '0'}</Text>
      <Text style={styles.statLabel}>Case Filed</Text>
    </View>
  </View>
);

export default DashboardStats;
