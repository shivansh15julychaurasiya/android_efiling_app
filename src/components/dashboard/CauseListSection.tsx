
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

/*
 * ============================================================
 * Developed By : Vijay Chaurasiya
 * Module       : Today's Cause List
 * Application  : Allahabad High Court eFiling App
 * Description  : Displays listed cases with Last Order and
 *                Case Status actions.
 * ============================================================
 */

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

  // Keep the cause list independently scrollable on phones.
  const causeListHeight = Math.min(height * 0.45, 400);

  return (
    <View style={styles.sectionCardFullWidth}>
      <Text style={styles.sectionTitle}>
        Your Today's Listed Cases
      </Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="small"
            color="#D4AF37"
          />
          <Text style={styles.loaderText}>
            Loading today's cause list...
          </Text>
        </View>
      ) : causeList.length > 0 ? (
        <ScrollView
          style={{ height: causeListHeight }}
          nestedScrollEnabled
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {causeList.map((row, index) => (
            <Pressable
              key={`${String(
                row.cause_reg_no ?? row.case_no ?? 'case',
              )}-${index}`}
              style={({ pressed }) => [
                styles.causeItem,
                {
                  borderColor: pressed ? '#D4AF37' : '#DCE5F0',
                  opacity: pressed ? 0.94 : 1,
                },
              ]}
              onPress={() =>
                console.log('Selected Cause List:', row)
              }
            >
              <View
                style={[
                  styles.causeNumber,
                  {
                    backgroundColor: '#102D50',
                    borderColor: '#D4AF37',
                    borderWidth: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.causeNumberText,
                    { color: '#F2D68A' },
                  ]}
                >
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
                    flexWrap: 'wrap',
                    marginTop: 10,
                    gap: 10,
                  }}
                >
                  {/* Last Order Button */}
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      void openLastOrder(row.lastOrder);
                    }}
                    disabled={!row.lastOrder}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: !row.lastOrder
                        ? '#F0F2F5'
                        : '#EEF3FA',
                      borderWidth: 1,
                      borderColor: '#C9D8E9',
                      paddingHorizontal: 13,
                      paddingVertical: 8,
                      borderRadius: 20,
                      opacity: !row.lastOrder
                        ? 0.45
                        : pressed
                          ? 0.7
                          : 1,
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#102D50',
                        fontWeight: '800',
                      }}
                    >
                      📄 Last Order
                    </Text>
                  </Pressable>

                  {/* Case Status Button */}
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
                      backgroundColor: '#EAF6F1',
                      borderWidth: 1,
                      borderColor: '#B9DFCE',
                      paddingHorizontal: 13,
                      paddingVertical: 8,
                      borderRadius: 20,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#16845A',
                        fontWeight: '800',
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
