// src/components/Sidebar.jsx
import React from 'react';

const navItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'imoveis', icon: '🏠', label: 'Imóveis' },
    { key: 'pessoas', icon: '👥', label: 'Pessoas' },
    { key: 'contratos', icon: '📄', label: 'Contratos' },
    { key: 'pagamentos', icon: '💰', label: 'Pagamentos' },
    { key: 'manutencao', icon: '🛠️', label: 'Manutenção' },
    // Adicione os outros itens do menu aqui
];

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-gray-800 text-white flex-col md:translate-x-0">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">VARGAS</h1>
      </div>
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map(item => (
          <a
            key={item.key}
            href="#"
            onClick={(e) => { e.preventDefault(); setActivePage(item.key); }}
            className={`nav-item flex items-center px-4 py-2.5 rounded-lg transition duration-200 ${activePage === item.key ? 'active-nav' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="ml-4">{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;