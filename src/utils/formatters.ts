import { CURRENCIES } from '@/constants/currencies';
import type { Currency } from '@/constants/currencies';

// Formater un montant avec la devise
export const formatCurrency = (amount: number, currency: Currency | string): string => {
    // Valeurs par défaut si la devise n'est pas connue
    const defaultConfig = { decimals: 2, symbol: currency || '?' };
    const currencyInfo = CURRENCIES[currency as Currency] ?? defaultConfig;
    
    // S'assurer que amount est un nombre valide
    const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    const formatted = safeAmount.toFixed(currencyInfo.decimals);

    if (currency === 'MAD' || currency == "GNF") {
        return `${formatted} ${currencyInfo.symbol}`;
    }

    return `${currencyInfo.symbol} ${formatted}`;
};

// Formater un numéro de téléphone
export const formatPhoneNumber = (phone: string, countryCode: string): string => {
    // Enlever le code pays si présent
    const cleanPhone = phone.replace(countryCode, '').replace(/\s/g, '');

    if (countryCode === '+212') {
        // Format marocain: +212 6XX XX XX XX
        return `${countryCode} ${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 5)} ${cleanPhone.slice(5, 7)} ${cleanPhone.slice(7)}`;
    } else if (countryCode === '+224') {
        // Format guinéen: +224 6XX XX XX XX
        return `${countryCode} ${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 5)} ${cleanPhone.slice(5, 7)} ${cleanPhone.slice(7)}`;
    }

    return `${countryCode} ${cleanPhone}`;
};

// Formater une date
export const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        return "Aujourd'hui";
    } else if (days === 1) {
        return 'Hier';
    } else if (days < 7) {
        return `Il y a ${days} jours`;
    }

    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

// Formater une heure
export const formatTime = (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Formater une date et heure complète
export const formatDateTime = (date: string | Date): string => {
    return `${formatDate(date)} à ${formatTime(date)}`;
};

// Masquer un numéro de téléphone
export const maskPhoneNumber = (phone: string): string => {
    if (phone.length < 4) return phone;
    return `****${phone.slice(-4)}`;
};
