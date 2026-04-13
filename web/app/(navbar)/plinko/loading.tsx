import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
        <p className="text-white font-bold text-2xl">Loading Emerald Plinko...</p>
        <p className="text-slate-400 text-sm">Setting up the board</p>
      </div>
    </div>
  );
}
