import React from 'react';

const HomePage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold">Welcome to Stock Monitor App</h1>
            <p className="mt-4 text-lg">Your one-stop solution for monitoring and managing stocks.</p>
            <div className="mt-8">
                <a href="/dashboard" className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                    Go to Dashboard
                </a>
                <a href="/stocks" className="ml-4 px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600">
                    Explore Stocks
                </a>
            </div>
        </div>
    );
};

export default HomePage;