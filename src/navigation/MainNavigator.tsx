import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MainTabParamList } from '@/types/navigation.types';
import { COLORS, TYPOGRAPHY } from '@/constants/colors';
import { Icon } from '@/components/common/Icon';

// Import des écrans
import DashboardScreen from '@/screens/home/DashboardScreen';
import OffersListScreen from '@/screens/offers/OffersListScreen';
import TransactionHistoryScreen from '@/screens/transactions/TransactionHistoryScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.secondary,

        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,

          // ✅ Safe area + hauteur stable
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 8,

          // ✅ Look plus premium
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,

          // iOS shadow
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -4 },

          // Android shadow
          elevation: 12,

          // important pour que les coins arrondis soient visibles sur Android
          overflow: 'hidden',
        },

        tabBarLabelStyle: {
          fontSize: TYPOGRAPHY.sizes.xs,
          fontWeight: TYPOGRAPHY.weights.medium,
          marginTop: 2,
        },

        tabBarIconStyle: { marginTop: 2 },

        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Offers') iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
          else if (route.name === 'Transactions') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Accueil' }} />
      <Tab.Screen name="Offers" component={OffersListScreen} options={{ tabBarLabel: 'Offres' }} />
      <Tab.Screen name="Transactions" component={TransactionHistoryScreen} options={{ tabBarLabel: 'Historique' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
};
