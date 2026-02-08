export type Currency = 'MAD' | 'GNF';

// Statuts backend (source de vérité)
export type OfferStatus =
    | 'OPEN'        // Offre active (créée, pas encore acceptée)
    | 'ACCEPTED'    // Acheteur a accepté (fonds bloqués)
    | 'LOCKED'      // Vendeur a validé (escrow verrouillé)
    | 'COMPLETED'   // Transaction terminée
    | 'CANCELLED'   // Annulée
    | 'EXPIRED'     // Expirée
    | 'DISPUTE';    // En litige

export interface OfferUser {
    id: string;
    first_name?: string;
    last_name?: string;
    country_code?: string;
    kyc_status?: string;
    kyc_nationality?: string;
}

export interface Offer {
    id: string;

    // Utilisateurs (backend)
    user: OfferUser;           // A1 - créateur (vendeur)
    accepted_by?: OfferUser;   // A2 - acheteur

    // Montants réels (backend retourne des floats)
    amount_sell: number;
    currency_sell: string;
    amount_buy: number;
    currency_buy: string;
    rate: number;

    // Statut et dates
    status: OfferStatus;
    created_at: string;
    expires_at?: string;
    accepted_at?: string;

    // Confirmations bénéficiaires
    b1_confirmed: boolean;
    b2_confirmed: boolean;

    // Helpers calculés côté frontend
    userName?: string;         // first_name + last_name du user
    sendAmount?: number;       // alias amount_sell
    sendCurrency?: string;     // alias currency_sell
    receiveAmount?: number;    // alias amount_buy
    receiveCurrency?: string;  // alias currency_buy
    exchangeRate?: number;     // alias rate
}

// Payload création offre
export interface CreateOfferPayload {
    amount_sell: number;
    currency_sell: string;
    amount_buy: number;
    currency_buy: string;
    expiry_hours?: number;
    beneficiary_name?: string;
    beneficiary_phone?: string;
}

// Payload accept offre
export interface AcceptOfferPayload {
    offer_id: string;
    beneficiary_name?: string;
    beneficiary_phone?: string;
}

// Payload validate offre (vendeur)
export interface ValidateOfferPayload {
    offer_id: string;
    beneficiary_name?: string;
    beneficiary_phone?: string;
}

// Helper: normalise une offre backend en format display
export function normalizeOffer(o: Offer): Offer {
    return {
        ...o,
        userName: [o.user?.first_name, o.user?.last_name].filter(Boolean).join(' ') || 'Inconnu',
        sendAmount: o.amount_sell,
        sendCurrency: o.currency_sell,
        receiveAmount: o.amount_buy,
        receiveCurrency: o.currency_buy,
        exchangeRate: o.rate,
    };
}
