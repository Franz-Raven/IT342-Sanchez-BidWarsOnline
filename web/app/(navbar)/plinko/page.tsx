"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { placeBet } from "@/lib/api/games";
import { GameResult } from "@/types/game";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function PlinkoPage() {
  const [betAmount, setBetAmount] = useState<string>("10");
  const [riskLevel, setRiskLevel] = useState<string>("MEDIUM");
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(1000000);
  const [latestResult, setLatestResult] = useState<GameResult | null>(null);
  const [error, setError] = useState<string>("");
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
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
        stompClient.subscribe("/user/topic/wallet", (message) => {
          try {
            const walletUpdate = JSON.parse(message.body);
            setBalance(walletUpdate.balance);
          } catch (err) {
            console.error("Failed to parse wallet update:", err);
          }
        });

        stompClient.subscribe("/user/topic/game-results", (message) => {
          try {
            const gameResult = JSON.parse(message.body);
            setLatestResult(gameResult);
            setBalance(gameResult.newBalance);
            setIsDropping(false);
          } catch (err) {
            console.error("Failed to parse game result:", err);
            setIsDropping(false);
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

  const handleDropBall = async () => {
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

    setIsDropping(true);

    try {
      const response = await placeBet({
        gameType: "PLINKO",
        betAmount: betAmountNum,
        config: {
          risk: riskLevel,
          rows: 16,
        },
      });

      setLatestResult({
        transactionId: response.transactionId,
        resultMultiplier: response.resultMultiplier,
        payout: response.payout,
        newBalance: response.newBalance,
        gameType: "PLINKO",
        timestamp: new Date().toISOString(),
      });

      setBalance(response.newBalance);
      setIsDropping(false);
    } catch (err: any) {
      setError(err.message || "Failed to place bet");
      setIsDropping(false);
    }
  };

  const riskLevels = ["LOW", "MEDIUM", "HIGH"];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="w-full border-b border-border bg-background/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link href="/landing" className="text-xl font-bold text-white hover:text-emerald-400 transition-colors">
            ← Back to Games
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-card px-4 py-2 rounded-full border border-border flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span className="text-yellow-400 font-bold">₱ {balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[100rem] mx-auto px-6 lg:px-10 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white uppercase tracking-tight">Plinko</h1>
          <p className="text-slate-400 mt-2">Drop the ball and watch your multiplier stack up</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Bet Amount</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  disabled={isDropping}
                  min="1"
                  step="1"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter amount"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-300">Risk Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {riskLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setRiskLevel(level)}
                      disabled={isDropping}
                      className={`py-2 px-3 rounded-lg font-semibold text-sm uppercase tracking-tight transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        riskLevel === level
                          ? "bg-emerald-600 text-white border border-emerald-500"
                          : "bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleDropBall}
                disabled={isDropping}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase py-3 text-lg rounded-lg transition-all"
              >
                {isDropping ? "Dropping..." : "Drop Ball"}
              </Button>

            <p className="text-3xl font-bold text-white">
                <span className="text-yellow-400">₱</span> {balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>

              {latestResult && (
                <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-slate-300">Last Result</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {latestResult.resultMultiplier.toFixed(2)}x
                  </p>
                  <p className="text-xs text-slate-400">
                    Payout: ₱ {latestResult.payout.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl aspect-square flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-500 mb-4">Matter.js Canvas Goes Here</p>
                <p className="text-sm text-slate-600">Physics rendering coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
