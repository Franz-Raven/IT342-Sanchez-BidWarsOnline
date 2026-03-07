import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <div className="flex flex-col justify-center px-8 py-12 md:w-1/2 md:px-16 lg:px-32">
        <h1 className="text-5xl font-extrabold tracking-tighter text-foreground sm:text-6xl uppercase">
          BID<span className="text-brand-gold">WARS</span>
        </h1>
        <p className="mt-2 text-sm font-bold tracking-widest text-foreground/70 uppercase">
          Start your gaming journey now!
        </p>
      </div>

      <div className="flex flex-col justify-center px-8 py-12 md:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="mb-8 text-2xl font-bold uppercase text-foreground">
            Welcome Back!
          </h2>
          
          <form className="space-y-4">
            <div>
              <label className="sr-only">Email</label>
              <input 
                type="email" 
                placeholder="Email" 
                required 
                className="input-field" 
              />
            </div>
            <div>
              <label className="sr-only">Password</label>
              <input 
                type="password" 
                placeholder="Password" 
                required 
                className="input-field" 
              />
            </div>
            
            <hr className="my-8 border-border" />
            
            <button type="submit" className="btn-primary w-full uppercase">
              Sign In
            </button>
          </form>
          
          <p className="mt-4 text-center text-xs font-medium text-foreground/70">
            Don't have an account yet?{" "}
            <Link href="/register" className="text-brand-gold hover:underline font-bold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}