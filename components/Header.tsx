import React from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import ThemeToggle from "./ThemeToggle";

const Header = async () => {
  const session = await auth();

  return (
    <header className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Stock Monitor
        </Link>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/stocks" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Stocks
              </Link>
            </li>
            <li>
              <ThemeToggle />
            </li>
            {session ? (
              <>
                <li className="text-gray-500 dark:text-gray-400 hidden sm:block">{session.user?.email}</li>
                <li>
                  <form action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/"});
                  }}>
                    <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors">
                      Sign Out
                    </button>
                  </form>
                </li>
              </>
            ) : (
              <li>
                <Link href="/auth/signin" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
                  Sign In
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;