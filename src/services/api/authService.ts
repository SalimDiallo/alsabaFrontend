import { apiClient, saveTokens } from './apiClient';
import {
    PhoneAuthRequest,
    OTPVerifyRequest,
    OTPResponse,
    AuthResponse,
    RefreshTokenResponse,
    SessionStatusResponse,
} from '@/types/auth.types';

export const authService = {
    // 1) POST /api/accounts/auth/phone/
    requestOTP: async (data: PhoneAuthRequest): Promise<OTPResponse> => {
        const res = await apiClient.post('/api/accounts/auth/phone/', data);
        return res.data;
    },

    // 2) POST /api/accounts/auth/verify/
    verifyOTP: async (data: OTPVerifyRequest): Promise<AuthResponse> => {
        const res = await apiClient.post('/api/accounts/auth/verify/', data);

        // Ici on sauvegarde les tokens si le backend renvoie access/refresh
        const access =
            (res.data as any)?.auth?.access_token ??
            (res.data as any)?.access ??
            (res.data as any)?.access_token;

        const refresh =
            (res.data as any)?.auth?.refresh_token ??
            (res.data as any)?.refresh ??
            (res.data as any)?.refresh_token;

        if (access && refresh) {
            await saveTokens(access, refresh);
        }

        return res.data;
    },

    // 3) POST /api/accounts/auth/resend/
    resendOTP: async (session_key: string): Promise<OTPResponse> => {
        const res = await apiClient.post('/api/accounts/auth/resend/', { session_key });
        return res.data;
    },

    // 4) GET /api/accounts/auth/status/?session_key=
    getSessionStatus: async (session_key: string): Promise<SessionStatusResponse> => {
        const res = await apiClient.get(`/api/accounts/auth/status/?session_key=${encodeURIComponent(session_key)}`);
        return res.data;
    },

    // 5) POST /api/accounts/auth/refresh/
    refreshToken: async (refresh: string): Promise<RefreshTokenResponse> => {
        const res = await apiClient.post('/api/accounts/auth/refresh/', { refresh });
        return res.data;
    },
};
