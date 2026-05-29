import React, { useState, useEffect } from 'react';

export default function Budget503020Page() {
  const fixedConcepts = ['Sueldo', 'Aguinaldo', 'BAE', 'Turismo'];

  const getCurrentMonthString = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());
  const [editingId, setEditingId] = useState(null); // ID para controlar el modo edición

  // 1. CARGA INICIAL DESDE LOCALSTORAGE
  const [budgetList, setBudgetList] = useState(() => {
    const savedBudgets = localStorage.getItem('mft_budgets');
    return savedBudgets ? JSON.parse(savedBudgets) : [];
  });

  // Estado del formulario horizontal
  const [budgetForm, setBudgetForm] = useState({
    concept: '',
    amount: ''
  });

  // 2. PERSISTENCIA EN LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem('mft_budgets', JSON.stringify(budgetList));
  }, [budgetList]);

  // Filtrar según el mes seleccionado
  const filteredBudgets = budgetList.filter(b => b.month === selectedMonth);

  // Totales generales calculados dinámicamente
  const totalIncomeMonth = filteredBudgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalNeeds = totalIncomeMonth * 0.50;
  const totalDesires = totalIncomeMonth * 0.30;
  const totalSavings = totalIncomeMonth * 0.20;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBudgetForm(prev => ({ ...prev, [name]: value }));
  };

  // Guardar (Carga nueva o Edición de registro existente)
  const handleSaveBudget = (e) => {
    e.preventDefault();
    if (!budgetForm.concept || !budgetForm.amount) return;

    if (editingId) {
      // Modo Edición
      setBudgetList(prev => prev.map(b => 
        b.id === editingId 
          ? { ...b, concept: budgetForm.concept, amount: parseFloat(budgetForm.amount) }
          : b
      ));
      setEditingId(null);
    } else {
      // Modo Nueva Carga
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

  // Activar modo edición cargando los valores en el menú horizontal
  const handleEditClick = (b) => {
    setEditingId(b.id);
    setBudgetForm({
      concept: b.concept,
      amount: b.amount
    });
  };

  // Cancelar la edición y limpiar campos
  const handleCancelEdit = () => {
    setEditingId(null);
    setBudgetForm({ concept: '', amount: '' });
  };

  // Eliminar un registro definitivamente
  const handleDeleteBudget = (id) => {
    if (window.confirm('¿Deseas eliminar este ingreso presupuestario?')) {
      setBudgetList(prev => prev.filter(b => b.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setBudgetForm({ concept: '', amount: '' });
      }
    }
  };

  const formatMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  return (
    <div className="space-y-5 flex flex-col h-[calc(100vh-10rem)] overflow-y-auto pr-1">
      
      {/* SECCIÓN 1: PLANIFICACIÓN Y CONTROL DE MES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-200/60 dark:border-slate-700/60">
        <div>
          <h2 className="text-xl font-black text-black dark:text-white">Planificación Mensual 50/30/20</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Distribución automática de tus ingresos.</p>
        </div>
        <div>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* SECCIÓN 2: FORMULARIO EN DISPOSICIÓN HORIZONTAL (Mutación visual si edita) */}
      <div className={`p-4 rounded-2xl border transition-colors shrink-0 
        ${editingId 
          ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40' 
          : 'bg-gray-50 dark:bg-slate-800/40 border-gray-200/60 dark:border-slate-700/60'}`}
      >
        <form onSubmit={handleSaveBudget} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-1/3">
            <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
              {editingId ? 'Editar Concepto' : 'Concepto Fijo'}
            </label>
            <select
              name="concept"
              value={budgetForm.concept}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona concepto...</option>
              {fixedConcepts.map((item, idx) => (
                <option key={idx} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-1/3">
            <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Monto ($)</label>
            <input
              type="number"
              name="amount"
              value={budgetForm.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              required
              min="1"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* BOTONES INTERACTIVOS SEGÚN ACCIÓN */}
          <div className="w-full sm:w-1/3 flex gap-2">
            {editingId ? (
              <>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all shadow-md h-[38px]"
                >
                  Actualizar
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-sm hover:bg-gray-300 dark:hover:bg-slate-600 h-[38px]"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md h-[38px]"
              >
                Procesar y Distribuir
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SECCIÓN 3: INDICADORES GRÁFICOS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-blue-50/60 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Ingreso Total ({formatMonthLabel(selectedMonth)})</span>
          <span className="text-xl font-black text-black dark:text-white">${totalIncomeMonth.toLocaleString('es-AR')}</span>
        </div>
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Necesidades Básicas (50%)</span>
          <span className="text-xl font-black text-black dark:text-white">${totalNeeds.toLocaleString('es-AR')}</span>
        </div>
        <div className="bg-purple-50/60 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30">
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Gastos Personales (30%)</span>
          <span className="text-xl font-black text-black dark:text-white">${totalDesires.toLocaleString('es-AR')}</span>
        </div>
        <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Ahorro / Inversión (20%)</span>
          <span className="text-xl font-black text-black dark:text-white">${totalSavings.toLocaleString('es-AR')}</span>
        </div>
      </div>

      {/* SECCIÓN 4: TABLA CON COLUMNA MES Y BOTONES EDITAR / ELIMINAR */}
      <div className="flex-1 flex flex-col border border-gray-200/60 dark:border-slate-700/60 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden min-h-[250px]">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 shrink-0">
          <h4 className="text-base font-bold text-black dark:text-white">Desglose de Fondos Distribuidos</h4>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredBudgets.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No hay ingresos registrados para el mes seleccionado. Inicia una carga arriba.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-slate-700/50 sticky top-0 text-[11px] font-bold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-700 z-10">
                <tr>
                  <th className="p-4">Mes Corriente</th>
                  <th className="p-4">Concepto</th>
                  <th className="p-4 text-right">Monto Bruto</th>
                  <th className="p-4 text-right text-emerald-600 dark:text-emerald-400">Básicos (50%)</th>
                  <th className="p-4 text-right text-purple-600 dark:text-purple-400">Gastos (30%)</th>
                  <th className="p-4 text-right text-amber-600 dark:text-amber-400">Ahorro (20%)</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 text-xs font-semibold">
                {filteredBudgets.map((b) => (
                  <tr key={b.id} className={`hover:bg-gray-50/80 dark:hover:bg-slate-700/30 transition-colors ${editingId === b.id ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}`}>
                    <td className="p-4 text-gray-500 dark:text-gray-400 font-bold whitespace-nowrap">
                      {formatMonthLabel(b.month)}
                    </td>
                    <td className="p-4 font-black text-black dark:text-white text-sm">{b.concept}</td>
                    <td className="p-4 text-right text-sm font-black text-gray-900 dark:text-slate-100">
                      ${b.amount.toLocaleString('es-AR')}
                    </td>
                    <td className="p-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                      ${(b.amount * 0.5).toLocaleString('es-AR')}
                    </td>
                    <td className="p-4 text-right text-purple-600 dark:text-purple-400 font-bold">
                      ${(b.amount * 0.3).toLocaleString('es-AR')}
                    </td>
                    <td className="p-4 text-right text-amber-600 dark:text-amber-400 font-bold">
                      ${(b.amount * 0.2).toLocaleString('es-AR')}
                    </td>
                    {/* ACCIONES DE LA FILA */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(b)}
                          className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(b.id)}
                          className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-colors"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}