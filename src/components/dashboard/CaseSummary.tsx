import React from 'react';
import { Text, View } from 'react-native';
import { CaseSummaryData } from '../../types/dashboard';
import styles from '../../styles/dashboardStyles';

type Props = { value: string };

const CaseSummary: React.FC<Props> = ({ value }) => {
  try {
    const data: CaseSummaryData = JSON.parse(value);
    return (
      <View style={styles.caseSummaryCard}>
        <View style={styles.caseSummaryHeader}>
          <View>
            <Text style={styles.caseSummaryTitle}>Case Filing Summary</Text>
            <Text style={styles.caseSummarySubtitle}>Your active case distribution</Text>
          </View>
          <View style={styles.caseSummaryIcon}>
            <Text style={styles.caseSummaryIconText}>⚖</Text>
          </View>
        </View>

        <View style={styles.caseSummaryDivider} />

        <View style={styles.caseSummaryRow}>
          <View style={styles.caseSummaryItem}>
            <Text style={styles.caseSummaryValue}>{data.PetAdvocateCaseCount || '0'}</Text>
            <Text style={styles.caseSummaryLabel}>As Petitioner</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.caseSummaryItem}>
            <Text style={styles.caseSummaryValue}>{data.ResAdvocateCaseCount || '0'}</Text>
            <Text style={styles.caseSummaryLabel}>As Respondent</Text>
          </View>
        </View>
      </View>
    );
  } catch {
    return null;
  }
};

export default CaseSummary;
