import React from 'react';

export const HomeView = () => (
  <div>
    <h2 className="text-2xl font-black text-black dark:text-white mb-2">Panel General</h2>
    <p className="text-gray-500 dark:text-gray-400">Resumen rápido del estado de tus finanzas este mes.</p>
  </div>
);

export const IngresosView = () => ( // Corregido nombre a IngresosView al importar
  <div>
    <h2 className="text-2xl font-black text-black dark:text-white mb-2">Gestión de Ingresos</h2>
    <p className="text-gray-500 dark:text-gray-400">Registra y categoriza tus entradas de dinero.</p>
  </div>
);

export const EgresosView = () => (
  <div>
    <h2 className="text-2xl font-black text-black dark:text-white mb-2">Gestión de Egresos</h2>
    <p className="text-gray-500 dark:text-gray-400">Controla tus gastos diarios y fijos.</p>
  </div>
);

export const Regla503020View = () => (
  <div>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
      <div>
        <h2 className="text-2xl font-black text-black dark:text-white mb-1">Regla Presupuestaria 50/30/20</h2>
        <p className="text-gray-500 dark:text-gray-400">Distribución inteligente de tus finanzas.</p>
      </div>
      <div>
        <select className="px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="enero">Enero</option>
          <option value="febrero">Febrero</option>
          <option value="marzo">Marzo</option>
          <option value="abril">Abril</option>
          <option value="mayo">Mayo</option>
        </select>
      </div>
    </div>
  </div>
);