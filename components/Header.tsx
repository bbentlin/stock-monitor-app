import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
    return (
        <header className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">Stock Monitor App</h1>
                <nav>
                    <ul className="flex space-x-4">
                        <li>
                            <Link href="/dashboard">Dashboard</Link>
                        </li>
                        <li>
                            <Link href="/stocks">Stocks</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;