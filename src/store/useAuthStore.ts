// src/store/useAuthStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/services/api/authService';
import { AuthState, User } from '@/types/auth.types';
import { saveToken, saveUser, getToken, getUser, clearStorage } from '@/services/storage/asyncStorage';

const REFRESH_TOKEN_KEY = '@alsax_refresh_token';

interface AuthStore extends AuthState {
    isBootstrapping: boolean;

    setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: Partial<User>) => Promise<void>;
    initializeAuth: () => Promise<void>;
    setLoading: (isLoading: boolean) => void;
    updateTokens: (accessToken: string, refreshToken?: string) => Promise<void>;
    setKycStatus: (status: User['kyc_status']) => Promise<void>;

    refreshProfile: () => Promise<User | null>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,

    // ✅ IMPORTANT
    isBootstrapping: true,
    isLoading: false,

    setAuth: async (user, accessToken, refreshToken) => {
        await saveToken(accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        await saveUser(user);
        set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isBootstrapping: false,
            isLoading: false,
        });
    },

    logout: async () => {
        const { refreshToken } = get();
        // Blackliste les tokens côté serveur avant de les effacer localement
        if (refreshToken) {
            await authService.logout(refreshToken);
        }
        await clearStorage();
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isBootstrapping: false,
            isLoading: false,
        });
    },

    updateUser: async (userData) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const updatedUser = { ...currentUser, ...userData };
        await saveUser(updatedUser);
        set({ user: updatedUser });
    },

    setKycStatus: async (kycStatus) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const updatedUser = { ...currentUser, kyc_status: kycStatus };
        await saveUser(updatedUser);
        set({ user: updatedUser });
    },

    updateTokens: async (accessToken, refreshToken) => {
        await saveToken(accessToken);
        if (refreshToken) {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
            set({ token: accessToken, refreshToken });
        } else {
            set({ token: accessToken });
        }
    },

    // ✅ Boot uniquement
    initializeAuth: async () => {
        try {
            set({ isBootstrapping: true });

            const token = await getToken();
            const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
            const user = await getUser();

            if (token && user) {
                set({
                    user,
                    token,
                    refreshToken,
                    isAuthenticated: true,
                    isBootstrapping: false,
                });
            } else {
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isBootstrapping: false,
                });
            }
        } catch (e) {
            set({
                user: null,
                token: null,
                refreshToken: null,
                isAuthenticated: false,
                isBootstrapping: false,
            });
        }
    },

    // ✅ Action loading (ne doit plus casser la navigation)
    refreshProfile: async () => {
        try {
            set({ isLoading: true });
            const res = await authService.getProfile();
            await saveUser(res.user);
            set({ user: res.user });
            return res.user;
        } catch (e) {
            return null;
        } finally {
            set({ isLoading: false });
        }
    },

    setLoading: (isLoading) => set({ isLoading }),
}));
