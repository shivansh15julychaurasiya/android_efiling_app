
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import CaseFileRespondentComponent from '../components/ecourt/caseFileRespondentComponent';

const CaseFileRespondentScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <CaseFileRespondentComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
});

export default CaseFileRespondentScreen;
