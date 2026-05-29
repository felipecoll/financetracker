import React, { useState, useEffect } from 'react';

export default function ExpensesPage() {
  // 1. CARGA INICIAL DESDE LOCALSTORAGE
  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem('mft_categories');
    return savedCategories ? JSON.parse(savedCategories) : [
      'Supermercado', 'Combustible', 'Internet', 'Seguro auto', 'Seguro moto', 'Alquiler', 'Restaurantes'
    ];
  });

  const [expensesList, setExpensesList] = useState(() => {
    const savedExpenses = localStorage.getItem('mft_expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [
      { id: 1, item: 'Supermercado', amount: 45200, date: '2026-05-28', description: 'Compra del mes', observations: 'Pago con tarjeta de crédito' },
      { id: 2, item: 'Internet', amount: 12500, date: '2026-05-25', description: 'Abono mensual', observations: 'Débito automático' }
    ];
  });

  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // Estado para saber si estamos editando un registro
  
  const today = new Date().toISOString().split('T')[0];

  // Estado del formulario de gastos
  const [expenseForm, setExpenseForm] = useState({
    item: '',
    amount: '',
    date: today,
    description: '',
    observations: ''
  });

  // 2. PERSISTENCIA EN LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem('mft_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('mft_expenses', JSON.stringify(expensesList));
  }, [expensesList]);

  // Cálculos dinámicos
  const totalSpent = expensesList.reduce((sum, exp) => sum + Number(exp.amount), 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm(prev => ({ ...prev, [name]: value }));
  };

  // Guardar Gasto (Carga nueva o Edición)
  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.item || !expenseForm.amount) return;

    if (editingId) {
      // Modo Edición
      setExpensesList(prev => prev.map(exp => 
        exp.id === editingId 
          ? { ...exp, ...expenseForm, amount: parseFloat(expenseForm.amount) }
          : exp
      ));
      setEditingId(null);
    } else {
      // Modo Nueva Carga
      const newExpense = {
        id: Date.now(),
        item: expenseForm.item,
        amount: parseFloat(expenseForm.amount),
        date: expenseForm.date,
        description: expenseForm.description || 'Sin detalle',
        observations: expenseForm.observations || '' // Guardado persistente local
      };
      setExpensesList(prev => [newExpense, ...prev]);
    }

    // Resetear formulario
    setExpenseForm({ item: '', amount: '', date: today, description: '', observations: '' });
  };

  // Preparar un registro para ser editado
  const handleEditClick = (exp) => {
    setEditingId(exp.id);
    setExpenseForm({
      item: exp.item,
      amount: exp.amount,
      date: exp.date,
      description: exp.description,
      observations: exp.observations || ''
    });
  };

  // Eliminar un registro definitivamente
  const handleDeleteClick = (id) => {
    if (window.confirm('¿Estás seguro de que querés eliminar este registro?')) {
      setExpensesList(prev => prev.filter(exp => exp.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setExpenseForm({ item: '', amount: '', date: today, description: '', observations: '' });
      }
    }
  };

  // Cancelar la edición actual
  const handleCancelEdit = () => {
    setEditingId(null);
    setExpenseForm({ item: '', amount: '', date: today, description: '', observations: '' });
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    if (!categories.includes(newCategoryName.trim())) {
      setCategories(prev => [...prev, newCategoryName.trim()]);
      setExpenseForm(prev => ({ ...prev, item: newCategoryName.trim() }));
    }
    setNewCategoryName('');
    setShowAddCategoryModal(false);
  };

  return (
    // Estructura flex calibrada para el alto de pantalla de la Mac de 14"
    <div className="space-y-6 flex flex-col h-[calc(100vh-10rem)] overflow-hidden">
      
      {/* SECCIÓN MÉTRES / TOTAL (Fijo arriba) */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-slate-900 dark:to-red-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block mb-1">
            Consumo Total del Período
          </span>
          <h3 className="text-2xl font-black text-black dark:text-white">
            ${totalSpent.toLocaleString('es-AR')}
          </h3>
        </div>
        <div className="w-full sm:w-64 bg-gray-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min((totalSpent / 200000) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* CUERPO CENTRAL CONFIGURADO PARA HACER SCROLL CORRECTAMENTE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        
        {/* FORMULARIO DE CARGA / EDICIÓN */}
        <div className="lg:col-span-1 bg-gray-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 flex flex-col overflow-y-auto max-h-full">
          <form onSubmit={handleSaveExpense} className="space-y-4">
            <h4 className="text-lg font-bold text-black dark:text-white">
              {editingId ? '📝 Editar egreso' : '📌 Cargar egreso'}
            </h4>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Item</label>
                <button type="button" onClick={() => setShowAddCategoryModal(true)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">+ Crear Item</button>
              </div>
              <select name="item" value={expenseForm.item} onChange={handleInputChange} required className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white">
                <option value="">Selecciona un item...</option>
                {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Monto ($)</label>
                <input type="number" name="amount" value={expenseForm.amount} onChange={handleInputChange} placeholder="0.00" required min="0" step="any" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Fecha</label>
                <input type="date" name="date" value={expenseForm.date} onChange={handleInputChange} required className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Detalle Corto</label>
              <input type="text" name="description" value={expenseForm.description} onChange={handleInputChange} placeholder="Ej. Segunda cuota" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white" />
            </div>

            {/* CAMPO OBSERVACIONES SOLICITADO */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">Observaciones</label>
              <textarea name="observations" value={expenseForm.observations} onChange={handleInputChange} rows="2" placeholder="Notas adicionales importantes..." className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white resize-none" />
            </div>

            {/* BOTONES DE ACCIÓN (AGREGAR / ELIMINAR / CANCELAR EDICIÓN) */}
            <div className="flex gap-2 pt-2">
              {editingId ? (
                <>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all shadow-md">
                    Actualizar
                  </button>
                  <button type="button" onClick={handleCancelEdit} className="px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-sm hover:bg-gray-300 dark:hover:bg-slate-600">
                    Cancelar
                  </button>
                </>
              ) : (
                <button type="submit" className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-md shadow-red-500/10">
                  Guardar Gasto
                </button>
              )}
            </div>
          </form>
        </div>

        {/* TABLA DE HISTORIAL CON ACCIONES DE EDICIÓN Y ELIMINACIÓN */}
        <div className="lg:col-span-2 flex flex-col border border-gray-200/60 dark:border-slate-700/60 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden max-h-full">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 shrink-0">
            <h4 className="text-lg font-bold text-black dark:text-white">Historial de Egresos</h4>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {expensesList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No hay egresos registrados aún.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-700/50 sticky top-0 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-700 z-10">
                  <tr>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Item</th>
                    <th className="p-4 hidden sm:table-cell">Detalle / Obs.</th>
                    <th className="p-4 text-right">Monto</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 text-sm">
                  {expensesList.map((exp) => (
                    <tr key={exp.id} className={`hover:bg-gray-50/80 dark:hover:bg-slate-700/30 transition-colors ${editingId === exp.id ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
                      <td className="p-4 font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {exp.date.split('-').reverse().join('/')}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200">
                          {exp.item}
                        </span>
                      </td>
                      <td className="p-4 hidden sm:table-cell max-w-xs">
                        <div className="font-medium text-gray-700 dark:text-slate-300 truncate">{exp.description}</div>
                        {exp.observations && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5 italic">
                            Obs: {exp.observations}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right font-bold text-red-600 dark:text-red-400 whitespace-nowrap text-base">
                        - ${exp.amount.toLocaleString('es-AR')}
                      </td>
                      {/* COLUMNA DE ACCIONES DINÁMICAS (EDITAR / BORRAR) */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(exp)}
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors"
                            title="Editar registro"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteClick(exp.id)}
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-colors"
                            title="Eliminar registro"
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

      {/* MODAL POPUP NUEVA CATEGORÍA */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 border border-gray-100 dark:border-slate-700 shadow-2xl">
            <h5 className="text-lg font-bold text-black dark:text-white mb-2">Nuevo Item Permanente</h5>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <input type="text" autoFocus value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Ej. Seguro de Moto, Farmacia" required className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-transparent text-sm text-black dark:text-white" />
              <div className="flex gap-2 justify-end text-sm font-semibold">
                <button type="button" onClick={() => { setShowAddCategoryModal(false); setNewCategoryName(''); }} className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Agregar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}