import React from 'react';
import HoldingsTable from './components/HoldingsTable';
import PerformanceChart from './components/PerformanceChart';

const DashboardPage: React.FC = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <PerformanceChart />
            <HoldingsTable />
        </div>
    );
};

export default DashboardPage;