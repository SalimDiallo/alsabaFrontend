export interface Wallet {
    id: string;
    userId: string;
    currency: 'MAD' | 'GNF';
    balance: number;
    availableBalance: number;
    pendingBalance: number;
    createdAt: string;
    updatedAt: string;
}

export interface FundWalletRequest {
    amount: number;
    paymentMethod: 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER';
}
