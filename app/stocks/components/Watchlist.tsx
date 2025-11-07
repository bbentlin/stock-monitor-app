import React from 'react';
import { Stock } from '../../../types/stock';

interface WatchlistProps {
  stocks: Stock[];
  onRemove: (symbol: string) => void;
}

const Watchlist: React.FC<WatchlistProps> = ({ stocks, onRemove }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Watchlist</h2>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Symbol</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Price</th>
            <th className="py-2 px-4 border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.symbol}>
              <td className="py-2 px-4 border-b">{stock.symbol}</td>
              <td className="py-2 px-4 border-b">{stock.name}</td>
              <td className="py-2 px-4 border-b">${stock.price.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onRemove(stock.symbol)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Watchlist;