import Link from "next/link";

const games = [
  { id: 1, title: "Emerald Plinko", descShort: "High Stakes", descLong: "Classic drop game with multipliers.", currentBid: 50000 },
  { id: 2, title: "Deep Sea Mines", descShort: "Strategy", descLong: "Navigate the grid. Avoid explosions.", currentBid: 125000 },
  { id: 3, title: "Neon Hi-Lo", descShort: "Card Duel", descLong: "Predict the next card sequence.", currentBid: 75000 },
  { id: 4, title: "Project Alpha Bid", descShort: "Auction", descLong: "Compete for exclusive digital assets.", currentBid: 210000 },
  { id: 5, title: "Quartz Miner", descShort: "Clicker", descLong: "Mine resources for platform currency.", currentBid: 35000 },
  { id: 6, title: "Legacy Auctions", descShort: "Retro Loot", descLong: "Timed bidding on vintage game items.", currentBid: 95000 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      <header className="w-full flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1 cursor-pointer">
            <span className="block h-0.5 w-6 rounded-full bg-slate-300"></span>
            <span className="block h-0.5 w-6 rounded-full bg-slate-300"></span>
            <span className="block h-0.5 w-6 rounded-full bg-slate-300"></span>
          </div>
          <h1 className="text-xl font-bold font-sans tracking-tight text-white">
            BidWars <span className="font-light text-slate-300">Online</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-card px-4 py-1.5 rounded-full border border-border flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="text-yellow-400 font-medium">P 10,000,000</span>
          </div>

          <button className="bg-emerald-600 text-white font-semibold text-sm px-4 py-1.5 rounded-full hover:bg-emerald-700 transition-colors uppercase tracking-tight">
            + Deposit
          </button>

          <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-slate-100 text-xs">
            AB
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-8 p-6 lg:p-10 max-w-[1500px] mx-auto w-full">
        
        <div className="aspect-[3/1] rounded-3xl bg-card border border-border p-10 flex flex-col justify-end bg-no-repeat bg-cover bg-center"
             style={{ backgroundImage: `linear-gradient(180deg, rgba(30,41,59,0) 50%, rgba(30,41,59,1) 100%), url('https://images.pexels.com/photos/2100018/pexels-photo-2100018.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')` }}>
            <span className="text-emerald-400 font-bold uppercase text-xs tracking-widest mb-1.5">Featured Game: Plinko</span>
            <h2 className="text-4xl font-bold text-white leading-tight">Drop, Win, and Climb the SIA Leaderboard</h2>
            <button className="mt-5 w-fit bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-transform hover:scale-105">Place Your Bid Now</button>
        </div>

        {/* <div className="h-12 w-full rounded-2xl bg-[#26354D] border border-border flex items-center px-6 text-sm text-slate-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse"></span>
          Live Bidding Update: Item #302 (Vintage Cartridge) just closed at P 125,000. Next round in 2 minutes.
        </div> */}

        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-bold uppercase tracking-wide font-sans text-slate-100">
            Games & Auctions
          </h3>
          <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-400">View (6 of 12)</span>
              <button className="bg-card p-2 rounded-lg border border-border text-slate-200">←</button>
              <button className="bg-card p-2 rounded-lg border border-border text-slate-200">→</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  <button className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700">
                    Join Arena
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="w-full mt-10 p-6 border-t border-border bg-[#0a1120] text-center text-xs text-slate-500">
        BidWars Online | SIA Project Implementation | Central Visayas Institute of Technology
      </footer>
    </div>
  );
}