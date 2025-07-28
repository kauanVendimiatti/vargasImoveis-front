// src/components/Header.jsx
import React from 'react';

function Header({ pageTitle }) {
    const formatTitle = (title) => {
        if (!title) return '';
        return title.charAt(0).toUpperCase() + title.slice(1);
    };

    return (
        <header className="flex items-center justify-between h-20 px-6 bg-gray-900 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-2xl font-semibold text-white ml-2">{formatTitle(pageTitle)}</h2>
            <span className="text-white font-semibold text-lg hidden sm:block">Vargas Imóveis</span>
        </header>
    );
}

export default Header;