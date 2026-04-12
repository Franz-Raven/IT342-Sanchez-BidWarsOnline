export interface Card {
  rank: string;
  suit: string;
  value: number;
}

export interface HiloConfig {
  prediction?: 'HIGHER' | 'LOWER';
  sessionId?: number;
  cashOut?: boolean;
}

export interface HiloBetRequest {
  betAmount: number;
  config: HiloConfig;
}

export interface HiloResult {
  sessionId: number;
  currentCardRank: string;
  currentCardSuit: string;
  currentCardValue: number;
  currentPot?: number;
  streakCount?: number;
  higherProbability?: number;
  lowerProbability?: number;
  isCorrect?: boolean;
  isBust?: boolean;
  finalPayout?: number;
  newBalance: number;
  status: string;
}
