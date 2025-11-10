import React from "react";
import { Holding } from "@/lib/hooks/useHoldings";

interface HoldingsTableProps {
  holdings: Holding[];
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Symbol</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Shares</th>
            <th className="py-2 px-4 border-b">Purchase Price</th>
            <th className="py-2 px-4 border-b">Current Price</th>
            <th className="py-2 px-4 border-b">Value</th>
            <th className="py-2 px-4 border-b">Gain/Loss</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr key={holding.symbol}>
              <td className="py-2 px-4 border-b">{holding.symbol}</td>
              <td className="py-2 px-4 border-b">{holding.name}</td>
              <td className="py-2 px-4 border-b">{holding.shares}</td>
              <td className="py-2 px-4 border-b">{holding.purchasePrice.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">{holding.currentPrice.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">{holding.value.toFixed(2)}</td>
              <td className={`py-2 px-4 border-b ${holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'} `}>
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