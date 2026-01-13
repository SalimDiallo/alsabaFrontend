import { apiClient } from './apiClient';
import {
    PhoneAuthRequest,
    OTPVerifyRequest,
    RefreshTokenRequest,
    DeleteAccountRequest,
    DeleteAccountConfirmRequest,
    OTPResponse,
    AuthResponse,
    SessionStatusResponse,
    RefreshTokenResponse,
    ProfileResponse,
    DeleteRequestResponse,
} from '@/types/auth.types';

// =====================================================
// Service d'authentification - API Backend Django
// =====================================================

export const authService = {
    // =====================================================
    // Authentification
    // =====================================================

    /**
     * Demande OTP pour connexion/inscription
     * POST /auth/phone/
     */
    requestOTP: async (data: PhoneAuthRequest): Promise<OTPResponse> => {
        return apiClient.post<OTPResponse>('/auth/phone/', data);
    },

    /**
     * Vérification du code OTP
     * POST /auth/verify/
     */
    verifyOTP: async (data: OTPVerifyRequest): Promise<AuthResponse> => {
        return apiClient.post<AuthResponse>('/auth/verify/', data);
    },

    /**
     * Vérifier le statut d'une session OTP
     * GET /auth/status/?session_key=xxx
     */
    getSessionStatus: async (sessionKey: string): Promise<SessionStatusResponse> => {
        return apiClient.get<SessionStatusResponse>(`/auth/status/?session_key=${sessionKey}`);
    },

    /**
     * Rafraîchir le token d'accès
     * POST /auth/refresh/
     */
    refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
        return apiClient.post<RefreshTokenResponse>('/auth/refresh/', {
            refresh: refreshToken,
        });
    },

    // =====================================================
    // Profil utilisateur
    // =====================================================

    /**
     * Récupérer le profil de l'utilisateur connecté
     * GET /profile/
     */
    getProfile: async (): Promise<ProfileResponse> => {
        return apiClient.get<ProfileResponse>('/profile/');
    },

    // =====================================================
    // Suppression de compte
    // =====================================================

    /**
     * Demander la suppression du compte (envoie OTP)
     * POST /account/delete/
     */
    requestDeleteAccount: async (data?: DeleteAccountRequest): Promise<DeleteRequestResponse> => {
        return apiClient.post<DeleteRequestResponse>('/account/delete/', data);
    },

    /**
     * Confirmer la suppression du compte avec OTP
     * POST /account/delete/confirm/
     */
    confirmDeleteAccount: async (data: DeleteAccountConfirmRequest): Promise<{ success: boolean; message: string }> => {
        return apiClient.post('/account/delete/confirm/', data);
    },

    // =====================================================
    // Méthodes utilitaires (alias pour compatibilité)
    // =====================================================

    /**
     * Alias pour requestOTP - Connexion
     */
    login: async (data: PhoneAuthRequest): Promise<OTPResponse> => {
        return authService.requestOTP(data);
    },

    /**
     * Alias pour requestOTP - Inscription (même endpoint)
     */
    register: async (data: PhoneAuthRequest): Promise<OTPResponse> => {
        return authService.requestOTP(data);
    },

    /**
     * Renvoyer le code OTP
     */
    resendOTP: async (phoneNumber: string, countryCode: string): Promise<OTPResponse> => {
        return authService.requestOTP({
            phone_number: phoneNumber,
            country_code: countryCode,
        });
    },
};
