interface HiloMultiplierDisplayProps {
  higherMultiplier: number | null;
  lowerMultiplier: number | null;
}

export function HiloMultiplierDisplay({
  higherMultiplier,
  lowerMultiplier,
}: HiloMultiplierDisplayProps) {
  if (higherMultiplier === null || lowerMultiplier === null) {
    return null;
  }

  return (
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
  );
}
