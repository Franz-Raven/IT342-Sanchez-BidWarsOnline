"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/api/auth";
import { Toaster, toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerUser({ username, email, password });
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("user", JSON.stringify({ email: response.userEmail, username: response.username, isAdmin: false }));
      
      // Success Toast
      toast.success("Account created successfully!");
      
      // Delay redirect slightly so user can see the toast
      setTimeout(() => {
        router.push("/landing");
      }, 1500);

    } catch (err: any) {
      const errorMessage = err.message || "Failed to register. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage); // Error Toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[100rem] mx-auto px-6 lg:px-10">
      <div className="flex min-h-screen flex-col bg-background md:flex-row">
        {/* The Toaster component renders the notifications. 
           'position' set to bottom-center as requested.
        */}
        <Toaster position="bottom-center" richColors />

        <div className="flex flex-col justify-center px-8 py-12 md:w-1/2 md:px-16 lg:px-32">
        <h1 className="text-5xl font-extrabold tracking-tighter text-foreground sm:text-8xl uppercase">
          BID<span className="text-brand-gold">WARS</span>
        </h1>
        <p className="mt-2 ml-1 text-xl font-bold tracking-widest text-foreground/70 uppercase">
          Start your gaming journey now!
        </p>
      </div>

      <div className="flex flex-col justify-center px-8 py-12 md:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="mb-8 text-2xl font-bold uppercase text-foreground">
            Join Us!
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
            <div>
              <label className="sr-only">Username</label>
              <input 
                type="text" 
                placeholder="Username" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field" 
              />
            </div>
            <div>
              <label className="sr-only">Email</label>
              <input 
                type="email" 
                placeholder="Email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field" 
              />
            </div>
            <div>
              <label className="sr-only">Password</label>
              <input 
                type="password" 
                placeholder="Password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field" 
              />
            </div>
            <div>
              <label className="sr-only">Confirm Password</label>
              <input 
                type="password" 
                placeholder="Confirm Password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field" 
              />
            </div>
            
            <hr className="my-8 border-border" />
            
            <button type="submit" disabled={isLoading} className="btn-primary w-full uppercase disabled:opacity-50">
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
          
          <p className="mt-4 text-center text-xs font-medium text-foreground/70">
            Already have a bidwars account?{" "}
            <Link href="/login" className="text-brand-gold hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}