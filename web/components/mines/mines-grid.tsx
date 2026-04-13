import { MinesTile } from "./mines-tile";

type GameState = "IDLE" | "PLAYING" | "BUSTED" | "CASHED_OUT";

interface MinesGridProps {
  gameState: GameState;
  gridState: boolean[] | null;
  clickedTiles: number[];
  isProcessing: boolean;
  onTileClick: (index: number) => void;
}

export function MinesGrid({
  gameState,
  gridState,
  clickedTiles,
  isProcessing,
  onTileClick,
}: MinesGridProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-slate-700 rounded-3xl p-8">
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 25 }).map((_, index) => (
          <MinesTile
            key={index}
            index={index}
            gameState={gameState}
            gridState={gridState}
            clickedTiles={clickedTiles}
            isProcessing={isProcessing}
            onClick={onTileClick}
          />
        ))}
      </div>
    </div>
  );
}
