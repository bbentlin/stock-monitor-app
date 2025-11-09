import React from "react";
import StockScreener from "@/app/stocks/components/StockScreener";
import Watchlist from "@/app/stocks/components/Watchlist";

const StocksPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Stock Selection</h1>
      <>
        <StockScreener />
        <Watchlist stocks={[]} onRemove={() => {}} />
      </>
    </div>
  );
};

export default StocksPage;