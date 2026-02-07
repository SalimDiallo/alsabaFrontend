import { APP_MODE } from '@/constants/app';
import { apiClient, saveTokens } from './apiClient';
import {
    PhoneAuthRequest,
    OTPVerifyRequest,
    OTPResponse,
    AuthResponse,
    RefreshTokenResponse,
    SessionStatusResponse,
} from '@/types/auth.types';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const mockSessionKey = () => `auth_${Date.now()}`;
const mockRequestId = () => `req_${Math.random().toString(16).slice(2)}`;

export const authService = {
    // ✅ LoginScreen appelle authService.login()
    login: async (data: PhoneAuthRequest): Promise<OTPResponse> => {
        if (!APP_MODE.USE_MOCK) {
            // futur backend réel
            const res = await apiClient.post('/api/accounts/auth/phone/', data);
            return res.data;
        }

        await wait(600);
        const session_key = mockSessionKey();

        return {
            success: true,
            action: 'login',
            message: 'OTP envoyé (mock)',
            session_key,
            request_id: mockRequestId(),
            phone_number: `${data.country_code}${data.phone_number}`,
            user_exists: true,
            expires_in: 120,
            metadata: { code_size: 6, channel: 'sms', max_attempts: 3 },
            user: {
                id: 'mock-user-id',
                kyc_status: 'unverified',
                phone_verified: false,
            },
        };
    },

    // ✅ OTPScreen appelle authService.verifyOTP()
    verifyOTP: async (data: OTPVerifyRequest): Promise<AuthResponse> => {
        if (!APP_MODE.USE_MOCK) {
            const res = await apiClient.post('/api/accounts/auth/verify/', data);

            // save tokens si présents
            const access =
                (res.data as any)?.auth?.access_token ??
                (res.data as any)?.access ??
                (res.data as any)?.access_token;

            const refresh =
                (res.data as any)?.auth?.refresh_token ??
                (res.data as any)?.refresh ??
                (res.data as any)?.refresh_token;

            if (access && refresh) await saveTokens(access, refresh);

            return res.data;
        }

        await wait(600);

        // ✅ vrai comportement “plateforme” : code fixe en dev (ex: 123456)
        if (data.code !== '123456') {
            const err: any = new Error('Code incorrect (mock)');
            err.remaining_attempts = 2; // tu peux décrémenter côté UI
            throw err;
        }

        const access_token = `mock_access_${Date.now()}`;
        const refresh_token = `mock_refresh_${Date.now()}`;

        await saveTokens(access_token, refresh_token);

        return {
            success: true,
            action: 'login',
            message: 'OTP vérifié (mock)',
            otp_verified: true,
            user: {
                id: 'mock-user-id',
                full_phone_number: data.phone_number,
                phone_number: data.phone_number.replace(/^\+\d{1,4}/, ''),
                country_code: data.phone_number.startsWith('+212') ? '+212' : '+224',
                phone_verified: true,
                date_joined: new Date().toISOString(),
                is_active: true,
                kyc_status: 'unverified',
                first_name: 'Utilisateur',
                last_name: 'Mock',
                email: '',
            },
            auth: {
                access_token,
                refresh_token,
                expires_in: 3600,
                token_type: 'Bearer',
            },
            kyc_info: {
                status: 'unverified',
                required: true,
                next_step: 'document',
            },
            metadata: {
                verified_at: new Date().toISOString(),
                verification_method: 'mock',
            },
        };
    },

    // ✅ OTPScreen appelle authService.resendOTP(phone, countryCode)
    resendOTP: async (phone_number: string, country_code: string): Promise<OTPResponse> => {
        if (!APP_MODE.USE_MOCK) {
            // backend : il attend session_key normalement -> à adapter selon ton backend réel
            // ici on simule en renvoyant un nouveau session_key
            const res = await apiClient.post('/api/accounts/auth/resend/', { session_key: 'TODO' });
            return res.data;
        }

        await wait(400);

        return {
            success: true,
            action: 'login',
            message: 'OTP renvoyé (mock)',
            session_key: mockSessionKey(),
            request_id: mockRequestId(),
            phone_number: `${country_code}${phone_number}`,
            user_exists: true,
            expires_in: 120,
            metadata: { code_size: 6, channel: 'sms', max_attempts: 3 },
        };
    },

    getSessionStatus: async (session_key: string): Promise<SessionStatusResponse> => {
        if (!APP_MODE.USE_MOCK) {
            const res = await apiClient.get(`/api/accounts/auth/status/?session_key=${encodeURIComponent(session_key)}`);
            return res.data;
        }

        await wait(250);
        return {
            status: 'pending',
            phone_number: '+212000000000',
            expires_at: new Date(Date.now() + 120_000).toISOString(),
        };
    },

    refreshToken: async (refresh: string): Promise<RefreshTokenResponse> => {
        if (!APP_MODE.USE_MOCK) {
            const res = await apiClient.post('/api/accounts/auth/refresh/', { refresh });
            return res.data;
        }

        await wait(250);
        return {
            access: `mock_access_${Date.now()}`,
            refresh: `mock_refresh_${Date.now()}`,
        };
    },
};
