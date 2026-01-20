// 1. Mise à jour de src/types/navigation.types.ts
// ==========================================
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
    // Écrans modaux/empilés
    FundWallet: undefined;
    CreateOffer: undefined;
    PersonalInfo: undefined;
    PaymentMethods: undefined;
    Settings: { title: string };
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    OTPVerification: {
        phoneNumber: string;
        countryCode: string;
    };
};

export type MainTabParamList = {
    Dashboard: undefined;
    Offers: undefined;
    Transactions: undefined;
    Profile: undefined;
};