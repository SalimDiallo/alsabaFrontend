import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation.types';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { Loader } from '@/components/common/Loader';

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

  // En mode dev, on affiche directement l'app principale
  const showMainApp = DEV_MODE || isAuthenticated;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showMainApp ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
