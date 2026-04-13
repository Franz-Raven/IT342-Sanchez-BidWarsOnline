"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { placeMinesBet, checkActiveSession } from "@/lib/api/mines";
import { MinesResult } from "@/types/mines";
import { useWallet } from "@/hooks/useWallet";
import { useWebSocket } from "@/hooks/useWebSocket";
import { GameLoading } from "@/components/shared/game-loading";
import { BalanceDisplay } from "@/components/shared/balance-display";
import { MinesSessionModal } from "@/components/mines/mines-session-modal";
import { MinesGameControls } from "@/components/mines/mines-game-controls";
import { MinesGameStats } from "@/components/mines/mines-game-stats";
import { MinesResultDisplay } from "@/components/mines/mines-result-display";
import { MinesGrid } from "@/components/mines/mines-grid";

type GameState = "IDLE" | "PLAYING" | "BUSTED" | "CASHED_OUT";

export default function MinesPage() {
  const [betAmount, setBetAmount] = useState<string>("10");
  const [minesCount, setMinesCount] = useState<number>(3);
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [clickedTiles, setClickedTiles] = useState<number[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [gridState, setGridState] = useState<boolean[] | null>(null);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showActiveSessionModal, setShowActiveSessionModal] = useState<boolean>(false);
  const [activeSessionData, setActiveSessionData] = useState<MinesResult | null>(null);

  const { balance, setBalance, isLoading: walletLoading } = useWallet();

  const resetGame = useCallback(() => {
    setGameState("IDLE");
    setSessionId(null);
    setClickedTiles([]);
    setCurrentMultiplier(1.0);
    setGridState(null);
    setError("");
    setIsProcessing(false);
  }, []);

  const handleGameResult = useCallback((result: MinesResult) => {
    if (result.isBust) {
      setGameState("BUSTED");
      setBalance(result.newBalance);
      setGridState(result.gridState || null);
      
      setTimeout(() => {
        resetGame();
      }, 3000);
    } else if (result.finalPayout || result.isWin) {
      setGameState("CASHED_OUT");
      setBalance(result.newBalance);
      setGridState(result.gridState || null);
      
      setTimeout(() => {
        resetGame();
      }, 3000);
    } else {
      setClickedTiles(result.clickedTiles || []);
      setCurrentMultiplier(result.currentMultiplier || 1.0);
    }
  }, [setBalance, resetGame]);

  const { isConnected } = useWebSocket({
    gameType: "MINES",
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
        
        const token = localStorage.getItem('token');
        const cashOutData = {
          betAmount: parseFloat(betAmount),
          config: { sessionId, cashOut: true }
        };
        
        navigator.sendBeacon(
          'http://localhost:8080/api/games/mines/bet',
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
    const betAmountNum = parseFloat(betAmount);
    if (isNaN(betAmountNum) || betAmountNum <= 0) {
      setError("Please enter a valid bet amount");
      return;
    }

    if (betAmountNum > balance) {
      setError("Insufficient balance");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const response = await placeMinesBet({
        betAmount: betAmountNum,
        config: {
          minesCount: minesCount,
        },
      });

      setGameState("PLAYING");
      setSessionId(response.sessionId);
      setClickedTiles([]);
      setCurrentMultiplier(response.currentMultiplier || 1.0);
      setBalance(response.newBalance);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || "Failed to start game");
      setIsProcessing(false);
    }
  };

  const handleTileClick = async (tileIndex: number) => {
    if (isProcessing || !sessionId || clickedTiles.includes(tileIndex) || gameState !== "PLAYING") return;
    
    setIsProcessing(true);
    setError("");

    try {
      const response = await placeMinesBet({
        betAmount: parseFloat(betAmount),
        config: {
          sessionId: sessionId,
          tileIndex: tileIndex,
        },
      });

      handleGameResult(response);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || "Failed to click tile");
      setIsProcessing(false);
    }
  };

  const handleCashOut = async () => {
    if (isProcessing || !sessionId) return;
    
    setIsProcessing(true);
    setError("");

    try {
      const response = await placeMinesBet({
        betAmount: parseFloat(betAmount),
        config: {
          sessionId: sessionId,
          cashOut: true,
        },
      });

      setGameState("CASHED_OUT");
      setBalance(response.newBalance);
      setGridState(response.gridState || null);
      setIsProcessing(false);

      setTimeout(() => {
        resetGame();
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to cash out");
      setIsProcessing(false);
    }
  };

  const handleContinueSession = () => {
    if (!activeSessionData) return;
    
    setGameState("PLAYING");
    setSessionId(activeSessionData.sessionId);
    setClickedTiles(activeSessionData.clickedTiles || []);
    setCurrentMultiplier(activeSessionData.currentMultiplier || 1.0);
    setBetAmount(activeSessionData.betAmount?.toString() || '10');
    setMinesCount(activeSessionData.minesCount || 3);
    setShowActiveSessionModal(false);
    setActiveSessionData(null);
  };

  const handleCashOutSession = async () => {
    if (!activeSessionData) return;
    
    setIsProcessing(true);
    setError("");

    try {
      const response = await placeMinesBet({
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

  if (isLoading) {
    return <GameLoading gameName="Deep Sea Mines" loadingMessage="Preparing the minefield" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <main className="flex-1 max-w-[100rem] mx-auto px-6 lg:px-10 py-8 w-full">
        <Link href="/landing" className="text-xl font-bold text-white hover:text-emerald-400 transition-colors">
            ←
        </Link>
        <div className="my-8">
          <h1 className="text-5xl font-bold text-white uppercase tracking-tight">Mines</h1>
          <p className="text-slate-400 mt-2">Uncover gems while avoiding hidden mines</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              {gameState === "IDLE" && (
                <MinesGameControls
                  betAmount={betAmount}
                  minesCount={minesCount}
                  onBetAmountChange={setBetAmount}
                  onMinesCountChange={setMinesCount}
                  onStartGame={handleStartGame}
                  isProcessing={isProcessing}
                  error={error}
                />
              )}

              {gameState === "PLAYING" && (
                <MinesGameStats
                  currentMultiplier={currentMultiplier}
                  betAmount={betAmount}
                  clickedTiles={clickedTiles}
                  minesCount={minesCount}
                  error={error}
                  onCashOut={handleCashOut}
                  isProcessing={isProcessing}
                />
              )}

              {(gameState === "BUSTED" || gameState === "CASHED_OUT") && (
                <MinesResultDisplay
                  gameState={gameState}
                  betAmount={betAmount}
                  currentMultiplier={currentMultiplier}
                />
              )}

              <BalanceDisplay balance={balance} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <MinesGrid
              gameState={gameState}
              gridState={gridState}
              clickedTiles={clickedTiles}
              isProcessing={isProcessing}
              onTileClick={handleTileClick}
            />
          </div>
        </div>
      </main>

      <MinesSessionModal
        isOpen={showActiveSessionModal}
        sessionData={activeSessionData}
        isProcessing={isProcessing}
        error={error}
        onContinue={handleContinueSession}
        onCashOut={handleCashOutSession}
      />
    </div>
  );
}
