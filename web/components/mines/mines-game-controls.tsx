import { Button } from "@/components/ui/button";

interface MinesGameControlsProps {
  betAmount: string;
  minesCount: number;
  onBetAmountChange: (value: string) => void;
  onMinesCountChange: (value: number) => void;
  onStartGame: () => void;
  isProcessing: boolean;
  error: string;
}

export function MinesGameControls({
  betAmount,
  minesCount,
  onBetAmountChange,
  onMinesCountChange,
  onStartGame,
  isProcessing,
  error,
}: MinesGameControlsProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-300">Bet Amount</label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => onBetAmountChange(e.target.value)}
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
          onChange={(e) => onMinesCountChange(parseInt(e.target.value))}
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
        onClick={onStartGame}
        disabled={isProcessing}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase py-3 text-lg rounded-lg transition-all"
      >
        {isProcessing ? "Starting..." : "Start Game"}
      </Button>
    </>
  );
}
