interface HiloPlayingCardProps {
  cardRank: string | null;
  cardSuit: string | null;
  flipCard: boolean;
  getSuitSymbol: (suit: string) => string;
  getSuitColor: (suit: string) => string;
}

export function HiloPlayingCard({
  cardRank,
  cardSuit,
  flipCard,
  getSuitSymbol,
  getSuitColor,
}: HiloPlayingCardProps) {
  if (!cardRank || !cardSuit) {
    return (
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-500 mb-4">Place your bet to start</p>
        <p className="text-sm text-slate-600">Draw a card and predict the next!</p>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center">
      <div className={`card-container ${flipCard ? "flip" : ""}`}>
        <div className="card bg-white rounded-2xl shadow-2xl w-48 h-72 flex flex-col items-center justify-center border-4 border-slate-800">
          <div className={`text-6xl font-bold ${getSuitColor(cardSuit)}`}>
            {cardRank}
          </div>
          <div className={`text-8xl mt-4 ${getSuitColor(cardSuit)}`}>
            {getSuitSymbol(cardSuit)}
          </div>
          <div className={`text-6xl font-bold mt-4 ${getSuitColor(cardSuit)}`}>
            {cardRank}
          </div>
        </div>
      </div>

      <style jsx>{`
        .card-container {
          perspective: 1000px;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        
        .card-container.flip {
          transform: rotateY(180deg);
        }
        
        .card {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}




