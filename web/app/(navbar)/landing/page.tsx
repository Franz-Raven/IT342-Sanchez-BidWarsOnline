import Link from "next/link";

const games = [
  { id: 1, title: "Emerald Plinko", descShort: "High Stakes", descLong: "Classic drop game with multipliers.", currentBid: 50000, gameType: "plinko" },
  { id: 2, title: "Deep Sea Mines", descShort: "Strategy", descLong: "Navigate the grid. Avoid explosions.", currentBid: 125000, gameType: "mines" },
  { id: 3, title: "Neon Hi-Lo", descShort: "Card Duel", descLong: "Predict the next card sequence.", currentBid: 75000, gameType: "hi-lo" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <main className="flex-1 space-y-8 p-6 lg:p-10 max-w-[100rem] mx-auto w-full">
        
        <div className="aspect-[3/1] rounded-3xl bg-card border border-border p-10 flex flex-col justify-end bg-no-repeat bg-cover bg-center"
             style={{ backgroundImage: `linear-gradient(180deg, rgba(30,41,59,0) 50%, rgba(30,41,59,1) 100%), url('https://images.pexels.com/photos/2100018/pexels-photo-2100018.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')` }}>
            <span className="text-emerald-400 font-bold uppercase text-xs tracking-widest mb-1.5">Featured Game: Plinko</span>
            <h2 className="text-4xl font-bold text-white leading-tight">Drop, Win, and Climb the SIA Leaderboard</h2>
            <Link href="/plinko">
              <button className="mt-5 w-fit bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-transform hover:scale-105">Place Your Bid Now</button>
            </Link>
        </div>

        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-bold uppercase tracking-wide font-sans text-slate-100">
            Games
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="bg-card rounded-2xl border border-border overflow-hidden transition-all hover:border-emerald-700 group">
              <div className="aspect-[4/3] w-full border-b border-border bg-slate-800 flex items-center justify-center">
                  <span className="text-4xl font-extrabold text-slate-900 group-hover:text-slate-700 transition-colors">{game.id}</span>
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

                <div className="border-t border-slate-700/50 pt-3 flex items-center justify-between text-xs mt-1">
                    <span className="font-bold text-slate-300">Starting:</span>
                    <span className="font-bold text-yellow-400">P {game.currentBid.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2.5 mt-2.5">
                  <Link href={`/games/${game.id}`} className="flex-1 text-center bg-slate-700 text-white font-bold py-2 rounded-lg hover:bg-slate-600">
                    View Info
                  </Link>
                  <Link href={`/${game.gameType}`} className="flex-1 text-center bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700">
                    Join Arena
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