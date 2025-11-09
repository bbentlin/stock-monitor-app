import React from "react";
import HoldingsTable from "@/app/dashboard/components/HoldingsTable";
import PerformanceChart from "@/app/dashboard/components/PerformanceChart";

const DashboardPage: React.FC = () => {
    const holdings: any[] = []; // TODO: Fetch or define your holdings data
    
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <PerformanceChart />
            <HoldingsTable holdings={holdings} />
        </div>
    );
};

export default DashboardPage;