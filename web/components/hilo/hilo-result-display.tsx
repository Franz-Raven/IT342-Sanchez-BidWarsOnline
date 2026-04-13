type GameState = "IDLE" | "PLAYING" | "BUSTED" | "CASHED_OUT";

interface HiloResultDisplayProps {
  gameState: GameState;
  currentPot: number;
}

export function HiloResultDisplay({
  gameState,
  currentPot,
}: HiloResultDisplayProps) {
  if (gameState !== "BUSTED" && gameState !== "CASHED_OUT") {
    return null;
  }

  return (
    <div className={`${gameState === "BUSTED" ? "bg-red-900/20 border-red-700" : "bg-emerald-900/20 border-emerald-700"} border rounded-lg p-4 space-y-2`}>
      <p className="text-sm text-slate-300">
        {gameState === "BUSTED" ? "Game Over - Bust!" : "Success - Cashed Out!"}
      </p>
      <p className={`text-2xl font-bold ${gameState === "BUSTED" ? "text-red-400" : "text-emerald-400"}`}>
        {gameState === "BUSTED" 
          ? "Better luck next time" 
          : `₱ ${currentPot.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
      </p>
    </div>
  );
}
