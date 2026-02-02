import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { KycStackParamList } from '@/types/navigation.types';

import KycDocumentScreen from '@/screens/kyc/KycDocumentScreen';
import KycUploadScreen from '@/screens/kyc/KycUploadScreen';
import KycConfirmScreen from '@/screens/kyc/KycConfirmScreen';

const Stack = createNativeStackNavigator<KycStackParamList>();

export const KycNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="KycDocument" component={KycDocumentScreen} />
      <Stack.Screen name="KycUpload" component={KycUploadScreen} />
      <Stack.Screen name="KycConfirm" component={KycConfirmScreen} />
    </Stack.Navigator>
  );
};
