import React from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View, Linking } from 'react-native';
import { CauseListRow } from '../../types/dashboard';
import styles from '../../styles/dashboardStyles';

type Props = {
  causeList: CauseListRow[];
  loading: boolean;
  openLastOrder: (lastOrder: string | number | null | undefined) => Promise<void>;
};

const CauseListSection: React.FC<Props> = ({ causeList, loading, openLastOrder }) => (
  <View style={styles.sectionCardFullWidth}>
    <Text style={styles.sectionTitle}>Your Today's Listed Cases</Text>

    {loading ? (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" />
        <Text style={styles.loaderText}>Loading today's cause list...</Text>
      </View>
    ) : causeList.length > 0 ? (
      causeList.map((row, index) => (
        <Pressable
          key={`${String(row.cause_reg_no ?? row.case_no ?? 'case')}-${index}`}
          style={styles.causeItem}
          onPress={() => console.log('Selected Cause List:', row)}
        >
          <View style={styles.causeNumber}>
            <Text style={styles.causeNumberText}>{index + 1}</Text>
          </View>

          <View style={styles.causeInfo}>
            <Text style={styles.caseNumber}>
              {row.Case_Type_Name || 'CASE'}
              {' / '}
              {row.cause_reg_no || row.case_no || '-'}
              {' / '}
              {row.cause_reg_year || '-'}
            </Text>

            <Text style={styles.caseCourt}>
              Court: {row.court_no || '-'}
              {'  |  '}
              Current Sr: {row.curSlno || '-'}
              {'  |  '}
              Serial No: {row.sr_no || '-'}
            </Text>

            <Text style={styles.benchName}>
              {row.Bench_Name || 'Court'}
              {row.listing_date ? ' • ' + row.listing_date : ''}
            </Text>

            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                openLastOrder(row.lastOrder);
              }}
              hitSlop={8}
              accessibilityRole="link"
            >
              <Text style={styles.lastOrderLink}>Last Order</Text>
            </Pressable>
          </View>
        </Pressable>
      ))
    ) : (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyText}>No cases listed for today</Text>
      </View>
    )}
  </View>
);

export default CauseListSection;
