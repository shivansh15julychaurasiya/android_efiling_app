
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import CaseFilePetitionComponent from '../components/ecourt/caseFilePetition';

const CaseFilePetitionScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <CaseFilePetitionComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
});

export default CaseFilePetitionScreen;
