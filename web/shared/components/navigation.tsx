"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"

import { Menu, X, Shield, User } from "lucide-react"
import { getWallet } from "@/features/wallet/api/wallet"
import { Wallet } from "@/features/wallet/types/wallet"

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")
      if (token && userData) {
        try {
          setUser(JSON.parse(userData))
        } catch (error) {
          console.error("Failed to parse user data:", error)
          localStorage.removeItem("user")
          localStorage.removeItem("token")
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }

    checkAuth()
    window.addEventListener("storage", checkAuth)
    window.addEventListener("authChange", checkAuth)

    return () => {
      window.removeEventListener("storage", checkAuth)
      window.removeEventListener("authChange", checkAuth)
    }
  }, [pathname])

  // Fetch wallet when user changes
  useEffect(() => {
    const fetchWallet = () => {
      if (user) {
        getWallet()
          .then((res) => {
            setWallet(res.data)
          })
          .catch(() => setWallet(null))
      } else {
        setWallet(null)
      }
    }

    fetchWallet()

    // Listen for wallet changes from other components (e.g., Plinko page)
    window.addEventListener("walletChange", fetchWallet)

    return () => {
      window.removeEventListener("walletChange", fetchWallet)
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }

    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [profileMenuOpen])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    window.dispatchEvent(new Event("authChange"))
    router.push("/login")
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/news", label: "News" },
    { href: "/about", label: "About" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-900">
      <div className="max-w-[100rem] mx-auto px-6 lg:px-10">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <h1 className="text-xl font-bold font-sans tracking-tight text-white">
              BidWars <span className="font-light text-slate-300">Online</span>
            </h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-emerald-400 border-b-2 border-emerald-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {user?.isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive("/admin")
                    ? "text-emerald-400 border-b-2 border-emerald-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-300" />
            ) : (
              <Menu className="w-5 h-5 text-slate-300" />
            )}
          </button>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="bg-card px-4 py-1.5 rounded-full border border-border flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span className="text-yellow-400 font-medium">
                    P {wallet ? Number(wallet.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"}
                  </span>
                </div>

                <button className="bg-emerald-600 text-white font-semibold text-sm px-4 py-1.5 rounded-full hover:bg-emerald-700 transition-colors uppercase tracking-tight">
                  + Deposit
                </button>

                {/* Profile Button */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-slate-100 text-xs hover:bg-slate-600 transition-colors"
                  >
                    <User className="w-5 h-5" />
                  </button>

                  {/* Profile Popup */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
                      <div className="p-4 border-b border-slate-700 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                          <User className="w-6 h-6 text-slate-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {user.username}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          handleLogout()
                          setProfileMenuOpen(false)
                        }}
                        className="w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-slate-700 transition-colors text-left"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-1.5 rounded-full border border-slate-600 text-slate-300 font-semibold text-sm hover:text-white hover:border-slate-400 transition-colors uppercase tracking-tight"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors uppercase tracking-tight"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-slate-700">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-emerald-600/20 text-emerald-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {user?.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive("/admin")
                    ? "bg-emerald-600/20 text-emerald-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}

            {/* Mobile User Section */}
            <div className="border-t border-slate-700 mt-4 pt-4 space-y-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-slate-400">
                    {user.email}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg border border-slate-600 text-slate-300 font-medium hover:bg-slate-800 transition-colors text-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors text-center"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}



