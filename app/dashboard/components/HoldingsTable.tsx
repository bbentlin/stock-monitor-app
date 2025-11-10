import React from "react";
import { Holding } from "@/lib/hooks/useHoldings";

interface HoldingsTableProps {
  holdings: Holding[];
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings }) => {
  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Holdings</h2>
      <table className="min-w-full bg-gray-900 border border-gray-700">
        <thead>
          <tr className="bg-gray-800">
            <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Symbol</th>
            <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Name</th>
            <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Shares</th>
            <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Purchase Price</th>
            <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Current Price</th>
            <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Value</th>
            <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Gain/Loss</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr key={holding.symbol} className="hover:bg-gray-800">
              <td className="py-3 px-4 border-b border-gray-700 text-white font-semibold">{holding.symbol}</td>
              <td className="py-3 px-4 border-b border-gray-700 text-gray-300">{holding.name}</td>
              <td className="py-3 px-4 border-b border-gray-700 text-right text-gray-300">{holding.shares}</td>
              <td className="py-3 px-4 border-b border-gray-700 text-right text-gray-300">{holding.purchasePrice.toFixed(2)}</td>
              <td className="py-3 px-4 border-b border-gray-700 text-right text-gray-300">{holding.currentPrice.toFixed(2)}</td>
              <td className="py-3 px-4 border-b border-gray-700 text-right text-white font-semibold">{holding.value.toFixed(2)}</td>
              <td className={`py-3 px-4 border-b border-gray-700 text-right font-semibold ${holding.gainLoss >= 0 ? 'text-green-500' : 'text-red-500'} `}>
                ${holding.gainLoss.toFixed(2)} ({holding.gainLossPercent.toFixed(2)}%)
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HoldingsTable;