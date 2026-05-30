import React, { useState, useEffect } from 'react';
import { supabase } from './config/supabaseClient'; 

import LoginPage from './modules/auth/pages/LoginPage'; 
import Budget503020Page from './modules/budget/pages/Budget503020Page'; 
import ExtraIncomesPage from './modules/income/pages/IncomePage'; 
import EgresosPage from './modules/expenses/pages/ExpensesPage'; 

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('planificacion'); 
  
  // Estados de Interfaz: Sidebar (Mobile y Desktop) y Modo Oscuro
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop colapsable
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true; 
  });

  // Manejo de Autenticación Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Aplicación del Tema Oscuro/Claro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const navigateTo = (tab) => {
    setCurrentTab(tab);
    setIsSidebarOpen(false); // Cierra el drawer en mobile al navegar
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white text-xs font-bold tracking-wider uppercase gap-3">
        <div className="w-6 h-6 border-2 border-t-blue-500 border-slate-700 rounded-full animate-spin"></div>
        Cargando entorno seguro...
      </div>
    );
  }

  // --- PROTECCIÓN STRICT LOGIN ---
  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans transition-colors duration-200">
      
      {/* 📱 HEADER MOBILE (Solo visible en pantallas chicas) */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shrink-0 z-40">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
          >
            {isSidebarOpen ? '✕' : '☰'}
          </button>
          <div>
            <span className="text-[9px] font-black text-blue-500 tracking-wider uppercase block">MFT</span>
            <h1 className="text-xs font-black">Finance Tracker</h1>
          </div>
        </div>
        
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-xs"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      {/* 🗂️ SIDEBAR RESPONSIVE Y COLAPSABLE EN DESKTOP */}
      <aside className={`
        fixed inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:flex flex-col z-50 transition-all duration-300 ease-in-out shrink-0
        ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}
      `}>
        {/* Encabezado Sidebar + Botón de Ocultar/Expandir en Desktop */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
          <div className={`overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'}`}>
            <span className="text-[10px] font-black text-blue-500 tracking-widest uppercase block mb-0.5 whitespace-nowrap">My Finance Tracker</span>
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 whitespace-nowrap">Control de operaciones</h2>
          </div>
          {/* Botón interactivo para colapsar (Solo visible en Desktop) */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:block p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-xs border border-gray-200/60 dark:border-slate-800 transition-all active:scale-95"
            title={isSidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isSidebarCollapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Perfil de Usuario Logueado */}
        <div className="p-4 bg-gray-50/50 dark:bg-slate-950/40 border-b border-gray-100 dark:border-slate-800/40 flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold shrink-0">
            👤
          </div>
          <div className={`overflow-hidden flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100 w-auto'}`}>
            <span className="text-[10px] font-bold text-gray-400 block uppercase whitespace-nowrap">Usuario Activo</span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{session.user.email}</p>
          </div>
        </div>

        {/* Cuerpo de Navegación */}
        <nav className="flex-1 p-3 space-y-1 overflow-x-hidden">
          <button
            onClick={() => navigateTo('planificacion')}
            className={`w-full flex items-center py-2.5 rounded-xl text-xs font-bold transition-all ${
              isSidebarCollapsed ? 'md:justify-center md:px-0' : 'px-4'
            } ${
              currentTab === 'planificacion'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/60'
            }`}
            title="Regla 50/30/20"
          >
            <span className="text-sm shrink-0">📊</span> 
            <span className={`ml-3 transition-opacity duration-200 whitespace-nowrap ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>Regla 50/30/20</span>
          </button>

          <button
            onClick={() => navigateTo('ingresos')}
            className={`w-full flex items-center py-2.5 rounded-xl text-xs font-bold transition-all ${
              isSidebarCollapsed ? 'md:justify-center md:px-0' : 'px-4'
            } ${
              currentTab === 'ingresos'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/60'
            }`}
            title="Módulo Ingresos"
          >
            <span className="text-sm shrink-0">💰</span> 
            <span className={`ml-3 transition-opacity duration-200 whitespace-nowrap ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>Ingresos</span>
          </button>

          <button
            onClick={() => navigateTo('egresos')}
            className={`w-full flex items-center py-2.5 rounded-xl text-xs font-bold transition-all ${
              isSidebarCollapsed ? 'md:justify-center md:px-0' : 'px-4'
            } ${
              currentTab === 'egresos'
                ? 'bg-red-600 text-white shadow-md shadow-red-500/10'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/60'
            }`}
            title="Módulo Egresos"
          >
            <span className="text-sm shrink-0">💸</span> 
            <span className={`ml-3 transition-opacity duration-200 whitespace-nowrap ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>Egresos</span>
          </button>
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-3 border-t border-gray-100 dark:border-slate-800 space-y-2 overflow-hidden">
          {/* Switch Light / Dark Mode en Desktop */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full hidden md:flex items-center rounded-xl bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200/60 dark:border-slate-800 text-[11px] font-bold transition-all py-2 ${
              isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-4'
            }`}
          >
            <span className={isSidebarCollapsed ? 'hidden' : 'block'}>Apariencia</span>
            <span>{darkMode ? '🌙' : '☀️'}</span>
          </button>

          {/* Botón Salir */}
          <button 
            onClick={() => supabase.auth.signOut()} 
            className={`w-full flex items-center bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-black transition-all border border-red-500/10 py-2.5 ${
              isSidebarCollapsed ? 'justify-center px-0 rounded-xl' : 'justify-center gap-2 px-4 rounded-xl'
            }`}
            title="Cerrar sesión"
          >
            <span>🔒</span>
            <span className={isSidebarCollapsed ? 'hidden' : 'block'}>Salir</span>
          </button>
        </div>
      </aside>

      {/* 🌫️ BACKDROP MOBILE */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* 💻 CONTENEDOR CENTRAL DE LAS PÁGINAS */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto overflow-y-auto h-[calc(100vh-65px)] md:h-screen transition-all duration-300">
        {currentTab === 'planificacion' && <Budget503020Page />}
        {currentTab === 'ingresos' && <ExtraIncomesPage />}
        {currentTab === 'egresos' && <EgresosPage />}
      </main>

    </div>
  );
}