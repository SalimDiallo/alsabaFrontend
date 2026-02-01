import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type KycStatus = 'unverified' | 'pending' | 'approved' | 'rejected';
export type KycDocumentType = 'passport' | 'id_card' | 'driver_license';

export type ProfileMock = {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    country_code: string;

    // Photo (mock)
    avatarUri?: string | null;

    // KYC
    kyc_status: KycStatus;
    kyc_document_type?: KycDocumentType | null;
    kyc_date_of_birth?: string | null; // YYYY-MM-DD
    kyc_nationality?: string | null;
    kyc_submitted_at?: string | null;
    kyc_verified_at?: string | null;
    kyc_retry_count?: number;
};

const now = () => new Date().toISOString();

type ProfileMockState = {
    profile: ProfileMock;

    updateProfile: (patch: Partial<ProfileMock>) => void;

    // Photo
    setAvatar: (uri: string | null) => void;

    // KYC actions (mock)
    submitKyc: (payload: {
        documentType: KycDocumentType;
        dateOfBirth: string; // YYYY-MM-DD
        nationality: string;
    }) => void;

    setKycStatus: (status: KycStatus) => void;

    resetProfileMock: () => void;
};

const initialProfile: ProfileMock = {
    first_name: 'Utilisateur',
    last_name: 'ALSABA',
    email: '',
    phone_number: '710914717',
    country_code: '+212',

    avatarUri: null,

    kyc_status: 'unverified',
    kyc_document_type: null,
    kyc_date_of_birth: null,
    kyc_nationality: null,
    kyc_submitted_at: null,
    kyc_verified_at: null,
    kyc_retry_count: 0,
};

export const useProfileMock = create<ProfileMockState>()(
    persist(
        (set, get) => ({
            profile: initialProfile,

            updateProfile: (patch) => {
                set({ profile: { ...get().profile, ...patch } });
            },

            setAvatar: (uri) => {
                set({ profile: { ...get().profile, avatarUri: uri } });
            },

            submitKyc: ({ documentType, dateOfBirth, nationality }) => {
                const p = get().profile;
                const retries = (p.kyc_retry_count ?? 0) + (p.kyc_status === 'rejected' ? 1 : 0);

                set({
                    profile: {
                        ...p,
                        kyc_document_type: documentType,
                        kyc_date_of_birth: dateOfBirth,
                        kyc_nationality: nationality,
                        kyc_submitted_at: now(),
                        kyc_verified_at: null,
                        kyc_status: 'pending',
                        kyc_retry_count: retries,
                    },
                });
            },

            setKycStatus: (status) => {
                const p = get().profile;
                set({
                    profile: {
                        ...p,
                        kyc_status: status,
                        kyc_verified_at: status === 'approved' ? now() : p.kyc_verified_at,
                    },
                });
            },

            resetProfileMock: () => set({ profile: initialProfile }),
        }),
        {
            name: '@alsaba_profile_mock',
            storage: createJSONStorage(() => AsyncStorage),
            version: 1,
        }
    )
);
