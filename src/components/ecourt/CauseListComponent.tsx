
import React, { useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import { getCauseListDate } from '../../api/advocateApi';

/* =========================================================
   TYPES
========================================================= */

type CauseListRow = {
  Bench_Name?: string;
  Case_Type_Name?: string;

  Extra_Res_adv?: string;
  Extra_Res_adv_Roll?: string;

  Extra_pet_adv?: string;
  Extra_pet_adv_Roll?: string;

  Max_Sr_No?: number;

  PetCounsel_Roll?: string;
  ResCounsel_Roll?: string;

  case_no?: string;

  case_type?: string;
  case_year?: string | number;

  caseType?: string;
  caseYear?: string | number;
  Case_Type?: string;
  cause_type?: string;

  cause_list_type?: string;

  cause_reg_no?: number;
  cause_reg_year?: number;

  court_no?: string;

  curListType?: string;
  curSlno?: string;

  listing_type?: number;

  petitioner_advocate?: string;
  petitioner_name?: string;

  respondent_advocate?: string;
  respondent_name?: string;

  sr_no?: string;

  [key: string]: any;
};

/* =========================================================
   THEME
========================================================= */

const NAVY = '#E87500';
const NAVY_LIGHT = '#F28C00';
const GOLD = '#FFB000';

const BG = '#FFF4E5';
const TEXT = '#512500';
const MUTED = '#9A6030';
const BORDER = '#F5D2A8';

/* =========================================================
   HELPERS
========================================================= */

const extractCauseList = (response: any): CauseListRow[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.modelList)) {
    return response.modelList;
  }

  if (Array.isArray(response?.data?.modelList)) {
    return response.data.modelList;
  }

  return [];
};

const clean = (
  value?: string | number | null,
): string => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
};

// Keep the date in local time.
// This preserves the date selected by the user.
const normalizeDate = (date: Date): Date => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
};

// Keep the existing backend date format.
// Do not change to yyyy-MM-dd until the Spring
// controller's expected date format is verified.
const formatApiDate = (date: Date): string => {
  return normalizeDate(date).toString();
};

/* =========================================================
   COMPONENT
========================================================= */

const CasueListComponent: React.FC = () => {
  const navigation = useNavigation<any>();

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const [expandedCase, setExpandedCase] =
    useState<string | null>(null);

  const [selectedDate, setSelectedDate] =
    useState<Date>(normalizeDate(new Date()));

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [dateSearchResult, setDateSearchResult] =
    useState<CauseListRow[] | null>(null);

  const [dateSearchLoading, setDateSearchLoading] =
    useState(false);

  /* =====================================================
     INITIAL CAUSE LIST API
  ===================================================== */

  const causeListQuery = useQuery<CauseListRow[]>({
    queryKey: ['advocate', 'causeList'],

    queryFn: async () => {
      // No argument means today's date.
      const response = await getCauseListDate();

      return extractCauseList(response);
    },

    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,

    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Date-search results replace the initial cause list.
  const causeList =
    dateSearchResult ?? causeListQuery.data ?? [];

  /* =====================================================
     DATE LABEL
  ===================================================== */

  const formatDateLabel = (date: Date): string => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  /* =====================================================
     DATE PICKER
  ===================================================== */

const handleDatePickerChange = (
  event: DateTimePickerEvent,
  date?: Date,
) => {
  setShowDatePicker(false);

  if (event.type === 'set' && date) {
    setSelectedDate(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0, 0, 0, 0,
      ),
    );
  }
};

  /* =====================================================
     DATE SEARCH
  ===================================================== */

 const handleDateSearch = async () => {
  try {
    setDateSearchLoading(true);

    const dateParameter = selectedDate.toString();

    console.log('Selected date:', selectedDate);
    console.log('Sending date to backend:', dateParameter);

    const response = await getCauseListDate(dateParameter);

    setDateSearchResult(extractCauseList(response));

  } catch (error: any) {
    console.log(
      'DATE CAUSE LIST ERROR:',
      error?.response?.data || error.message,
    );

    Alert.alert('Error', 'Unable to fetch cause list for selected date.');
  } finally {
    setDateSearchLoading(false);
  }
};

  /* =====================================================
     CLEAR DATE SEARCH
  ===================================================== */

  const clearDateSearch = () => {
    setDateSearchResult(null);
    setSelectedDate(normalizeDate(new Date()));

    setSelectedFilter('All');
    setSearch('');
    setExpandedCase(null);
  };

  /* =====================================================
     CATEGORY FILTERS
  ===================================================== */

  const filters = useMemo(() => {
    const types = Array.from(
      new Set(
        causeList
          .map(item =>
            clean(
              item.cause_list_type || item.curListType,
            ),
          )
          .filter(Boolean),
      ),
    );

    return ['All', ...types];
  }, [causeList]);

  /* =====================================================
     SEARCH + FILTER
  ===================================================== */

  const filteredCases = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return causeList.filter(item => {
      const listType = clean(
        item.cause_list_type || item.curListType,
      );

      const matchesFilter =
        selectedFilter === 'All' ||
        listType === selectedFilter;

      const searchableText = [
        item.case_no,
        item.Case_Type_Name,
        item.case_type,
        item.case_year,
        item.cause_reg_no,
        item.cause_reg_year,
        item.court_no,
        item.sr_no,
        item.curSlno,
        item.petitioner_name,
        item.respondent_name,
        item.petitioner_advocate,
        item.respondent_advocate,
        item.Extra_pet_adv,
        item.Extra_Res_adv,
        item.Bench_Name,
        item.cause_list_type,
      ]
        .map(value => clean(value).toLowerCase())
        .join(' ');

      const matchesSearch =
        !keyword || searchableText.includes(keyword);

      return matchesFilter && matchesSearch;
    });
  }, [causeList, search, selectedFilter]);

  /* =====================================================
     CASE DOCUMENTS NAVIGATION
  ===================================================== */

  const openCaseDocuments = (item: CauseListRow) => {
    if (!clean(item.case_no)) {
      Alert.alert(
        'Case Documents',
        'Case number is not available.',
      );

      return;
    }

    navigation.navigate('CaseDocuments', {
      caseDetails: item,
    });
  };

  /* =====================================================
     MANUAL REFRESH
  ===================================================== */

  const handleRefresh = async () => {
    setDateSearchResult(null);
    setSelectedDate(normalizeDate(new Date()));

    setSelectedFilter('All');
    setSearch('');
    setExpandedCase(null);

    await causeListQuery.refetch();
  };

  /* =====================================================
     CASE CARD
  ===================================================== */

  const renderCaseCard = (
    item: CauseListRow,
    index: number,
  ) => {
    const caseKey =
      clean(item.case_no) ||
      `${clean(item.court_no)}-${clean(item.sr_no)}-${index}`;

    const isExpanded = expandedCase === caseKey;

    return (
      <View key={caseKey} style={styles.caseCard}>

        {/* CASE HEADER */}

        <View style={styles.caseTopRow}>
          <View style={styles.serialBadge}>
            <Text style={styles.serialLabel}>
              SR. NO.
            </Text>

            <Text style={styles.serialNumber}>
              {clean(item.sr_no) || '--'}
            </Text>
          </View>

          <View style={styles.caseHeading}>
            <Text style={styles.caseNumber}>
              {clean(item.case_no) || 'Case number unavailable'}
            </Text>

            <Text style={styles.caseType}>
              {clean(item.Case_Type_Name) || 'Case'}
            </Text>
          </View>

          <View style={styles.courtBadge}>
            <Text style={styles.courtLabel}>
              COURT
            </Text>

            <Text style={styles.courtNumber}>
              {clean(item.court_no) || '--'}
            </Text>
          </View>
        </View>

        {/* CAUSE LIST TYPE */}

        <View style={styles.listTypeRow}>
          <View style={styles.listTypeBadge}>
            <Text style={styles.listTypeText}>
              {clean(
                item.cause_list_type || item.curListType,
              ) || 'Cause List'}
            </Text>
          </View>

          <Text style={styles.currentSerial}>
            Current SL: {clean(item.curSlno) || '--'}
          </Text>
        </View>

        <View style={styles.cardDivider} />

        {/* PETITIONER */}

        <Text style={styles.partyLabel}>
          PETITIONER
        </Text>

        <Text style={styles.partyName}>
          {clean(item.petitioner_name) || 'Not available'}
        </Text>

        {/* RESPONDENT */}

        <Text style={styles.partyLabel}>
          RESPONDENT
        </Text>

        <Text style={styles.partyName}>
          {clean(item.respondent_name) || 'Not available'}
        </Text>

        {/* CASE DOCUMENTS */}

        <TouchableOpacity
          style={styles.caseDocumentsButton}
          activeOpacity={0.8}
          onPress={() => openCaseDocuments(item)}
        >
          <Text style={styles.caseDocumentsButtonText}>
            📁 Case Documents
          </Text>
        </TouchableOpacity>

        {/* EXPANDED DETAILS */}

        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.cardDivider} />

            <Text style={styles.detailHeading}>
              CASE DETAILS
            </Text>

            <DetailRow
              label="Bench / Judges"
              value={
                clean(item.Bench_Name)
                  .replace(/\|/g, '\n') || '--'
              }
            />

            <DetailRow
              label="Petitioner Advocate"
              value={clean(item.petitioner_advocate) || '--'}
            />

            <DetailRow
              label="Respondent Advocate"
              value={clean(item.respondent_advocate) || '--'}
            />

            <DetailRow
              label="Additional Petitioner Counsel"
              value={clean(item.Extra_pet_adv) || '--'}
            />

            <DetailRow
              label="Additional Respondent Counsel"
              value={clean(item.Extra_Res_adv) || '--'}
            />

            <DetailRow
              label="Cause Registration"
              value={
                item.cause_reg_no
                  ? `${item.cause_reg_no}/${clean(item.cause_reg_year)}`
                  : '--'
              }
            />

            <DetailRow
              label="Maximum Serial Number"
              value={clean(item.Max_Sr_No) || '--'}
            />
          </View>
        )}

        {/* EXPAND / COLLAPSE */}

        <TouchableOpacity
          style={styles.expandFooter}
          activeOpacity={0.75}
          onPress={() =>
            setExpandedCase(
              isExpanded ? null : caseKey,
            )
          }
        >
          <Text style={styles.expandText}>
            {isExpanded ? 'Show Less' : 'View Case Details'}
          </Text>

          <Text style={styles.expandArrow}>
            {isExpanded ? '⌃' : '⌄'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /* =====================================================
     LOADING STATE
  ===================================================== */

  const loading = causeListQuery.isLoading;

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={NAVY}
      />

      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              CAUSE LIST
            </Text>

            <Text style={styles.headerSubtitle}>
              ALLAHABAD HIGH COURT
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.refreshButton,
              causeListQuery.isFetching &&
                styles.refreshButtonDisabled,
            ]}
            onPress={handleRefresh}
            disabled={causeListQuery.isFetching}
            activeOpacity={0.75}
          >
            <Text style={styles.refreshIcon}>
              {causeListQuery.isFetching ? '…' : '↻'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* TOTAL CASES */}

        <View style={styles.summaryCompact}>
          <Text style={styles.summaryCompactLabel}>
            TOTAL CASES
          </Text>

          <Text style={styles.summaryCompactNumber}>
            {causeList.length}
          </Text>

          <Text style={styles.summaryCompactCaption}>
            in your cause list
          </Text>
        </View>
      </View>

      <View style={styles.content}>

        {/* SEARCH */}

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search case, party, advocate, court..."
            placeholderTextColor={MUTED}
            style={styles.searchInput}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
            >
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* DATE SEARCH */}

        <View style={styles.dateSearchCard}>
          <View style={styles.dateSearchTopRow}>
            <Text style={styles.dateSearchTitle}>
              CAUSE LIST DATE
            </Text>

            {dateSearchResult !== null && (
              <TouchableOpacity onPress={clearDateSearch}>
                <Text style={styles.clearDateText}>
                  CLEAR DATE
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.dateSearchActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerIcon}>
                ▦
              </Text>

              <Text
                style={styles.datePickerValue}
                numberOfLines={1}
              >
                {formatDateLabel(selectedDate)}
              </Text>

              <Text style={styles.datePickerHint}>
                ▾
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.dateSearchButton,
                dateSearchLoading &&
                  styles.dateSearchButtonDisabled,
              ]}
              onPress={handleDateSearch}
              disabled={dateSearchLoading}
            >
              {dateSearchLoading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                  size="small"
                />
              ) : (
                <Text style={styles.dateSearchButtonText}>
                  SEARCH
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDatePickerChange}
              maximumDate={new Date(2035, 11, 31)}
            />
          )}

          {dateSearchResult !== null && (
            <Text
              style={styles.dateSearchInfo}
              numberOfLines={1}
            >
              Showing {formatDateLabel(selectedDate)}
            </Text>
          )}
        </View>

        {/* FILTER HEADER */}

        <View style={styles.filterHeader}>
          <Text style={styles.sectionTitle}>
            Case Categories
          </Text>

          <Text style={styles.resultCount}>
            {filteredCases.length} RESULTS
          </Text>
        </View>

        {/* CATEGORY FILTERS */}

        <ScrollView
          horizontal
          style={styles.filterScroll}
          contentContainerStyle={styles.filterList}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filters.map(filter => {
            const active = selectedFilter === filter;

            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                style={[
                  styles.filterChip,
                  active && styles.filterChipActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* LOADING / ERROR / CASE LIST */}

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator
              size="large"
              color={NAVY}
            />

            <Text style={styles.stateText}>
              Loading your cause list...
            </Text>
          </View>
        ) : causeListQuery.isError &&
          dateSearchResult === null ? (
          <View style={styles.centerState}>
            <Text style={styles.emptyIcon}>!</Text>

            <Text style={styles.emptyTitle}>
              Unable to load Cause List
            </Text>

            <Text style={styles.stateText}>
              Please check your connection and try again.
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRefresh}
            >
              <Text style={styles.retryText}>
                TRY AGAIN
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.caseListScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          >
            {filteredCases.length > 0 ? (
              filteredCases.map((item, index) =>
                renderCaseCard(item, index),
              )
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>⌕</Text>

                <Text style={styles.emptyTitle}>
                  No Cases Found
                </Text>

                <Text style={styles.stateText}>
                  Try another search term or category.
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setSearch('');
                    setSelectedFilter('All');
                  }}
                >
                  <Text style={styles.resetText}>
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.footerText}>
              Allahabad High Court • e-Filing Advocate Portal
            </Text>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

/* =========================================================
   DETAIL ROW
========================================================= */

type DetailRowProps = {
  label: string;
  value: string;
};

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>
      {label}
    </Text>

    <Text style={styles.detailValue}>
      {value}
    </Text>
  </View>
);

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    backgroundColor: NAVY,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    fontSize: 36,
    color: '#FFFFFF',
    lineHeight: 40,
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 1,
  },

  headerSubtitle: {
    color: '#FFE0B2',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 1,
  },

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: NAVY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  refreshButtonDisabled: {
    opacity: 0.6,
  },

  refreshIcon: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  summaryCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 14,
    padding: 12,
  },

  summaryCompactLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  summaryCompactNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginLeft: 12,
  },

  summaryCompactCaption: {
    color: '#FFE0B2',
    fontSize: 11,
    marginLeft: 8,
  },

  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 14,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    minHeight: 48,
  },

  searchIcon: {
    color: NAVY,
    fontSize: 24,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    color: TEXT,
    fontSize: 13,
    paddingVertical: 10,
  },

  clearSearch: {
    color: MUTED,
    fontSize: 18,
    padding: 5,
  },

  dateSearchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 13,
    marginTop: 12,
  },

  dateSearchTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },

  dateSearchTitle: {
    color: TEXT,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  clearDateText: {
    color: NAVY,
    fontSize: 10,
    fontWeight: '900',
  },

  dateSearchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  datePickerButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: BG,
    borderRadius: 10,
    paddingHorizontal: 10,
  },

  datePickerIcon: {
    color: NAVY,
    fontSize: 18,
    marginRight: 8,
  },

  datePickerValue: {
    flex: 1,
    color: TEXT,
    fontWeight: '700',
    fontSize: 12,
  },

  datePickerHint: {
    color: MUTED,
    fontSize: 15,
    marginLeft: 5,
  },

  dateSearchButton: {
    minWidth: 88,
    height: 44,
    borderRadius: 10,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  dateSearchButtonDisabled: {
    opacity: 0.65,
  },

  dateSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  dateSearchInfo: {
    color: MUTED,
    fontSize: 10,
    marginTop: 9,
  },

  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 17,
    marginBottom: 8,
  },

  sectionTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '900',
  },

  resultCount: {
    color: NAVY,
    fontSize: 10,
    fontWeight: '900',
  },

  filterScroll: {
    flexGrow: 0,
    maxHeight: 42,
  },

  filterList: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 5,
  },

  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },

  filterChipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },

  filterText: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  caseListScroll: {
    flex: 1,
    marginTop: 9,
  },

  listContent: {
    paddingBottom: 25,
  },

  caseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },

  caseTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  serialBadge: {
    width: 48,
    height: 49,
    borderRadius: 11,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },

  serialLabel: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '800',
  },

  serialNumber: {
    color: NAVY,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },

  caseHeading: {
    flex: 1,
    marginHorizontal: 10,
  },

  caseNumber: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '900',
  },

  caseType: {
    color: MUTED,
    fontSize: 11,
    marginTop: 4,
  },

  courtBadge: {
    minWidth: 49,
    backgroundColor: '#FFF0D5',
    borderRadius: 10,
    padding: 7,
    alignItems: 'center',
  },

  courtLabel: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '800',
  },

  courtNumber: {
    color: NAVY,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },

  listTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 13,
  },

  listTypeBadge: {
    backgroundColor: BG,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  listTypeText: {
    color: NAVY,
    fontSize: 10,
    fontWeight: '800',
  },

  currentSerial: {
    color: MUTED,
    fontSize: 10,
  },

  cardDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 12,
  },

  partyLabel: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 4,
    marginTop: 4,
  },

  partyName: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },

  caseDocumentsButton: {
    backgroundColor: NAVY,
    borderRadius: 9,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 7,
  },

  caseDocumentsButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  expandedSection: {
    marginTop: 4,
  },

  detailHeading: {
    color: NAVY,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 10,
  },

  detailRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8E8D5',
  },

  detailLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },

  detailValue: {
    color: TEXT,
    fontSize: 12,
    lineHeight: 18,
  },

  expandFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 13,
  },

  expandText: {
    color: NAVY,
    fontSize: 11,
    fontWeight: '900',
  },

  expandArrow: {
    color: NAVY,
    fontSize: 17,
    marginLeft: 7,
  },

  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  stateText: {
    color: MUTED,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 9,
    lineHeight: 18,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 55,
  },

  emptyIcon: {
    color: NAVY,
    fontSize: 35,
    fontWeight: '900',
  },

  emptyTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 9,
  },

  retryButton: {
    backgroundColor: NAVY,
    borderRadius: 9,
    paddingHorizontal: 22,
    paddingVertical: 11,
    marginTop: 18,
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  resetText: {
    color: NAVY,
    fontWeight: '900',
    fontSize: 12,
    marginTop: 15,
  },

  footerText: {
    color: MUTED,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
});

export default CasueListComponent;
