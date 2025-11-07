import React from 'react';
import StockScreener from './components/StockScreener';
import Watchlist from './components/Watchlist';

const StocksPage: React.FC = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Stock Selection</h1>
            <StockScreener />
            <Watchlist />
        </div>
    );
};

export default StocksPage;