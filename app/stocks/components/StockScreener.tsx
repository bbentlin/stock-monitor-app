import React, { useState } from 'react';

const StockScreener: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCriteria, setFilterCriteria] = useState({
        marketCap: '',
        sector: '',
        priceRange: [0, 1000],
    });

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFilterCriteria((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePriceRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value);
        setFilterCriteria((prev) => ({
            ...prev,
            priceRange: [prev.priceRange[0], value],
        }));
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Stock Screener</h2>
            <input
                type="text"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="border p-2 mb-4 w-full"
            />
            <div className="mb-4">
                <label className="block mb-2">Market Cap:</label>
                <select name="marketCap" onChange={handleFilterChange} className="border p-2 w-full">
                    <option value="">Select Market Cap</option>
                    <option value="small">Small Cap</option>
                    <option value="mid">Mid Cap</option>
                    <option value="large">Large Cap</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block mb-2">Sector:</label>
                <select name="sector" onChange={handleFilterChange} className="border p-2 w-full">
                    <option value="">Select Sector</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="consumer">Consumer</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block mb-2">Price Range:</label>
                <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filterCriteria.priceRange[1]}
                    onChange={handlePriceRangeChange}
                    className="w-full"
                />
                <span>{`$${filterCriteria.priceRange[0]} - $${filterCriteria.priceRange[1]}`}</span>
            </div>
            {/* Add logic to display filtered stocks based on searchTerm and filterCriteria */}
        </div>
    );
};

export default StockScreener;