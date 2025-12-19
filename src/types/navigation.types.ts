import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
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