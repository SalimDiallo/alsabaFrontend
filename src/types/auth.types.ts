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
