import React from 'react';

export default function LoginPage({ onLogin }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(); // Simula el ingreso al dashboard
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white dark:bg-slate-800 border border-gray-200/50 dark:border-slate-700/50 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white">
          ¡Bienvenido!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Ingresa a My Finance Tracker
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
              Contraseña
            </label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all transform active:scale-95 shadow-md shadow-blue-500/20"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}