import { Loader2 } from "lucide-react";

interface GameLoadingProps {
  gameName: string;
  loadingMessage?: string;
}

export function GameLoading({ gameName, loadingMessage }: GameLoadingProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
        <p className="text-white font-bold text-2xl">Loading {gameName}...</p>
        {loadingMessage && (
          <p className="text-slate-400 text-sm">{loadingMessage}</p>
        )}
      </div>
    </div>
  );
}
