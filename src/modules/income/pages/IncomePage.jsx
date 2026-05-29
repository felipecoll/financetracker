import React, { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabaseClient';

export default function ExtraIncomesPage() {
  // Conceptos dinámicos para los ingresos extras
  const [concepts, setConcepts] = useState(() => {
    const savedConcepts = localStorage.getItem('mft_income_concepts');
    return savedConcepts ? JSON.parse(savedConcepts) : ['Venta Hardware', 'Changas', 'Rendimientos', 'Otros'];
  });

  const getCurrentMonthString = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());
  const [editingId, setEditingId] = useState(null);
  const [newConceptName, setNewConceptName] = useState('');
  const [showAddConceptModal, setShowAddConceptModal] = useState(false);
  
  const [syncStatus, setSyncStatus] = useState({ loading: false, type: '', message: '' });

  // 1. INGRESOS EXTRAS (Los que se gestionan y suben desde este módulo)
  const [incomeList, setIncomeList] = useState(() => {
    const savedIncomes = localStorage.getItem('mft_extra_incomes');
    return savedIncomes ? JSON.parse(savedIncomes) : [];
  });

  // 2. REFLEJO DE INGRESOS FIJOS (Vienen del módulo 50/30/20)
  const [fixedBudgets, setFixedBudgets] = useState(() => {
    const savedBudgets = localStorage.getItem('mft_budgets');
    return savedBudgets ? JSON.parse(savedBudgets) : [];
  });

  // Escuchar cambios en el localStorage por si el usuario actualiza el 50/30 en otra pestaña
  useEffect(() => {
    const handleStorageChange = () => {
      const savedBudgets = localStorage.getItem('mft_budgets');
      if (savedBudgets) setFixedBudgets(JSON.parse(savedBudgets));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('mft_income_concepts', JSON.stringify(concepts));
  }, [concepts]);

  useEffect(() => {
    localStorage.setItem('mft_extra_incomes', JSON.stringify(incomeList));
  }, [incomeList]);

  // --- PROCESAMIENTO UNIFICADO DE DATOS RECOLECTADOS ---
  
  // Filtrados por el período mensual seleccionado
  const filteredExtraIncomes = incomeList.filter(inc => inc.month === selectedMonth);
  const filteredFixedBudgets = fixedBudgets.filter(b => b.month === selectedMonth);

  // Mapeamos los ingresos fijos para unificar la visualización en la tabla de abajo
  const reflectedFixedList = filteredFixedBudgets.map(b => ({
    id: `fixed-${b.id}`, 
    month: b.month,
    concept: b.concept,
    amount: b.amount,
    isFixedReflected: true // Flag para identificar que viene de la regla 50/30
  }));

  // Concatenamos ambos mundos para la grilla y el cálculo final
  const combinedIncomesTotalList = [...reflectedFixedList, ...filteredExtraIncomes];
  
  const totalExtraIncomeOnly = filteredExtraIncomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
  const totalFixedIncomeOnly = filteredFixedBudgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalGeneralIncome = totalFixedIncomeOnly + totalExtraIncomeOnly;

  // --- LÓGICA DE CONCEPTOS EN CALIENTE ---
  const handleAddConcept = (e) => {
    e.preventDefault();
    const cleanName = newConceptName.trim();
    if (!cleanName) return;
    
    if (!concepts.some(c => c.toLowerCase() === cleanName.toLowerCase())) {
      setConcepts(prev => [...prev, cleanName]);
      setIncomeForm(prev => ({ ...prev, concept: cleanName }));
    }
    setNewConceptName('');
    setShowAddConceptModal(false);
  };

  // --- INTERFACES ASINCRÓNICAS SUPABASE (Solo opera sobre extras) ---
  const handleUploadToCloud = async () => {
    setSyncStatus({ loading: true, type: 'upload', message: 'Respaldando ingresos extras en Supabase...' });
    try {
      if (incomeList.length === 0) {
        const { error: deleteError } = await supabase.from('mft_extra_incomes').delete().neq('id', 0);
        if (deleteError) throw deleteError;
      } else {
        const { error } = await supabase.from('mft_extra_incomes').upsert(incomeList);
        if (error) throw error;
      }
      setSyncStatus({ loading: false, type: 'success', message: '¡Ingresos extras guardados en la nube con éxito! ✅' });
    } catch (error) {
      console.error(error);
      setSyncStatus({ loading: false, type: 'error', message: `Error al subir: ${error.message} ❌` });
    }
    setTimeout(() => setSyncStatus({ loading: false, type: '', message: '' }), 4000);
  };

  const handleDownloadFromCloud = async () => {
    setSyncStatus({ loading: true, type: 'download', message: 'Sincronizando base de datos externa...' });
    try {
      const { data, error } = await supabase
        .from('mft_extra_incomes')
        .select('*')
        .order('month', { ascending: false });

      if (error) throw error;

      if (data) {
        setIncomeList(data);
        setSyncStatus({ loading: false, type: 'success', message: '¡Ingresos extras sincronizados en este dispositivo! 📥' });
      }
    } catch (error) {
      console.error(error);
      setSyncStatus({ loading: false, type: 'error', message: `Error al bajar: ${error.message} ❌` });
    }
    setTimeout(() => setSyncStatus({ loading: false, type: '', message: '' }), 4000);
  };

  // --- OPERACIONES LOCALES (CRUD) ---
  const [incomeForm, setIncomeForm] = useState({ concept: '', amount: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIncomeForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveIncome = (e) => {
    e.preventDefault();
    if (!incomeForm.concept || !incomeForm.amount) return;

    if (editingId) {
      setIncomeList(prev => prev.map(inc => 
        inc.id === editingId 
          ? { ...inc, concept: incomeForm.concept, amount: parseFloat(incomeForm.amount) } 
          : inc
      ));
      setEditingId(null);
    } else {
      const newIncome = {
        id: Date.now(),
        month: selectedMonth,
        concept: incomeForm.concept,
        amount: parseFloat(incomeForm.amount)
      };
      setIncomeList(prev => [newIncome, ...prev]);
    }
    setIncomeForm({ concept: '', amount: '' });
  };

  const handleEditClick = (inc) => {
    setEditingId(inc.id);
    setIncomeForm({ concept: inc.concept, amount: inc.amount });
  };

  const handleDeleteIncome = (id) => {
    if (window.confirm('¿Deseas eliminar este ingreso extra del registro local?')) {
      setIncomeList(prev => prev.filter(inc => inc.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setIncomeForm({ concept: '', amount: '' });
      }
    }
  };

  return (
    <div className="space-y-5 flex flex-col h-full max-w-full overflow-x-hidden pb-6">
      
      {/* CONTROLADOR CLOUD SUPABASE */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 mx-1 shrink-0">
        <div className="text-center sm:text-left">
          <span className="text-[10px] font-black text-blue-400 tracking-wider uppercase block">Nube de Supabase</span>
          <p className="text-xs text-slate-300 font-semibold">Resguarda o recupera la información de ingresos extraordinarios.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleUploadToCloud}
            disabled={syncStatus.loading}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all shadow-sm disabled:opacity-50 active:scale-95"
          >
            {syncStatus.loading && syncStatus.type === 'upload' ? 'Subiendo...' : '📤 Respaldar en Nube'}
          </button>
          <button
            onClick={handleDownloadFromCloud}
            disabled={syncStatus.loading}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-black transition-all shadow-sm disabled:opacity-50 active:scale-95"
          >
            {syncStatus.loading && syncStatus.type === 'download' ? 'Descargando...' : '📥 Traer de Nube'}
          </button>
        </div>
      </div>

      {/* COMPONENTE AVISADOR EN PANTALLA */}
      {syncStatus.message && (
        <div className={`mx-1 p-3 rounded-xl text-xs font-bold text-center transition-all animate-pulse
          ${syncStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : ''}
          ${syncStatus.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : ''}
          ${syncStatus.type === 'upload' || syncStatus.type === 'download' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : ''}
        `}>
          {syncStatus.message}
        </div>
      )}

      {/* ENCABEZADO LOCAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-200/60 mx-1">
        <div className="text-center sm:text-left">
          <h2 className="text-lg font-black text-black dark:text-white">Flujo de Ingresos Integrado</h2>
          <p className="text-[11px] text-gray-400">Visualización de fijos (regla 50/30) y adición de ingresos extraordinarios.</p>
        </div>
        <input 
          type="month" 
          value={selectedMonth} 
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            setEditingId(null);
            setIncomeForm({ concept: '', amount: '' });
          }} 
          className="w-full sm:w-auto text-center px-4 py-1.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-bold text-black dark:text-white" 
        />
      </div>

      {/* FORMULARIO DINÁMICO */}
      <div className={`p-4 rounded-2xl border transition-colors shrink-0 mx-1 
        ${editingId 
          ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40' 
          : 'bg-gray-50 dark:bg-slate-800/40 border-gray-200/60 dark:border-slate-700/60'}`}
      >
        <form onSubmit={handleSaveIncome} className="flex flex-col md:flex-row items-stretch md:items-end gap-3.5">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase text-gray-500">Origen / Concepto Extra</label>
              <button 
                type="button" 
                onClick={() => setShowAddConceptModal(true)} 
                className="text-[11px] font-bold text-blue-600 hover:underline px-1"
              >
                ➕ Nuevo
              </button>
            </div>
            <select name="concept" value={incomeForm.concept} onChange={handleInputChange} required className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-black dark:text-white font-medium focus:outline-none">
              <option value="">Selecciona origen...</option>
              {concepts.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Monto Cobrado ($)</label>
            <input type="number" name="amount" value={incomeForm.amount} onChange={handleInputChange} placeholder="0" required min="1" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-black dark:text-white font-medium focus:outline-none" />
          </div>
          <div className="flex-1 flex gap-2">
            {editingId ? (
              <>
                <button type="submit" className="flex-1 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs h-[36px] shadow-md transition-all">
                  Actualizar Registro
                </button>
                <button type="button" onClick={() => { setEditingId(null); setIncomeForm({ concept: '', amount: '' }); }} className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-xs h-[36px]">
                  X
                </button>
              </>
            ) : (
              <button type="submit" className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-[36px] transition-all shadow-sm">
                Inyectar Extra
              </button>
            )}
          </div>
        </form>
      </div>

      {/* MÉTRICAS BALANCEADAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0 mx-1">
        <div className="bg-blue-50/60 dark:bg-blue-950/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/20">
          <span className="text-[9px] font-bold uppercase text-blue-500 block">Fijos (Regla 50/30)</span>
          <h4 className="text-sm font-black text-black dark:text-white">${totalFixedIncomeOnly.toLocaleString('es-AR')}</h4>
        </div>
        <div className="bg-teal-50/60 dark:bg-teal-950/10 p-3 rounded-xl border border-teal-100 dark:border-teal-900/20">
          <span className="text-[9px] font-bold uppercase text-teal-600 block">Extras Cargados</span>
          <h4 className="text-sm font-black text-black dark:text-white">${totalExtraIncomeOnly.toLocaleString('es-AR')}</h4>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
          <span className="text-[9px] font-bold uppercase text-emerald-600 block">Ingreso General Real</span>
          <h4 className="text-sm font-black text-black dark:text-white">${totalGeneralIncome.toLocaleString('es-AR')}</h4>
        </div>
      </div>

      {/* HISTORIAL INTEGRADO */}
      <div className="flex-1 flex flex-col border border-gray-200/60 dark:border-slate-700/60 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden min-h-[300px]">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 shrink-0">
          <h4 className="text-sm font-bold text-black dark:text-white">Caja Unificada del Mes</h4>
        </div>

        <div className="flex-1 overflow-y-auto">
          {combinedIncomesTotalList.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">No hay entradas de caja para este periodo.</div>
          ) : (
            <>
              {/* MOBILE INTERFACE */}
              <div className="block md:hidden divide-y divide-gray-100 dark:divide-slate-700/60">
                {combinedIncomesTotalList.map((inc) => (
                  <div key={inc.id} className="p-4 flex flex-col gap-3 bg-white dark:bg-slate-800">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-black text-black dark:text-white block">{inc.concept}</span>
                        {inc.isFixedReflected ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Fijo (50/30/20)</span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold bg-teal-50 text-teal-600 border border-teal-100">Ingreso Extra</span>
                        )}
                      </div>
                      <span className="text-sm font-black text-emerald-600">+${inc.amount.toLocaleString('es-AR')}</span>
                    </div>
                    {!inc.isFixedReflected && (
                      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-slate-700/40">
                        <button type="button" onClick={() => handleEditClick(inc)} className="text-[11px] font-bold text-blue-600 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 active:scale-95">✏️ Editar</button>
                        <button type="button" onClick={() => handleDeleteIncome(inc.id)} className="text-[11px] font-bold text-red-600 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 active:scale-95">🗑️ Borrar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <table className="hidden md:table w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-700/50 sticky top-0 text-[11px] font-bold uppercase text-gray-400 border-b border-gray-100 z-10">
                  <tr>
                    <th className="p-3.5">Origen / Concepto</th>
                    <th className="p-3.5">Tipo de Flujo</th>
                    <th className="p-3.5 text-right text-emerald-500">Monto Inyectado</th>
                    <th className="p-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 text-xs font-semibold">
                  {combinedIncomesTotalList.map((inc) => (
                    <tr key={inc.id} className={`hover:bg-gray-50/60 dark:hover:bg-slate-700/20 transition-colors ${editingId === inc.id ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}`}>
                      <td className="p-3.5 font-bold text-black dark:text-white">{inc.concept}</td>
                      <td className="p-3.5">
                        {inc.isFixedReflected ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">Fijo (50/30/20)</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-100 dark:border-teal-900/30">Ingreso Extra</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-black text-emerald-600">+${inc.amount.toLocaleString('es-AR')}</td>
                      <td className="p-3.5 text-center">
                        {inc.isFixedReflected ? (
                          <span className="text-gray-400 text-[11px] italic">Bloqueado (Editar en 50/30)</span>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <button type="button" onClick={() => handleEditClick(inc)} className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 border border-transparent hover:border-blue-200 dark:hover:border-blue-900/50 transition-all">✏️</button>
                            <button type="button" onClick={() => handleDeleteIncome(inc.id)} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 border border-transparent hover:border-red-200 dark:hover:border-red-900/50 transition-all">🗑️</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* MODAL PARA AGREGAR NUEVO ORIGEN / CONCEPTO EXTRA */}
      {showAddConceptModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 max-w-sm w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h5 className="text-sm font-black text-black dark:text-white mb-1.5">Nuevo Origen de Ingreso Extra</h5>
            <p className="text-[11px] text-gray-400 mb-4">Se guardará de forma local para imputaciones extras.</p>
            
            <form onSubmit={handleAddConcept} className="space-y-4">
              <input 
                type="text" 
                value={newConceptName}
                onChange={(e) => setNewConceptName(e.target.value)}
                placeholder="Ej. Venta de Celular, Honorarios..." 
                autoFocus
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-xs text-black dark:text-white focus:outline-none"
              />
              <div className="flex gap-2 justify-end text-xs font-bold">
                <button 
                  type="button" 
                  onClick={() => { setShowAddConceptModal(false); setNewConceptName(''); }}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                >
                  Agregar Origen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}