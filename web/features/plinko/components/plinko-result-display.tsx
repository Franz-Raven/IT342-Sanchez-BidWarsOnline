"use client";

import { PlinkoResult } from "@/features/plinko/types/plinko";

interface PlinkoResultDisplayProps {
  result: PlinkoResult | null;
}

export function PlinkoResultDisplay({ result }: PlinkoResultDisplayProps) {
  if (!result) return null;

  return (
    <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4 space-y-2">
      <p className="text-sm text-slate-300">Last Result</p>
      <p className="text-2xl font-bold text-emerald-400">
        {result.resultMultiplier.toFixed(2)}x
      </p>
      <p className="text-xs text-slate-400">
        Payout: ₱ {result.payout.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      {result.bucketPosition !== undefined && (
        <p className="text-xs text-slate-500">
          Bucket: {result.bucketPosition}
        </p>
      )}
    </div>
  );
}




