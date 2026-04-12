"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { placeMinesBet } from "@/lib/api/mines";
import { getWallet } from "@/lib/api/wallet";
import { MinesResult } from "@/types/mines";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

type GameState = "IDLE" | "PLAYING" | "BUSTED" | "CASHED_OUT";

export default function MinesPage() {
  const [betAmount, setBetAmount] = useState<string>("10");
  const [minesCount, setMinesCount] = useState<number>(3);
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [balance, setBalance] = useState<number>(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [clickedTiles, setClickedTiles] = useState<number[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [gridState, setGridState] = useState<boolean[] | null>(null);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    getWallet()
      .then((res) => {
        if (res.success && res.data) {
          setBalance(parseFloat(res.data.balance));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch wallet:", err);
      });

    const token = localStorage.getItem("token");
    
    const socket = new SockJS("http://localhost:8080/ws-gaming");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        stompClient.subscribe("/user/topic/wallet", (message) => {
          try {
            const walletUpdate = JSON.parse(message.body);
            setBalance(walletUpdate.balance);
            window.dispatchEvent(new Event("walletChange"));
          } catch (err) {
            console.error("Failed to parse wallet update:", err);
          }
        });

        stompClient.subscribe("/user/topic/game-results", (message) => {
          try {
            const gameResult = JSON.parse(message.body);
            
            if (gameResult.gameType === "MINES") {
              handleGameResult(gameResult);
            }
            
            setIsProcessing(false);
          } catch (err) {
            console.error("Failed to parse game result:", err);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current?.active) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  const handleGameResult = (result: MinesResult) => {
    if (result.isBust) {
      setGameState("BUSTED");
      setBalance(result.newBalance);
      setGridState(result.gridState || null);
      window.dispatchEvent(new Event("walletChange"));
      
      setTimeout(() => {
        resetGame();
      }, 3000);
    } else if (result.finalPayout || result.isWin) {
      setGameState("CASHED_OUT");
      setBalance(result.newBalance);
      setGridState(result.gridState || null);
      window.dispatchEvent(new Event("walletChange"));
      
      setTimeout(() => {
        resetGame();
      }, 3000);
    } else {
      setClickedTiles(result.clickedTiles || []);
      setCurrentMultiplier(result.currentMultiplier || 1.0);
    }
  };

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
      setCurrentMultiplier(1.0);
      setBalance(response.newBalance);
      window.dispatchEvent(new Event("walletChange"));
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
      window.dispatchEvent(new Event("walletChange"));
      setIsProcessing(false);

      setTimeout(() => {
        resetGame();
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to cash out");
      setIsProcessing(false);
    }
  };

  const resetGame = () => {
    setGameState("IDLE");
    setSessionId(null);
    setClickedTiles([]);
    setCurrentMultiplier(1.0);
    setGridState(null);
    setError("");
    setIsProcessing(false);
  };

  const getTileContent = (index: number) => {
    if (gameState === "IDLE") return "";
    
    if (gridState) {
      if (gridState[index]) {
        return "💣";
      } else if (clickedTiles.includes(index)) {
        return "💎";
      }
      return "";
    }
    
    if (clickedTiles.includes(index)) {
      return "💎";
    }
    
    return "";
  };

  const getTileClassName = (index: number) => {
    const baseClass = "aspect-square rounded-lg border-2 flex items-center justify-center text-4xl transition-all cursor-pointer";
    
    if (gameState === "IDLE") {
      return `${baseClass} bg-slate-800 border-slate-700 cursor-not-allowed`;
    }

    if (gridState) {
      if (gridState[index]) {
        return `${baseClass} bg-red-900 border-red-700`;
      } else if (clickedTiles.includes(index)) {
        return `${baseClass} bg-emerald-900 border-emerald-700`;
      }
      return `${baseClass} bg-slate-800 border-slate-700`;
    }

    if (clickedTiles.includes(index)) {
      return `${baseClass} bg-emerald-900 border-emerald-700 cursor-not-allowed`;
    }

    if (gameState === "PLAYING") {
      return `${baseClass} bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-emerald-500`;
    }

    return `${baseClass} bg-slate-800 border-slate-700 cursor-not-allowed`;
  };

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
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300">Bet Amount</label>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      disabled={isProcessing}
                      min="1"
                      step="1"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter amount"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300">Mines Count ({minesCount})</label>
                    <input
                      type="range"
                      value={minesCount}
                      onChange={(e) => setMinesCount(parseInt(e.target.value))}
                      disabled={isProcessing}
                      min="1"
                      max="24"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>1 Mine</span>
                      <span>24 Mines</span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleStartGame}
                    disabled={isProcessing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase py-3 text-lg rounded-lg transition-all"
                  >
                    {isProcessing ? "Starting..." : "Start Game"}
                  </Button>
                </>
              )}

              {gameState === "PLAYING" && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300">Current Multiplier</label>
                    <p className="text-3xl font-bold text-emerald-400">
                      {currentMultiplier.toFixed(4)}x
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300">Current Win</label>
                    <p className="text-2xl font-bold text-yellow-400">
                      ₱ {(parseFloat(betAmount) * currentMultiplier).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">Gems Found</label>
                    <p className="text-lg font-bold text-emerald-400">{clickedTiles.length} / {25 - minesCount}</p>
                  </div>

                  {error && (
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-700">
                    <button
                      onClick={handleCashOut}
                      disabled={isProcessing || clickedTiles.length === 0}
                      className="w-full py-3 px-4 rounded-lg font-semibold text-lg uppercase tracking-tight transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-yellow-600 text-white border border-yellow-500 hover:bg-yellow-700"
                    >
                      Cash Out
                    </button>
                  </div>
                </>
              )}

              {(gameState === "BUSTED" || gameState === "CASHED_OUT") && (
                <div className={`${gameState === "BUSTED" ? "bg-red-900/20 border-red-700" : "bg-emerald-900/20 border-emerald-700"} border rounded-lg p-4 space-y-2`}>
                  <p className="text-sm text-slate-300">
                    {gameState === "BUSTED" ? "Game Over - Hit a Mine!" : "Success - Cashed Out!"}
                  </p>
                  <p className={`text-2xl font-bold ${gameState === "BUSTED" ? "text-red-400" : "text-emerald-400"}`}>
                    {gameState === "BUSTED" ? "Better luck next time" : `₱ ${(parseFloat(betAmount) * currentMultiplier).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </p>
                </div>
              )}

              <p className="text-3xl font-bold text-white text-center">
                <span className="text-yellow-400">₱</span> {balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-slate-700 rounded-3xl p-8">
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 25 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleTileClick(index)}
                    disabled={isProcessing || clickedTiles.includes(index) || gameState !== "PLAYING" || gridState !== null}
                    className={getTileClassName(index)}
                  >
                    {getTileContent(index)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
