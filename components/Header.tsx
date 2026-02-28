import React from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import ThemeToggle from "./ThemeToggle";
import MobileNav from "./MobileNav";
import HeaderStats from "./HeaderStats";
import MarketStatus from "./MarketStatus";

const Header = async () => {
  const session = await auth();

  return (
    <header className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-lg sm:text-xl font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              📈 Stock Monitor
            </Link>
            {/* Quick Stats - only visible on larger screens */}
            <HeaderStats />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6 items-center">
              <li>
                <MarketStatus />
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/stocks"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Stocks
                </Link>
              </li>
              <li>
                <Link
                  href="/stocks/compare"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Compare
                </Link>
              </li>
              <li>
                <ThemeToggle />
              </li>
              {session ? (
                <>
                  <li className="text-gray-500 dark:text-gray-400 text-sm max-w-[150px] truncate">
                    {session.user?.email}
                  </li>
                  <li>
                    <form
                      action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/" });
                      }}
                    >
                      <button
                        type="submit"
                        onClick={() => {
                          // Signal to SessionGuard that sign-out is intentional
                          try {
                            localStorage.setItem("session-signout-initiated", Date.now().toString());
                          } catch {}
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Sign Out
                      </button>
                    </form>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    href="/auth/signin"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <MobileNav
              userEmail={session?.user?.email}
              isAuthenticated={!!session}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;