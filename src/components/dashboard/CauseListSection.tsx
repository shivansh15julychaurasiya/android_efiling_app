
import React from 'react';

import {
  ActivityIndicator,
  Pressable,
  Alert,
  Text,
  View,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

import { CauseListRow } from '../../types/dashboard';
import styles from '../../styles/dashboardStyles';

type Props = {
  causeList: CauseListRow[];
  loading: boolean;

  openLastOrder: (
    lastOrder: string | number | null | undefined,
  ) => Promise<void>;

  openStatus: (row: CauseListRow) => void | Promise<void>;
};

const CauseListSection: React.FC<Props> = ({
  causeList,
  loading,
  openLastOrder,
  openStatus,
}) => {
  const { height } = useWindowDimensions();

  // Limit the cause-list height on phones.
  const causeListHeight = Math.min(height * 0.45, 400);

  return (
    <View style={styles.sectionCardFullWidth}>
      <Text style={styles.sectionTitle}>
        Your Today's Listed Cases
      </Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" />
          <Text style={styles.loaderText}>
            Loading today's cause list...
          </Text>
        </View>
      ) : causeList.length > 0 ? (
        <ScrollView
          style={{ height: causeListHeight }}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {causeList.map((row, index) => (
            <Pressable
              key={`${String(
                row.cause_reg_no ?? row.case_no ?? 'case',
              )}-${index}`}
              style={styles.causeItem}
              onPress={() =>
                console.log('Selected Cause List:', row)
              }
            >
              <View style={styles.causeNumber}>
                <Text style={styles.causeNumberText}>
                  {index + 1}
                </Text>
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
                  {row.listing_date
                    ? ' • ' + row.listing_date
                    : ''}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 10,
                    gap: 10,
                  }}
                >
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      void openLastOrder(row.lastOrder);
                    }}
                    disabled={!row.lastOrder}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#EEF4FF',
                      borderWidth: 1,
                      borderColor: '#D5E3FA',
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 20,
                      opacity: !row.lastOrder
                        ? 0.5
                        : pressed
                          ? 0.7
                          : 1,
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: '#e0620d',
                        fontWeight: '600',
                      }}
                    >
                      📄 Last Order
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();

                      if (
                        row.Case_ID == null ||
                        row.Case_ID === 0
                      ) {
                        Alert.alert(
                          'Case Status',
                          'Case ID is not available.',
                        );
                        return;
                      }

                      void openStatus(row);
                    }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#EAF7F0',
                      borderWidth: 1,
                      borderColor: '#CBE9D7',
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 20,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: '#15965A',
                        fontWeight: '600',
                      }}
                    >
                      ✓ Status
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyText}>
            No cases listed for today
          </Text>
        </View>
      )}
    </View>
  );
};

export default CauseListSection;
