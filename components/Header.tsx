import React from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

const Header = async () => {
  const session = await auth();

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Stock Monitor</h1>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <Link href="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link href="/stocks">Stocks</Link>
            </li>
            {session ? (
              <>
                <li className="text-gray-400">{session.user?.email}</li>
                <li>
                  <form action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/"});
                  }}>
                    <button type="submit" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
                      Sign Out
                    </button>
                  </form>
                </li>
              </>
            ) : (
              <li>
                <Link href="/auth/signin" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
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