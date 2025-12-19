export type TransactionStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED';

export type TransactionType =
    | 'DEPOSIT'
    | 'WITHDRAWAL'
    | 'EXCHANGE'
    | 'REFUND';

export interface Transaction {
    id: string;
    userId: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    currency: 'MAD' | 'GNF';
    fee: number;
    netAmount: number;
    fromCurrency?: 'MAD' | 'GNF';
    toCurrency?: 'MAD' | 'GNF';
    exchangeRate?: number;
    offerId?: string;
    reference: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

export interface CreateTransactionRequest {
    offerId: string;
    recipientPhone?: string;
}
