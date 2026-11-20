
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

  // Case Documents API fields, if returned by Cause List API
  case_type?: string;
  case_year?: string | number;

  // Alternative API field names, if present
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
  value?: string | number | null
): string => {

  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
};


/* =========================================================
   COMPONENT
========================================================= */

const CasueListComponent: React.FC = () => {

  // FIX: Get navigation directly from React Navigation.
  const navigation = useNavigation<any>();


  const [search, setSearch] = useState('');

  const [selectedFilter, setSelectedFilter] = useState('All');

  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [dateSearchResult, setDateSearchResult] =
    useState<CauseListRow[] | null>(null);

  const [dateSearchLoading, setDateSearchLoading] = useState(false);


  /* =====================================================
     CAUSE LIST API
  ===================================================== */

  const causeListQuery = useQuery<CauseListRow[]>({

    queryKey: ['advocate', 'causeList'],

    queryFn: async () => {

      const response = await getCauseListDate();

      return extractCauseList(response);

    },

    staleTime: Infinity,

    gcTime: 30 * 60 * 1000,

    refetchOnMount: false,

    refetchOnWindowFocus: false,

    refetchOnReconnect: false,

  });


  // Date-search results replace the initial list.
  const causeList =
    dateSearchResult ?? causeListQuery.data ?? [];


  /* =====================================================
     DATE FORMAT
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
    date?: Date
  ) => {

    setShowDatePicker(false);

    if (event.type === 'set' && date) {

      setSelectedDate(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          0,
          0,
          0,
          0
        )
      );

    }

  };


  /* =====================================================
     DATE SEARCH
  ===================================================== */

  const handleDateSearch = async () => {

    try {

      setDateSearchLoading(true);

      setExpandedCase(null);

      const dateAtMidnight = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        0,
        0,
        0,
        0
      );

      // Retains your existing backend date parameter format.
      const dateParameter = dateAtMidnight.toString();

      console.log(
        'Cause list date parameter:',
        dateParameter
      );

      const response = await getCauseListDate(dateParameter);

      const result = extractCauseList(response);

      setDateSearchResult(result);

      setSelectedFilter('All');

      setSearch('');

      if (result.length === 0) {

        Alert.alert(
          'Cause List',
          'No cause list found for the selected date.'
        );

      }

    } catch (error) {

      console.error(
        'Date-wise cause list error:',
        error
      );

      Alert.alert(
        'Cause List',
        'Unable to load the cause list for the selected date. Please try again.'
      );

    } finally {

      setDateSearchLoading(false);

    }

  };


  /* =====================================================
     CLEAR DATE SEARCH
  ===================================================== */

  const clearDateSearch = () => {

    setDateSearchResult(null);

    setSelectedDate(new Date());

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
              item.cause_list_type || item.curListType
            )
          )
          .filter(Boolean)

      )

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
        item.cause_list_type || item.curListType
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
     Vijay Chaurasiya | CASE DOCUMENTS NAVIGATION
  ===================================================== */

  const openCaseDocuments = (item: CauseListRow) => {

    if (!clean(item.case_no)) {

      Alert.alert(
        'Case Documents',
        'Case number is not available.'
      );

      return;
    }

    // Pass the complete case record.
    // CaseDocumentsScreen can resolve the API parameters.
    navigation.navigate('CaseDocuments', {
      caseDetails: item,
    });

  };


  /* =====================================================
     Vijay Chaurasiya| MANUAL REFRESH
  ===================================================== */

  const handleRefresh = async () => {

    setDateSearchResult(null);

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
    index: number
  ) => {

    const caseKey =
      clean(item.case_no) ||
      `${clean(item.court_no)}-${clean(item.sr_no)}-${index}`;

    const isExpanded = expandedCase === caseKey;


    return (

      // FIX: View instead of TouchableOpacity.
      // Prevents nested touchable conflicts.
      <View
        key={caseKey}
        style={styles.caseCard}
      >

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
                item.cause_list_type || item.curListType
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


        {/* CASE DOCUMENTS BUTTON */}

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


        {/* INDEPENDENT EXPAND / COLLAPSE BUTTON */}

        <TouchableOpacity
          style={styles.expandFooter}
          activeOpacity={0.75}
          onPress={() =>
            setExpandedCase(
              isExpanded ? null : caseKey
            )
          }
        >

          <Text style={styles.expandText}>
            {isExpanded
              ? 'Show Less'
              : 'View Case Details'}
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

            <Text style={styles.backText}>
              ‹
            </Text>

          </TouchableOpacity>


          <View style={styles.headerTitleContainer}>

            <Text style={styles.headerTitle}>
              CAUSE LIST
            </Text>

            <Text style={styles.headerSubtitle}>
              ALLAHABAD HIGH COURT
            </Text>

          </View>


          {/* MANUAL API REFRESH */}

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

          <Text style={styles.searchIcon}>
            ⌕
          </Text>

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

              <Text style={styles.clearSearch}>
                ✕
              </Text>

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

              <TouchableOpacity
                onPress={clearDateSearch}
              >

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

        ) : causeListQuery.isError && dateSearchResult === null ? (

          <View style={styles.centerState}>

            <Text style={styles.emptyIcon}>
              !
            </Text>

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
                renderCaseCard(item, index)
              )

            ) : (

              <View style={styles.emptyContainer}>

                <Text style={styles.emptyIcon}>
                  ⌕
                </Text>

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
    paddingHorizontal: 14,
    paddingTop: 2,
    paddingBottom: 7,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 34,
    marginTop: -4,
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  headerSubtitle: {
    color: '#FFE0B2',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginTop: 2,
  },

  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  refreshButtonDisabled: {
    opacity: 0.65,
  },

  refreshIcon: {
    color: '#FFE0A3',
    fontSize: 28,
    fontWeight: '800',
  },

  headerAccent: {
    height: 3,
    width: 48,
    backgroundColor: '#FFC46B',
    borderRadius: 3,
    marginTop: 9,
    marginBottom: 9,
  },

  summaryCard: {
    backgroundColor: NAVY_LIGHT,
    borderWidth: 1,
    borderColor: 'rgba(255,224,178,0.35)',
    borderRadius: 17,
    padding: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryLabel: {
    color: '#FFE8CD',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  summaryNumber: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
    marginTop: 1,
  },

  summaryCaption: {
    color: '#FFE0B2',
    fontSize: 11,
    marginTop: 2,
  },

  summaryCompact: {
    marginTop: 6,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.13)',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
  },

  summaryCompactLabel: {
    color: '#FFE8CD',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  summaryCompactNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  summaryCompactCaption: {
    color: '#FFE0B2',
    fontSize: 9,
  },

  summaryIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: 'rgba(255,196,107,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryIconText: {
    color: '#FFD18A',
    fontSize: 25,
  },

  content: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 12,
    paddingTop: 6,
  },

  searchContainer: {
    height: 39,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  searchIcon: {
    fontSize: 25,
    color: NAVY,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    color: TEXT,
    fontSize: 13,
    paddingVertical: 0,
  },

  clearSearch: {
    color: MUTED,
    fontSize: 18,
    padding: 5,
  },

  dateSearchCard: {
    marginTop: 6,
    padding: 7,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },

  dateSearchTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  dateSearchTitle: {
    color: TEXT,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  datePickerButton: {
    flex: 1,
    minHeight: 35,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#F1C18C',
    backgroundColor: '#FFF8EF',
    marginRight: 7,
  },

  datePickerIcon: {
    color: NAVY,
    fontSize: 17,
    marginRight: 7,
  },

  datePickerValue: {
    flex: 1,
    color: TEXT,
    fontSize: 12,
    fontWeight: '800',
  },

  datePickerHint: {
    color: NAVY,
    fontSize: 13,
    fontWeight: '900',
  },

  dateSearchActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateSearchButton: {
    width: 94,
    minHeight: 35,
    borderRadius: 9,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dateSearchButtonDisabled: {
    opacity: 0.65,
  },

  dateSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  clearDateText: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '900',
  },

  dateSearchInfo: {
    color: MUTED,
    fontSize: 10,
    marginTop: 5,
    fontWeight: '600',
  },

  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 4,
  },

  sectionTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '800',
  },

  resultCount: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 34,
  },

  filterList: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 2,
    gap: 5,
  },

  filterChip: {
    height: 30,
    minHeight: 30,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  filterChipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },

  filterText: {
    color: '#754018',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.1,
    includeFontPadding: false,
  },

  filterTextActive: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    includeFontPadding: false,
  },

  caseListScroll: {
    flex: 1,
    minHeight: 0,
    width: '100%',
  },

  listContent: {
    flexGrow: 1,
    paddingBottom: 18,
  },

  caseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
    shadowColor: '#9A4D13',
    shadowOpacity: 0.07,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  caseTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  serialBadge: {
    width: 53,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#FFF0D6',
    borderWidth: 1,
    borderColor: '#F5D4A7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  serialLabel: {
    color: '#A34B0A',
    fontSize: 8,
    fontWeight: '800',
  },

  serialNumber: {
    color: NAVY,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 3,
  },

  caseHeading: {
    flex: 1,
    marginHorizontal: 11,
  },

  caseNumber: {
    color: NAVY,
    fontSize: 13,
    fontWeight: '800',
  },

  caseType: {
    color: MUTED,
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },

  courtBadge: {
    backgroundColor: '#FFF0DF',
    borderWidth: 1,
    borderColor: '#F4D6B7',
    borderRadius: 12,
    minWidth: 51,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },

  courtLabel: {
    color: MUTED,
    fontSize: 8,
    fontWeight: '800',
  },

  courtNumber: {
    color: NAVY,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },

  listTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 13,
  },

  listTypeBadge: {
    backgroundColor: '#FFF1DC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#F4D7B3',
  },

  listTypeText: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '800',
  },

  currentSerial: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '600',
  },

  cardDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 13,
  },

  partyLabel: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 4,
  },

  partyName: {
    color: TEXT,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 12,
  },

  expandedSection: {
    marginTop: 1,
  },

  detailHeading: {
    color: NAVY,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 11,
  },

  detailRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EBDD',
  },

  detailLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },

  detailValue: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },

  expandFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F5EBDD',
    marginTop: 10,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },

  expandText: {
    color: NAVY,
    fontSize: 11,
    fontWeight: '800',
  },

  expandArrow: {
    color: GOLD,
    fontSize: 18,
    fontWeight: '800',
  },

  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },

  stateText: {
    color: MUTED,
    fontSize: 12,
    marginTop: 9,
    textAlign: 'center',
  },

  retryButton: {
    backgroundColor: NAVY,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 18,
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 55,
  },

  emptyIcon: {
    color: GOLD,
    fontSize: 42,
    fontWeight: '700',
  },

  emptyTitle: {
    color: NAVY,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },

  resetText: {
    color: NAVY,
    fontWeight: '800',
    fontSize: 12,
    marginTop: 15,
  },

  footerText: {
    color: '#B49A83',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },

  caseDocumentsButton: {
    backgroundColor: '#ec920a',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 14,
    marginBottom: 5,
    alignItems: 'center',
  },

  caseDocumentsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

});


export default CasueListComponent;
