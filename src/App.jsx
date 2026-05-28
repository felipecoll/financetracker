import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './modules/auth/pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import { HomeView, IngresosView, EgresosView, Regla503020View } from './modules/contentViews';
import './App.css'

export default function App() {
  // Cambiado a true para desarrollo. Volver a false cuando implementemos Auth real.
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [activeTab, setActiveTab] = useState('home');

  // Selector dinámico de contenido central
  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeView />;
      case 'ingresos': return <IngresosView />;
      case 'egresos': return <EgresosView />;
      case 'regla': return <Regla503020View />;
      default: return <HomeView />;
    }
  };

  return (
    <ThemeProvider>
      {!isAuthenticated ? (
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
          {renderContent()}
        </DashboardLayout>
      )}
    </ThemeProvider>
  );
}