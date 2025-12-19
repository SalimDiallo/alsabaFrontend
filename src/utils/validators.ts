import { APP_CONFIG } from '@/constants/config';

// Valider un numéro de téléphone
export const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
    const cleanPhone = phone.replace(/\s/g, '');

    if (countryCode === '+212') {
        // Maroc: 9 chiffres commençant par 6 ou 7
        return /^[67]\d{8}$/.test(cleanPhone);
    } else if (countryCode === '+224') {
        // Guinée: 9 chiffres commençant par 6
        return /^6\d{8}$/.test(cleanPhone);
    }

    return false;
};

// Valider un code OTP
export const validateOTP = (otp: string): boolean => {
    return /^\d{6}$/.test(otp);
};

// Valider un montant
export const validateAmount = (
    amount: number,
    currency: 'MAD' | 'GNF'
): { isValid: boolean; error?: string } => {
    const min = APP_CONFIG.MIN_TRANSACTION_AMOUNT[currency];
    const max = APP_CONFIG.MAX_TRANSACTION_AMOUNT[currency];

    if (amount < min) {
        return {
            isValid: false,
            error: `Le montant minimum est de ${min} ${currency}`,
        };
    }

    if (amount > max) {
        return {
            isValid: false,
            error: `Le montant maximum est de ${max} ${currency}`,
        };
    }

    return { isValid: true };
};

// Valider un email
export const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}