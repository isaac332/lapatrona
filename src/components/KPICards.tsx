'use client';

import React from 'react';
import { TimeframeFilter, ProductItem, SaleRecord, ExpenseRecord } from '@/types/accounting';
import { getPaymentBreakdown, calculateExpensesAnalytics } from '@/utils/accountingCalculations';
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
}) => {
  const safeSales = Array.isArray(sales) ? sales : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const totalUnits = safeSales.reduce((acc, curr) => acc + (curr?.quantity || 0), 0);
  const totalRevenue = safeSales.reduce((acc, curr) => acc + (curr?.quantity || 0) * (curr?.unitPrice || 0), 0);
  const expenseAnalytics = calculateExpensesAnalytics(safeExpenses);
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

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-start sm:justify-end">
          <button
            onClick={onOpenCalculadora}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-colors touch-manipulation active:scale-95"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calcular Cambio</span>
          </button>

          <button
            onClick={onOpenGastos}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-colors touch-manipulation active:scale-95"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Ver Tickets de Compra ({expenses.length})</span>
          </button>

          {onOpenMermas && (
            <button
              onClick={onOpenMermas}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors touch-manipulation active:scale-95 ${
                totalWasteCost > 0
                  ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/25'
                  : 'text-neutral-400 hover:text-white bg-white/5 border-white/10'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Mermas{totalWasteCost > 0 ? ` (-$${totalWasteCost.toFixed(0)})` : ''}</span>
            </button>
          )}

          {onExportCSV && sales.length > 0 && (
            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 transition-colors touch-manipulation active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* 5 Sleek KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        
        {/* Metric 1: Total Units */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#141417] border border-white/[0.08] p-3 sm:p-5 hover:border-white/[0.15] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Piezas Vendidas
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
              <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 text-[#e59b38]" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
            <span className="font-serif text-2xl sm:text-4xl font-bold text-[#f5f0eb]">
              {totalUnits}
            </span>
            <span className="text-[10px] sm:text-xs text-neutral-400 font-mono">piezas</span>
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-neutral-500 truncate">
            {topProduct ? `Líder: ${topProduct.name} (${comboRate}% c/papas)` : '7 productos en menú'}
          </div>
        </div>

        {/* Metric 2: Gross Sales Revenue */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#141417] border border-white/[0.08] p-3 sm:p-5 hover:border-white/[0.15] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Venta Bruta
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1">
            <span className="font-serif text-xl sm:text-3xl font-bold text-white truncate">
              ${totalRevenue.toFixed(2)}
            </span>
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-neutral-400 truncate">
            Ingreso bruto de {sales.length} ventas
          </div>
        </div>

        {/* Metric 3: Total Purchase Tickets (Gastos / Insumos) */}
        <div
          onClick={onOpenGastos}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#141417] border border-rose-500/25 p-3 sm:p-5 hover:border-rose-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-rose-300 font-medium">
              Tickets Insumos ({expenses.length})
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/25">
              <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-rose-400" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1">
            <span className="font-serif text-xl sm:text-3xl font-bold text-rose-400 truncate">
              -${totalTicketsExpenses.toFixed(2)}
            </span>
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-neutral-400 group-hover:text-rose-300 transition-colors truncate">
            Efec: ${expenseAnalytics.cashExpenses.toFixed(0)} • Tarj: ${expenseAnalytics.cardExpenses.toFixed(0)}
          </div>
        </div>

        {/* Metric 4: Net Profit (Utilidad Neta Real = Ventas - Tickets) */}
        <div
          onClick={onOpenGastos}
          className="col-span-2 sm:col-span-1 relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1a1e1b] to-[#141417] border border-emerald-500/35 p-3 sm:p-5 hover:border-emerald-500/60 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-emerald-300 font-bold">
              Utilidad Neta Real
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1">
            <span className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-400 truncate">
              ${netRealProfit.toFixed(2)}
            </span>
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-emerald-300/80 font-mono truncate">
            Margen real: {netMarginPct}% (Ventas - Tickets)
          </div>
        </div>

        {/* Metric 5: Cash in Drawer */}
        <div
          onClick={onOpenCorte}
          className="col-span-2 sm:col-span-1 relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#141417] border border-white/[0.08] p-3 sm:p-5 hover:border-white/[0.15] cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Efectivo en Caja
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 text-[#e59b38]" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="font-serif text-xl sm:text-3xl font-bold text-[#e59b38] truncate">
              ${totalEfectivoEnCajon.toFixed(2)}
            </div>
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-neutral-500 truncate">
            Fondo ${startingCash} + Ventas Ef. - Tickets Ef.
          </div>
        </div>

      </div>
    </div>
  );
};