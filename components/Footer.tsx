import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Ben Bentlin. All rights reserved.</p>
        <nav>
          <a href="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mx-2">
            Dashboard
          </a>
          <a href="/stocks" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mx-2">
            Stocks
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;