interface HiloGameButtonsProps {
  onHigher: () => void;
  onLower: () => void;
  isProcessing: boolean;
}

export function HiloGameButtons({
  onHigher,
  onLower,
  isProcessing,
}: HiloGameButtonsProps) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-md">
      <button
        onClick={onHigher}
        disabled={isProcessing}
        className="py-4 px-6 rounded-lg font-bold text-xl uppercase tracking-tight transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 text-white border-2 border-emerald-500 hover:bg-emerald-700 shadow-lg"
      >
        Higher
      </button>
      <button
        onClick={onLower}
        disabled={isProcessing}
        className="py-4 px-6 rounded-lg font-bold text-xl uppercase tracking-tight transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 text-white border-2 border-red-500 hover:bg-red-700 shadow-lg"
      >
        Lower
      </button>
    </div>
  );
}
