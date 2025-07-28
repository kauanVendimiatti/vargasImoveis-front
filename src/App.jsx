// src/App.jsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header';
import ImoveisPage from './pages/ImoveisPage';
import PagamentosPage from './pages/PagamentosPage';
import ManutencaoPage from './pages/ManutencaoPage';
// No futuro, você importará as outras páginas aqui

function App() {
  const [activePage, setActivePage] = useState('imoveis');

  // Esta função decide qual componente de página renderizar
  const renderActivePage = () => {
    switch (activePage) {
      case 'imoveis':
        return <ImoveisPage />;
      case 'pagamentos':
        return <PagamentosPage />;
      case 'manutencao':
        return <ManutencaoPage />;
      // Adicione os 'cases' para 'contratos', 'locadores', etc. aqui no futuro
      default:
        return <div className="p-8 text-white">Selecione uma página</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-300">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header pageTitle={activePage} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export default App;