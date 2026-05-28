import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function DashboardLayout({ children, activeTab, setActiveTab }) {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Agregamos íconos representativos a cada sección
  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'ingresos', label: 'Ingresos', icon: '💰' },
    { id: 'egresos', label: 'Egresos', icon: '💸' },
    { id: 'regla', label: 'Regla 50/30/20', icon: '📊' },
  ];

  return (
    // h-screen y overflow-hidden congelan la pantalla para que no haya scroll general
    <div className="h-screen flex flex-col bg-gray-100 text-gray-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* NAVBAR SUPERIOR */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-xl"
            title="Alternar menú"
          >
            ☰
          </button>
          <h1 className="text-xl font-black tracking-tight text-black dark:text-white">
            My Finance Tracker
          </h1>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 text-lg hover:scale-105 transition-transform"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>

      {/* CUERPO PRINCIPAL (Ocupa el espacio restante de la pantalla) */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR IZQUIERDO */}
        <aside className={`
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          transition-all duration-300 ease-in-out
          border-r border-gray-200 dark:border-slate-800 
          bg-white dark:bg-slate-800 flex flex-col justify-between shrink-0
        `}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                  ${activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700/50'}
                `}
                title={!isSidebarOpen ? item.label : ''}
              >
                {/* El ícono siempre se ve, si está cerrado se agranda y centra */}
                <span className={`text-lg ${!isSidebarOpen ? 'w-full text-center' : ''}`}>
                  {item.icon}
                </span>
                {/* El texto desaparece suavemente al colapsar */}
                {isSidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* CONTENIDO CENTRAL (Con scroll independiente si desborda) */}
        <main className="flex-1 p-6 bg-gray-50 dark:bg-slate-900 overflow-y-auto">
          <div className="max-w-7xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-700/50 min-h-full">
            {children}
          </div>
        </main>
      </div>

      {/* FOOTER ADAPTADO AL CONTENEDOR FIJO */}
      <footer className="h-10 flex items-center justify-center text-xs font-medium text-gray-400 dark:text-slate-500 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 shrink-0">
        &copy; {new Date().getFullYear()} My Finance Tracker. Todos los derechos reservados.
      </footer>
    </div>
  );
}