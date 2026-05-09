export interface MinesConfig {
  sessionId?: number;
  tileIndex?: number;
  minesCount?: number;
  cashOut?: boolean;
}

export interface MinesBetRequest {
  betAmount: number;
  config: MinesConfig;
}

export interface MinesResult {
  sessionId: number;
  minesCount: number;
  clickedTiles: number[];
  currentMultiplier: number;
  isBust?: boolean;
  isWin?: boolean;
  gridState?: boolean[];
  finalPayout?: number;
  newBalance: number;
  status: string;
  betAmount?: number;
}




