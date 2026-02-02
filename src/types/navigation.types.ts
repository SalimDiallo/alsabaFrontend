import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;

    FundWallet: undefined;
    CreateOffer: undefined;

    PersonalInfo: undefined;
    PaymentMethods: undefined;
    Settings: { title: string };

    // ✅ Flow KYC (nested)
    KYCFlow: NavigatorScreenParams<KycStackParamList>;
};

export type AuthStackParamList = {
    Login: undefined;
    OTPVerification: {
        phoneNumber: string;
        countryCode: string;
        fullPhoneNumber: string;
        sessionKey: string;
        expiresIn: number;
    };
};

export type MainTabParamList = {
    Dashboard: undefined;
    Offers: undefined;
    Transactions: undefined;
    Profile: undefined;
};

// ✅ KYC stack : NOMS EXACTS (respecte la casse)
export type KycStackParamList = {
    KycDocument: undefined;
    KycUpload: { documentType: 'id_card' | 'passport' | 'driver_license' };
    KycConfirm: {
        documentType: 'id_card' | 'passport' | 'driver_license';
        frontAdded: boolean;
        backAdded: boolean;
        selfieAdded: boolean;
    };
};
