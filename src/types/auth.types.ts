// =====================================================
// Types correspondant au backend Django ALSABA
// =====================================================

export interface User {
    id: string;
    // Téléphone
    full_phone_number: string;
    phone_number: string;
    country_code: string;
    phone_verified: boolean;
    phone_verified_at?: string;

    // Infos personnelles
    first_name?: string;
    last_name?: string;
    email?: string;
    city?: string;
    postal_code?: string;
    state?: string;

    // KYC
    kyc_status: 'unverified' | 'pending' | 'verified' | 'rejected';
    kyc_verified_at?: string;
    kyc_submitted_at?: string;
    kyc_retry_count?: number;
    kyc_document_type?: string;
    kyc_date_of_birth?: string;
    kyc_nationality?: string;

    // Métadonnées
    carrier?: string;
    is_disposable?: boolean;
    is_voip?: boolean;
    date_joined: string;
    last_login?: string;
    is_active: boolean;

    // Alias pour compatibilité
    is_verified?: boolean;  // Alias pour phone_verified
    currency?: 'MAD' | 'GNF';
    created_at?: string;
    updated_at?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;        // pour actions courantes (profil, etc.)
    isBootstrapping?: boolean; // pour l'initialisation au démarrage
}


// =====================================================
// Requests
// =====================================================

// POST /auth/phone/ - Demande OTP
export interface PhoneAuthRequest {
    phone_number: string;
    country_code: string;
}

// POST /auth/verify/ - Vérification OTP
export interface OTPVerifyRequest {
    phone_number: string;  // Format E.164 complet
    code: string;
    session_key: string;
}

// POST /auth/refresh/ - Rafraîchir le token
export interface RefreshTokenRequest {
    refresh: string;
}

// POST /account/delete/ - Demande suppression
export interface DeleteAccountRequest {
    reason?: string;
}

// POST /account/delete/confirm/ - Confirmer suppression
export interface DeleteAccountConfirmRequest {
    code: string;
    session_key: string;
}

// =====================================================
// Responses
// =====================================================

// Réponse de demande OTP - POST /auth/phone/
export interface OTPResponse {
    success: boolean;
    action: 'login' | 'register';
    message: string;
    session_key: string;
    request_id: string;
    phone_number: string;
    user_exists: boolean;
    expires_in: number;
    metadata: {
        code_size: number;
        channel: string;
        max_attempts: number;
    };
    user?: {
        id: string;
        kyc_status: string;
        phone_verified: boolean;
    };
}

// Réponse de vérification OTP (authentification réussie) - POST /auth/verify/
export interface AuthResponse {
    success: boolean;
    action: 'login' | 'register';
    message: string;
    user: User;
    auth: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        token_type: string;
    };
    kyc_info: {
        status: string;
        required: boolean;
        next_step: string;
    };
    otp_verified: boolean;
    metadata: {
        verified_at: string;
        verification_method: string;
    };
}

// Réponse du statut de session
export interface SessionStatusResponse {
    status: 'pending' | 'verified' | 'expired';
    phone_number: string;
    expires_at: string;
}

// Réponse de rafraîchissement du token
export interface RefreshTokenResponse {
    access: string;
    refresh?: string;  // Optionnel si rotation des tokens
}

// Réponse du profil (GET retourne { success, profile, metadata }, PATCH retourne { success, message, profile })
export interface ProfileResponse {
    success?: boolean;
    user?: User;    // utilisé par authService.getProfile() qui mappe sur res.data
    profile?: User; // utilisé par profileService (backend retourne "profile")
    message?: string;
    metadata?: {
        retrieved_at?: string;
        requires_kyc?: boolean;
    };
}

// Réponse de demande de suppression
export interface DeleteRequestResponse {
    success: boolean;
    message: string;
    session_key: string;
}

// Réponse d'erreur API
export interface ApiErrorResponse {
    error?: string;
    message?: string;
    detail?: string;
    code?: string;
}

export interface ProfileUpdatePayload {
    photoUri?: string;
    address?: string;
    city?: string;
    country?: string;
    date_of_birth?: string; // ISO: "1999-12-31"
    currency?: 'MAD' | 'GNF';
}

// =====================================================
// Legacy types (pour compatibilité)
// =====================================================

export interface LoginRequest extends PhoneAuthRequest { }

export interface RegisterRequest extends PhoneAuthRequest {
    first_name?: string;
    last_name?: string;
}
