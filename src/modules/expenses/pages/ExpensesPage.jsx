import React, { useState, useEffect } from 'react';

export default function ExpensesPage() {
  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem('mft_categories');
    return savedCategories ? JSON.parse(savedCategories) : [
      'Supermercado', 'Combustible', 'Internet', 'Seguro auto', 'Seguro moto', 'Alquiler', 'Restaurantes'
    ];
  });

  const [expensesList, setExpensesList] = useState(() => {
    const savedExpenses = localStorage.getItem('mft_expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });

  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const today = new Date().toISOString().split('T')[0];

  const [expenseForm, setExpenseForm] = useState({
    item: '',
    amount: '',
    date: today,
    description: '',
    observations: ''
  });

  useEffect(() => {
    localStorage.setItem('mft_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('mft_expenses', JSON.stringify(expensesList));
  }, [expensesList]);

  const totalSpent = expensesList.reduce((sum, exp) => sum + Number(exp.amount), 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.item || !expenseForm.amount) return;

    if (editingId) {
      setExpensesList(prev => prev.map(exp => 
        exp.id === editingId ? { ...exp, ...expenseForm, amount: parseFloat(expenseForm.amount) } : exp
      ));
      setEditingId(null);
    } else {
      const newExpense = {
        id: Date.now(),
        item: expenseForm.item,
        amount: parseFloat(expenseForm.amount),
        date: expenseForm.date,
        description: expenseForm.description || 'Sin detalle',
        observations: expenseForm.observations || ''
      };
      setExpensesList(prev => [newExpense, ...prev]);
    }
    setExpenseForm({ item: '', amount: '', date: today, description: '', observations: '' });
  };

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

  const handleDeleteClick = (id) => {
    if (window.confirm('¿Estás seguro de que querés eliminar este registro?')) {
      setExpensesList(prev => prev.filter(exp => exp.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setExpenseForm({ item: '', amount: '', date: today, description: '', observations: '' });
      }
    }
  };

  return (
    <div className="space-y-5 flex flex-col h-full max-w-full overflow-x-hidden pb-6">
      
      {/* TOTAL MEDIDOR */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-slate-900 dark:to-red-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 mx-1">
        <div className="text-center md:text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block mb-0.5">
            Consumo Total del Período
          </span>
          <h3 className="text-xl font-black text-black dark:text-white">
            ${totalSpent.toLocaleString('es-AR')}
          </h3>
        </div>
        <div className="w-full md:w-64 bg-gray-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full" style={{ width: `${Math.min((totalSpent / 200000) * 100, 100)}%` }} />
        </div>
      </div>

      {/* COMPONENTE RESPONSIVE: Stack vertical en Mobile, Grid de 3 columnas en Desktop */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5 flex-1 min-h-0 mx-1">
        
        {/* FORMULARIO */}
        <div className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 flex flex-col shrink-0 lg:shrink h-fit">
          <form onSubmit={handleSaveExpense} className="space-y-3.5">
            <h4 className="text-sm font-bold text-black dark:text-white flex items-center gap-1.5">
              {editingId ? '📝 Editar Egreso' : '📌 Registrar Egreso'}
            </h4>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-bold uppercase text-gray-500">Item</label>
                <button type="button" onClick={() => setShowAddCategoryModal(true)} className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">+ Crear Item</button>
              </div>
              <select name="item" value={expenseForm.item} onChange={handleInputChange} required className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-black dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none">
                <option value="">Selecciona un item...</option>
                {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Monto ($)</label>
                <input type="number" name="amount" value={expenseForm.amount} onChange={handleInputChange} placeholder="0" required min="0" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-black dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Fecha</label>
                <input type="date" name="date" value={expenseForm.date} onChange={handleInputChange} required className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-black dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Detalle Corto</label>
              <input type="text" name="description" value={expenseForm.description} onChange={handleInputChange} placeholder="Ej. Segunda cuota" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-black dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Observaciones</label>
              <textarea name="observations" value={expenseForm.observations} onChange={handleInputChange} rows="2" placeholder="Notas adicionales..." className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-black dark:text-white resize-none focus:ring-2 focus:ring-red-500 focus:outline-none" />
            </div>

            <div className="flex gap-2 pt-1">
              {editingId ? (
                <>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition-all shadow-md">Actualizar</button>
                  <button type="button" onClick={() => { setEditingId(null); setExpenseForm({ item: '', amount: '', date: today, description: '', observations: '' }); }} className="px-3 py-2 rounded-xl bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-xs hover:bg-gray-300 dark:hover:bg-slate-600">X</button>
                </>
              ) : (
                <button type="submit" className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-md">Guardar Gasto</button>
              )}
            </div>
          </form>
        </div>

        {/* TABLA OPTIMIZADA CON TARJETAS AUTOMÁTICAS EN MOBILE */}
        <div className="lg:col-span-2 flex flex-col border border-gray-200/60 dark:border-slate-700/60 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden min-h-[300px] lg:h-full">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 shrink-0">
            <h4 className="text-sm font-bold text-black dark:text-white">Historial de Egresos</h4>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {expensesList.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">No hay egresos registrados aún.</div>
            ) : (
              <>
                {/* VISTA MOBILE: Tarjetas elásticas apiladas */}
                <div className="block sm:hidden divide-y divide-gray-100 dark:divide-slate-700/60">
                  {expensesList.map((exp) => (
                    <div key={exp.id} className="p-4 space-y-2.5 bg-white dark:bg-slate-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 block">{exp.date.split('-').reverse().join('/')}</span>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200">{exp.item}</span>
                        </div>
                        <span className="text-sm font-black text-red-600">-${exp.amount.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-900/40 p-2 rounded-lg">
                        <div className="font-semibold">{exp.description}</div>
                        {exp.observations && <div className="text-[10px] text-gray-400 mt-0.5 italic">Obs: {exp.observations}</div>}
                      </div>
                      <div className="flex justify-end gap-3 pt-1 border-t border-gray-50 dark:border-slate-700/30">
                        <button onClick={() => handleEditClick(exp)} className="flex items-center gap-1 text-[11px] font-bold text-blue-600 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 active:scale-95 transition-transform">✏️ Editar</button>
                        <button onClick={() => handleDeleteClick(exp.id)} className="flex items-center gap-1 text-[11px] font-bold text-red-600 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 active:scale-95 transition-transform">🗑️ Borrar</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* VISTA TABLET/DESKTOP: Estructura de tabla tradicional */}
                <table className="hidden sm:table w-full text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-slate-700/50 sticky top-0 text-[11px] font-bold uppercase text-gray-400 border-b border-gray-100 dark:border-slate-700 z-10">
                    <tr>
                      <th className="p-3.5">Fecha</th>
                      <th className="p-3.5">Item</th>
                      <th className="p-3.5">Detalle / Obs.</th>
                      <th className="p-3.5 text-right">Monto</th>
                      <th className="p-3.5 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 text-xs font-semibold">
                    {expensesList.map((exp) => (
                      <tr key={exp.id} className={`hover:bg-gray-50/60 dark:hover:bg-slate-700/20 transition-colors ${editingId === exp.id ? 'bg-blue-50/40' : ''}`}>
                        <td className="p-3.5 text-gray-500">{exp.date.split('-').reverse().join('/')}</td>
                        <td className="p-3.5"><span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200">{exp.item}</span></td>
                        <td className="p-3.5 max-w-xs">
                          <div className="text-gray-700 dark:text-slate-300 truncate">{exp.description}</div>
                          {exp.observations && <div className="text-[10px] text-gray-400 truncate italic mt-0.5">Obs: {exp.observations}</div>}
                        </td>
                        <td className="p-3.5 text-right font-black text-red-600">-${exp.amount.toLocaleString('es-AR')}</td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => handleEditClick(exp)} className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 border border-transparent hover:border-blue-200 dark:hover:border-blue-900/50 transition-all" title="Editar">✏️</button>
                            <button onClick={() => handleDeleteClick(exp.id)} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 border border-transparent hover:border-red-200 dark:hover:border-red-900/50 transition-all" title="Eliminar">🗑️</button>
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
    </div>
  );
}