"use client";

import { useState, useCallback } from "react";
import { placePlinkoBet } from "@/lib/api/plinko";
import { PlinkoResult } from "@/types/plinko";

interface UsePlinkoGameProps {
  onResultReceived?: (result: PlinkoResult) => void;
}

export function usePlinkoGame({ onResultReceived }: UsePlinkoGameProps = {}) {
  const [betAmount, setBetAmount] = useState<string>("10");
  const [riskLevel, setRiskLevel] = useState<string>("MEDIUM");
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [latestResult, setLatestResult] = useState<PlinkoResult | null>(null);
  const [error, setError] = useState<string>("");
  const [currentBallPath, setCurrentBallPath] = useState<string[] | undefined>();
  const [currentBucketPosition, setCurrentBucketPosition] = useState<number | undefined>();

  const handleGameResult = useCallback((result: PlinkoResult) => {
    setLatestResult(result);
    setCurrentBallPath(result.ballPath);
    setCurrentBucketPosition(result.bucketPosition);
    
    if (onResultReceived) {
      onResultReceived(result);
    }

    setIsDropping(false);
  }, [onResultReceived]);

  const handleDropBall = useCallback(async (balance: number) => {
    setError("");
    
    const betAmountNum = parseFloat(betAmount);
    
    if (isNaN(betAmountNum) || betAmountNum <= 0) {
      setError("Bet amount must be greater than 0");
      return false;
    }

    if (betAmountNum > balance) {
      setError("Insufficient balance");
      return false;
    }

    setIsDropping(true);
    setCurrentBallPath(undefined);
    setCurrentBucketPosition(undefined);

    try {
      const response = await placePlinkoBet({
        betAmount: betAmountNum,
        config: {
          risk: riskLevel as 'LOW' | 'MEDIUM' | 'HIGH',
        },
      });

      handleGameResult(response);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to place bet");
      setIsDropping(false);
      return false;
    }
  }, [betAmount, riskLevel, handleGameResult]);

  const clearResult = useCallback(() => {
    setCurrentBallPath(undefined);
    setCurrentBucketPosition(undefined);
  }, []);

  return {
    betAmount,
    setBetAmount,
    riskLevel,
    setRiskLevel,
    isDropping,
    latestResult,
    error,
    currentBallPath,
    currentBucketPosition,
    handleDropBall,
    handleGameResult,
    clearResult,
  };
}
