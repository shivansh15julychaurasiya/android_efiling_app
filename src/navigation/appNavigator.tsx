import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screeen/loginScreen';
import OtpScreen from '../screeen/otpScreen';
import AdvocateDashboard from '../screeen/AdvocateDashboard';
import CaseFilePetitionScreen from '../screeen/caseFilePetitionScreen';
import CaseFileRespondentScreen from '../screeen/caseFileRespondentScreen';
import DraftManagementScreen from '../screeen/DraftManagementScreen';
import AdvCauseListScreen from '../screeen/AdvCauseListScreen';
import CaseDocumentsScreen from '../screeen/CaseDocumentScreent';

import { RootStackParamList } from './navigationTypes';
import QueryProvider from '../config/QueryProvider';
import ProfileScreen from '../screeen/ProfileScreen';
//import ChangePasswordScreen from '../screeen/ChangePasswordScreen'

/* =========================================================
   Vijay Chaurasiya
   APPLICATION NAVIGATION CONFIGURATION
   Allahabad High Court eFiling App
========================================================= */

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <QueryProvider>
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

         
          <Stack.Screen
            name="AdvCauseList"
            component={AdvCauseListScreen}
          />

          
          <Stack.Screen
            name="CaseDocuments"
            component={CaseDocumentsScreen}
            options={{
              headerShown: false,
            }}
          />



          <Stack.Screen
  name="Profile"
  component={ProfileScreen}
/>

{/* <Stack.Screen
  name="ChangePassword"
  component={ChangePasswordScreen}
/> */}
        </Stack.Navigator>
      </NavigationContainer>
    </QueryProvider>
  );
};

export default AppNavigator;