export type Currency = 'MAD' | 'GNF';

export type OfferStatus =
    | 'ACTIVE'
    | 'ACCEPTED'   // buyer a saisi son numéro
    | 'VALIDATED'  // seller a saisi son numéro
    | 'COMPLETED'
    | 'CANCELLED'
    | 'DISPUTED';

export type OfferParty = {
    name?: string;
    phone?: string; // numéro saisi pendant le flow (mock)
};

export interface Offer {
    id: string;

    // créateur de l’offre (vendeur au sens “owner”)
    userName: string;

    sendAmount: number;
    sendCurrency: Currency;

    receiveAmount: number;
    receiveCurrency: Currency;

    exchangeRate: number; // receiveCurrency par 1 sendCurrency
    status: OfferStatus;

    // flow
    buyer?: OfferParty;   // celui qui accepte
    seller?: OfferParty;  // celui qui crée (peut saisir son numéro au validate)
    disputeReason?: string;

    createdAt: string;
    updatedAt?: string;
}
