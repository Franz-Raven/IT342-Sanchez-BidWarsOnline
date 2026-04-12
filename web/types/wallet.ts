export interface Wallet {
  id: number;
  userId: number;
  balance: string; // Use string to avoid JS float issues
  currency: string;
  lastUpdated: string;
}

export interface WalletResponse {
  success: boolean;
  data: Wallet;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}
