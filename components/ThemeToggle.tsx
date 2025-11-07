import React, { useEffect, useState } from 'react';

const ThemeToggle: React.FC = () => {
    const [theme, setTheme] = useState<string>('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <button onClick={toggleTheme} className="p-2 rounded bg-gray-200 dark:bg-gray-700">
            Toggle to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
    );
};

export default ThemeToggle;