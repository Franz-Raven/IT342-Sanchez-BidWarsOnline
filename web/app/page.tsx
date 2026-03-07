import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <main className="max-w-4xl space-y-8">
        <h1 className="text-6xl font-extrabold tracking-tighter text-foreground sm:text-7xl uppercase">
          BID<span className="text-brand-gold">WARS</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-foreground/70">
          The ultimate competitive auction and iGaming arena.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/login" className="btn-primary sm:w-48 hover:scale-105">
            LOGIN
          </Link>
          <Link href="/register" className="flex h-[50px] w-full items-center justify-center rounded-lg border border-border px-8 text-sm font-bold text-foreground transition-colors hover:bg-card sm:w-48">
            REGISTER
          </Link>
        </div>
      </main>
    </div>
  );
}