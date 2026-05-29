import React, { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabaseClient';

export default function ExpensesPage() {
  // Categorías personalizables
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
  
  const [syncStatus, setSyncStatus] = useState({ loading: false, type: '', message: '' });

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

  // --- LÓGICA DE AGREGAR CATEGORÍA EN CALIENTE ---
  const handleAddCategory = (e) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (!cleanName) return;
    
    if (!categories.some(cat => cat.toLowerCase() === cleanName.toLowerCase())) {
      setCategories(prev => [...prev, cleanName]);
      setExpenseForm(prev => ({ ...prev, item: cleanName })); // Autoselecciona la nueva
    }
    setNewCategoryName('');
    setShowAddCategoryModal(false);
  };

  // --- LÓGICA DE SINCRONIZACIÓN CON SUPABASE ---
  const handleUploadToCloud = async () => {
    setSyncStatus({ loading: true, type: 'upload', message: 'Subiendo registros a Supabase...' });
    try {
      if (expensesList.length === 0) {
        const { error: deleteError } = await supabase.from('mft_expenses').delete().neq('id', 0);
        if (deleteError) throw deleteError;
      } else {
        const { error } = await supabase.from('mft_expenses').upsert(expensesList);
        if (error) throw error;
      }
      setSyncStatus({ loading: false, type: 'success', message: '¡Datos respaldados en la nube con éxito! ✅' });
    } catch (error) {
      console.error(error);
      setSyncStatus({ loading: false, type: 'error', message: `Error al subir: ${error.message} ❌` });
    }
    setTimeout(() => setSyncStatus({ loading: false, type: '', message: '' }), 4000);
  };

  const handleDownloadFromCloud = async () => {
    setSyncStatus({ loading: true, type: 'download', message: 'Descargando datos de la nube...' });
    try {
      const { data, error } = await supabase
        .from('mft_expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        setExpensesList(data);
        setSyncStatus({ loading: false, type: 'success', message: '¡Egresos sincronizados en este dispositivo! 📥' });
      }
    } catch (error) {
      console.error(error);
      setSyncStatus({ loading: false, type: 'error', message: `Error al bajar: ${error.message} ❌` });
    }
    setTimeout(() => setSyncStatus({ loading: false, type: '', message: '' }), 4000);
  };

  // --- CRUD LOCAL OPERATIVO ---
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
    if (window.confirm('¿Estás seguro de que querés eliminar este registro local?')) {
      setExpensesList(prev => prev.filter(exp => exp.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setExpenseForm({ item: '', amount: '', date: today, description: '', observations: '' });
      }
    }
  };

  return (
    <div className="space-y-5 flex flex-col h-full max-w-full overflow-x-hidden pb-6">
      
      {/* PANEL DE COMANDO SUPABASE */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 mx-1 shrink-0">
        <div className="text-center sm:text-left">
          <span className="text-[10px] font-black text-blue-400 tracking-wider uppercase block">Nube de Supabase</span>
          <p className="text-xs text-slate-300 font-semibold">Resguarda o recupera la información de este módulo.</p>
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

      {/* BANNER NOTIFICADOR */}
      {syncStatus.message && (
        <div className={`mx-1 p-3 rounded-xl text-xs font-bold text-center transition-all animate-pulse
          ${syncStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : ''}
          ${syncStatus.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : ''}
          ${syncStatus.type === 'upload' || syncStatus.type === 'download' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : ''}
        `}>
          {syncStatus.message}
        </div>
      )}

      {/* TOTAL MEDIDOR */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-slate-900 dark:to-red-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 mx-1">
        <div className="text-center md:text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block mb-0.5">Consumo Total Local</span>
          <h3 className="text-xl font-black text-black dark:text-white">${totalSpent.toLocaleString('es-AR')}</h3>
        </div>
        <div className="w-full md:w-64 bg-gray-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full" style={{ width: `${Math.min((totalSpent / 200000) * 100, 100)}%` }} />
        </div>
      </div>

      {/* INTERFAZ DEL MÓDULO */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5 flex-1 min-h-0 mx-1">
        
        {/* FORMULARIO CON SELECCIÓN RE-INCORPORADA */}
        <div className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 flex flex-col shrink-0 lg:shrink h-fit">
          <form onSubmit={handleSaveExpense} className="space-y-3.5">
            <h4 className="text-sm font-bold text-black dark:text-white flex items-center gap-1.5">
              {editingId ? '📝 Editar Egreso' : '📌 Registrar Egreso'}
            </h4>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase text-gray-500">Item / Categoría</label>
                <button 
                  type="button" 
                  onClick={() => setShowAddCategoryModal(true)} 
                  className="text-[11px] font-bold text-blue-600 hover:underline px-1"
                >
                  ➕ Nueva
                </button>
              </div>
              <select name="item" value={expenseForm.item} onChange={handleInputChange} required className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-black dark:text-white focus:outline-none">
                <option value="">Selecciona un item...</option>
                {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Monto ($)</label>
                <input type="number" name="amount" value={expenseForm.amount} onChange={handleInputChange} placeholder="0" required min="0" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-black dark:text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Fecha</label>
                <input type="date" name="date" value={expenseForm.date} onChange={handleInputChange} required className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-black dark:text-white focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Detalle Corto</label>
              <input type="text" name="description" value={expenseForm.description} onChange={handleInputChange} placeholder="Ej. Segunda cuota" className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-black dark:text-white focus:outline-none" />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Observaciones</label>
              <textarea name="observations" value={expenseForm.observations} onChange={handleInputChange} rows="2" placeholder="Notas adicionales..." className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-black dark:text-white resize-none focus:outline-none" />
            </div>

            <div className="flex gap-2 pt-1">
              {editingId ? (
                <>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-md">Actualizar</button>
                  <button type="button" onClick={() => { setEditingId(null); setExpenseForm({ item: '', amount: '', date: today, description: '', observations: '' }); }} className="px-3 py-2 rounded-xl bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-xs">X</button>
                </>
              ) : (
                <button type="submit" className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md">Guardar Gasto</button>
              )}
            </div>
          </form>
        </div>

        {/* TABLA HISTORIAL */}
        <div className="lg:col-span-2 flex flex-col border border-gray-200/60 dark:border-slate-700/60 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden min-h-[300px] lg:h-full">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 shrink-0">
            <h4 className="text-sm font-bold text-black dark:text-white">Historial de Egresos</h4>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {expensesList.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">No hay egresos registrados localmente.</div>
            ) : (
              <>
                {/* VISTA MOBILE */}
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
                      <div className="flex justify-end gap-3 pt-1 border-t border-gray-50/50">
                        <button onClick={() => handleEditClick(exp)} className="text-[11px] font-bold text-blue-600 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 active:scale-95">✏️ Editar</button>
                        <button onClick={() => handleDeleteClick(exp.id)} className="text-[11px] font-bold text-red-600 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 active:scale-95">🗑️ Borrar</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* VISTA TABLET/DESKTOP */}
                <table className="hidden sm:table w-full text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-slate-700/50 sticky top-0 text-[11px] font-bold uppercase text-gray-400 border-b border-gray-100 z-10">
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
                            <button onClick={() => handleEditClick(exp)} className="p-2 rounded-full hover:bg-blue-50 text-blue-600 border border-transparent hover:border-blue-200 transition-all">✏️</button>
                            <button onClick={() => handleDeleteClick(exp.id)} className="p-2 rounded-full hover:bg-red-50 text-red-600 border border-transparent hover:border-red-200 transition-all">🗑️</button>
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

      {/* MODAL PARA AGREGAR NUEVAS CATEGORÍAS */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 max-w-sm w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h5 className="text-sm font-black text-black dark:text-white mb-1.5">Nueva Categoría de Egreso</h5>
            <p className="text-[11px] text-gray-400 mb-4">Se agregará al listado local desplegable de manera permanente.</p>
            
            <form onSubmit={handleAddCategory} className="space-y-4">
              <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ej. Gimnasio, Mascotas..." 
                autoFocus
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-xs text-black dark:text-white focus:outline-none"
              />
              <div className="flex gap-2 justify-end text-xs font-bold">
                <button 
                  type="button" 
                  onClick={() => { setShowAddCategoryModal(false); setNewCategoryName(''); }}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                >
                  Agregar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}