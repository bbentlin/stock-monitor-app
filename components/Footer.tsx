import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm sm:text-base">
          &copy; {new Date().getFullYear()} Ben Bentlin. All rights reserved.
        </p>
        <nav className="mt-2 flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/stocks"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Stocks
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;