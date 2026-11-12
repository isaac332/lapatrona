'use client';

import React from 'react';
import { TimeframeFilter, ProductItem, SaleRecord, ExpenseRecord } from '@/types/accounting';
import { getPaymentBreakdown, calculateExpensesAnalytics, calculateInitialInvestmentSummary } from '@/utils/accountingCalculations';
import { ShoppingBag, DollarSign, Award, Wallet, Calculator, Download, Trash2, TrendingUp } from 'lucide-react';

interface KPICardsProps {
  timeframe: TimeframeFilter;
  sales?: SaleRecord[];
  products?: ProductItem[];
  expenses?: ExpenseRecord[];
  totalExpenses?: number;
  totalWasteCost?: number;
  startingCash?: number;
  onOpenGastos: () => void;
  onOpenCalculadora: () => void;
  onOpenMermas?: () => void;
  onOpenCorte?: () => void;
  onExportCSV?: () => void;
  isAdvancedView?: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({
  timeframe,
  sales = [],
  products = [],
  expenses = [],
  totalExpenses = 0,
  totalWasteCost = 0,
  startingCash = 0,
  onOpenGastos,
  onOpenCalculadora,
  onOpenMermas,
  onOpenCorte,
  onExportCSV,
  isAdvancedView = false,
}) => {
  const safeSales = Array.isArray(sales) ? sales : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const totalUnits = safeSales.reduce((acc, curr) => acc + (curr?.quantity || 0), 0);
  const totalRevenue = safeSales.reduce((acc, curr) => acc + (curr?.quantity || 0) * (curr?.unitPrice || 0), 0);
  const expenseAnalytics = calculateExpensesAnalytics(safeExpenses);
  const investmentSummary = calculateInitialInvestmentSummary(safeSales, safeExpenses);
  const totalTicketsExpenses = expenseAnalytics.totalExpenses;
  const netRealProfit = totalRevenue - totalTicketsExpenses - totalWasteCost;
  const netMarginPct = totalRevenue > 0 ? Math.round((netRealProfit / totalRevenue) * 100) : 0;

  const paymentBreakdown = getPaymentBreakdown(safeSales);
  const totalEfectivoEnCajon = startingCash + paymentBreakdown.efectivo.total - expenseAnalytics.cashExpenses;

  const productCountMap: Record<string, number> = {};
  safeSales.forEach((s) => {
    if (s?.productId) {
      productCountMap[s.productId] = (productCountMap[s.productId] || 0) + (s.quantity || 0);
    }
  });

  let topProductId = '';
  let topCount = 0;
  Object.entries(productCountMap).forEach(([pId, count]) => {
    if (count > topCount) {
      topCount = count;
      topProductId = pId;
    }
  });

  const topProduct = safeProducts.find((p) => p.id === topProductId);

  const sandwichFries = productCountMap['sandwich-fries'] || 0;
  const sandwichAlone = productCountMap['sandwich-alone'] || 0;
  const quesadillaFries = productCountMap['quesadilla-fries'] || 0;
  const quesadillaAlone = productCountMap['quesadilla-alone'] || 0;
  const totalMains = sandwichFries + sandwichAlone + quesadillaFries + quesadillaAlone;
  const totalFriesCombos = sandwichFries + quesadillaFries;
  const comboRate = totalMains > 0 ? Math.round((totalFriesCombos / totalMains) * 100) : 0;

  const timeframeLabels: Record<TimeframeFilter, string> = {
    today: 'Hoy',
    week: 'Esta Semana',
    month: 'Este Mes',
    all: 'Histórico Total',
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Bar with Filter Context and Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 pb-2 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xs sm:text-sm font-semibold tracking-wider text-neutral-300 uppercase">
            Balance Contable — {timeframeLabels[timeframe]}
          </h2>
          <p className="text-[11px] sm:text-xs text-neutral-500">
            Calculado sobre {safeSales.length} ventas y {safeExpenses.length} tickets de compra registrados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenCalculadora}
            className="flex items-center justify-center gap-1.5 px-3.5 min-h-[44px] sm:min-h-[34px] text-xs font-semibold rounded-full text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-colors touch-manipulation active:scale-95 shrink-0"
          >
            <Calculator className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Calcular Cambio</span>
          </button>

          <button
            type="button"
            onClick={onOpenGastos}
            className="flex items-center justify-center gap-1.5 px-3.5 min-h-[44px] sm:min-h-[34px] text-xs font-semibold rounded-full text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-colors touch-manipulation active:scale-95 shrink-0"
          >
            <Wallet className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Tickets ({expenses.length})</span>
          </button>

          {onOpenMermas && (
            <button
              type="button"
              onClick={onOpenMermas}
              className={`flex items-center justify-center gap-1.5 px-3.5 min-h-[44px] sm:min-h-[34px] text-xs font-semibold rounded-full border transition-colors touch-manipulation active:scale-95 shrink-0 ${
                totalWasteCost > 0
                  ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/25'
                  : 'text-neutral-400 hover:text-white bg-white/5 border-white/10'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />
              <span>Mermas{totalWasteCost > 0 ? ` (-$${totalWasteCost.toFixed(0)})` : ''}</span>
            </button>
          )}

          {onExportCSV && sales.length > 0 && (
            <button
              type="button"
              onClick={onExportCSV}
              className="flex items-center justify-center gap-1.5 px-3.5 min-h-[44px] sm:min-h-[34px] text-xs font-semibold rounded-full text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 transition-colors touch-manipulation active:scale-95 shrink-0"
            >
              <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Initial Investment Partner Banner (Shown only in Advanced View) */}
      {isAdvancedView && investmentSummary.totalInitialInvestment > 0 && (
        <button
          type="button"
          onClick={onOpenGastos}
          className="w-full text-left flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 min-h-[44px] rounded-xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-emerald-500/10 border border-amber-500/30 hover:border-amber-500/50 transition-all text-xs shadow-sm animate-fade-in"
          title="Ver desglose de inversión inicial por socio (Mónica y Isaac)"
        >
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" aria-hidden="true" />
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Inversión Inicial Socios:
            </span>
            <span className="font-mono font-extrabold text-[#e59b38]">
              ${investmentSummary.totalInitialInvestment.toFixed(2)}
            </span>
            <span className="text-neutral-400 text-[11px] hidden md:inline">
              (Mónica: <strong className="text-neutral-200">${investmentSummary.monica.total.toFixed(2)}</strong> • Isaac: <strong className="text-neutral-200">${investmentSummary.isaac.total.toFixed(2)}</strong>)
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 leading-snug">
              ✓ Inversión 100% Recuperada (+${investmentSummary.netProfitAfterInitialInvestment.toFixed(2)} libre)
            </span>
            <span className="text-[11px] text-neutral-300 underline shrink-0">Ver detalle ➔</span>
          </div>
        </button>
      )}

      {/* Responsive KPI Cards */}
      <div className={`grid gap-2.5 sm:gap-4 grid-cols-1 min-[360px]:grid-cols-2 ${isAdvancedView ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
        
        {/* Metric 1: Total Units */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#141417] border border-white/[0.08] p-3.5 sm:p-5 hover:border-white/[0.15] transition-all min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Piezas Vendidas
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/[0.08] shrink-0" aria-hidden="true">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e59b38]" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 flex-wrap">
            <span className="font-serif text-2xl sm:text-4xl font-bold text-[#f5f0eb] tabular-nums">
              {totalUnits}
            </span>
            <span className="text-[11px] sm:text-xs text-neutral-400 font-mono">piezas</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 leading-snug">
            {topProduct ? `Líder: ${topProduct.name} (${comboRate}% c/papas)` : '7 productos en menú'}
          </div>
        </div>

        {/* Metric 2: Gross Sales Revenue */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#141417] border border-white/[0.08] p-3.5 sm:p-5 hover:border-white/[0.15] transition-all min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Venta Bruta
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/[0.08] shrink-0" aria-hidden="true">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1">
            <span className="font-serif text-[clamp(1.2rem,3.5vw,1.875rem)] font-bold text-white tabular-nums break-words">
              ${totalRevenue.toFixed(2)}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 leading-snug">
            Ingreso bruto de {sales.length} ventas
          </div>
        </div>

        {/* Metric 3: Total Purchase Tickets (Gastos / Insumos) */}
        <button
          type="button"
          onClick={onOpenGastos}
          className="text-left relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#141417] border border-rose-500/25 p-3.5 sm:p-5 hover:border-rose-500/50 transition-all group min-w-0 active:scale-[0.99]"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-rose-300 font-medium leading-snug">
              Gastos e Insumos ({safeExpenses.length})
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/25 shrink-0" aria-hidden="true">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1">
            <span className="font-serif text-[clamp(1.2rem,3.5vw,1.875rem)] font-bold text-rose-400 tabular-nums break-words">
              -${totalTicketsExpenses.toFixed(2)}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 group-hover:text-rose-300 transition-colors leading-snug">
            ${expenseAnalytics.initialInvestmentTotal.toFixed(0)} inicial • ${expenseAnalytics.operationalExpensesTotal.toFixed(0)} reabasto
          </div>
        </button>

        {/* Metric 4: Net Profit (Shown only in Advanced View) */}
        {isAdvancedView && (
          <button
            type="button"
            onClick={onOpenGastos}
            className="text-left min-[360px]:col-span-2 lg:col-span-1 relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1a1e1b] to-[#141417] border border-emerald-500/35 p-3.5 sm:p-5 hover:border-emerald-500/60 transition-all group animate-fade-in min-w-0 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-emerald-300 font-bold">
                Utilidad Neta Real
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40 shrink-0" aria-hidden="true">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 flex items-baseline gap-1">
              <span className="font-serif text-[clamp(1.35rem,3.8vw,1.875rem)] font-extrabold text-emerald-400 tabular-nums break-words">
                ${netRealProfit.toFixed(2)}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-emerald-300/80 font-mono leading-snug">
              Margen real: {netMarginPct}% (Ventas - Tickets)
            </div>
          </button>
        )}

        {/* Metric 5: Cash in Drawer */}
        <button
          type="button"
          onClick={onOpenCorte}
          className="text-left relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#141417] border border-white/[0.08] p-3.5 sm:p-5 hover:border-white/[0.15] transition-all min-w-0 active:scale-[0.99]"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Efectivo en Caja
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/[0.08] shrink-0" aria-hidden="true">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e59b38]" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="font-serif text-[clamp(1.2rem,3.5vw,1.875rem)] font-bold text-[#e59b38] tabular-nums break-words">
              ${totalEfectivoEnCajon.toFixed(2)}
            </div>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 leading-snug">
            Fondo ${startingCash} + Ef. ventas - gastos
          </div>
        </button>

      </div>
    </div>
  );
};