interface MinesGameStatsProps {
  currentMultiplier: number;
  betAmount: string;
  clickedTiles: number[];
  minesCount: number;
  error: string;
  onCashOut: () => void;
  isProcessing: boolean;
}

export function MinesGameStats({
  currentMultiplier,
  betAmount,
  clickedTiles,
  minesCount,
  error,
  onCashOut,
  isProcessing,
}: MinesGameStatsProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-300">Current Multiplier</label>
        <p className="text-3xl font-bold text-emerald-400">
          {currentMultiplier.toFixed(2)}x
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
          onClick={onCashOut}
          disabled={isProcessing || clickedTiles.length === 0}
          className="w-full py-3 px-4 rounded-lg font-semibold text-lg uppercase tracking-tight transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-yellow-600 text-white border border-yellow-500 hover:bg-yellow-700"
        >
          Cash Out
        </button>
      </div>
    </>
  );
}




