import React, { useState, useEffect } from 'react';

export function HomeView() {
  // Banco de frases motivacionales exclusivas de finanzas y esfuerzo
  const motivationalQuotes = [
    "No ahorres lo que te queda después de gastar, gasta lo que te queda después de ahorrar.",
    "La disciplina es el puente entre tus metas financieras y tus logros reales.",
    "Controlar tus finanzas no limita tu libertad; multiplica tus opciones a futuro.",
    "Pequeños sacrificios hoy construyen la total independencia del mañana.",
    "El dinero es un gran esclavo pero un pésimo amo. Toma las riendas hoy.",
    "Cuidá los centavos; los pesos se cuidan solos. Cada decisión cuenta."
  ];

  const [quote, setQuote] = useState('');
  
  // Obtener mes corriente para aislar los datos en el dashboard de inicio (Ej: "2026-05")
  const getCurrentMonthString = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
  };
  
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthString());

  // 1. CARGA DE DATOS EN TIEMPO REAL DESDE LOS OTROS MÓDULOS
  const [budgets, setBudgets] = useState([]);
  const [extraIncomes, setExtraIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    // Rotar frase aleatoria al montar el componente
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);

    // Absorber datos persistidos de los módulos hermanos
    const savedBudgets = localStorage.getItem('mft_budgets');
    const savedExtras = localStorage.getItem('mft_extra_incomes');
    const savedExpenses = localStorage.getItem('mft_expenses');

    if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
    if (savedExtras) setExtraIncomes(JSON.parse(savedExtras));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
  }, []);

  // --- PROCESAMIENTO CRUZADO DE FONDOS PARA EL MES ACTIVO ---
  
  // 1. Ingresos (Sueldo del módulo 50/30/20 + ingresos extras del módulo ingresos)
  const monthSalary = budgets.find(b => b.month === currentMonth && b.concept === 'Sueldo')?.amount || 0;
  const monthBudgetsTotal = budgets.filter(b => b.month === currentMonth).reduce((sum, b) => sum + Number(b.amount), 0);
  const monthExtrasTotal = extraIncomes.filter(i => i.month === currentMonth).reduce((sum, i) => sum + Number(i.amount), 0);
  
  // Flujo total que entró en la caja este mes
  const totalIncomesForMonth = monthBudgetsTotal + monthExtrasTotal;

  // Distribución automática de la regla 50/30/20 sobre la base cargada
  const needsCap = monthBudgetsTotal * 0.50;
  const desiresCap = monthBudgetsTotal * 0.30;
  const savingsCap = monthBudgetsTotal * 0.20;

  // 2. Egresos (Filtrados por el mes en curso)
  // Formato de fecha del gasto: "2026-05-28", extraemos "2026-05" para matchear con currentMonth
  const totalExpensesForMonth = expenses
    .filter(exp => exp.date && exp.date.substring(0, 7) === currentMonth)
    .reduce((sum, exp) => sum + Number(exp.amount), 0);

  // 3. Balance de caja matemático
  const netSavings = totalIncomesForMonth - totalExpensesForMonth;

  // Cálculo del porcentaje de consumo (¿Cuánto capital se tragaron los gastos?)
  const burnRatePercentage = totalIncomesForMonth > 0 
    ? Math.min((totalExpensesForMonth / totalIncomesForMonth) * 100, 100) 
    : 0;

  const formatMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-10rem)] overflow-y-auto pr-1">
      
      {/* SECCIÓN 1: EL MURAL MOTIVACIONAL (Frases de enfoque con diseño premium) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-6 rounded-2xl border border-indigo-900/40 text-center relative overflow-hidden shadow-lg shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />
        <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase block mb-2">🎯 Enfoque y Disciplina Financiera</span>
        <h3 className="text-base sm:text-lg font-medium text-indigo-100 italic max-w-3xl mx-auto leading-relaxed">
          "{quote}"
        </h3>
      </div>

      {/* SECCIÓN 2: SELECTOR DE PERÍODO ACTIVO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-gray-50 dark:bg-slate-800/40 p-4 rounded-xl border border-gray-200/60 dark:border-slate-700/60">
        <div>
          <h4 className="text-sm font-bold text-black dark:text-white">Resumen General de Actividad</h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Datos consolidados del mes seleccionado.</p>
        </div>
        <input 
          type="month" 
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white text-xs font-bold focus:outline-none"
        />
      </div>

      {/* SECCIÓN 3: INDICADORES PRINCIPALES DE FLUJO DE CAJA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
        {/* Ingresos consolidados */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Ingresos Totales</span>
          <span className="text-2xl font-black text-black dark:text-white">${totalIncomesForMonth.toLocaleString('es-AR')}</span>
          <span className="text-[10px] text-gray-400 block mt-1">Sueldo Base: ${monthSalary.toLocaleString('es-AR')}</span>
        </div>

        {/* Egresos consolidados que cambian dinámicamente según las cargas reales */}
        <div className="bg-rose-50/50 dark:bg-rose-950/10 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30">
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Gastos Registrados</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400">-${totalExpensesForMonth.toLocaleString('es-AR')}</span>
          <span className="text-[10px] text-gray-400 block mt-1">Cargados en módulo Egresos</span>
        </div>

        {/* Balance o Saldo Neto resultante */}
        <div className={`p-4 rounded-xl border ${netSavings >= 0 ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30' : 'bg-red-50 dark:bg-red-950/20 border-red-200'}`}>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Caja Disponible Real</span>
          <span className={`text-2xl font-black ${netSavings >= 0 ? 'text-black dark:text-white' : 'text-red-500'}`}>
            {netSavings < 0 ? '-' : ''}${Math.abs(netSavings).toLocaleString('es-AR')}
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Capital libre remanente</span>
        </div>
      </div>

      {/* SECCIÓN 4: AREA DE MONITOREO CRUZADO DE REGLAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[220px]">
        
        {/* Sub-Panel Izquierdo: Desglose Presupuestario 50/30/20 */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 flex flex-col justify-between">
          <h5 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider text-gray-500 mb-3">
            🎯 Distribución Teórica Presupuestada ({formatMonthLabel(currentMonth)})
          </h5>
          
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-slate-700/40 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Necesidades Básicas (50%):</span>
              </div>
              <span className="text-sm font-black text-black dark:text-white">${needsCap.toLocaleString('es-AR')}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-slate-700/40 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Gastos Personales (30%):</span>
              </div>
              <span className="text-sm font-black text-black dark:text-white">${desiresCap.toLocaleString('es-AR')}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-slate-700/40 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Ahorro o Inversión (20%):</span>
              </div>
              <span className="text-sm font-black text-black dark:text-white">${savingsCap.toLocaleString('es-AR')}</span>
            </div>
          </div>
        </div>

        {/* Sub-Panel Derecho: Barra de Control de Consumo Real */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 flex flex-col justify-between">
          <div>
            <h5 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider text-gray-500 mb-1">
              📊 Grado de Consumo del Capital
            </h5>
            <p className="text-[10px] text-gray-400">¿Qué porcentaje de tus ingresos totales del mes ya consumiste en egresos?</p>
          </div>

          <div className="my-auto space-y-3">
            <div className="w-full bg-gray-100 dark:bg-slate-700 h-6 rounded-xl overflow-hidden p-1 border border-gray-200 dark:border-slate-600">
              <div 
                className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-black text-white
                  ${burnRatePercentage > 85 ? 'bg-red-600' : burnRatePercentage > 50 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                style={{ width: `${totalIncomesForMonth > 0 ? burnRatePercentage : 0}%` }}
              >
                {totalIncomesForMonth > 0 && burnRatePercentage > 15 ? `${burnRatePercentage.toFixed(1)}%` : ''}
              </div>
            </div>

            <div className="text-center">
              {totalIncomesForMonth === 0 ? (
                <span className="text-xs font-semibold text-gray-400">Cargá ingresos para activar el termómetro de consumo.</span>
              ) : burnRatePercentage > 85 ? (
                <span className="text-xs font-bold text-red-500">⚠️ ¡Alerta! Estás consumiendo casi todo tu capital de este mes.</span>
              ) : burnRatePercentage > 50 ? (
                <span className="text-xs font-bold text-orange-500">⚠️ Consumo moderado. Monitoreá tus gastos de ocio.</span>
              ) : (
                <span className="text-xs font-bold text-emerald-600">✅ Excelente control. Tu saldo disponible está saludable.</span>
              )}
            </div>
          </div>
          
          <div className="text-[10px] text-center text-gray-400 pt-2 border-t border-gray-100 dark:border-slate-700/60">
            Sueldo + Extras de este mes evaluados frente a los Egresos cargados en tiempo real.
          </div>
        </div>

      </div>
    </div>
  );
}