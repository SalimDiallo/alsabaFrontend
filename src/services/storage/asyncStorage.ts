import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    TOKEN: '@alsax_token',
    USER: '@alsax_user',
    LANGUAGE: '@alsax_language',
    ONBOARDING_COMPLETED: '@alsax_onboarding',
} as const;

// Token Management
export const saveToken = async (token: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(KEYS.TOKEN, token);
    } catch (error) {
        console.error('Error saving token:', error);
        throw error;
    }
};

export const getToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(KEYS.TOKEN);
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

export const removeToken = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(KEYS.TOKEN);
    } catch (error) {
        console.error('Error removing token:', error);
        throw error;
    }
};

// User Management
export const saveUser = async (user: any): Promise<void> => {
    try {
        await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (error) {
        console.error('Error saving user:', error);
        throw error;
    }
};

export const getUser = async (): Promise<any | null> => {
    try {
        const user = await AsyncStorage.getItem(KEYS.USER);
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};

export const removeUser = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(KEYS.USER);
    } catch (error) {
        console.error('Error removing user:', error);
        throw error;
    }
};

// Clear all data
export const clearStorage = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]);
    } catch (error) {
        console.error('Error clearing storage:', error);
        throw error;
    }
};
