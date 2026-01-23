import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types/navigation.types';

// Import des écrans
import LoginScreen from '@/screens/auth/LoginScreen';
import OTPScreen from '@/screens/auth/OTPScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Login = Inscription implicite (le backend crée le compte si nécessaire) */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTPVerification" component={OTPScreen} />
    </Stack.Navigator>
  );
};
