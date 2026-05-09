import { Button } from '@/shared/ui/button';

interface HiloGameControlsProps {
  betAmount: string;
  onBetAmountChange: (value: string) => void;
  onStartGame: () => void;
  isProcessing: boolean;
  error: string;
}

export function HiloGameControls({
  betAmount,
  onBetAmountChange,
  onStartGame,
  isProcessing,
  error,
}: HiloGameControlsProps) {
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




