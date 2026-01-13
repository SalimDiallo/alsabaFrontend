import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
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

export type OffersStackParamList = {
    OffersList: undefined;
    CreateOffer: undefined;
    OfferDetails: {
        offerId: string;
    };
    ConfirmTransaction: {
        offerId: string;
    };
};