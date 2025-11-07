export interface Stock {
    symbol: string;
    name: string;
    price: number;
    change: number; // Change in price, can be positive or negative
    percentageChange: number; // Percentage change in price
    marketCap: number; // Market capitalization
    volume: number; // Trading volume
    peRatio: number; // Price-to-earnings ratio
    dividendYield: number; // Dividend yield percentage
}