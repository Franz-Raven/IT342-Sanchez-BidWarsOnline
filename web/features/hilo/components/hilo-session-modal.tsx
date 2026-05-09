import { HiloResult } from '@/features/hilo/types/hilo';

interface HiloSessionModalProps {
  isOpen: boolean;
  sessionData: HiloResult | null;
  isProcessing: boolean;
  error: string;
  onContinue: () => void;
  onCashOut: () => void;
  getSuitSymbol: (suit: string) => string;
}

export function HiloSessionModal({
  isOpen,
  sessionData,
  isProcessing,
  error,
  onContinue,
  onCashOut,
  getSuitSymbol,
}: HiloSessionModalProps) {
  if (!isOpen || !sessionData) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">Active Session Found</h2>
        <p className="text-slate-300 mb-6">
          You have an active Hi-Lo game session. Would you like to continue playing or cash out?
        </p>
        
        <div className="space-y-3 mb-6 bg-slate-800/50 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Bet Amount:</span>
            <span className="text-white font-semibold">₱{sessionData.betAmount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Current Pot:</span>
            <span className="text-emerald-400 font-bold text-lg">
              ₱{(sessionData.currentPot || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Win Streak:</span>
            <span className="text-yellow-400 font-semibold">{sessionData.streakCount || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Current Card:</span>
            <span className="text-white font-semibold">
              {sessionData.currentCardRank} {getSuitSymbol(sessionData.currentCardSuit || "")}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCashOut}
            disabled={isProcessing}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'CASH OUT'}
          </button>
          <button
            onClick={onContinue}
            disabled={isProcessing}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CONTINUE
          </button>
        </div>

        {error && (
          <p className="mt-4 text-red-400 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  );
}




