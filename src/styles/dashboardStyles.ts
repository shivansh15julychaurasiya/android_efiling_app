
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NAVY,
  },
  loadingLogo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogoText: { fontSize: 37, color: NAVY },
  loadingTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 17,
    letterSpacing: 0.5,
  },
  loadingIndicator: { marginTop: 25 },
  loadingText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
  },
  loadingSubText: {
    color: '#A8B5C9',
    fontSize: 11,
    marginTop: 5,
  },

  topBar: {
    height: 72,
    backgroundColor: NAVY,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: { flexDirection: 'row', alignItems: 'center' },
  brandLogo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandLogoText: { color: NAVY, fontSize: 23 },
  brandTitle: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandSubtitle: {
    color: '#9EACC2',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginTop: 1,
  },
  logoutTopButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#405273',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutTopText: { color: GOLD, fontSize: 23, fontWeight: '700' },

  scrollContent: { padding: 16, paddingBottom: 40 },

  // ============================================================
  // PROFILE CARD - ROYAL NAVY AND GOLD THEME
  // ============================================================

  profileCard: {
    backgroundColor: '#102D50',
    borderRadius: 22,
    padding: 17,
    elevation: 7,
    shadowColor: '#071A3D',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#254D75',
    overflow: 'hidden',
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImageWrapper: {
    width: 78,
    height: 78,
    borderRadius: 39,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#D4AF37',
    padding: 2,
    backgroundColor: '#244C70',
  },

  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: '#E7D49B',
  },

  profileInitials: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#244C70',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },

  profileInitialsText: {
    color: '#F2D68A',
    fontSize: 26,
    fontWeight: '900',
  },

  onlineDot: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#32D296',
    right: 1,
    bottom: 3,
    borderWidth: 3,
    borderColor: '#102D50',
  },

  profileMainInfo: {
    flex: 1,
    marginLeft: 14,
  },

  profileWelcome: {
    fontSize: 11,
    color: '#C6D5E5',
    fontWeight: '700',
    letterSpacing: 0.7,
  },

  profileName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 3,
  },

  roleLastLoginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 8,
  },

  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212,175,55,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 7,
  },

  roleBadgeText: {
    color: '#F3D88E',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  profileDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.17)',
    marginVertical: 15,
  },

  profileDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 47,
  },

  profileDetail: {
    flex: 1,
  },

  profileDetailLabel: {
    color: '#9DB4CC',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.9,
  },

  profileDetailValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },

  detailSeparator: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: 13,
  },

  // ============================================================
  // NEW CASE FILING BANNER
  // ============================================================

  newCaseFilingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FF',
    borderWidth: 1,
    borderColor: '#D7E3F5',
    borderLeftWidth: 4,
    borderLeftColor: GOLD,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 12,
    marginBottom: 16,
    shadowColor: '#102A56',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  filingIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E4ECFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  filingIcon: { fontSize: 23 },
  filingTextContainer: { flex: 1, justifyContent: 'center' },
  filingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#102A56',
  },
  filingSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  filingArrowBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#102A56',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  filingArrow: {
    color: WHITE,
    fontSize: 25,
    lineHeight: 28,
    fontWeight: '500',
  },

  // ============================================================
  // TODAY'S CAUSE LIST - NAVY AND GOLD THEME
  // ============================================================

  sectionCardFullWidth: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 16,
    marginTop: 6,
    marginHorizontal: -16,
    elevation: 4,
    shadowColor: '#071A3D',
    shadowOpacity: 0.09,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: '#E5EAF2',
  },

  sectionTitle: {
    color: '#102D50',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
  },

  sectionSubtitle: {
    color: TEXT_MUTED,
    fontSize: 10,
    marginTop: 4,
  },

  loaderContainer: {
    paddingVertical: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loaderText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  causeItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 9,
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#E2EAF3',
    borderRadius: 14,
  },

  causeNumber: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#102D50',
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginRight: 12,
  },

  causeNumberText: {
    color: '#F2D68A',
    fontSize: 14,
    fontWeight: '900',
  },

  causeInfo: {
    flex: 1,
    minWidth: 0,
  },

  caseNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#102D50',
    lineHeight: 20,
  },

  caseCourt: {
    marginTop: 6,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    lineHeight: 17,
  },

  benchName: {
    marginTop: 6,
    fontSize: 12,
    color: '#A17B16',
    fontWeight: '800',
  },

  lastOrderLink: {
    color: '#102D50',
    textDecorationLine: 'underline',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },

  emptyContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFD',
    borderRadius: 14,
  },

  emptyIcon: {
    fontSize: 30,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '700',
  },

  // ============================================================
  // DASHBOARD HEADING
  // ============================================================

  dashboardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 13,
  },

  dashboardTitle: {
    color: NAVY,
    fontSize: 19,
    fontWeight: '900',
  },

  dashboardSubtitle: {
    color: TEXT_MUTED,
    fontSize: 11,
    marginTop: 4,
  },

  refreshSmallButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  refreshSmallText: {
    color: NAVY,
    fontSize: 23,
    fontWeight: '800',
  },

  // ============================================================
  // STATISTICS
  // ============================================================

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statCard: {
    width: '31.7%',
    backgroundColor: WHITE,
    borderRadius: 17,
    padding: 12,
    elevation: 2,
    minHeight: 128,
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statIconText: {
    fontSize: 17,
    color: NAVY,
    fontWeight: '800',
  },

  statValue: {
    color: NAVY,
    fontSize: 21,
    fontWeight: '900',
    marginTop: 13,
  },

  statLabel: {
    color: TEXT_MUTED,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 3,
  },

  // ============================================================
  // CASE SUMMARY
  // ============================================================

  caseSummaryCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 17,
    marginTop: 13,
    elevation: 2,
  },

  caseSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  caseSummaryTitle: {
    color: NAVY,
    fontSize: 14,
    fontWeight: '900',
  },

  caseSummarySubtitle: {
    color: TEXT_MUTED,
    fontSize: 9,
    marginTop: 3,
  },

  caseSummaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF6DC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  caseSummaryIconText: {
    color: '#8B6A00',
    fontSize: 19,
  },

  caseSummaryDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 14,
  },

  caseSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  caseSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  caseSummaryValue: {
    color: NAVY,
    fontSize: 25,
    fontWeight: '900',
  },

  caseSummaryLabel: {
    color: TEXT_MUTED,
    fontSize: 10,
    marginTop: 4,
  },

  verticalDivider: {
    width: 1,
    height: 42,
    backgroundColor: BORDER,
  },

  // ============================================================
  // SERVICES
  // ============================================================

    // ============================================================
  // SERVICES - COMPACT ROYAL NAVY AND GOLD THEME
  // ============================================================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 10,
  },

  serviceCountBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#102D50',
    borderWidth: 1,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },

  serviceCountText: {
    color: '#F2D68A',
    fontSize: 11,
    fontWeight: '900',
  },

  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  serviceCard: {
    width: '48.5%',
    backgroundColor: WHITE,
    borderRadius: 13,
    padding: 10,
    marginBottom: 9,
    minHeight: 112,
    borderWidth: 1,
    borderColor: '#E3EAF3',
    elevation: 2,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  serviceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4EAF2',
  },

  serviceIconText: {
    fontSize: 16,
    color: NAVY,
    fontWeight: '800',
  },

  serviceArrowBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#F0F4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  serviceArrow: {
    color: '#A18A42',
    fontSize: 16,
    fontWeight: '900',
  },

  serviceValue: {
    color: '#102D50',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 7,
  },

  serviceTitle: {
    color: '#34445C',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    marginTop: 2,
    minHeight: 0,
  },

  serviceBottom: {
    borderTopWidth: 1,
    borderTopColor: '#E9EEF5',
    marginTop: 7,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  serviceOpenText: {
    color: '#A18A42',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  serviceFooterArrow: {
    color: '#102D50',
    fontSize: 12,
    fontWeight: '900',
  },

  // ============================================================
  // FOOTER
  // ============================================================

  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },

  footerLine: {
    width: 45,
    height: 3,
    borderRadius: 2,
    backgroundColor: GOLD,
    marginBottom: 14,
  },

  footerTitle: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '900',
  },

  footerText: {
    color: TEXT_MUTED,
    fontSize: 9,
    marginTop: 4,
  },

  footerSmall: {
    color: '#AAB1BC',
    fontSize: 8,
    marginTop: 3,
  },
  
  
});

export default styles;
