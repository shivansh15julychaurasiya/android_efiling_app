
import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  getDraftDetails,
  getPassedCaseDetails,
  getExpierdCaseDetails,
} from '../../api/draftApi';

type CaseStatus = 'draft' | 'passed' | 'defect';

type DraftRecord = {
  rcd_id?: number;
  rcd_draft_no?: string;
  rcd_diary_no?: string;
  rcd_cr_date?: number | string;
  rcd_stage_lid?: number;
  rcd_case_year?: number;
  rcd_case_no?: number | string;
  rcd_case_type?: string;
  rcd_ct_id?: number;

  caseStage?: {
    lk_id?: number;
    lk_longname?: string;
  };

  caseType?: {
    ct_id?: number;
    ct_name?: string;
  };

  petitionerDetails?: {
    pt_name?: string;
  };

  respondentDetails?: {
    rt_name?: string;
  };

  scrutionRemark?: {
    sr_remrk?: string;
  };
};

type Props = {
  onEdit?: (item: DraftRecord) => void;
  onDocuments?: (item: DraftRecord) => void;
  onPreview?: (item: DraftRecord) => void;
  onSubmit?: (item: DraftRecord) => void;
};

const STATUS_TABS: {
  key: CaseStatus;
  label: string;
  description: string;
}[] = [
  {
    key: 'draft',
    label: 'In-Process',
    description: 'Cases in progress',
  },
  {
    key: 'passed',
    label: 'Passed Cases',
    description: 'Passed cases',
  },
  {
    key: 'defect',
    label: 'Expired Cases',
    description: 'Defect or expired cases',
  },
];

const formatDate = (value?: number | string): string => {
  if (value === undefined || value === null || value === '') {
    return 'Date unavailable';
  }

  const date =
    typeof value === 'number' || /^\d+$/.test(String(value))
      ? new Date(Number(value))
      : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusColor = (status: string) => {
  const normalized = status.toUpperCase();

  if (normalized.includes('DRAFT')) {
    return { background: '#E8F2FF', text: '#245BB5' };
  }

  if (
    normalized.includes('RETURN') ||
    normalized.includes('DEFECT')
  ) {
    return { background: '#FFF2D8', text: '#946200' };
  }

  if (normalized.includes('EXPIRED')) {
    return { background: '#FCE8E8', text: '#B42318' };
  }

  if (
    normalized.includes('PASS') ||
    normalized.includes('DISPOSE') ||
    normalized.includes('MOVED_TO_DMS')
  ) {
    return { background: '#E4F7EC', text: '#187443' };
  }

  return { background: '#EEF0F5', text: '#4B5565' };
};

const DraftForm: React.FC<Props> = ({
  onEdit,
  onDocuments,
  onPreview,
  onSubmit,
}) => {
  const [selectedStatus, setSelectedStatus] =
    useState<CaseStatus>('draft');

  const [draftList, setDraftList] = useState<DraftRecord[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadCases = useCallback(
    async (status: CaseStatus, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        let result: any;

        if (status === 'passed') {
          result = await getPassedCaseDetails();
        } else if (status === 'defect') {
          result = await getExpierdCaseDetails();
        } else {
          result = await getDraftDetails();
        }

        if (result?.response === 'TRUE') {
          const records: DraftRecord[] = Array.isArray(result.modelList)
            ? result.modelList
            : [];

          setDraftList(records);
          setCount(Number(result.data) || 0);
        } else {
          setDraftList([]);
          setCount(0);
          setError(
            'Unable to load cases. Please try again.',
          );
        }
      } catch (exception) {
        console.error('DRAFT MANAGEMENT ERROR:', exception);

        setDraftList([]);
        setCount(0);

        setError(
          'Unable to connect to the e-Filing server. Please try again.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadCases(selectedStatus);
  }, [selectedStatus, loadCases]);

  const canEditOrSubmit = (item: DraftRecord): boolean =>
    item.caseStage?.lk_longname === 'DRAFT' ||
    item.caseStage?.lk_id === 1000041;

  const renderCaseCard = (item: DraftRecord, index: number) => {
    const statusName =
      item.caseStage?.lk_longname || 'Status unavailable';

    const statusColors = getStatusColor(statusName);
    const showCaseNumber = item.rcd_stage_lid === 1000049;

    return (
      <View
        key={String(item.rcd_id ?? item.rcd_draft_no ?? index)}
        style={styles.caseCard}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.draftIcon}>
            <Text style={styles.draftIconText}>DF</Text>
          </View>

          <View style={styles.draftInfo}>
            <Text style={styles.draftLabel}>DRAFT NUMBER</Text>

            <Text style={styles.draftNumber}>
              {item.rcd_draft_no || 'Not available'}
            </Text>

            <Text style={styles.createdDate}>
              Filed on {formatDate(item.rcd_cr_date)}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors.background },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusColors.text },
              ]}
              numberOfLines={2}
            >
              {statusName.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.caseTypeRow}>
          <View style={styles.caseTypePill}>
            <Text style={styles.caseTypeText}>
              {item.caseType?.ct_name ||
                item.rcd_case_type ||
                'Case type unavailable'}
            </Text>
          </View>

          {showCaseNumber && (
            <Text style={styles.caseNumber}>
              Case No. {item.rcd_case_no || '-'} /{' '}
              {item.rcd_case_year || '-'}
            </Text>
          )}
        </View>

        <View style={styles.partiesSection}>
          <View style={styles.partyRow}>
            <View style={styles.partyMarker}>
              <Text style={styles.partyMarkerText}>P</Text>
            </View>

            <View style={styles.partyContent}>
              <Text style={styles.partyLabel}>PETITIONER</Text>
              <Text style={styles.partyName}>
                {item.petitionerDetails?.pt_name || 'Not available'}
              </Text>
            </View>
          </View>

          <View style={styles.partyRow}>
            <View
              style={[
                styles.partyMarker,
                styles.respondentMarker,
              ]}
            >
              <Text style={styles.partyMarkerText}>R</Text>
            </View>

            <View style={styles.partyContent}>
              <Text style={styles.partyLabel}>RESPONDENT</Text>
              <Text style={styles.partyName}>
                {item.respondentDetails?.rt_name || 'Not available'}
              </Text>
            </View>
          </View>
        </View>

        {!!item.rcd_diary_no && (
          <View style={styles.diaryBox}>
            <Text style={styles.diaryLabel}>DIARY NUMBER</Text>
            <Text style={styles.diaryValue}>
              {item.rcd_diary_no}
            </Text>
          </View>
        )}

        {statusName === 'RETURN_TO_COUNCIL' &&
          !!item.scrutionRemark?.sr_remrk && (
            <View style={styles.remarkBox}>
              <Text style={styles.remarkTitle}>Remarks</Text>
              <Text style={styles.remarkText}>
                {item.scrutionRemark.sr_remrk}
              </Text>
            </View>
          )}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.secondaryButton,
              (!canEditOrSubmit(item) || !onEdit) &&
                styles.disabledButton,
            ]}
            disabled={!canEditOrSubmit(item) || !onEdit}
            onPress={() => onEdit?.(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.secondaryButton,
              !onDocuments && styles.disabledButton,
            ]}
            disabled={!onDocuments}
            onPress={() => onDocuments?.(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              Documents
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.previewButton,
              !onPreview && styles.disabledButton,
            ]}
            disabled={!onPreview}
            onPress={() => onPreview?.(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.previewButtonText}>Preview</Text>
          </TouchableOpacity>
        </View>

        {canEditOrSubmit(item) && (
          <TouchableOpacity
            style={[
              styles.submitButton,
              !onSubmit && styles.disabledSubmitButton,
            ]}
            disabled={!onSubmit}
            onPress={() => onSubmit?.(item)}
            activeOpacity={0.85}
          >
            <Text style={styles.submitButtonText}>
              Submit Application
            </Text>
            <Text style={styles.submitArrow}>›</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const title =
    selectedStatus === 'draft'
      ? 'In-Process Cases'
      : selectedStatus === 'passed'
        ? 'Passed Cases'
        : 'Expired Cases';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#0B1F45"
        barStyle="light-content"
      />

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>DF</Text>
          </View>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerEyebrow}>
              ALLAHABAD HIGH COURT
            </Text>

            <Text style={styles.headerTitle}>
              Draft Management
            </Text>

            <Text style={styles.headerSubtitle}>
              Manage your court applications
            </Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTextContainer}>
            <Text style={styles.summaryCaption}>
              {
                STATUS_TABS.find(
                  (tab) => tab.key === selectedStatus,
                )?.description
              }
            </Text>

            <Text style={styles.summaryCount}>
              {loading ? '—' : count}
            </Text>

            <Text style={styles.summaryFooter}>
              Total applications
            </Text>
          </View>

          <View style={styles.summaryGraphic}>
            <Text style={styles.summaryGraphicText}>▤</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionHeading}>
          Your Applications
        </Text>

        <Text style={styles.sectionDescription}>
          Select a category to view your cases
        </Text>

        <View style={styles.tabsContainer}>
          {STATUS_TABS.map((tab) => {
            const active = selectedStatus === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  active && styles.activeTab,
                ]}
                onPress={() => {
                  if (selectedStatus !== tab.key) {
                    setSelectedStatus(tab.key);
                  }
                }}
                activeOpacity={0.8}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[
                    styles.tabText,
                    active && styles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{title}</Text>

          <Text style={styles.listCount}>
            {loading ? 'Loading...' : `${draftList.length} cases`}
          </Text>
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadCases(selectedStatus, true)}
              tintColor="#173B73"
              colors={['#173B73']}
            />
          }
        >
          {loading && !refreshing ? (
            <View style={styles.centerState}>
              <ActivityIndicator
                size="large"
                color="#173B73"
              />

              <Text style={styles.stateTitle}>
                Loading applications
              </Text>

              <Text style={styles.stateDescription}>
                Fetching your latest case details...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.centerState}>
              <Text style={styles.stateIcon}>!</Text>

              <Text style={styles.stateTitle}>
                Unable to load applications
              </Text>

              <Text style={styles.stateDescription}>
                {error}
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => loadCases(selectedStatus)}
              >
                <Text style={styles.retryButtonText}>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : draftList.length === 0 ? (
            <View style={styles.centerState}>
              <Text style={styles.emptyIcon}>▤</Text>

              <Text style={styles.stateTitle}>
                No applications found
              </Text>

              <Text style={styles.stateDescription}>
                There are no cases available in this category.
              </Text>
            </View>
          ) : (
            draftList.map(renderCaseCard)
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default DraftForm;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F8F7',
  },

  header: {
    backgroundColor: '#075E54',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 23,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: '#0D7467',
    borderWidth: 1,
    borderColor: '#368D80',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerIconText: {
    color: '#F6D98B',
    fontSize: 15,
    fontWeight: '900',
  },

  headerTitleContainer: {
    flex: 1,
  },

  headerEyebrow: {
    color: '#F6D98B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#D1E7E3',
    fontSize: 12,
    marginTop: 4,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    marginTop: 19,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 104,
  },

  summaryTextContainer: {
    flex: 1,
  },

  summaryCaption: {
    color: '#667C78',
    fontSize: 12,
    fontWeight: '600',
  },

  summaryCount: {
    color: '#075E54',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 3,
  },

  summaryFooter: {
    color: '#7D918D',
    fontSize: 11,
    marginTop: 1,
  },

  summaryGraphic: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#E5F4F0',
    borderWidth: 1,
    borderColor: '#CDE8E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  summaryGraphicText: {
    color: '#08796B',
    fontSize: 32,
    fontWeight: '700',
  },

  content: {
    flex: 1,
    paddingTop: 18,
  },

  sectionHeading: {
    color: '#183B36',
    fontSize: 19,
    fontWeight: '800',
    paddingHorizontal: 20,
  },

  sectionDescription: {
    color: '#788C87',
    fontSize: 12,
    paddingHorizontal: 20,
    marginTop: 5,
  },

  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 4,
    gap: 8,
  },

  tab: {
    flex: 1,
    minWidth: 0,
    minHeight: 38,
    paddingHorizontal: 5,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E5E1',
  },

  activeTab: {
    backgroundColor: '#08796B',
    borderColor: '#08796B',
  },

  tabText: {
    color: '#526E68',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  listHeader: {
    paddingHorizontal: 20,
    marginTop: 17,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  listTitle: {
    color: '#183B36',
    fontSize: 14,
    fontWeight: '800',
  },

  listCount: {
    color: '#748B85',
    fontSize: 11,
    fontWeight: '600',
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  caseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E0EBE7',
    shadowColor: '#164D43',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.045,
    shadowRadius: 8,
    elevation: 2,
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  draftIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E5F4F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  draftIconText: {
    color: '#08796B',
    fontSize: 13,
    fontWeight: '900',
  },

  draftInfo: {
    flex: 1,
    paddingTop: 1,
  },

  draftLabel: {
    color: '#84958F',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  draftNumber: {
    color: '#183B36',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },

  createdDate: {
    color: '#7B908A',
    fontSize: 10,
    marginTop: 5,
  },

  statusBadge: {
    maxWidth: 112,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 5,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#EAF1EE',
    marginVertical: 14,
  },

  caseTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },

  caseTypePill: {
    backgroundColor: '#EDF5F2',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  caseTypeText: {
    color: '#42675F',
    fontSize: 10,
    fontWeight: '700',
  },

  caseNumber: {
    color: '#38564F',
    fontSize: 10,
    fontWeight: '700',
  },

  partiesSection: {
    marginTop: 16,
    gap: 13,
  },

  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  partyMarker: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#DDF3ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  respondentMarker: {
    backgroundColor: '#F0E8FA',
  },

  partyMarkerText: {
    color: '#08796B',
    fontSize: 11,
    fontWeight: '900',
  },

  partyContent: {
    flex: 1,
  },

  partyLabel: {
    color: '#84958F',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  partyName: {
    color: '#29443E',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },

  diaryBox: {
    marginTop: 14,
    backgroundColor: '#F1F7F5',
    borderRadius: 10,
    padding: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  diaryLabel: {
    color: '#718A83',
    fontSize: 10,
    fontWeight: '700',
  },

  diaryValue: {
    color: '#08796B',
    fontSize: 12,
    fontWeight: '800',
  },

  remarkBox: {
    marginTop: 13,
    padding: 11,
    backgroundColor: '#FFF7E8',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#D7A744',
  },

  remarkTitle: {
    color: '#8B610E',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },

  remarkText: {
    color: '#72541F',
    fontSize: 12,
    lineHeight: 18,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 16,
  },

  actionButton: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D6E5E1',
  },

  secondaryButtonText: {
    color: '#23685C',
    fontSize: 11,
    fontWeight: '800',
  },

  previewButton: {
    backgroundColor: '#EAF5F1',
    borderColor: '#D3E9E2',
  },

  previewButtonText: {
    color: '#08796B',
    fontSize: 11,
    fontWeight: '800',
  },

  disabledButton: {
    backgroundColor: '#F4F6F5',
    borderColor: '#E6ECE9',
    opacity: 0.55,
  },

  submitButton: {
    minHeight: 44,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: '#08796B',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  submitArrow: {
    color: '#F6D98B',
    fontSize: 23,
    marginLeft: 8,
    marginTop: -2,
  },

  disabledSubmitButton: {
    backgroundColor: '#91AAA4',
  },

  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 45,
  },

  stateTitle: {
    color: '#24443D',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 13,
  },

  stateDescription: {
    color: '#778C85',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
  },

  stateIcon: {
    color: '#B42318',
    backgroundColor: '#FCE8E8',
    overflow: 'hidden',
    borderRadius: 24,
    width: 48,
    height: 48,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 28,
    fontWeight: '800',
  },

  emptyIcon: {
    color: '#829A93',
    fontSize: 43,
  },

  retryButton: {
    marginTop: 17,
    paddingHorizontal: 22,
    paddingVertical: 11,
    backgroundColor: '#08796B',
    borderRadius: 10,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 24,
  },
});
