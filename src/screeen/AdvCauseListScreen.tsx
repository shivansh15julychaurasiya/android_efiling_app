
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import CasueListComponent from '../components/ecourt/CauseListComponent';

import CaseFilePetitionComponent from '../components/ecourt/caseFilePetition';
import CauseListSection from '../components/dashboard/CauseListSection';

const AdvCauseListScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <CasueListComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
});

export default AdvCauseListScreen;
