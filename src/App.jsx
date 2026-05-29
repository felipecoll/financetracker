import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './modules/auth/pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import ExpensesPage from './modules/expenses/pages/ExpensesPage';
import Budget503020Page from './modules/budget/pages/Budget503020Page'; // Importación añadida
import { HomeView, IngresosView } from './modules/contentViews';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [activeTab, setActiveTab] = useState('regla'); // Lo seteamos acá para que veas los cambios al recargar

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeView />;
      case 'ingresos': return <IngresosView />;
      case 'egresos': return <ExpensesPage />; 
      case 'regla': return <Budget503020Page />; // Vinculación del componente dinámico
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