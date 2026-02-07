import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OfferStackParamList } from '@/types/navigation.types';

import OfferDetailsScreen from '../screens/offers/OfferDetailsScreen';
import OfferAcceptScreen from '../screens/offers/OfferAcceptScreen';
import OfferValidateScreen from '../screens/offers/OfferValidateScreen';

const Stack = createNativeStackNavigator<OfferStackParamList>();

export const OfferNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OfferDetails" component={OfferDetailsScreen} />
      <Stack.Screen name="OfferAccept" component={OfferAcceptScreen} />
      <Stack.Screen name="OfferValidate" component={OfferValidateScreen} />
    </Stack.Navigator>
  );
};
