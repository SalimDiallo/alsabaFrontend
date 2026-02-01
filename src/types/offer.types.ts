export type OfferStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';

export interface Offer {
    id: string;
    userName: string;

    sendAmount: number;
    sendCurrency: 'MAD' | 'GNF';

    receiveAmount: number;
    receiveCurrency: 'MAD' | 'GNF';

    exchangeRate: number; // receiveCurrency par 1 sendCurrency
    status: OfferStatus;

    createdAt: string;
}
