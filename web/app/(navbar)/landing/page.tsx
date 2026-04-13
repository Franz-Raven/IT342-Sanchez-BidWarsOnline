import Link from "next/link";
import Image from "next/image";

const games = [
  { 
    id: 1, 
    title: "Emerald Plinko", 
    descShort: "High Stakes", 
    descLong: "Watch as the gravity-bound sphere dances through a labyrinth of emerald pegs, carving a path toward massive multipliers.", 
    gameType: "plinko" 
  },
  { 
    id: 2, 
    title: "Deep Sea Mines", 
    descShort: "Strategy", 
    descLong: "Uncover the treasures of the abyss while navigating around volatile explosives in this high-tension game of calculated risk.", 
    gameType: "mines" 
  },
  { 
    id: 3, 
    title: "Neon Hi-Lo", 
    descShort: "Card Duel", 
    descLong: "Step into a vibrant arena of probability where the next card could signify your triumph or your downfall. ", 
    gameType: "hilo" 
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <main className="flex-1 space-y-8 p-6 lg:p-10 max-w-[100rem] mx-auto w-full">
        
        <div className="aspect-[3/1] rounded-3xl bg-card border border-border p-10 flex flex-col justify-end bg-no-repeat bg-cover bg-center"
             style={{ backgroundImage: `linear-gradient(180deg, rgba(30,41,59,0) 50%, rgba(30,41,59,1) 100%), url('/home.png')` }}>
            <h2 className="text-4xl font-bold text-white leading-tight">Drop, Win, and Climb the SIA Leaderboard</h2>
        </div>

        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-bold uppercase tracking-wide font-sans text-slate-100">
            Games
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="bg-card rounded-2xl border border-border overflow-hidden transition-all hover:border-emerald-700 group">
              <div className="aspect-[3/3] w-full border-b border-border bg-slate-800 flex items-center justify-center relative overflow-hidden">
                  <Image 
                    src={`/${game.gameType}.png`} 
                    alt={game.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
              </div>

              <div className="p-5 flex flex-col gap-3">
                <h4 className="text-lg font-bold text-white group-hover:text-emerald-400">{game.title}</h4>
                
                <div className="flex flex-col gap-1.5">
                    <div className="h-5 w-3/4 rounded bg-slate-700 border border-slate-600 p-1 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                        <span className="text-xs text-slate-300 font-bold uppercase tracking-tight">{game.descShort}</span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 min-h-10">{game.descLong}</p>
                </div>

                <div className="flex items-center gap-2.5 mt-2.5">
                  <Link href={`/${game.gameType}`} className="flex-1 text-center bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700">
                    Play Game
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="w-full mt-10 p-6 border-t border-border bg-[#0a1120] text-center text-xs text-slate-500">
        BidWars Online | Cebu Institute of Technology - University
      </footer>
    </div>
  );
}