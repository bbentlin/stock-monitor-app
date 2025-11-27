import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import "@/app/globals.css";

export const metadata = {
  title: "Stock Monitor",
  description: "Track your stock portfolio",
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <html lang="en">
        <body>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </Providers>
        </body>
      </html>
    );
};

export default Layout;