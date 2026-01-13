import { create } from 'zustand';
import { AuthState, User } from '@/types/auth.types';
import {
    saveToken,
    removeToken,
    saveUser,
    getToken,
    getUser,
    clearStorage
} from '@/services/storage/asyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REFRESH_TOKEN_KEY = '@alsax_refresh_token';

interface AuthStore extends AuthState {
    // Actions
    setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: Partial<User>) => Promise<void>;
    initializeAuth: () => Promise<void>;
    setLoading: (isLoading: boolean) => void;
    updateTokens: (accessToken: string, refreshToken?: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,

    setAuth: async (user, accessToken, refreshToken) => {
        try {
            await saveToken(accessToken);
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
            await saveUser(user);
            set({ 
                user, 
                token: accessToken, 
                refreshToken,
                isAuthenticated: true, 
                isLoading: false 
            });
        } catch (error) {
            console.error('Error setting auth:', error);
            throw error;
        }
    },

    logout: async () => {
        try {
            await clearStorage();
            await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
            set({ 
                user: null, 
                token: null, 
                refreshToken: null,
                isAuthenticated: false, 
                isLoading: false 
            });
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    },

    updateUser: async (userData) => {
        try {
            const currentUser = get().user;
            if (!currentUser) return;

            const updatedUser = { ...currentUser, ...userData };
            await saveUser(updatedUser);
            set({ user: updatedUser });
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    updateTokens: async (accessToken, refreshToken) => {
        try {
            await saveToken(accessToken);
            if (refreshToken) {
                await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
                set({ token: accessToken, refreshToken });
            } else {
                set({ token: accessToken });
            }
        } catch (error) {
            console.error('Error updating tokens:', error);
            throw error;
        }
    },

    initializeAuth: async () => {
        try {
            set({ isLoading: true });
            const token = await getToken();
            const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
            const user = await getUser();

            if (token && user) {
                set({ 
                    user, 
                    token, 
                    refreshToken,
                    isAuthenticated: true, 
                    isLoading: false 
                });
            } else {
                set({ 
                    user: null, 
                    token: null, 
                    refreshToken: null,
                    isAuthenticated: false, 
                    isLoading: false 
                });
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
            set({ 
                user: null, 
                token: null, 
                refreshToken: null,
                isAuthenticated: false, 
                isLoading: false 
            });
        }
    },

    setLoading: (isLoading) => {
        set({ isLoading });
    },
}));
