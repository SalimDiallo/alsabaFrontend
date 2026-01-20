// 2. Mise à jour de src/navigation/AppNavigator.tsx
// ==========================================
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { Loader } from '@/components/common/Loader';

// Import des écrans modaux
import FundWalletScreen from '@/screens/wallet/FundWalletScreen';
import CreateOfferScreen from '@/screens/offers/CreateOfferScreen';
import PersonalInfoScreen from '@/screens/profile/PersonalInfoScreen';
import PaymentMethodsScreen from '@/screens/profile/PaymentMethodsScreen';
import GenericSettingsScreen from '@/screens/profile/GenericSettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// MODE DÉVELOPPEMENT - Mettre à true pour bypass l'authentification
const DEV_MODE = true;

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    if (!DEV_MODE) {
      initializeAuth();
    }
  }, [initializeAuth]);

  if (!DEV_MODE && isLoading) {
    return <Loader fullScreen message="Chargement..." />;
  }

  const showMainApp = DEV_MODE || isAuthenticated;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showMainApp ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            {/* Écrans modaux */}
            <Stack.Screen 
              name="FundWallet" 
              component={FundWalletScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen 
              name="CreateOffer" 
              component={CreateOfferScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen 
              name="PersonalInfo" 
              component={PersonalInfoScreen}
            />
            <Stack.Screen 
              name="PaymentMethods" 
              component={PaymentMethodsScreen}
            />
            <Stack.Screen 
              name="Settings" 
              component={GenericSettingsScreen}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
