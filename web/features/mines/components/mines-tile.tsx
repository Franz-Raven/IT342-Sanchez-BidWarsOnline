type GameState = "IDLE" | "PLAYING" | "BUSTED" | "CASHED_OUT";

interface MinesTileProps {
  index: number;
  gameState: GameState;
  gridState: boolean[] | null;
  clickedTiles: number[];
  isProcessing: boolean;
  onClick: (index: number) => void;
}

export function MinesTile({
  index,
  gameState,
  gridState,
  clickedTiles,
  isProcessing,
  onClick,
}: MinesTileProps) {
  const getTileContent = () => {
    if (gameState === "IDLE") return "";
    
    if (gridState) {
      if (gridState[index]) {
        return "💣";
      } else if (clickedTiles.includes(index)) {
        return "💎";
      }
      return "";
    }
    
    if (clickedTiles.includes(index)) {
      return "💎";
    }
    
    return "";
  };

  const getTileClassName = () => {
    const baseClass = "aspect-square rounded-lg border-2 flex items-center justify-center text-4xl transition-all cursor-pointer";
    
    if (gameState === "IDLE") {
      return `${baseClass} bg-slate-800 border-slate-700 cursor-not-allowed`;
    }

    if (gridState) {
      if (gridState[index]) {
        return `${baseClass} bg-red-900 border-red-700`;
      } else if (clickedTiles.includes(index)) {
        return `${baseClass} bg-emerald-900 border-emerald-700`;
      }
      return `${baseClass} bg-slate-800 border-slate-700`;
    }

    if (clickedTiles.includes(index)) {
      return `${baseClass} bg-emerald-900 border-emerald-700 cursor-not-allowed`;
    }

    if (gameState === "PLAYING") {
      return `${baseClass} bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-emerald-500`;
    }

    return `${baseClass} bg-slate-800 border-slate-700 cursor-not-allowed`;
  };

  return (
    <button
      onClick={() => onClick(index)}
      disabled={isProcessing || clickedTiles.includes(index) || gameState !== "PLAYING" || gridState !== null}
      className={getTileClassName()}
    >
      {getTileContent()}
    </button>
  );
}




