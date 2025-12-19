import { apiClient } from './apiClient';
import {
    LoginRequest,
    RegisterRequest,
    OTPVerifyRequest,
    AuthResponse,
    OTPResponse,
} from '@/types/auth.types';

export const authService = {
    // Inscription
    register: async (data: RegisterRequest): Promise<OTPResponse> => {
        return apiClient.post<OTPResponse>('/auth/register', data);
    },

    // Connexion
    login: async (data: LoginRequest): Promise<OTPResponse> => {
        return apiClient.post<OTPResponse>('/auth/login', data);
    },

    // Vérification OTP
    verifyOTP: async (data: OTPVerifyRequest): Promise<AuthResponse> => {
        return apiClient.post<AuthResponse>('/auth/verify-otp', data);
    },

    // Renvoyer OTP
    resendOTP: async (phoneNumber: string, countryCode: string): Promise<OTPResponse> => {
        return apiClient.post<OTPResponse>('/auth/resend-otp', {
            phoneNumber,
            countryCode,
        });
    },

    // Récupérer le profil
    getProfile: async (): Promise<AuthResponse> => {
        return apiClient.get<AuthResponse>('/auth/profile');
    },

    // Déconnexion
    logout: async (): Promise<void> => {
        return apiClient.post<void>('/auth/logout');
    },
};
