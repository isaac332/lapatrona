'use client';

import React, { useMemo } from 'react';
import {
  TimeframeFilter,
  SaleRecord,
  ExpenseRecord,
  DailyStat,
  MonthlyWeekStat,
  ProductPerformance,
} from '@/types/accounting';
import { calculateExpensesAnalytics, getCalculatedExpenseAmount } from '@/utils/accountingCalculations';
import { calculateTicketItemSubtotal } from '@/data/purchaseTicketsData';
import {
  Clock,
  Calendar,
  TrendingUp,
  Award,
  BarChart3,
  Flame,
  DollarSign,
  BookOpen,
  Receipt,
  Scale,
} from 'lucide-react';

interface GranularTimeframeViewProps {
  timeframe: TimeframeFilter;
  onTimeframeChange: (tf: TimeframeFilter) => void;
  sales?: SaleRecord[];
  expenses?: ExpenseRecord[];
  dailyStats: DailyStat[];
  monthlyWeekStats: MonthlyWeekStat[];
  productRanking: ProductPerformance[];
  onOpenGastos?: () => void;
}

export const GranularTimeframeView: React.FC<GranularTimeframeViewProps> = ({
  timeframe,
  onTimeframeChange,
  sales = [],
  expenses = [],
  dailyStats,
  monthlyWeekStats,
  productRanking,
  onOpenGastos,
}) => {
  const safeSales = Array.isArray(sales) ? sales : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const totalUnits = safeSales.reduce((sum, s) => sum + (s?.quantity || 0), 0);
  const totalRevenue = safeSales.reduce((sum, s) => sum + (s?.quantity || 0) * (s?.unitPrice || 0), 0);
  const expenseAnalytics = useMemo(() => calculateExpensesAnalytics(safeExpenses), [safeExpenses]);
  const netRealProfit = totalRevenue - expenseAnalytics.totalExpenses;

  const historicalDays = useMemo(() => {
    const map = new Map<
      string,
      {
        dateKey: string;
        formattedDate: string;
        units: number;
        revenue: number;
        itemsSummary: Record<string, { qty: number; price: number }>;
      }
    >();

    for (const s of safeSales) {
      const d = new Date(s.timestamp);
      if (isNaN(d.getTime())) continue;
      const dateKey = s.timestamp.split('T')[0];
      const formattedDate = d.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });

      if (!map.has(dateKey)) {
        map.set(dateKey, {
          dateKey,
          formattedDate,
          units: 0,
          revenue: 0,
          itemsSummary: {},
        });
      }
      const entry = map.get(dateKey)!;
      entry.units += s.quantity;
      entry.revenue += s.quantity * s.unitPrice;
      const itemKey = `${s.productId}@${s.unitPrice}`;
      if (!entry.itemsSummary[itemKey]) {
        entry.itemsSummary[itemKey] = { qty: 0, price: s.unitPrice };
      }
      entry.itemsSummary[itemKey].qty += s.quantity;
    }

    return Array.from(map.values()).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [safeSales]);

  const productNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of productRanking) {
      m[p.product.id] = p.product.name;
    }
    return m;
  }, [productRanking]);

  const tabs: { id: TimeframeFilter; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'today', label: 'Día (Hoy)', icon: Clock },
    { id: 'week', label: 'Esta Semana', icon: Calendar },
    { id: 'month', label: 'Este Mes', icon: TrendingUp },
    { id: 'all', label: 'Libreta y Tickets', icon: BarChart3 },
  ];

  return (
    <div className="rounded-2xl bg-[#141417] border border-white/[0.08] p-3.5 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in shadow-xl">
      {/* Top Header with View Selector Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-white/[0.06] pb-4 sm:pb-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#e59b38]/10 border border-[#e59b38]/20 flex items-center justify-center shrink-0">
            {timeframe === 'today' && <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#e59b38]" />}
            {timeframe === 'week' && <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#e59b38]" />}
            {timeframe === 'month' && <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#e59b38]" />}
            {timeframe === 'all' && <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#e59b38]" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#e59b38]">
                {timeframe === 'today' && 'Resumen de Hoy'}
                {timeframe === 'week' && 'Vista Semanal'}
                {timeframe === 'month' && 'Vista Mensual'}
                {timeframe === 'all' && 'Contabilidad Completa: Libreta de Ventas y Tickets de Insumos'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5 leading-snug">
              {timeframe === 'today' && 'Ventas del Día (Apertura a Cierre)'}
              {timeframe === 'week' && 'Rendimiento Diario de la Semana (7 Días)'}
              {timeframe === 'month' && 'Evolución y Ranking de Productos del Mes'}
              {timeframe === 'all' && ' Estado de Resultados Real (Octubre – Noviembre 2026)'}
            </h3>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-[#19191d] p-1.5 rounded-xl border border-white/[0.06] overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = timeframe === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTimeframeChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 touch-manipulation select-none active:scale-95 ${
                  isActive
                    ? 'bg-[#e59b38] text-black shadow-md font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-[#e59b38]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. VISTA DIARIA (HOY) */}
      {timeframe === 'today' && (
        <div className="space-y-4">
          <div className="p-3.5 sm:p-4 rounded-xl bg-black/40 border border-white/[0.05] grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                Ventas Registradas Hoy
              </div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-white mt-0.5">
                {safeSales.length}
              </div>
            </div>
            <div className="border-y sm:border-y-0 sm:border-x border-white/[0.06] py-2 sm:py-0">
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                Piezas Vendidas Hoy
              </div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#e59b38] mt-0.5">
                {totalUnits} pzs
              </div>
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                Venta Total del Día
              </div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-emerald-400 mt-0.5">
                ${totalRevenue.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VISTA SEMANAL */}
      {timeframe === 'week' && (
        <div className="space-y-4 sm:space-y-6">
          {(() => {
            const peakDay = dailyStats.find((d) => d.isPeak);
            const avgDailyUnits = dailyStats.length > 0 ? (totalUnits / 7).toFixed(1) : '0';
            const avgDailyRevenue = dailyStats.length > 0 ? (totalRevenue / 7).toFixed(2) : '0.00';
            const maxDayCount = Math.max(...dailyStats.map((d) => d.count), 1);

            return (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs bg-black/30 p-2.5 sm:p-3 rounded-xl border border-white/[0.04]">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <span className="text-neutral-400">Total Semana:</span>
                    <strong className="text-white font-mono text-xs sm:text-sm">{totalUnits} piezas</strong>
                    <span className="text-neutral-500">•</span>
                    <strong className="text-[#e59b38] font-mono text-xs sm:text-sm">${totalRevenue.toFixed(2)}</strong>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {peakDay && peakDay.count > 0 && (
                      <div className="bg-[#e59b38]/15 border border-[#e59b38]/30 px-2.5 sm:px-3 py-1 rounded-lg flex items-center gap-1.5 text-[#e59b38] text-[11px] sm:text-xs">
                        <Flame className="w-3.5 h-3.5" />
                        <span className="font-semibold">Día Pico:</span>
                        <span className="font-bold text-white">{peakDay.dayName} ({peakDay.count} u)</span>
                      </div>
                    )}
                    <div className="bg-black/50 border border-white/[0.06] px-2.5 sm:px-3 py-1 rounded-lg flex items-center gap-1.5 text-neutral-300 text-[11px] sm:text-xs">
                      <span className="text-neutral-400">Promedio:</span>
                      <strong className="text-white font-mono">{avgDailyUnits} u/d</strong>
                      <span className="text-neutral-500">(${avgDailyRevenue})</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:grid sm:grid-cols-7 gap-2 sm:gap-3 overflow-x-auto snap-x snap-mandatory pb-1 no-scrollbar">
                  {dailyStats.map((day) => {
                    const heightPct = Math.round((day.count / maxDayCount) * 100);
                    return (
                      <div
                        key={day.dateStr}
                        className={`flex-none w-[74px] sm:w-auto snap-start p-2.5 sm:p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                          day.isPeak && day.count > 0
                            ? 'bg-[#e59b38]/10 border-[#e59b38]/40 ring-1 ring-[#e59b38]/30 shadow-md'
                            : 'bg-black/40 border-white/[0.05] hover:border-white/[0.1]'
                        }`}
                      >
                        <div className="text-center pb-1.5 sm:pb-2 border-b border-white/[0.04]">
                          <div className="text-xs font-semibold text-white">
                            {day.dayName.slice(0, 3)}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            {day.formattedDate.split(' ')[0]}
                          </div>
                        </div>

                        <div className="my-2 sm:my-3 h-16 sm:h-24 flex items-end justify-center">
                          <div className="w-5 sm:w-7 bg-neutral-800 rounded-t-md overflow-hidden flex items-end h-full">
                            <div
                              className={`w-full rounded-t-md transition-all duration-700 ${
                                day.isPeak && day.count > 0
                                  ? 'bg-gradient-to-t from-[#e59b38] to-amber-300'
                                  : 'bg-neutral-600'
                              }`}
                              style={{ height: `${Math.max(heightPct, 8)}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-center pt-1.5 sm:pt-2 border-t border-white/[0.04]">
                          <div className="font-serif text-sm sm:text-lg font-bold text-white tabular-nums">
                            {day.count}
                          </div>
                          <div className="text-[10px] sm:text-[11px] font-mono text-[#e59b38] font-semibold mt-0.5">
                            ${day.revenue.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* 3. VISTA MENSUAL */}
      {timeframe === 'month' && (
        <div className="space-y-4 sm:space-y-6">
          {(() => {
            const topRevenueProduct = [...productRanking].sort((a, b) => b.revenue - a.revenue)[0];
            const topUnitsProduct = productRanking[0];

            return (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-black/30 p-2.5 sm:p-3 rounded-xl border border-white/[0.04]">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <span className="text-neutral-400">Total Mes:</span>
                    <strong className="text-white font-mono text-xs sm:text-sm">{totalUnits} piezas</strong>
                    <span className="text-neutral-500">•</span>
                    <strong className="text-[#e59b38] font-mono text-xs sm:text-sm">${totalRevenue.toFixed(2)}</strong>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {topUnitsProduct && topUnitsProduct.units > 0 && (
                      <div className="bg-black/50 border border-white/[0.06] px-2.5 sm:px-3 py-1 rounded-lg flex items-center gap-1.5 text-[11px] sm:text-xs">
                        <Award className="w-3.5 h-3.5 text-[#e59b38]" />
                        <span className="text-neutral-400">Líder:</span>
                        <strong className="text-white truncate max-w-[120px] sm:max-w-none">
                          {topUnitsProduct.product.name} ({topUnitsProduct.units} u)
                        </strong>
                      </div>
                    )}
                    {topRevenueProduct && topRevenueProduct.revenue > 0 && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 sm:px-3 py-1 rounded-lg flex items-center gap-1.5 text-emerald-300 text-[11px] sm:text-xs">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Mayor Ingreso:</span>
                        <strong className="text-white font-mono">
                          ${topRevenueProduct.revenue.toFixed(0)}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  {monthlyWeekStats.map((week) => (
                    <div
                      key={week.id}
                      className="p-3 sm:p-4 rounded-xl bg-black/40 border border-white/[0.05] hover:border-white/[0.1] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-semibold text-white">{week.label}</span>
                          <span className="text-[9px] sm:text-[11px] font-mono text-[#e59b38] bg-[#e59b38]/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-[#e59b38]/20 font-bold">
                            {week.percentage}%
                          </span>
                        </div>
                        <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5 truncate">{week.dateRange}</div>
                      </div>

                      <div className="mt-3 pt-2 sm:mt-4 sm:pt-3 border-t border-white/[0.04]">
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className="font-serif text-lg sm:text-2xl font-bold text-white">
                              {week.count}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-mono">u</span>
                          </div>
                          <span className="text-[11px] sm:text-xs font-mono font-bold text-emerald-400">
                            ${week.revenue.toFixed(0)}
                          </span>
                        </div>

                        <div className="mt-1.5 w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#e59b38] to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${week.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* 4. VISTA HISTÓRICO TOTAL: LIBRETA DE VENTAS + TICKETS DE COMPRA (ALL) */}
      {timeframe === 'all' && (
        <div className="space-y-6">
          {/* Financial Balance Card: Ventas vs Tickets de Compra = Utilidad Neta */}
          <div className="p-3 sm:p-4 rounded-2xl bg-black/40 border border-white/[0.08] grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-center">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                Ventas Libreta ({totalUnits} pzs)
              </div>
              <div className="font-serif text-xl sm:text-3xl font-bold text-white mt-0.5 tabular-nums">
                ${totalRevenue.toFixed(2)}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {historicalDays.length} días con venta
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-[10px] uppercase tracking-wider text-rose-300 font-semibold">
                Gastos en Tickets ({safeExpenses.length})
              </div>
              <div className="font-serif text-xl sm:text-3xl font-bold text-rose-400 mt-0.5 tabular-nums">
                -${expenseAnalytics.totalExpenses.toFixed(2)}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Efec: ${expenseAnalytics.cashExpenses.toFixed(2)} | Tarj: ${expenseAnalytics.cardExpenses.toFixed(2)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold">
                Ahorro en Ofertas (Ley/Aurrera)
              </div>
              <div className="font-serif text-xl sm:text-3xl font-bold text-[#e59b38] mt-0.5 tabular-nums">
                +${expenseAnalytics.totalSavingsFromOffers.toFixed(2)}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Descuentos en tickets
              </div>
            </div>

            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">
                Utilidad Neta Real
              </div>
              <div className="font-serif text-xl sm:text-3xl font-extrabold text-emerald-400 mt-0.5 tabular-nums">
                ${netRealProfit.toFixed(2)}
              </div>
              <div className="text-[10px] text-emerald-300/80 font-mono mt-0.5">
                Ventas - Tickets de Compra
              </div>
            </div>
          </div>

          {/* Daily Notebook Breakdown Table */}
          <div className="space-y-2.5">
            <div className="text-[11px] sm:text-xs uppercase tracking-wider text-neutral-300 font-bold flex items-center justify-between">
              <span>1. Desglose Día por Día (Libreta de Ventas)</span>
              <span className="text-[10px] text-[#e59b38] font-mono">
                {historicalDays.length} días activos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {historicalDays.map((day) => (
                <div
                  key={day.dateKey}
                  className="p-3.5 rounded-xl bg-black/35 border border-white/[0.07] flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="text-xs sm:text-sm font-bold text-white capitalize">
                      {day.formattedDate}
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      ${day.revenue.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    {Object.entries(day.itemsSummary).map(([itemKey, info]) => {
                      const [prodId] = itemKey.split('@');
                      const prodName = productNameMap[prodId] || prodId;
                      return (
                        <div key={itemKey} className="flex items-center justify-between text-neutral-300">
                          <span>
                            <strong className="text-[#e59b38] font-mono">{info.qty}x</strong> {prodName}{' '}
                            <span className="text-[10px] text-neutral-500">(${info.price} c/u)</span>
                          </span>
                          <span className="font-mono text-white font-semibold">
                            ${(info.qty * info.price).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Purchase Tickets Summary Section */}
          <div className="space-y-2.5 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] sm:text-xs uppercase tracking-wider text-rose-300 font-bold flex items-center gap-1.5 min-w-0">
                <Receipt className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
                <span>2. Tickets Físicos de Compra e Insumos ({safeExpenses.length} tickets = -${expenseAnalytics.totalExpenses.toFixed(2)})</span>
              </div>
              {onOpenGastos && (
                <button
                  type="button"
                  onClick={onOpenGastos}
                  className="text-xs font-bold text-[#e59b38] hover:underline min-h-[44px] flex items-center shrink-0"
                >
                  Ver Detalle Completo →
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {safeExpenses.map((exp) => {
                const calcAmt = getCalculatedExpenseAmount(exp);
                const d = new Date(exp.timestamp);
                const dateStr = d.toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  timeZone: 'UTC',
                });
                return (
                  <button
                    type="button"
                    key={exp.id}
                    onClick={onOpenGastos}
                    className="text-left p-3.5 rounded-xl bg-black/35 border border-white/[0.07] hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-2 active:scale-[0.99]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-white leading-tight">
                          {exp.storeName || exp.description}
                        </span>
                        <span className="font-mono text-xs font-extrabold text-rose-400 shrink-0">
                          -${calcAmt.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center justify-between">
                        <span>{dateStr}</span>
                        <span className="uppercase font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] text-neutral-300">
                          {exp.paymentMethod === 'tarjeta' ? '💳 Débito' : '💵 Efectivo'}
                        </span>
                      </div>
                    </div>

                    {exp.items && exp.items.length > 0 && (
                      <div className="pt-2 border-t border-white/[0.05] space-y-1 text-[11px]">
                        {exp.items.map((it) => (
                          <div key={it.id} className="flex items-center justify-between text-neutral-300">
                            <span className="truncate pr-2">
                              <strong className="text-[#e59b38] font-mono">{it.quantity} {it.unit}</strong> {it.description}
                            </span>
                            <span className="font-mono text-white shrink-0">
                              ${calculateTicketItemSubtotal(it).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ingredient Volume & Average Cost Summary */}
          <div className="space-y-2.5 pt-2">
            <div className="text-[11px] sm:text-xs uppercase tracking-wider text-neutral-300 font-bold flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#e59b38] shrink-0" aria-hidden="true" />
              <span>3. Insumos Calculados desde los Tickets (Kilos, Litros y Costo Promedio)</span>
            </div>

            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {expenseAnalytics.ingredientMetrics.map((m) => (
                <div
                  key={m.key}
                  className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col justify-between"
                >
                  <div className="text-xs font-bold text-white truncate">{m.label}</div>
                  <div className="mt-2">
                    <div className="font-mono text-base font-extrabold text-[#e59b38]">
                      {m.totalQuantity} {m.unit}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mt-0.5">
                      <span>Prom: ${m.avgUnitCost.toFixed(2)}/{m.unit}</span>
                      <span className="text-rose-400 font-bold">${m.totalSpent.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};