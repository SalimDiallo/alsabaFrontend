import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from '@/types/navigation.types';
import { useAuthStore } from '@/store/useAuthStore';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { KycNavigator } from './KycNavigator';

import { Loader } from '@/components/common/Loader';
import { OfferNavigator } from './OfferNavigator';


// Modals / stacked screens
import FundWalletScreen from '@/screens/wallet/FundWalletScreen';
import CreateOfferScreen from '@/screens/offers/CreateOfferScreen';
import PersonalInfoScreen from '@/screens/profile/PersonalInfoScreen';
import PaymentMethodsScreen from '@/screens/profile/PaymentMethodsScreen';
import GenericSettingsScreen from '@/screens/profile/GenericSettingsScreen';
import NotificationsScreen from '@/screens/notifications/NotificationsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { user, isAuthenticated, isBootstrapping, initializeAuth, logout } = useAuthStore();

  // Initialisation de l'authentification au démarrage
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Si pas d'utilisateur après le bootstrap, déconnecter
  useEffect(() => {
    if (!isBootstrapping && isAuthenticated && !user) {
      // L'utilisateur est marqué comme authentifié mais pas de données user
      // Cela indique un état incohérent, il faut déconnecter
      logout();
    }
  }, [isBootstrapping, isAuthenticated, user, logout]);

  // Afficher le loader pendant le bootstrapping
  if (isBootstrapping) return <Loader fullScreen message="Chargement..." />;

  const showMainApp = isAuthenticated;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showMainApp ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />

            {/* ✅ KYC FLOW (nested stack) */}
            <Stack.Screen name="KYCFlow" component={KycNavigator} />

            {/* Modals */}
            <Stack.Screen name="FundWallet" component={FundWalletScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="CreateOffer" component={CreateOfferScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />

            {/* Profile stack screens */}
            <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <Stack.Screen name="Settings" component={GenericSettingsScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
        <Stack.Screen name="OfferFlow" component={OfferNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
