export interface Offer {
    id: string;
    userId: string;
    userName: string;
    sendAmount: number;
    sendCurrency: 'MAD' | 'GNF';
    receiveAmount: number;
    receiveCurrency: 'MAD' | 'GNF';
    exchangeRate: number;
    status: 'ACTIVE' | 'MATCHED' | 'COMPLETED' | 'CANCELLED';
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOfferRequest {
    sendAmount: number;
    sendCurrency: 'MAD' | 'GNF';
    receiveCurrency: 'MAD' | 'GNF';
    exchangeRate?: number;
}

export interface MatchOfferRequest {
    offerId: string;
}