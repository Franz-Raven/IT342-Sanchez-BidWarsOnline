"use client";

import { Button } from "@/shared/ui/button";

interface PlinkoGameControlsProps {
  betAmount: string;
  riskLevel: string;
  onBetAmountChange: (value: string) => void;
  onRiskLevelChange: (value: string) => void;
  onDropBall: () => void;
  isDropping: boolean;
  error: string;
}

export function PlinkoGameControls({
  betAmount,
  riskLevel,
  onBetAmountChange,
  onRiskLevelChange,
  onDropBall,
  isDropping,
  error,
}: PlinkoGameControlsProps) {
  const riskLevels = ["LOW", "MEDIUM", "HIGH"];

  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-300">Bet Amount</label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => onBetAmountChange(e.target.value)}
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
              onClick={() => onRiskLevelChange(level)}
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
        onClick={onDropBall}
        disabled={isDropping}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase py-3 text-lg rounded-lg transition-all"
      >
        {isDropping ? "Dropping..." : "Drop Ball"}
      </Button>
    </>
  );
}




