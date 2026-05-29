import React, { useState, useEffect } from 'react';

export default function Budget503020Page() {
  const fixedConcepts = ['Sueldo', 'Aguinaldo', 'BAE', 'Turismo'];
  
  const getCurrentMonthString = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());
  const [editingId, setEditingId] = useState(null);
  
  // CARGA DE PRESUPUESTOS (Sincronizado con todo el ecosistema)
  const [budgetList, setBudgetList] = useState(() => {
    const savedBudgets = localStorage.getItem('mft_budgets');
    return savedBudgets ? JSON.parse(savedBudgets) : [];
  });

  const [budgetForm, setBudgetForm] = useState({ concept: '', amount: '' });

  useEffect(() => {
    localStorage.setItem('mft_budgets', JSON.stringify(budgetList));
  }, [budgetList]);

  // Filtrado y cálculos reactivos para las tarjetas
  const filteredBudgets = budgetList.filter(b => b.month === selectedMonth);
  const totalIncomeMonth = filteredBudgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalNeeds = totalIncomeMonth * 0.50;
  const totalDesires = totalIncomeMonth * 0.30;
  const totalSavings = totalIncomeMonth * 0.20;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBudgetForm(prev => ({ ...prev, [name]: value }));
  };

  // GUARDAR O ACTUALIZAR REGISTRO
  const handleSaveBudget = (e) => {
    e.preventDefault();
    if (!budgetForm.concept || !budgetForm.amount) return;

    if (editingId) {
      // Modo Edición: Actualiza el concepto o monto existente
      setBudgetList(prev => prev.map(b => 
        b.id === editingId 
          ? { ...b, concept: budgetForm.concept, amount: parseFloat(budgetForm.amount) } 
          : b
      ));
      setEditingId(null);
    } else {
      // Modo Carga Nueva
      const newBudget = { 
        id: Date.now(), 
        month: selectedMonth, 
        concept: budgetForm.concept, 
        amount: parseFloat(budgetForm.amount) 
      };
      setBudgetList(prev => [newBudget, ...prev]);
    }
    setBudgetForm({ concept: '', amount: '' });
  };

  // ACTIVAR EL MODO EDICIÓN
  const handleEditClick = (b) => {
    setEditingId(b.id);
    setBudgetForm({ concept: b.concept, amount: b.amount });
  };

  // ELIMINAR REGISTRO (Libera y recalcula los otros módulos automáticamente)
  const handleDeleteBudget = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de planificación? Esto alterará los totales calculados de este mes.')) {
      setBudgetList(prev => prev.filter(b => b.id !== id));
      if (editingId === id) { 
        setEditingId(null); 
        setBudgetForm({ concept: '', amount: '' }); 
      }
    }
  };

  return (
    <div className="space-y-5 flex flex-col h-full max-w-full overflow-x-hidden pb-6">
      
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-200/60 mx-1">
        <div className="text-center sm:text-left">
          <h2 className="text-lg font-black text-black dark:text-white">Planificación Mensual 50/30/20</h2>
          <p className="text-[11px] text-gray-400">Distribución automática de tus ingresos brutos.</p>
        </div>
        <input 
          type="month" 
          value={selectedMonth} 
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            setEditingId(null);
            setBudgetForm({ concept: '', amount: '' });
          }} 
          className="w-full sm:w-auto text-center px-4 py-1.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-bold text-black dark:text-white" 
        />
      </div>

      {/* FORMULARIO ADAPTATIVO */}
      <div className={`p-4 rounded-2xl border transition-colors shrink-0 mx-1 
        ${editingId 
          ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40' 
          : 'bg-gray-50 dark:bg-slate-800/40 border-gray-200/60 dark:border-slate-700/60'}`}
      >
        <form onSubmit={handleSaveBudget} className="flex flex-col md:flex-row items-stretch md:items-end gap-3.5">
          <div className="flex-1">
            <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Concepto Fijo</label>
            <select name="concept" value={budgetForm.concept} onChange={handleInputChange} required className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-black dark:text-white font-medium focus:outline-none">
              <option value="">Selecciona concepto...</option>
              {fixedConcepts.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Monto ($)</label>
            <input type="number" name="amount" value={budgetForm.amount} onChange={handleInputChange} placeholder="0" required min="1" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-black dark:text-white font-medium focus:outline-none" />
          </div>
          <div className="flex-1 flex gap-2">
            {editingId ? (
              <>
                <button type="submit" className="flex-1 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs h-[36px] shadow-md transition-all">
                  Actualizar Monto
                </button>
                <button type="button" onClick={() => { setEditingId(null); setBudgetForm({ concept: '', amount: '' }); }} className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-xs h-[36px]">
                  X
                </button>
              </>
            ) : (
              <button type="submit" className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-[36px] transition-all shadow-sm">
                Procesar y Distribuir
              </button>
            )}
          </div>
        </form>
      </div>

      {/* INDICADORES GRÁFICOS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0 mx-1">
        <div className="bg-blue-50/60 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
          <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider block">Ingreso Total</span>
          <span className="text-sm font-black text-black dark:text-white">${totalIncomeMonth.toLocaleString('es-AR')}</span>
        </div>
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider block">Básicos (50%)</span>
          <span className="text-sm font-black text-black dark:text-white">${totalNeeds.toLocaleString('es-AR')}</span>
        </div>
        <div className="bg-purple-50/60 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/30">
          <span className="text-[9px] font-bold text-purple-500 uppercase tracking-wider block">Gastos (30%)</span>
          <span className="text-sm font-black text-black dark:text-white">${totalDesires.toLocaleString('es-AR')}</span>
        </div>
        <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
          <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block">Ahorro (20%)</span>
          <span className="text-sm font-black text-black dark:text-white">${totalSavings.toLocaleString('es-AR')}</span>
        </div>
      </div>

      {/* TABLA CON VISTA DUAL RESPONSIVE Y EDICIÓN COMPLETA */}
      <div className="flex-1 flex flex-col border border-gray-200/60 dark:border-slate-700/60 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden min-h-[300px]">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 shrink-0">
          <h4 className="text-sm font-bold text-black dark:text-white">Desglose de Fondos Distribuidos</h4>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredBudgets.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">No hay registros de planificación para este mes.</div>
          ) : (
            <>
              {/* MOBILE CARDS */}
              <div className="block md:hidden divide-y divide-gray-100 dark:divide-slate-700/60">
                {filteredBudgets.map((b) => (
                  <div key={b.id} className="p-4 space-y-3 bg-white dark:bg-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-black dark:text-white">{b.concept}</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white">${b.amount.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 p-1.5 rounded-lg">50%<br />${(b.amount * 0.5).toLocaleString('es-AR')}</div>
                      <div className="bg-purple-50 dark:bg-purple-950/30 text-purple-600 p-1.5 rounded-lg">30%<br />${(b.amount * 0.3).toLocaleString('es-AR')}</div>
                      <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 p-1.5 rounded-lg">20%<br />${(b.amount * 0.2).toLocaleString('es-AR')}</div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-slate-700/40">
                      <button type="button" onClick={() => handleEditClick(b)} className="flex items-center gap-1 text-[11px] font-bold text-blue-600 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 active:scale-95 transition-transform">✏️ Editar</button>
                      <button type="button" onClick={() => handleDeleteBudget(b.id)} className="flex items-center gap-1 text-[11px] font-bold text-red-600 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 active:scale-95 transition-transform">🗑️ Borrar</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* TABLET / DESKTOP TABLE */}
              <table className="hidden md:table w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-700/50 sticky top-0 text-[11px] font-bold uppercase text-gray-400 border-b border-gray-100 dark:border-slate-700 z-10">
                  <tr>
                    <th className="p-3.5">Mes</th>
                    <th className="p-3.5">Concepto</th>
                    <th className="p-3.5 text-right">Monto Bruto</th>
                    <th className="p-3.5 text-right text-emerald-500">Básicos (50%)</th>
                    <th className="p-3.5 text-right text-purple-500">Gastos (30%)</th>
                    <th className="p-3.5 text-right text-amber-500">Ahorro (20%)</th>
                    <th className="p-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 text-xs font-semibold">
                  {filteredBudgets.map((b) => (
                    <tr key={b.id} className={`hover:bg-gray-50/60 dark:hover:bg-slate-700/20 transition-colors ${editingId === b.id ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}`}>
                      <td className="p-3.5 text-gray-400 uppercase text-[10px]">{(new Date(b.month + '-02')).toLocaleDateString('es-AR', {month:'short', year:'numeric'})}</td>
                      <td className="p-3.5 font-bold text-black dark:text-white">{b.concept}</td>
                      <td className="p-3.5 text-right font-black text-black dark:text-white">${b.amount.toLocaleString('es-AR')}</td>
                      <td className="p-3.5 text-right text-emerald-600">${(b.amount * 0.5).toLocaleString('es-AR')}</td>
                      <td className="p-3.5 text-right text-purple-600">${(b.amount * 0.3).toLocaleString('es-AR')}</td>
                      <td className="p-3.5 text-right text-amber-600">${(b.amount * 0.2).toLocaleString('es-AR')}</td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button type="button" onClick={() => handleEditClick(b)} className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 border border-transparent hover:border-blue-200 dark:hover:border-blue-900/50 transition-all" title="Editar">✏️</button>
                          <button type="button" onClick={() => handleDeleteBudget(b.id)} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 border border-transparent hover:border-red-200 dark:hover:border-red-900/50 transition-all" title="Eliminar">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

    </div>
  );
}