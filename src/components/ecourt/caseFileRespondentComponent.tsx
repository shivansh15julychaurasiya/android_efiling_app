
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

import { getCasesAsRespondent } from '../../api/caseFilePetition';
import type { CaseFilePetition } from '../../types/caseFilePetition';

const COLORS = {
  primary: '#145B8C',
  dark: '#0B2D4D',
  accent: '#38A6A5',
  background: '#F2F6FA',
  surface: '#FFFFFF',
  text: '#17324D',
  secondary: '#71839A',
  border: '#E3EAF1',
  pending: '#B7791F',
  pendingBg: '#FFF4DB',
  disposed: '#25815D',
  disposedBg: '#E0F5E9',
  error: '#C0392B',
};

type CaseStatus = 'Pending' | 'Disposed';
type StatusFilter = 'All' | CaseStatus;

const getStatus = (status?: string | null): CaseStatus => {
  const value = (status || '').trim().toLowerCase();

  if (
    value.includes('dispos') ||
    value.includes('decided') ||
    value.includes('closed')
  ) {
    return 'Disposed';
  }

  return 'Pending';
};

const getCaseNumber = (item: CaseFilePetition): string =>
  item.DisplayCaseno || String(item.CaseId || 'Case number unavailable');

const CaseFileRespondentComponent = () => {
  const [cases, setCases] = useState<CaseFilePetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  // Fetch respondent cases only.
  const loadCases = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      console.log('=== RESPONDENT SCREEN: LOADING CASES ===');
      console.log('=== API: /ecourt/getCaseAsRes ===');

      const response = await getCasesAsRespondent();

      console.log(
        '=== RESPONDENT RECORD COUNT ===',
        Array.isArray(response) ? response.length : 0,
      );

      setCases(Array.isArray(response) ? response : []);
    } catch (err: unknown) {
      console.error('Error loading respondent cases:', err);

      setError(
        'Unable to retrieve respondent cases. Check your connection and try again.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    console.log('=== CASE FILE RESPONDENT SCREEN MOUNTED ===');
    loadCases();
  }, [loadCases]);

  const pendingCount = useMemo(
    () =>
      cases.filter((item) => getStatus(item.CaseStatus) === 'Pending').length,
    [cases],
  );

  const disposedCount = useMemo(
    () =>
      cases.filter((item) => getStatus(item.CaseStatus) === 'Disposed').length,
    [cases],
  );

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();

    return cases.filter((item) => {
      const status = getStatus(item.CaseStatus);

      if (statusFilter !== 'All' && status !== statusFilter) {
        return false;
      }

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

      return !query || searchableText.includes(query);
    });
  }, [cases, search, statusFilter]);

  const renderCase = ({
    item,
    index,
  }: {
    item: CaseFilePetition;
    index: number;
  }) => {
    const disposed = getStatus(item.CaseStatus) === 'Disposed';

    return (
      <View style={styles.caseCard}>
        <View style={styles.cardTop}>
          <View style={styles.caseIcon}>
            <Text style={styles.caseIconText}>⚖</Text>
          </View>

          <View style={styles.caseHeading}>
            <Text style={styles.eyebrow}>
              RESPONDENT CASE · {index + 1}
            </Text>

            <Text style={styles.caseNumber}>{getCaseNumber(item)}</Text>

            <Text style={styles.caseId}>
              Case ID: {item.CaseId || '—'}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              disposed ? styles.disposedBadge : styles.pendingBadge,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: disposed
                    ? COLORS.disposed
                    : COLORS.pending,
                },
              ]}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color: disposed ? COLORS.disposed : COLORS.pending,
                },
              ]}
            >
              {disposed ? 'Disposed' : 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.partyBlock}>
          <View style={styles.partyRow}>
            <View style={styles.partyLetter}>
              <Text style={styles.partyLetterText}>P</Text>
            </View>

            <View style={styles.partyInfo}>
              <Text style={styles.partyLabel}>PETITIONER</Text>
              <Text style={styles.partyName} selectable>
                {item.PetitionerName || 'Not available'}
              </Text>
            </View>
          </View>

          <View style={styles.partyConnector}>
            <View style={styles.connectorLine} />
          </View>

          <View style={styles.partyRow}>
            <View style={[styles.partyLetter, styles.respondentLetter]}>
              <Text style={styles.respondentLetterText}>R</Text>
            </View>

            <View style={styles.partyInfo}>
              <Text style={styles.partyLabel}>RESPONDENT</Text>
              <Text style={styles.partyName} selectable>
                {item.RespondentName || 'Not available'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cinoBox}>
          <View style={styles.cinoContent}>
            <Text style={styles.cinoLabel}>
              CASE IDENTIFICATION NUMBER
            </Text>
            <Text style={styles.cinoValue} selectable>
              {item.CINO || 'Not available'}
            </Text>
          </View>

          <Text style={styles.cinoIcon}>▤</Text>
        </View>

        {item.judgmentID ? (
          <View style={styles.judgmentBox}>
            <Text style={styles.judgmentTitle}>
              Judgment information
            </Text>

            <Text style={styles.judgmentText}>
              Judgment ID: {item.judgmentID}
            </Text>

            {item.judgmentType ? (
              <Text style={styles.judgmentText}>
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

    const hasFilters =
      search.trim().length > 0 || statusFilter !== 'All';

    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>
            {error ? '!' : '⚖'}
          </Text>
        </View>

        <Text style={styles.emptyTitle}>
          {error
            ? 'Unable to load cases'
            : hasFilters
              ? 'No matching cases'
              : 'No respondent cases found'}
        </Text>

        <Text style={styles.emptyMessage}>
          {error ||
            (hasFilters
              ? 'Try a different search term or change your status filter.'
              : 'Your respondent case records will appear here when available.')}
        </Text>

        {error ? (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadCases()}
            activeOpacity={0.85}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        ) : hasFilters ? (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setSearch('');
              setStatusFilter('All');
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.retryText}>Clear Filters</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        backgroundColor={COLORS.dark}
        barStyle="light-content"
      />

      <FlatList
        data={filteredCases}
        keyExtractor={(item, index) =>
          `${item.CaseId || item.CINO || item.DisplayCaseno || 'case'}-${index}`
        }
        renderItem={renderCase}
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
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.brandRow}>
                <View style={styles.brandIcon}>
                  <Text style={styles.brandIconText}>⚖</Text>
                </View>

                <View style={styles.brandText}>
                  <Text style={styles.brandTitle}>
                    HIGH COURT OF JUDICATURE
                  </Text>
                  <Text style={styles.brandSubtitle}>
                    ALLAHABAD · e-FILING PORTAL
                  </Text>
                </View>
              </View>

              <View style={styles.headingRow}>
                <View style={styles.headingContent}>
                  <Text style={styles.screenTitle}>
                    Cases as Respondent
                  </Text>
                  <Text style={styles.screenSubtitle}>
                    Track your respondent case records
                  </Text>
                </View>

                <View style={styles.totalBadge}>
                  <Text style={styles.totalNumber}>{cases.length}</Text>
                  <Text style={styles.totalLabel}>TOTAL</Text>
                </View>
              </View>

              <View style={styles.headerAccent}>
                <View style={styles.headerAccentLine} />
                <Text style={styles.headerAccentText}>
                  YOUR CASE OVERVIEW
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={styles.statTopRow}>
                  <View style={styles.pendingStatIcon}>
                    <Text style={styles.statIconText}>◷</Text>
                  </View>
                  <Text style={styles.statCaption}>OPEN CASES</Text>
                </View>

                <Text style={styles.statNumber}>{pendingCount}</Text>
                <Text style={styles.statLabel}>Pending cases</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statTopRow}>
                  <View style={styles.disposedStatIcon}>
                    <Text style={styles.statIconText}>✓</Text>
                  </View>
                  <Text style={styles.statCaption}>COMPLETED</Text>
                </View>

                <Text
                  style={[
                    styles.statNumber,
                    { color: COLORS.disposed },
                  ]}
                >
                  {disposedCount}
                </Text>

                <Text style={styles.statLabel}>Disposed cases</Text>
              </View>
            </View>

            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionTitle}>
                  Your Case Records
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {filteredCases.length} of {cases.length} records
                </Text>
              </View>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => loadCases(true)}
                disabled={refreshing || loading}
                activeOpacity={0.8}
              >
                {refreshing ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                  />
                ) : (
                  <Text style={styles.refreshText}>↻ Refresh</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search case, party name or CINO..."
                placeholderTextColor="#93A1B2"
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

                  const count =
                    filter === 'All'
                      ? cases.length
                      : filter === 'Pending'
                        ? pendingCount
                        : disposedCount;

                  return (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterChip,
                        selected && styles.filterChipActive,
                      ]}
                      onPress={() => setStatusFilter(filter)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          selected && styles.filterTextActive,
                        ]}
                      >
                        {filter} ({count})
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>

            {loading ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator
                  size="large"
                  color={COLORS.primary}
                />

                <Text style={styles.loadingTitle}>
                  Loading respondent cases
                </Text>

                <Text style={styles.loadingMessage}>
                  Retrieving your case records securely...
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Allahabad High Court · e-Filing Portal
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 12,
  },
  header: {
    backgroundColor: COLORS.dark,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    color: '#FFFFFF',
    fontSize: 25,
  },
  brandText: {
    marginLeft: 12,
    flex: 1,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.65,
  },
  brandSubtitle: {
    color: '#BBD1E6',
    fontSize: 10,
    marginTop: 5,
    letterSpacing: 0.7,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 27,
  },
  headingContent: {
    flex: 1,
    paddingRight: 8,
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    color: '#C1D3E4',
    fontSize: 12,
    marginTop: 7,
    lineHeight: 18,
  },
  totalBadge: {
    minWidth: 69,
    height: 69,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalNumber: {
    color: COLORS.dark,
    fontSize: 25,
    fontWeight: '800',
  },
  totalLabel: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
  headerAccent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 23,
  },
  headerAccentLine: {
    width: 27,
    height: 3,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginRight: 9,
  },
  headerAccentText: {
    color: '#BBD1E6',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 19,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.pendingBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disposedStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.disposedBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  statCaption: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statNumber: {
    color: COLORS.pending,
    fontSize: 29,
    fontWeight: '800',
    marginTop: 12,
  },
  statLabel: {
    color: COLORS.secondary,
    fontSize: 11,
    marginTop: 3,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: COLORS.secondary,
    fontSize: 11,
    marginTop: 5,
  },
  refreshButton: {
    minHeight: 37,
    minWidth: 83,
    borderRadius: 11,
    backgroundColor: '#E4EEF8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 11,
  },
  refreshText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    minHeight: 51,
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 25,
    color: COLORS.primary,
    marginRight: 9,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 14,
    marginBottom: 5,
  },
  filterChip: {
    flex: 1,
    minHeight: 39,
    borderRadius: 12,
    backgroundColor: '#E8EEF5',
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  loadingCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 15,
    padding: 25,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 13,
  },
  loadingMessage: {
    color: COLORS.secondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 7,
  },
  caseCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 13,
    padding: 16,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#17324D',
    shadowOpacity: 0.045,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  caseIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#E7F0F9',
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
    marginRight: 5,
  },
  eyebrow: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  caseNumber: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  caseId: {
    color: COLORS.secondary,
    fontSize: 10,
    marginTop: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 7,
    marginTop: 1,
  },
  pendingBadge: {
    backgroundColor: COLORS.pendingBg,
  },
  disposedBadge: {
    backgroundColor: COLORS.disposedBg,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  partyBlock: {
    paddingVertical: 1,
  },
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partyLetter: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: '#E4EEF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyLetterText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  respondentLetter: {
    backgroundColor: '#DDF4EF',
  },
  respondentLetterText: {
    color: '#197B70',
    fontSize: 13,
    fontWeight: '800',
  },
  partyInfo: {
    flex: 1,
    marginLeft: 11,
  },
  partyLabel: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  partyName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 19,
  },
  partyConnector: {
    height: 17,
    paddingLeft: 17,
    justifyContent: 'center',
  },
  connectorLine: {
    height: 13,
    width: 1,
    backgroundColor: '#CFDCE8',
  },
  cinoBox: {
    marginTop: 17,
    backgroundColor: '#F3F7FB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7EDF4',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cinoContent: {
    flex: 1,
  },
  cinoLabel: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cinoValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  cinoIcon: {
    color: COLORS.primary,
    fontSize: 21,
    marginLeft: 8,
  },
  judgmentBox: {
    backgroundColor: '#EAF6F1',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  judgmentTitle: {
    color: COLORS.disposed,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 5,
  },
  judgmentText: {
    color: COLORS.text,
    fontSize: 11,
    marginTop: 3,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 15,
    padding: 25,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: '#E7F0F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconText: {
    color: COLORS.primary,
    fontSize: 27,
    fontWeight: '800',
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyMessage: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 11,
    marginTop: 17,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 23,
  },
  footerText: {
    color: COLORS.secondary,
    fontSize: 10,
    letterSpacing: 0.2,
  },
});

export default CaseFileRespondentComponent;
