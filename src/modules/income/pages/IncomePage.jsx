import React, { useState, useEffect } from 'react';

export default function IncomePage() {
  const getCurrentMonthString = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());
  const [editingId, setEditingId] = useState(null);
  const [extraIncomeList, setExtraIncomeList] = useState(() => {
    const savedIncomes = localStorage.getItem('mft_extra_incomes');
    return savedIncomes ? JSON.parse(savedIncomes) : [];
  });

  const [budgetList, setBudgetList] = useState(() => {
    const savedBudgets = localStorage.getItem('mft_budgets');
    return savedBudgets ? JSON.parse(savedBudgets) : [];
  });

  const [incomeForm, setIncomeForm] = useState({ concept: '', amount: '' });

  useEffect(() => {
    localStorage.setItem('mft_extra_incomes', JSON.stringify(extraIncomeList));
  }, [extraIncomeList]);

  const autoSalary = budgetList.find(b => b.month === selectedMonth && b.concept === 'Sueldo');
  const filteredExtras = extraIncomeList.filter(inc => inc.month === selectedMonth);

  const allIncomesForMonth = [];
  if (autoSalary) {
    allIncomesForMonth.push({ id: `auto-${autoSalary.id}`, month: autoSalary.month, concept: 'Sueldo (Importado)', amount: autoSalary.amount, isAuto: true });
  }
  allIncomesForMonth.push(...filteredExtras.map(ext => ({ ...ext, isAuto: false })));

  const totalIncome = allIncomesForMonth.reduce((sum, inc) => sum + Number(inc.amount), 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIncomeForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveIncome = (e) => {
    e.preventDefault();
    if (!incomeForm.concept || !incomeForm.amount) return;

    if (editingId) {
      setExtraIncomeList(prev => prev.map(inc => inc.id === editingId ? { ...inc, concept: incomeForm.concept, amount: parseFloat(incomeForm.amount) } : inc));
      setEditingId(null);
    } else {
      const newIncome = { id: Date.now(), month: selectedMonth, concept: incomeForm.concept, amount: parseFloat(incomeForm.amount) };
      setExtraIncomeList(prev => [newIncome, ...prev]);
    }
    setIncomeForm({ concept: '', amount: '' });
  };

  const handleEditClick = (inc) => {
    if (inc.isAuto) return;
    setEditingId(inc.id);
    setIncomeForm({ concept: inc.concept, amount: inc.amount });
  };

  const handleDeleteClick = (id, isAuto) => {
    if (isAuto) return;
    if (window.confirm('¿Deseas eliminar este ingreso adicional?')) {
      setExtraIncomeList(prev => prev.filter(inc => inc.id !== id));
      if (editingId === id) { setEditingId(null); setIncomeForm({ concept: '', amount: '' }); }
    }
  };

  return (
    <div className="space-y-5 flex flex-col h-full max-w-full overflow-x-hidden pb-6">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-200/60 mx-1">
        <div className="text-center sm:text-left">
          <h2 className="text-lg font-black text-black dark:text-white">Control de Ingresos</h2>
          <p className="text-[11px] text-gray-400">Auditoría contable limpia para balances generales.</p>
        </div>
        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full sm:w-auto text-center px-4 py-1.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-bold text-black dark:text-white" />
      </div>

      {/* FORMULARIO ADAPTATIVO */}
      <div className={`p-4 rounded-2xl border transition-colors shrink-0 mx-1 ${editingId ? 'bg-blue-50/40 border-blue-200' : 'bg-gray-50 dark:bg-slate-800/40 border-gray-200/60'}`}>
        <form onSubmit={handleSaveIncome} className="flex flex-col md:flex-row items-stretch md:items-end gap-3.5">
          <div className="flex-1">
            <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Concepto Adicional</label>
            <input type="text" name="concept" value={incomeForm.concept} onChange={handleInputChange} required placeholder="Ej. Venta de notebook" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-black dark:text-white font-medium focus:outline-none" />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Monto ($)</label>
            <input type="number" name="amount" value={incomeForm.amount} onChange={handleInputChange} placeholder="0" required min="1" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-black dark:text-white font-medium focus:outline-none" />
          </div>
          <div className="flex-1 flex gap-2">
            {editingId ? (
              <>
                <button type="submit" className="flex-1 py-2 rounded-xl bg-green-600 text-white font-bold text-xs h-[36px]">Actualizar</button>
                <button type="button" onClick={() => { setEditingId(null); setIncomeForm({ concept: '', amount: '' }); }} className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-slate-700 font-bold text-xs h-[36px]">X</button>
              </>
            ) : (
              <button type="submit" className="w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs h-[36px] transition-all shadow-sm">+ Añadir Ingreso Extra</button>
            )}
          </div>
        </form>
      </div>

      {/* INDICADORES RESUMEN (Elásticos de 1 columna en mobile, 3 en desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0 mx-1">
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-center sm:text-left">
          <span className="text-[9px] font-bold text-emerald-500 uppercase block">Caja Unificada del Mes</span>
          <span className="text-base font-black text-black dark:text-white">${totalIncome.toLocaleString('es-AR')}</span>
        </div>
        <div className="bg-blue-50/60 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 text-center sm:text-left">
          <span className="text-[9px] font-bold text-blue-500 uppercase block">Sueldo Base</span>
          <span className="text-base font-black text-black dark:text-white">${(autoSalary ? autoSalary.amount : 0).toLocaleString('es-AR')}</span>
        </div>
        <div className="bg-purple-50/60 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/30 text-center sm:text-left">
          <span className="text-[9px] font-bold text-purple-500 uppercase block">Extras Registrados</span>
          <span className="text-base font-black text-black dark:text-white">{filteredExtras.length} ítems</span>
        </div>
      </div>

      {/* TABLA CON VISTA DUAL RESPONSIVE */}
      <div className="flex-1 flex flex-col border border-gray-200/60 dark:border-slate-700/60 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden min-h-[300px]">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 shrink-0">
          <h4 className="text-sm font-bold text-black dark:text-white">Registro Histórico del Período</h4>
        </div>

        <div className="flex-1 overflow-y-auto">
          {allIncomesForMonth.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">No hay movimientos registrados.</div>
          ) : (
            <>
              {/* MOBILE CARDS */}
              <div className="block md:hidden divide-y divide-gray-100 dark:divide-slate-700/60">
                {allIncomesForMonth.map((inc) => (
                  <div key={inc.id} className="p-4 flex flex-col gap-2 bg-white dark:bg-slate-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-black text-black dark:text-white block">{inc.concept}</span>
                        <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-md ${inc.isAuto ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>{inc.isAuto ? '⚙️ Sincronizado' : '👤 Manual / Extra'}</span>
                      </div>
                      <span className="text-sm font-black text-emerald-600">+${inc.amount.toLocaleString('es-AR')}</span>
                    </div>
                    {!inc.isAuto && (
                      <div className="flex justify-end gap-3 pt-1 border-t border-gray-50">
                        <button onClick={() => handleEditClick(inc)} className="text-[11px] font-bold text-blue-600 px-2 py-1">✏️ Editar</button>
                        <button onClick={() => handleDeleteClick(inc.id, inc.isAuto)} className="text-[11px] font-bold text-red-600 px-2 py-1">🗑️ Borrar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* TABLET / DESKTOP */}
              <table className="hidden md:table w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-700/50 sticky top-0 text-[11px] font-bold uppercase text-gray-400 border-b border-gray-100 z-10">
                  <tr>
                    <th className="p-3.5">Mes</th>
                    <th className="p-3.5">Concepto</th>
                    <th className="p-3.5">Origen</th>
                    <th className="p-3.5 text-right">Monto</th>
                    <th className="p-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 text-xs font-semibold">
                  {allIncomesForMonth.map((inc) => (
                    <tr key={inc.id} className={`hover:bg-gray-50/60 dark:hover:bg-slate-700/20 transition-colors ${editingId === inc.id ? 'bg-blue-50/40' : ''}`}>
                      <td className="p-3.5 text-gray-400 uppercase text-[10px]">{(new Date(inc.month + '-02')).toLocaleDateString('es-AR', {month:'short', year:'numeric'})}</td>
                      <td className="p-3.5 font-bold text-black dark:text-white">{inc.concept}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] ${inc.isAuto ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{inc.isAuto ? '⚙️ Sincronizado' : '👤 Manual / Extra'}</span>
                      </td>
                      <td className="p-3.5 text-right font-black text-emerald-600">+${inc.amount.toLocaleString('es-AR')}</td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEditClick(inc)} disabled={inc.isAuto} className={`p-1.5 rounded-full border border-transparent transition-all ${inc.isAuto ? 'opacity-10 cursor-not-allowed' : 'hover:bg-blue-50 text-blue-600 hover:border-blue-200'}`}>✏️</button>
                          <button onClick={() => handleDeleteClick(inc.id, inc.isAuto)} disabled={inc.isAuto} className={`p-1.5 rounded-full border border-transparent transition-all ${inc.isAuto ? 'opacity-10 cursor-not-allowed' : 'hover:bg-red-50 text-red-600 hover:border-red-200'}`}>🗑️</button>
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