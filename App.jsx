import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/colors';

export default function App() {
    return (
        <>
            <StatusBar style="dark" backgroundColor={COLORS.background} />
            <AppNavigator />
        </>
    );
}