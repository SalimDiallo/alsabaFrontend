import { apiClient } from './apiClient';
import {
    PhoneAuthRequest,
    OTPVerifyRequest,
    DeleteAccountRequest,
    DeleteAccountConfirmRequest,
    OTPResponse,
    AuthResponse,
    SessionStatusResponse,
    RefreshTokenResponse,
    ProfileResponse,
    DeleteRequestResponse,
    User,
} from '@/types/auth.types';

const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const nowIso = () => new Date().toISOString();

const buildMockUser = (fullPhone: string): User => {
    const countryCode = fullPhone.startsWith('+212') ? '+212' : '+212';
    const phoneNumber = fullPhone.replace(countryCode, '').replace('+', '');

    return {
        id: 'mock-user-1',

        full_phone_number: fullPhone,
        phone_number: phoneNumber,
        country_code: countryCode,
        phone_verified: true,
        phone_verified_at: nowIso(),

        first_name: 'Dev',
        last_name: 'User',
        email: 'dev.user@example.com',

        kyc_status: 'unverified',

        date_joined: nowIso(),
        last_login: nowIso(),
        is_active: true,

        // alias compat
        is_verified: true,
        currency: 'MAD',
        created_at: nowIso(),
        updated_at: nowIso(),
    };
};

const buildOtpResponse = (data: PhoneAuthRequest): OTPResponse => {
    const fullPhone = `${data.country_code}${data.phone_number}`;
    return {
        success: true,
        action: 'login',
        message: 'OTP envoyé (mock)',
        session_key: 'mock-session-key',
        request_id: 'mock-request-id',
        phone_number: fullPhone,
        user_exists: true,
        expires_in: 300,
        metadata: {
            code_size: 6,
            channel: 'sms',
            max_attempts: 5,
        },
        user: {
            id: 'mock-user-1',
            kyc_status: 'unverified',
            phone_verified: false,
        },
    };
};

const buildAuthResponse = (fullPhone: string): AuthResponse => {
    const user = buildMockUser(fullPhone);
    return {
        success: true,
        action: 'login',
        message: 'Authentification réussie (mock)',
        user,
        auth: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_in: 3600,
            token_type: 'Bearer',
        },
        kyc_info: {
            status: user.kyc_status,
            required: user.kyc_status !== 'approved',
            next_step: user.kyc_status === 'unverified' ? 'submit_kyc' : 'none',
        },
        otp_verified: true,
        metadata: {
            verified_at: nowIso(),
            verification_method: 'mock',
        },
    };
};

export const authService = {
    /**
     * Demande OTP pour connexion/inscription
     * POST /auth/phone/
     */
    requestOTP: async (data: PhoneAuthRequest): Promise<OTPResponse> => {
        if (USE_MOCK_API) {
            await sleep(400);
            return buildOtpResponse(data);
        }
        return apiClient.post<OTPResponse>('/auth/phone/', data);
    },

    /**
     * Vérification du code OTP
     * POST /auth/verify/
     */
    verifyOTP: async (data: OTPVerifyRequest): Promise<AuthResponse> => {
        if (USE_MOCK_API) {
            await sleep(500);

            // Tu peux choisir d'accepter n'importe quel code en mock
            // ou imposer un code (ex: "000000") :
            // if (data.code !== '000000') throw new Error('Code OTP invalide (mock)');

            return buildAuthResponse(data.phone_number);
        }
        return apiClient.post<AuthResponse>('/auth/verify/', data);
    },

    /**
     * Vérifier le statut d'une session OTP
     * GET /auth/status/?session_key=xxx
     */
    getSessionStatus: async (sessionKey: string): Promise<SessionStatusResponse> => {
        if (USE_MOCK_API) {
            await sleep(250);
            return {
                status: 'pending',
                phone_number: '+212710914717',
                expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            };
        }
        return apiClient.get<SessionStatusResponse>(`/auth/status/?session_key=${sessionKey}`);
    },

    /**
     * Rafraîchir le token d'accès
     * POST /auth/refresh/
     */
    refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
        if (USE_MOCK_API) {
            await sleep(250);
            return {
                access: 'mock-access-token-refreshed',
                refresh: 'mock-refresh-token-refreshed',
            };
        }
        return apiClient.post<RefreshTokenResponse>('/auth/refresh/', {
            refresh: refreshToken,
        });
    },

    /**
     * Récupérer le profil de l'utilisateur connecté
     * GET /profile/
     */
    getProfile: async (): Promise<ProfileResponse> => {
        if (USE_MOCK_API) {
            await sleep(250);
            return { user: buildMockUser('+212710914717') };
        }
        return apiClient.get<ProfileResponse>('/profile/');
    },

    /**
     * Demander la suppression du compte (envoie OTP)
     * POST /account/delete/
     */
    requestDeleteAccount: async (data?: DeleteAccountRequest): Promise<DeleteRequestResponse> => {
        if (USE_MOCK_API) {
            await sleep(300);
            return {
                success: true,
                message: 'OTP suppression envoyé (mock)',
                session_key: 'mock-delete-session-key',
            };
        }
        return apiClient.post<DeleteRequestResponse>('/account/delete/', data);
    },

    /**
     * Confirmer la suppression du compte avec OTP
     * POST /account/delete/confirm/
     */
    confirmDeleteAccount: async (data: DeleteAccountConfirmRequest): Promise<{ success: boolean; message: string }> => {
        if (USE_MOCK_API) {
            await sleep(300);
            return { success: true, message: 'Compte supprimé (mock)' };
        }
        return apiClient.post('/account/delete/confirm/', data);
    },

    // Aliases
    login: async (data: PhoneAuthRequest): Promise<OTPResponse> => {
        return authService.requestOTP(data);
    },

    resendOTP: async (phoneNumber: string, countryCode: string): Promise<OTPResponse> => {
        return authService.requestOTP({
            phone_number: phoneNumber,
            country_code: countryCode,
        });
    },
};
