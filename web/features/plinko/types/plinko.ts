export interface PlinkoConfig {
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface PlinkoBetRequest {
  betAmount: number;
  config: PlinkoConfig;
}

export interface PlinkoResult {
  transactionId: string;
  resultMultiplier: number;
  payout: number;
  newBalance: number;
  bucketPosition?: number;
  ballPath?: string[];
}




