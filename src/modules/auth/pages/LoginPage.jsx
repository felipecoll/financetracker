import React, { useState } from 'react';
import { supabase } from './../../../config/supabaseClient'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Intentar loguearse en la base de datos de Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      // Si todo sale bien, Supabase dispara el evento 'onAuthStateChange' 
      // que ya está escuchando tu App.jsx y te da acceso automáticamente.
    } catch (error) {
      console.error("Error al autenticar:", error.message);
      // Traducimos el error común para que sea amigable
      if (error.message === 'Invalid login credentials') {
        setErrorMsg('Correo o contraseña incorrectos. Verificá los datos.');
      } else {
        setErrorMsg(error.message);
      }
    } finally {
      setLoading(false);
    }
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

        {/* CARTEL DE ERROR POR SI FALLA LAS CREDENCIALES */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl text-xs font-bold text-center bg-red-500/10 text-red-500 border border-red-500/20">
            {errorMsg} ⚠️
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
              placeholder="tu@correo.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
              Contraseña
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all transform active:scale-95 shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? 'Validando credenciales...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}