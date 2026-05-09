export interface PlaceBetRequest {
  gameType: string;
  betAmount: number;
  config: {
    risk: string;
    rows: number;
  };
}

export interface PlaceBetResponse {
  transactionId: string;
  resultMultiplier: number;
  payout: number;
  newBalance: number;
}

export interface GameResult {
  transactionId: string;
  resultMultiplier: number;
  payout: number;
  newBalance: number;
  gameType: string;
  timestamp: string;
}

export interface WalletUpdate {
  userId: number;
  balance: number;
  timestamp: string;
}



