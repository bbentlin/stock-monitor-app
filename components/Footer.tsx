import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 text-white py-4">
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} Stock Monitor App. All rights reserved.</p>
                <nav>
                    <a href="/dashboard" className="text-gray-400 hover:text-white mx-2">Dashboard</a>
                    <a href="/stocks" className="text-gray-400 hover:text-white mx-2">Stocks</a>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;