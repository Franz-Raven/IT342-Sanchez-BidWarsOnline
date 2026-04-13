"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { placeHiloBet } from "@/lib/api/hilo";
import { getWallet } from "@/lib/api/wallet";
import { HiloResult } from "@/types/hilo";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Loader2 } from "lucide-react";

type GameState = "IDLE" | "PLAYING" | "BUSTED" | "CASHED_OUT";

export default function HiLoPage() {
  const [betAmount, setBetAmount] = useState<string>("10");
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [balance, setBalance] = useState<number>(0);
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    let walletLoaded = false;
    let wsConnected = false;

    const checkLoading = () => {
      if (walletLoaded && wsConnected) {
        setIsLoading(false);
      }
    };

    getWallet()
      .then((res) => {
        if (res.success && res.data) {
          setBalance(parseFloat(res.data.balance));
        }
        walletLoaded = true;
        checkLoading();
      })
      .catch((err) => {
        console.error("Failed to fetch wallet:", err);
        walletLoaded = true;
        checkLoading();
      });

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
      } catch (err) {
        console.error("Failed to parse user data");
      }
    }

    const socket = new SockJS("http://localhost:8080/ws-gaming");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        console.log("WebSocket connected");
        wsConnected = true;
        checkLoading();
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
            
            if (gameResult.gameType === "HILO") {
              handleGameResult(gameResult);
            }
            
            setIsProcessing(false);
          } catch (err) {
            console.error("Failed to parse game result:", err);
            setIsProcessing(false);
          }
        });
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected");
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

  const handleGameResult = (result: HiloResult) => {
    setFlipCard(true);
    
    setTimeout(() => {
      if (result.isBust) {
        setGameState("BUSTED");
        setBalance(result.newBalance);
        setCurrentCardRank(result.currentCardRank);
        setCurrentCardSuit(result.currentCardSuit);
        window.dispatchEvent(new Event("walletChange"));
        
        setTimeout(() => {
          resetGame();
        }, 2000);
      } else if (result.finalPayout) {
        setGameState("CASHED_OUT");
        setBalance(result.newBalance);
        setCurrentPot(result.finalPayout);
        window.dispatchEvent(new Event("walletChange"));
        
        setTimeout(() => {
          resetGame();
        }, 2000);
      } else {
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
  };

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
      window.dispatchEvent(new Event("walletChange"));
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
      window.dispatchEvent(new Event("walletChange"));
      setIsProcessing(false);

      setTimeout(() => {
        resetGame();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to cash out");
      setIsProcessing(false);
    }
  };

  const resetGame = () => {
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
          <p className="text-white font-bold text-2xl">Loading Neon Hi-Lo...</p>
          <p className="text-slate-400 text-sm">Shuffling the deck</p>
        </div>
      </div>
    );
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
                    <label className="block text-sm font-semibold text-slate-300">Current Pot</label>
                    <p className="text-3xl font-bold text-emerald-400">
                      ₱ {currentPot.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">Streak</label>
                    <p className="text-lg font-bold text-yellow-400">{streakCount} wins in a row</p>
                  </div>

                  {error && (
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-700">
                    <button
                      onClick={handleCashOut}
                      disabled={isProcessing}
                      className="w-full py-3 px-4 rounded-lg font-semibold text-lg uppercase tracking-tight transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-yellow-600 text-white border border-yellow-500 hover:bg-yellow-700"
                    >
                      Collect (Cash Out)
                    </button>
                  </div>
                </>
              )}

              {(gameState === "BUSTED" || gameState === "CASHED_OUT") && (
                <div className={`${gameState === "BUSTED" ? "bg-red-900/20 border-red-700" : "bg-emerald-900/20 border-emerald-700"} border rounded-lg p-4 space-y-2`}>
                  <p className="text-sm text-slate-300">
                    {gameState === "BUSTED" ? "Game Over - Bust!" : "Success - Cashed Out!"}
                  </p>
                  <p className={`text-2xl font-bold ${gameState === "BUSTED" ? "text-red-400" : "text-emerald-400"}`}>
                    {gameState === "BUSTED" ? "Better luck next time" : `₱ ${currentPot.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </p>
                </div>
              )}

              <p className="text-3xl font-bold text-white text-center">
                <span className="text-yellow-400">₱</span> {balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900 border-2 border-slate-700 rounded-3xl aspect-[16/10] flex flex-col items-center justify-center overflow-hidden p-8">
              {!currentCardRank ? (
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-500 mb-4">Place your bet to start</p>
                  <p className="text-sm text-slate-600">Draw a card and predict the next!</p>
                </div>
              ) : (
                <>
                  <div className="relative flex items-center justify-center">
                    <div className={`card-container ${flipCard ? "flip" : ""}`}>
                      <div className="card bg-white rounded-2xl shadow-2xl w-48 h-72 flex flex-col items-center justify-center border-4 border-slate-800">
                        <div className={`text-6xl font-bold ${getSuitColor(currentCardSuit || "")}`}>
                          {currentCardRank}
                        </div>
                        <div className={`text-8xl mt-4 ${getSuitColor(currentCardSuit || "")}`}>
                          {getSuitSymbol(currentCardSuit || "")}
                        </div>
                        <div className={`text-6xl font-bold mt-4 ${getSuitColor(currentCardSuit || "")}`}>
                          {currentCardRank}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {gameState === "PLAYING" && higherMultiplier !== null && lowerMultiplier !== null && (
                    <>
                      <div className="mt-8 bg-slate-800/50 border border-slate-600 rounded-lg p-4 text-center w-full max-w-md">
                        <p className="text-sm text-slate-400 mb-2">Current Multipliers</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-emerald-400 mb-1">Higher</p>
                            <p className="text-2xl font-bold text-emerald-400">
                              {higherMultiplier.toFixed(2)}x
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-red-400 mb-1">Lower</p>
                            <p className="text-2xl font-bold text-red-400">
                              {lowerMultiplier.toFixed(2)}x
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-md">
                        <button
                          onClick={() => handleGuess("HIGHER")}
                          disabled={isProcessing}
                          className="py-4 px-6 rounded-lg font-bold text-xl uppercase tracking-tight transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 text-white border-2 border-emerald-500 hover:bg-emerald-700 shadow-lg"
                        >
                          Higher
                        </button>
                        <button
                          onClick={() => handleGuess("LOWER")}
                          disabled={isProcessing}
                          className="py-4 px-6 rounded-lg font-bold text-xl uppercase tracking-tight transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 text-white border-2 border-red-500 hover:bg-red-700 shadow-lg"
                        >
                          Lower
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .card-container {
          perspective: 1000px;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        
        .card-container.flip {
          transform: rotateY(180deg);
        }
        
        .card {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
