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
    OTPVerification: {
        phoneNumber: string;       // Numéro national
        countryCode: string;       // Code pays (+212, +224)
        fullPhoneNumber: string;   // Format E.164 complet
        sessionKey: string;        // Clé de session du backend
        expiresIn: number;         // Temps avant expiration
    };
};

export type MainTabParamList = {
    Dashboard: undefined;
    Offers: undefined;
    Transactions: undefined;
    Profile: undefined;
};