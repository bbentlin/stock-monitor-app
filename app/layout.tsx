import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/globals.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <html lang="en">
        <body>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </body>
      </html>
    );
};

export default Layout;