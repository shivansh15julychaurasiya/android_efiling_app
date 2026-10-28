
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import DraftForm from '../components/ecourt/DraftForm';

const DraftManagementScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <DraftForm />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
});

export default DraftManagementScreen;
