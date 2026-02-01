// src/navigation/AppNavigator.tsx
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { Loader } from '@/components/common/Loader';

import FundWalletScreen from '@/screens/wallet/FundWalletScreen';
import CreateOfferScreen from '@/screens/offers/CreateOfferScreen';
import PersonalInfoScreen from '@/screens/profile/PersonalInfoScreen';
import PaymentMethodsScreen from '@/screens/profile/PaymentMethodsScreen';
import GenericSettingsScreen from '@/screens/profile/GenericSettingsScreen';
import StaticContentScreen from '@/screens/profile/StaticContentScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const DEV_MODE = false;

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isBootstrapping, initializeAuth } = useAuthStore();
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    if (!DEV_MODE) initializeAuth();
  }, [initializeAuth]);

  // ✅ Ne bloque QUE pendant le boot
  if (!DEV_MODE && isBootstrapping) {
    return <Loader fullScreen message="Chargement..." />;
  }

  const showMainApp = DEV_MODE || isAuthenticated;

  return (
    <NavigationContainer>
      <Stack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
        {showMainApp ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />

            <Stack.Screen name="FundWallet" component={FundWalletScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="CreateOffer" component={CreateOfferScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <Stack.Screen name="Settings" component={GenericSettingsScreen} />
            <Stack.Screen name="Content" component={StaticContentScreen} />

          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
