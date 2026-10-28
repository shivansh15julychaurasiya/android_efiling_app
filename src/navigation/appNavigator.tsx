
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screeen/loginScreen';
import OtpScreen from '../screeen/otpScreen';
import AdvocateDashboard from '../screeen/AdvocateDashboard';
import CaseFilePetitionScreen from '../screeen/caseFilePetitionScreen';
import CaseFileRespondentScreen from "../screeen/caseFileRespondentScreen"
import DraftManagementScreen from '../screeen/DraftManagementScreen';

import { RootStackParamList } from './navigationTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Otp"
          component={OtpScreen}
        />

        <Stack.Screen
          name="AdvocateDashboard"
          component={AdvocateDashboard}
        />

        <Stack.Screen
          name="CaseFilePetition"
          component={CaseFilePetitionScreen}
        />
         <Stack.Screen
          name="CaseFileRespondent"
          component={CaseFileRespondentScreen}
        />
        

        <Stack.Screen
          name="DraftManagement"
          component={DraftManagementScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
