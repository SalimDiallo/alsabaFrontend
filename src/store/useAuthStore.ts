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

interface AuthStore extends AuthState {
    // Actions
    setAuth: (user: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: Partial<User>) => Promise<void>;
    initializeAuth: () => Promise<void>;
    setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,

    setAuth: async (user, token) => {
        try {
            await saveToken(token);
            await saveUser(user);
            set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
            console.error('Error setting auth:', error);
            throw error;
        }
    },

    logout: async () => {
        try {
            await clearStorage();
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
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

    initializeAuth: async () => {
        try {
            set({ isLoading: true });
            const token = await getToken();
            const user = await getUser();

            if (token && user) {
                set({ user, token, isAuthenticated: true, isLoading: false });
            } else {
                set({ user: null, token: null, isAuthenticated: false, isLoading: false });
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
    },

    setLoading: (isLoading) => {
        set({ isLoading });
    },
}));
