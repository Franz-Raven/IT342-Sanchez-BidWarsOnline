"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { placeHiloBet, checkActiveSession } from "@/lib/api/hilo";
import { HiloResult } from "@/types/hilo";
import { useWallet } from "@/hooks/useWallet";
import { useWebSocket } from "@/hooks/useWebSocket";
import { HiloSessionModal } from "@/components/hilo/hilo-session-modal";
import { HiloGameControls } from "@/components/hilo/hilo-game-controls";
import { HiloGameStats } from "@/components/hilo/hilo-game-stats";
import { HiloPlayingCard } from "@/components/hilo/hilo-playing-card";
import { HiloMultiplierDisplay } from "@/components/hilo/hilo-multiplier-display";
import { HiloGameButtons } from "@/components/hilo/hilo-game-buttons";
import { HiloResultDisplay } from "@/components/hilo/hilo-result-display";
import { GameLoading } from "@/components/shared/game-loading";
import { BalanceDisplay } from "@/components/shared/balance-display";

type GameState = "IDLE" | "PLAYING" | "BUSTED" | "CASHED_OUT";

export default function HiLoPage() {
  const [betAmount, setBetAmount] = useState<string>("10");
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentCardRank, setCurrentCardRank] = useState<string | null>(null);
  const [currentCardSuit, setCurrentCardSuit] = useState<string | null>(null);
  const [currentCardValue, setCurrentCardValue] = useState<number | null>(null);
  const [currentPot, setCurrentPot] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [higherProbability, setHigherProbability] = useState<number | null>(null);
  const [lowerProbability, setLowerProbability] = useState<number | null>(null);
  const [higherMultiplier, setHigherMultiplier] = useState<number | null>(null);
  const [lowerMultiplier, setLowerMultiplier] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [flipCard, setFlipCard] = useState<boolean>(false);
  const [showActiveSessionModal, setShowActiveSessionModal] = useState<boolean>(false);
  const [activeSessionData, setActiveSessionData] = useState<HiloResult | null>(null);

  const { balance, setBalance, isLoading: walletLoading } = useWallet();

  const resetGame = useCallback(() => {
    setGameState("IDLE");
    setSessionId(null);
    setCurrentCardRank(null);
    setCurrentCardSuit(null);
    setCurrentCardValue(null);
    setCurrentPot(0);
    setStreakCount(0);
    setHigherProbability(null);
    setLowerProbability(null);
    setHigherMultiplier(null);
    setLowerMultiplier(null);
    setFlipCard(false);
    setError("");
    setIsProcessing(false);
  }, []);

  const handleGameResult = useCallback((result: HiloResult) => {
    setFlipCard(true);
    
    setTimeout(() => {
      if (result.isBust) {
        setGameState("BUSTED");
        setBalance(result.newBalance);
        setCurrentCardRank(result.currentCardRank);
        setCurrentCardSuit(result.currentCardSuit);
        
        setTimeout(() => {
          resetGame();
        }, 2000);
      } else if (result.finalPayout) {
        setGameState("CASHED_OUT");
        setBalance(result.newBalance);
        setCurrentPot(result.finalPayout);
        
        setTimeout(() => {
          resetGame();
        }, 2000);
      } else {
        setGameState("PLAYING");
        setCurrentCardRank(result.currentCardRank);
        setCurrentCardSuit(result.currentCardSuit);
        setCurrentCardValue(result.currentCardValue);
        setCurrentPot(result.currentPot || 0);
        setStreakCount(result.streakCount || 0);
        setHigherProbability(result.higherProbability || null);
        setLowerProbability(result.lowerProbability || null);
        setHigherMultiplier(result.higherProbability ? 1 / result.higherProbability : null);
        setLowerMultiplier(result.lowerProbability ? 1 / result.lowerProbability : null);
        setFlipCard(false);
      }
    }, 600);
  }, [setBalance, resetGame]);

  const { isConnected } = useWebSocket({
    gameType: "HILO",
    onGameResult: handleGameResult,
    onWalletUpdate: setBalance,
  });

  const isLoading = walletLoading || !isConnected;

  useEffect(() => {
    if (!isLoading) {
      checkActiveSession()
        .then((result) => {
          if (result.hasActiveSession && result.session) {
            setActiveSessionData(result.session);
            setShowActiveSessionModal(true);
          }
        })
        .catch((err) => {
          console.error("Failed to check active session:", err);
        });
    }
  }, [isLoading]);

  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (sessionId && gameState === "PLAYING") {
        e.preventDefault();
        e.returnValue = '';
        
        const cashOutData = {
          betAmount: parseFloat(betAmount),
          config: { sessionId, cashOut: true }
        };
        
        navigator.sendBeacon(
          'http://localhost:8080/api/games/hilo/bet',
          new Blob([JSON.stringify(cashOutData)], {
            type: 'application/json'
          })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionId, gameState, betAmount]);

  const handleStartGame = async () => {
    setError("");
    
    const betAmountNum = parseFloat(betAmount);
    
    if (isNaN(betAmountNum) || betAmountNum <= 0) {
      setError("Bet amount must be greater than 0");
      return;
    }

    if (betAmountNum > balance) {
      setError("Insufficient balance");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await placeHiloBet({
        betAmount: betAmountNum,
        config: {},
      });

      setGameState("PLAYING");
      setSessionId(response.sessionId);
      setCurrentCardRank(response.currentCardRank);
      setCurrentCardSuit(response.currentCardSuit);
      setCurrentCardValue(response.currentCardValue);
      setCurrentPot(response.currentPot || betAmountNum);
      setStreakCount(response.streakCount || 0);
      setHigherProbability(response.higherProbability || null);
      setLowerProbability(response.lowerProbability || null);
      setHigherMultiplier(response.higherProbability ? 1 / response.higherProbability : null);
      setLowerMultiplier(response.lowerProbability ? 1 / response.lowerProbability : null);
      setBalance(response.newBalance);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || "Failed to start game");
      setIsProcessing(false);
    }
  };

  const handleGuess = async (prediction: "HIGHER" | "LOWER") => {
    if (isProcessing || !sessionId) return;
    
    setIsProcessing(true);
    setError("");

    try {
      const response = await placeHiloBet({
        betAmount: parseFloat(betAmount),
        config: {
          prediction: prediction,
          sessionId: sessionId,
        },
      });

      handleGameResult(response);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || "Failed to make guess");
      setIsProcessing(false);
    }
  };

  const handleCashOut = async () => {
    if (isProcessing || !sessionId) return;
    
    setIsProcessing(true);
    setError("");

    try {
      const response = await placeHiloBet({
        betAmount: parseFloat(betAmount),
        config: {
          cashOut: true,
          sessionId: sessionId,
        },
      });

      setGameState("CASHED_OUT");
      setBalance(response.newBalance);
      setCurrentPot(response.finalPayout || 0);
      setIsProcessing(false);

      setTimeout(() => {
        resetGame();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to cash out");
      setIsProcessing(false);
    }
  };

  const handleContinueSession = () => {
    if (!activeSessionData) return;
    
    setGameState("PLAYING");
    setSessionId(activeSessionData.sessionId);
    setCurrentCardRank(activeSessionData.currentCardRank);
    setCurrentCardSuit(activeSessionData.currentCardSuit);
    setCurrentCardValue(activeSessionData.currentCardValue);
    setCurrentPot(activeSessionData.currentPot || 0);
    setStreakCount(activeSessionData.streakCount || 0);
    setHigherProbability(activeSessionData.higherProbability || null);
    setLowerProbability(activeSessionData.lowerProbability || null);
    setHigherMultiplier(activeSessionData.higherProbability ? 1 / activeSessionData.higherProbability : null);
    setLowerMultiplier(activeSessionData.lowerProbability ? 1 / activeSessionData.lowerProbability : null);
    setBetAmount(activeSessionData.betAmount?.toString() || '10');
    setShowActiveSessionModal(false);
    setActiveSessionData(null);
  };

  const handleCashOutSession = async () => {
    if (!activeSessionData) return;
    
    setIsProcessing(true);
    setError("");

    try {
      const response = await placeHiloBet({
        betAmount: activeSessionData.betAmount || 0,
        config: {
          sessionId: activeSessionData.sessionId,
          cashOut: true,
        },
      });

      setBalance(response.newBalance);
      setShowActiveSessionModal(false);
      setActiveSessionData(null);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || "Failed to cash out");
      setIsProcessing(false);
    }
  };

  const getSuitSymbol = (suit: string) => {
    const suits: { [key: string]: string } = {
      hearts: "♥",
      diamonds: "♦",
      clubs: "♣",
      spades: "♠",
    };
    return suits[suit.toLowerCase()] || "";
  };

  const getSuitColor = (suit: string) => {
    return suit.toLowerCase() === "hearts" || suit.toLowerCase() === "diamonds"
      ? "text-red-500"
      : "text-slate-900";
  };

  if (isLoading) {
    return <GameLoading gameName="Neon Hi-Lo" loadingMessage="Shuffling the deck" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <main className="flex-1 max-w-[100rem] mx-auto px-6 lg:px-10 py-8 w-full">
        <Link href="/landing" className="text-xl font-bold text-white hover:text-emerald-400 transition-colors">
          ←
        </Link>
        <div className="my-8">
          <h1 className="text-5xl font-bold text-white uppercase tracking-tight">Hi-Lo</h1>
          <p className="text-slate-400 mt-2">Predict if the next card is higher or lower</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              {gameState === "IDLE" && (
                <HiloGameControls
                  betAmount={betAmount}
                  onBetAmountChange={setBetAmount}
                  onStartGame={handleStartGame}
                  isProcessing={isProcessing}
                  error={error}
                />
              )}

              {gameState === "PLAYING" && (
                <HiloGameStats
                  currentPot={currentPot}
                  streakCount={streakCount}
                  error={error}
                  onCashOut={handleCashOut}
                  isProcessing={isProcessing}
                />
              )}

              {(gameState === "BUSTED" || gameState === "CASHED_OUT") && (
                <HiloResultDisplay
                  gameState={gameState}
                  currentPot={currentPot}
                />
              )}

              <BalanceDisplay balance={balance} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900 border-2 border-slate-700 rounded-3xl aspect-[16/10] flex flex-col items-center justify-center overflow-hidden p-8">
              <HiloPlayingCard
                cardRank={currentCardRank}
                cardSuit={currentCardSuit}
                flipCard={flipCard}
                getSuitSymbol={getSuitSymbol}
                getSuitColor={getSuitColor}
              />
              
              {gameState === "PLAYING" && higherMultiplier !== null && lowerMultiplier !== null && (
                <>
                  <HiloMultiplierDisplay
                    higherMultiplier={higherMultiplier}
                    lowerMultiplier={lowerMultiplier}
                  />
                  
                  <HiloGameButtons
                    onHigher={() => handleGuess("HIGHER")}
                    onLower={() => handleGuess("LOWER")}
                    isProcessing={isProcessing}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <HiloSessionModal
        isOpen={showActiveSessionModal}
        sessionData={activeSessionData}
        isProcessing={isProcessing}
        error={error}
        onContinue={handleContinueSession}
        onCashOut={handleCashOutSession}
        getSuitSymbol={getSuitSymbol}
      />
    </div>
  );
}
