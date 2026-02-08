import { apiClient } from './apiClient';
import { ProfileResponse, User } from '@/types/auth.types';

export const profileService = {
    // 6) GET /api/accounts/profile/
    getProfile: async (): Promise<ProfileResponse> => {
        const res = await apiClient.get('/api/accounts/profile/');
        return res.data;
    },

    // 7) PATCH /api/accounts/profile/
    updateProfile: async (data: Partial<User>): Promise<ProfileResponse> => {
        const res = await apiClient.patch('/api/accounts/profile/', data);
        return res.data;
    },

    // 8) POST /api/accounts/kyc/verify/ (multipart)
    submitKyc: async (payload: {
        document_type: 'id_card' | 'passport' | 'drivers_license' | 'residence_permit';
        front_image: { uri: string; name?: string; type?: string };
        back_image?: { uri: string; name?: string; type?: string };
        perform_document_liveness?: boolean;
        minimum_age?: number;
    }) => {
        const form = new FormData();
        form.append('document_type', payload.document_type);

        form.append('front_image' as any, {
            uri: payload.front_image.uri,
            name: payload.front_image.name ?? 'front.jpg',
            type: payload.front_image.type ?? 'image/jpeg',
        } as any);

        if (payload.back_image) {
            form.append('back_image' as any, {
                uri: payload.back_image.uri,
                name: payload.back_image.name ?? 'back.jpg',
                type: payload.back_image.type ?? 'image/jpeg',
            } as any);
        }

        if (payload.perform_document_liveness !== undefined) {
            form.append('perform_document_liveness', String(payload.perform_document_liveness));
        }
        if (payload.minimum_age !== undefined) {
            form.append('minimum_age', String(payload.minimum_age));
        }

        const res = await apiClient.post('/api/accounts/kyc/verify/', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    // 10) POST /api/accounts/delete/
    requestDeleteAccount: async (reason?: string) => {
        const res = await apiClient.post('/api/accounts/delete/', { reason });
        return res.data;
    },

    // 11) POST /api/accounts/delete/confirm/
    confirmDeleteAccount: async (payload: { confirmation: string; code: string }) => {
        const res = await apiClient.post('/api/accounts/delete/confirm/', payload);
        return res.data;
    },
};
