import { StyleSheet } from 'react-native';

export const NAVY = '#071A3D';
export const NAVY_LIGHT = '#0D2855';
export const GOLD = '#D4AF37';
export const WHITE = '#FFFFFF';
export const BACKGROUND = '#F4F6FA';
export const TEXT_DARK = '#17233C';
export const TEXT_MUTED = '#7C8799';
export const BORDER = '#E8ECF2';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: NAVY },
  container: { flex: 1, backgroundColor: BACKGROUND },

  loadingSafeArea: { flex: 1, backgroundColor: NAVY },
  loadingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: NAVY,
  },
  loadingLogo: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: GOLD,
    alignItems: 'center', justifyContent: 'center',
  },
  loadingLogoText: { fontSize: 37, color: NAVY },
  loadingTitle: {
    color: WHITE, fontSize: 18, fontWeight: '900',
    marginTop: 17, letterSpacing: 0.5,
  },
  loadingIndicator: { marginTop: 25 },
  loadingText: { color: WHITE, fontSize: 14, fontWeight: '700', marginTop: 16 },
  loadingSubText: { color: '#A8B5C9', fontSize: 11, marginTop: 5 },

  topBar: {
    height: 72, backgroundColor: NAVY, paddingHorizontal: 17,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  brandContainer: { flexDirection: 'row', alignItems: 'center' },
  brandLogo: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: GOLD,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  brandLogoText: { color: NAVY, fontSize: 23 },
  brandTitle: { color: WHITE, fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  brandSubtitle: {
    color: '#9EACC2', fontSize: 8, fontWeight: '700',
    letterSpacing: 1.1, marginTop: 1,
  },
  logoutTopButton: {
    width: 40, height: 40, borderRadius: 12, borderWidth: 1,
    borderColor: '#405273', alignItems: 'center', justifyContent: 'center',
  },
  logoutTopText: { color: GOLD, fontSize: 23, fontWeight: '700' },

  scrollContent: { padding: 16, paddingBottom: 40 },

  profileCard: {
    backgroundColor: WHITE, borderRadius: 22, padding: 17, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 8,
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  profileImageWrapper: { width: 78, height: 78, borderRadius: 39, position: 'relative' },
  profileImage: {
    width: 78, height: 78, borderRadius: 39, borderWidth: 3,
    borderColor: '#E8D48B',
  },
  profileInitials: {
    width: 78, height: 78, borderRadius: 39, backgroundColor: NAVY,
    alignItems: 'center', justifyContent: 'center', borderWidth: 3,
    borderColor: '#E8D48B',
  },
  profileInitialsText: { color: GOLD, fontSize: 26, fontWeight: '900' },
  onlineDot: {
    position: 'absolute', width: 15, height: 15, borderRadius: 8,
    backgroundColor: '#27AE60', right: 1, bottom: 3,
    borderWidth: 3, borderColor: WHITE,
  },
  profileMainInfo: { flex: 1, marginLeft: 14 },
  profileWelcome: { fontSize: 11, color: TEXT_MUTED, fontWeight: '600' },
  profileName: { color: NAVY, fontSize: 20, fontWeight: '900', marginTop: 2 },
  roleLastLoginRow: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    marginTop: 6, gap: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start', backgroundColor: '#FFF7DD',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginTop: 7,
  },
  roleBadgeText: {
    color: '#8B6A00', fontSize: 9, fontWeight: '900', letterSpacing: 0.5,
  },
  profileDivider: { height: 1, backgroundColor: BORDER, marginVertical: 15 },
  profileDetailsRow: { flexDirection: 'row', alignItems: 'center', minHeight: 47 },
  profileDetail: { flex: 1 },
  profileDetailLabel: {
    color: '#9AA4B2', fontSize: 8, fontWeight: '900', letterSpacing: 0.8,
  },
  profileDetailValue: { color: TEXT_DARK, fontSize: 11, fontWeight: '700', marginTop: 5 },
  detailSeparator: { width: 1, height: 30, backgroundColor: BORDER, marginHorizontal: 13 },

  newCaseFilingBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F8FF',
    borderWidth: 1, borderColor: '#D7E3F5', borderLeftWidth: 4,
    borderLeftColor: GOLD, borderRadius: 14, paddingVertical: 14,
    paddingHorizontal: 14, marginTop: 12, marginBottom: 16,
    shadowColor: '#102A56', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  filingIconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#E4ECFA',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  filingIcon: { fontSize: 23 },
  filingTextContainer: { flex: 1, justifyContent: 'center' },
  filingTitle: { fontSize: 15, fontWeight: '700', color: '#102A56' },
  filingSubtitle: { fontSize: 12, color: '#64748B', marginTop: 4 },
  filingArrowBox: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: '#102A56',
    alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  filingArrow: { color: WHITE, fontSize: 25, lineHeight: 28, fontWeight: '500' },

  sectionCardFullWidth: {
    backgroundColor: WHITE, borderRadius: 16, padding: 16,
    marginTop: 6, marginHorizontal: -16,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.08,
    shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  sectionTitle: { color: NAVY, fontSize: 18, fontWeight: '900', marginBottom: 14 },
  sectionSubtitle: { color: TEXT_MUTED, fontSize: 10, marginTop: 4 },
  loaderContainer: {
    paddingVertical: 25, alignItems: 'center', justifyContent: 'center',
  },
  loaderText: { marginTop: 8, fontSize: 14, color: '#666666' },
  causeItem: {
    flexDirection: 'row', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#EEEEEE',
  },
  causeNumber: {
    width: 34, height: 34, borderRadius: 17, alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#7C3AED', marginRight: 12,
  },
  causeNumberText: { color: WHITE, fontSize: 14, fontWeight: '700' },
  causeInfo: { flex: 1 },
  caseNumber: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  caseCourt: { marginTop: 5, fontSize: 12, color: '#555555' },
  benchName: { marginTop: 5, fontSize: 13, color: '#7C3AED', fontWeight: '600' },
  lastOrderLink: {
    color: '#1565C0', textDecorationLine: 'underline',
    fontSize: 14, fontWeight: '600', marginTop: 6,
  },
  emptyContainer: { paddingVertical: 30, alignItems: 'center' },
  emptyIcon: { fontSize: 28, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#777777' },

  dashboardHeading: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 8, marginBottom: 13,
  },
  dashboardTitle: { color: NAVY, fontSize: 19, fontWeight: '900' },
  dashboardSubtitle: { color: TEXT_MUTED, fontSize: 11, marginTop: 4 },
  refreshSmallButton: {
    width: 40, height: 40, borderRadius: 13, backgroundColor: WHITE,
    alignItems: 'center', justifyContent: 'center', elevation: 2,
  },
  refreshSmallText: { color: NAVY, fontSize: 23, fontWeight: '800' },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    width: '31.7%', backgroundColor: WHITE, borderRadius: 17,
    padding: 12, elevation: 2, minHeight: 128,
  },
  statIcon: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  statIconText: { fontSize: 17, color: NAVY, fontWeight: '800' },
  statValue: { color: NAVY, fontSize: 21, fontWeight: '900', marginTop: 13 },
  statLabel: { color: TEXT_MUTED, fontSize: 9, fontWeight: '700', marginTop: 3 },

  caseSummaryCard: {
    backgroundColor: WHITE, borderRadius: 18, padding: 17, marginTop: 13, elevation: 2,
  },
  caseSummaryHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  caseSummaryTitle: { color: NAVY, fontSize: 14, fontWeight: '900' },
  caseSummarySubtitle: { color: TEXT_MUTED, fontSize: 9, marginTop: 3 },
  caseSummaryIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF6DC',
    alignItems: 'center', justifyContent: 'center',
  },
  caseSummaryIconText: { color: '#8B6A00', fontSize: 19 },
  caseSummaryDivider: { height: 1, backgroundColor: BORDER, marginVertical: 14 },
  caseSummaryRow: { flexDirection: 'row', alignItems: 'center' },
  caseSummaryItem: { flex: 1, alignItems: 'center' },
  caseSummaryValue: { color: NAVY, fontSize: 25, fontWeight: '900' },
  caseSummaryLabel: { color: TEXT_MUTED, fontSize: 10, marginTop: 4 },
  verticalDivider: { width: 1, height: 42, backgroundColor: BORDER },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 24, marginBottom: 13,
  },
  serviceCountBadge: {
    minWidth: 32, height: 32, borderRadius: 16, backgroundColor: NAVY,
    alignItems: 'center', justifyContent: 'center',
  },
  serviceCountText: { color: GOLD, fontSize: 12, fontWeight: '900' },

  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  serviceCard: {
    width: '48.2%', backgroundColor: WHITE, borderRadius: 18, padding: 14,
    marginBottom: 12, minHeight: 165, elevation: 2,
  },
  serviceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceIcon: {
    width: 43, height: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
  },
  serviceIconText: { fontSize: 20, color: NAVY, fontWeight: '800' },
  serviceArrow: { color: '#AAB2BF', fontSize: 19, fontWeight: '800' },
  serviceValue: { color: NAVY, fontSize: 21, fontWeight: '900', marginTop: 14 },
  serviceTitle: {
    color: TEXT_DARK, fontSize: 12, lineHeight: 17, fontWeight: '800',
    marginTop: 3, minHeight: 34,
  },
  serviceBottom: { borderTopWidth: 1, borderTopColor: '#EFF1F5', marginTop: 12, paddingTop: 9 },
  serviceOpenText: { color: '#A18A42', fontSize: 8, fontWeight: '900', letterSpacing: 0.6 },

  footer: { alignItems: 'center', paddingTop: 24 },
  footerLine: { width: 45, height: 3, borderRadius: 2, backgroundColor: GOLD, marginBottom: 14 },
  footerTitle: { color: NAVY, fontSize: 12, fontWeight: '900' },
  footerText: { color: TEXT_MUTED, fontSize: 9, marginTop: 4 },
  footerSmall: { color: '#AAB1BC', fontSize: 8, marginTop: 3 },
});

export default styles;
