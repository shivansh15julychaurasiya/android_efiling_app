import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCasesAsPetitioner } from '../../api/caseFilePetition';
import type { CaseFilePetition } from '../../types/caseFilePetition';

const COLORS = {
  primary: '#6D42B5',
  primaryDark: '#50308B',
  primaryLight: '#EEE6FA',
  background: '#F7F5FC',
  surface: '#FFFFFF',
  text: '#38245F',
  secondaryText: '#817397',
  border: '#E8E0F3',
  pending: '#8052C8',
  pendingBackground: '#F0E8FC',
  disposed: '#3972D6',
  disposedBackground: '#E6F0FF',
  error: '#C0392B',
  errorBackground: '#FCE8E6',
  muted: '#9B8CB0',
};

type StatusFilter = 'All' | 'Pending' | 'Disposed';

const getStatus = (status?: string | null): 'Pending' | 'Disposed' => {
  const normalized = (status || '').trim().toLowerCase();

  if (
    normalized.includes('dispos') ||
    normalized.includes('decided') ||
    normalized.includes('closed')
  ) {
    return 'Disposed';
  }

  return 'Pending';
};

const getCaseNumber = (item: CaseFilePetition): string => {
  return (
    item.DisplayCaseno ||
    String(item.CaseId || '') ||
    'Case number unavailable'
  );
};

const CaseFilePetitionComponent = () => {
  const [cases, setCases] = useState<CaseFilePetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const loadCases = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const response = await getCasesAsPetitioner();

      setCases(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error loading petitioner cases:', err);
      setError('Unable to load your cases. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const pendingCount = useMemo(
    () => cases.filter((item) => getStatus(item.CaseStatus) === 'Pending').length,
    [cases],
  );

  const disposedCount = useMemo(
    () => cases.filter((item) => getStatus(item.CaseStatus) === 'Disposed').length,
    [cases],
  );

  const filteredCases = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return cases.filter((item) => {
      const status = getStatus(item.CaseStatus);

      const matchesStatus =
        statusFilter === 'All' || status === statusFilter;

      const searchableText = [
        item.DisplayCaseno,
        item.CaseId,
        item.CINO,
        item.PetitionerName,
        item.RespondentName,
        item.CaseStatus,
      ]
        .map((value) => String(value ?? ''))
        .join(' ')
        .toLowerCase();

      return matchesStatus && (!query || searchableText.includes(query));
    });
  }, [cases, searchText, statusFilter]);

  const renderCase = ({ item, index }: { item: CaseFilePetition; index: number }) => {
    const status = getStatus(item.CaseStatus);
    const isDisposed = status === 'Disposed';

    return (
      <View style={styles.caseCard}>
        <View style={styles.caseCardTop}>
          <View style={styles.caseIcon}>
            <Text style={styles.caseIconText}>⚖</Text>
          </View>

          <View style={styles.caseHeading}>
            <Text style={styles.caseLabel}>CASE RECORD {index + 1}</Text>
            <Text style={styles.caseNumber}>
              {getCaseNumber(item)}
            </Text>
            <Text style={styles.caseId}>
              Case ID: {item.CaseId || '—'}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              isDisposed ? styles.disposedBadge : styles.pendingBadge,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isDisposed ? styles.disposedDot : styles.pendingDot,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isDisposed ? styles.disposedText : styles.pendingText,
              ]}
            >
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.partySection}>
          <View style={styles.partyIcon}>
            <Text style={styles.partyIconText}>P</Text>
          </View>
          <View style={styles.partyContent}>
            <Text style={styles.partyLabel}>PETITIONER</Text>
            <Text style={styles.partyName} selectable>
              {item.PetitionerName || 'Not available'}
            </Text>
          </View>
        </View>

        <View style={styles.partySection}>
          <View style={[styles.partyIcon, styles.respondentIcon]}>
            <Text style={[styles.partyIconText, styles.respondentIconText]}>
              R
            </Text>
          </View>
          <View style={styles.partyContent}>
            <Text style={styles.partyLabel}>RESPONDENT</Text>
            <Text style={styles.partyName} selectable>
              {item.RespondentName || 'Not available'}
            </Text>
          </View>
        </View>

        <View style={styles.identifierRow}>
          <View style={styles.identifierItem}>
            <Text style={styles.identifierLabel}>CINO</Text>
            <Text style={styles.identifierValue} selectable>
              {item.CINO || '—'}
            </Text>
          </View>
        </View>

        {item.judgmentID ? (
          <View style={styles.judgmentBox}>
            <Text style={styles.judgmentTitle}>Judgment Information</Text>
            <Text style={styles.judgmentValue}>
              Judgment ID: {item.judgmentID}
            </Text>
            {item.judgmentType ? (
              <Text style={styles.judgmentValue}>
                Type: {item.judgmentType}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    if (error) {
      return (
        <View style={styles.stateCard}>
          <View style={styles.stateIconError}>
            <Text style={styles.stateIconText}>!</Text>
          </View>
          <Text style={styles.stateTitle}>Unable to load cases</Text>
          <Text style={styles.stateMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadCases()}
            activeOpacity={0.85}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const hasFilters = searchText.trim().length > 0 || statusFilter !== 'All';

    return (
      <View style={styles.stateCard}>
        <View style={styles.stateIconEmpty}>
          <Text style={styles.stateIconText}>⚖</Text>
        </View>
        <Text style={styles.stateTitle}>
          {hasFilters ? 'No matching cases' : 'No cases found'}
        </Text>
        <Text style={styles.stateMessage}>
          {hasFilters
            ? 'Try another search term or change the status filter.'
            : 'Your petitioner case records will appear here when available.'}
        </Text>

        {hasFilters ? (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setSearchText('');
              setStatusFilter('All');
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.retryButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar
        backgroundColor={COLORS.primaryDark}
        barStyle="light-content"
      />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>⚖</Text>
          </View>

          <View style={styles.brandTextContainer}>
            <Text style={styles.brandTitle}>
              HIGH COURT OF JUDICATURE
            </Text>
            <Text style={styles.brandSubtitle}>
              ALLAHABAD · e-FILING PORTAL
            </Text>
          </View>
        </View>

        <View style={styles.headerTitleRow}>
          <View style={styles.headerTitleContent}>
            <Text style={styles.screenTitle}>Cases as Petitioner</Text>
            <Text style={styles.screenSubtitle}>
              Your case records at a glance
            </Text>
          </View>

          <View style={styles.totalBadge}>
            <Text style={styles.totalNumber}>{cases.length}</Text>
            <Text style={styles.totalLabel}>TOTAL</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredCases}
        keyExtractor={(item, index) =>
          `${item.CaseId || item.CINO || item.DisplayCaseno || 'case'}-${index}`
        }
        renderItem={renderCase}
        ListHeaderComponent={
          <View>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.pendingStatCard]}>
                <View style={styles.statIconCircle}>
                  <Text style={styles.statIcon}>◷</Text>
                </View>
                <Text style={styles.statNumber}>{pendingCount}</Text>
                <Text style={styles.statLabel}>Pending cases</Text>
              </View>

              <View style={[styles.statCard, styles.disposedStatCard]}>
                <View style={[styles.statIconCircle, styles.disposedIconCircle]}>
                  <Text style={[styles.statIcon, styles.disposedStatIcon]}>
                    ✓
                  </Text>
                </View>
                <Text style={[styles.statNumber, styles.disposedStatNumber]}>
                  {disposedCount}
                </Text>
                <Text style={styles.statLabel}>Disposed cases</Text>
              </View>
            </View>

            <View style={styles.listHeadingRow}>
              <View>
                <Text style={styles.listTitle}>Your Case Records</Text>
                <Text style={styles.listSubtitle}>
                  {filteredCases.length} of {cases.length} cases
                </Text>
              </View>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => loadCases(true)}
                disabled={refreshing || loading}
                activeOpacity={0.8}
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={styles.refreshButtonText}>↻ Refresh</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search case, party name or CINO..."
                placeholderTextColor={COLORS.muted}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </View>

            <View style={styles.filterRow}>
              {(['All', 'Pending', 'Disposed'] as StatusFilter[]).map(
                (filter) => {
                  const selected = statusFilter === filter;

                  return (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterChip,
                        selected && styles.filterChipSelected,
                      ]}
                      onPress={() => setStatusFilter(filter)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selected && styles.filterChipTextSelected,
                        ]}
                      >
                        {filter}
                        {filter === 'All'
                          ? ` (${cases.length})`
                          : filter === 'Pending'
                            ? ` (${pendingCount})`
                            : ` (${disposedCount})`}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>

            {loading ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingTitle}>Loading your cases</Text>
                <Text style={styles.loadingMessage}>
                  Please wait while we retrieve your case records.
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCases(true)}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Allahabad High Court · e-Filing Portal
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default CaseFilePetitionComponent;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  brandMark: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.17)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 25,
  },

  brandTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  brandTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  brandSubtitle: {
    color: '#E7DDF8',
    fontSize: 10,
    marginTop: 5,
    letterSpacing: 0.7,
  },

  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitleContent: {
    flex: 1,
    paddingRight: 10,
  },

  screenTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  screenSubtitle: {
    color: '#E7DDF8',
    fontSize: 12,
    marginTop: 6,
  },

  totalBadge: {
    width: 67,
    height: 67,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  totalNumber: {
    color: COLORS.primary,
    fontSize: 25,
    fontWeight: '800',
  },

  totalLabel: {
    color: COLORS.secondaryText,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 1,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 20,
    flexGrow: 1,
  },

  statsRow: {
    flexDirection: 'row',
    marginBottom: 25,
  },

  statCard: {
    flex: 1,
    borderRadius: 19,
    padding: 15,
    minHeight: 132,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  pendingStatCard: {
    backgroundColor: '#F0E8FC',
    marginRight: 7,
  },

  disposedStatCard: {
    backgroundColor: '#EAF1FF',
    marginLeft: 7,
    borderColor: '#DCE7FB',
  },

  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  disposedIconCircle: {
    backgroundColor: '#FFFFFF',
  },

  statIcon: {
    color: COLORS.pending,
    fontSize: 23,
    fontWeight: '700',
  },

  disposedStatIcon: {
    color: COLORS.disposed,
  },

  statNumber: {
    color: COLORS.primaryDark,
    fontSize: 26,
    fontWeight: '800',
  },

  disposedStatNumber: {
    color: '#2855A3',
  },

  statLabel: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 3,
    fontWeight: '600',
  },

  listHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  listTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },

  listSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 4,
  },

  refreshButton: {
    minWidth: 83,
    height: 37,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  refreshButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },

  searchContainer: {
    minHeight: 49,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 13,
  },

  searchIcon: {
    fontSize: 27,
    color: COLORS.primary,
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    minHeight: 46,
    color: COLORS.text,
    fontSize: 13,
    paddingVertical: 8,
  },

  filterRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },

  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },

  filterChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterChipText: {
    color: COLORS.secondaryText,
    fontSize: 11,
    fontWeight: '700',
  },

  filterChipTextSelected: {
    color: '#FFFFFF',
  },

  caseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#4E337B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },

  caseCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  caseIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  caseIconText: {
    color: COLORS.primary,
    fontSize: 23,
  },

  caseHeading: {
    flex: 1,
    marginLeft: 11,
    marginRight: 6,
  },

  caseLabel: {
    color: COLORS.secondaryText,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },

  caseNumber: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },

  caseId: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 4,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginTop: 3,
  },

  pendingBadge: {
    backgroundColor: COLORS.pendingBackground,
  },

  disposedBadge: {
    backgroundColor: COLORS.disposedBackground,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  pendingDot: {
    backgroundColor: COLORS.pending,
  },

  disposedDot: {
    backgroundColor: COLORS.disposed,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  pendingText: {
    color: COLORS.pending,
  },

  disposedText: {
    color: COLORS.disposed,
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#F0EAF6',
    marginVertical: 15,
  },

  partySection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },

  partyIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  partyIconText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  respondentIcon: {
    backgroundColor: '#E6F0FF',
  },

  respondentIconText: {
    color: COLORS.disposed,
  },

  partyContent: {
    flex: 1,
    marginLeft: 10,
    paddingTop: 1,
  },

  partyLabel: {
    color: COLORS.secondaryText,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 5,
  },

  partyName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },

  identifierRow: {
    backgroundColor: '#FAF8FD',
    borderRadius: 12,
    padding: 11,
    marginTop: 1,
  },

  identifierItem: {
    flex: 1,
  },

  identifierLabel: {
    color: COLORS.secondaryText,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 5,
  },

  identifierValue: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
  },

  judgmentBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F0E8FC',
  },

  judgmentTitle: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },

  judgmentValue: {
    color: COLORS.text,
    fontSize: 11,
    marginTop: 3,
  },

  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 5,
  },

  loadingTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 13,
  },

  loadingMessage: {
    color: COLORS.secondaryText,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  stateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 22,
    paddingVertical: 30,
    alignItems: 'center',
    marginTop: 3,
  },

  stateIconEmpty: {
    width: 62,
    height: 62,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  stateIconError: {
    width: 62,
    height: 62,
    borderRadius: 21,
    backgroundColor: COLORS.errorBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  stateIconText: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '800',
  },

  stateTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },

  stateMessage: {
    color: COLORS.secondaryText,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 13,
    marginTop: 18,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  footerText: {
    color: COLORS.secondaryText,
    fontSize: 10,
    fontWeight: '600',
  },
});