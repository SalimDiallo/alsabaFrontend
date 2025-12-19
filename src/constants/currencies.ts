export type Currency = 'MAD' | 'GNF';
export type CountryCode = '+212' | '+224';

export interface CurrencyInfo {
    code: Currency;
    name: string;
    symbol: string;
    country: string;
    countryCode: CountryCode;
    flag: string;
    decimals: number;
}

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
    MAD: {
        code: 'MAD',
        name: 'Dirham Marocain',
        symbol: 'DH',
        country: 'Maroc',
        countryCode: '+212',
        flag: '🇲🇦',
        decimals: 2,
    },
    GNF: {
        code: 'GNF',
        name: 'Franc Guinéen',
        symbol: 'GNF',
        country: 'Guinée',
        countryCode: '+224',
        flag: '🇬🇳',
        decimals: 0,
    },
};

// ==========================================
// 4. src/types/auth.types.ts
// ==========================================
export interface User {
    id: string;
    phoneNumber: string;
    countryCode: string;
    currency: 'MAD' | 'GNF';
    firstName?: string;
    lastName?: string;
    email?: string;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginRequest {
    phoneNumber: string;
    countryCode: string;
}

export interface RegisterRequest extends LoginRequest {
    firstName?: string;
    lastName?: string;
}

export interface OTPVerifyRequest {
    phoneNumber: string;
    countryCode: string;
    otp: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    message?: string;
}

export interface OTPResponse {
    success: boolean;
    message: string;
    expiresAt: string;
}
