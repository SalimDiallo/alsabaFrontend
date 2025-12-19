export const API_CONFIG = {
    BASE_URL: __DEV__
        ? 'http://localhost:3000/api'
        : 'https://api.alsax.com/api',
    TIMEOUT: 30000,
    HEADERS: {
        'Content-Type': 'application/json',
    },
};

export const APP_CONFIG = {
    OTP_LENGTH: 6,
    OTP_TIMEOUT: 300, // 5 minutes en secondes
    OTP_RESEND_DELAY: 60, // 1 minute en secondes

    SUPPORTED_CURRENCIES: ['MAD', 'GNF'] as const,

    COUNTRY_CODES: {
        MOROCCO: '+212',
        GUINEA: '+224',
    } as const,

    CURRENCY_BY_COUNTRY: {
        '+212': 'MAD',
        '+224': 'GNF',
    } as const,

    CURRENCY_SYMBOLS: {
        MAD: 'DH',
        GNF: 'GNF',
    } as const,

    MIN_TRANSACTION_AMOUNT: {
        MAD: 100,
        GNF: 10000,
    } as const,

    MAX_TRANSACTION_AMOUNT: {
        MAD: 50000,
        GNF: 50000000,
    } as const,
};

export const NOTIFICATION_CONFIG = {
    PUSH_ENABLED: true,
    SMS_ENABLED: true,
};
