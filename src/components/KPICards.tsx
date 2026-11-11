'use client';

import React from 'react';
import { TimeframeFilter, ProductItem, SaleRecord } from '@/types/accounting';
import { getPaymentBreakdown } from '@/utils/accountingCalculations';
import { ShoppingBag, DollarSign, Award, Sparkles, RotateCcw, Wallet, Calculator } from 'lucide-react';

interface KPICardsProps {
  timeframe: TimeframeFilter;
  sales: SaleRecord[];
  products: ProductItem[];
  totalExpenses: number;
  startingCash?: number;
  onLoadSample: () => void;
  onOpenZeroOut: () => void;
  onOpenGastos: () => void;
  onOpenCalculadora: () => void;
  onOpenCorte?: () => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  timeframe,
  sales,
  products,
  totalExpenses,
  startingCash = 0,
  onLoadSample,
  onOpenZeroOut,
  onOpenGastos,
  onOpenCalculadora,
  onOpenCorte,
}) => {
  // Aggregate units and revenue
  const totalUnits = sales.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalRevenue = sales.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
  const totalCost = sales.reduce((acc, curr) => acc + curr.quantity * curr.unitCost, 0);
  const grossProfit = totalRevenue - totalCost;
  const grossMargin = totalRevenue > 0 && totalCost > 0 ? Math.round((grossProfit / totalRevenue) * 100) : null;
  const paymentBreakdown = getPaymentBreakdown(sales);
  const cashNetFromSales = paymentBreakdown.efectivo.total - totalExpenses;
  const totalEfectivoEnCajon = startingCash + cashNetFromSales;
  const dineroEnBanco = paymentBreakdown.tarjeta.total + paymentBreakdown.transferencia.total;

  // Top seller
  const productCountMap: Record<string, number> = {};
  sales.forEach((s) => {
    productCountMap[s.productId] = (productCountMap[s.productId] || 0) + s.quantity;
  });

  let topProductId = '';
  let topCount = 0;
  Object.entries(productCountMap).forEach(([pId, count]) => {
    if (count > topCount) {
      topCount = count;
      topProductId = pId;
    }
  });

  const topProduct = products.find((p) => p.id === topProductId);

  // Combo attachment rate (Sandwich w/ fries + Quesadilla w/ fries) vs alone
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
      {/* Top Bar with Filter Context, Zero-Out action and Sample Loader */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 pb-2 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xs sm:text-sm font-semibold tracking-wider text-neutral-300 uppercase">
            Resumen de Rendimiento — {timeframeLabels[timeframe]}
          </h2>
          <p className="text-[11px] sm:text-xs text-neutral-500">
            Cálculos en tiempo real basados en {sales.length} transacciones registradas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Quick Cash Change Calculator Button */}
          <button
            onClick={onOpenCalculadora}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-colors touch-manipulation active:scale-95"
            title="Calculadora de cambio de efectivo"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calcular Cambio</span>
          </button>

          {/* Quick Expense Button */}
          <button
            onClick={onOpenGastos}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-colors touch-manipulation active:scale-95"
            title="Registrar salida o gasto de caja"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Registrar Gasto</span>
          </button>

          {sales.length > 0 && (
            <button
              onClick={onOpenZeroOut}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-full text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors touch-manipulation active:scale-95"
              title="Poner en ceros toda la contabilidad"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Poner en Ceros</span>
            </button>
          )}

          {sales.length === 0 ? (
            <button
              onClick={onLoadSample}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[#e59b38]/10 text-[#e59b38] border border-[#e59b38]/30 hover:bg-[#e59b38]/20 transition-colors touch-manipulation"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cargar Muestra</span>
            </button>
          ) : (
            <button
              onClick={onLoadSample}
              className="text-xs text-neutral-400 hover:text-neutral-200 underline underline-offset-4 decoration-neutral-600 hover:decoration-white transition-colors touch-manipulation"
            >
              Recargar Muestra
            </button>
          )}
        </div>
      </div>

      {/* 5 Sleek KPI Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        
        {/* Metric 1: Total Units */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#141417] border border-white/[0.08] p-3 sm:p-5 hover:border-white/[0.15] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Piezas
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
            4 cat. / 7 variantes
          </div>
        </div>

        {/* Metric 2: Estimated Gross Revenue */}
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
            {grossMargin !== null ? (
              <span className="text-emerald-400 font-semibold font-mono">
                Utilidad: ${grossProfit.toFixed(0)} ({grossMargin}% mg.)
              </span>
            ) : (
              'Ingreso total acumulado'
            )}
          </div>
        </div>

        {/* Metric 3: Salidas / Gastos */}
        <div
          onClick={onOpenGastos}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#141417] border border-rose-500/20 p-3 sm:p-5 hover:border-rose-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-rose-300 font-medium">
              Gastos Caja
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/25">
              <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-rose-400" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1">
            <span className="font-serif text-xl sm:text-3xl font-bold text-rose-400 truncate">
              -${totalExpenses.toFixed(2)}
            </span>
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-neutral-500 group-hover:text-rose-300 transition-colors truncate">
            Toca para ver / registrar
          </div>
        </div>

        {/* Metric 4: Efectivo Físico en Cajón */}
        <div
          onClick={onOpenCorte}
          className="col-span-2 sm:col-span-1 relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1a1e1b] to-[#141417] border border-emerald-500/30 p-3 sm:p-5 hover:border-emerald-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-emerald-300 font-bold">
              Efectivo en Cajón
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
              <span className="font-mono text-emerald-400 text-xs font-black">$</span>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1">
            <span className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-400 truncate">
              ${totalEfectivoEnCajon.toFixed(2)}
            </span>
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-neutral-400 truncate">
            {startingCash > 0
              ? `Fondo: $${startingCash} + Neto: $${cashNetFromSales.toFixed(0)}`
              : dineroEnBanco > 0
              ? `+ $${dineroEnBanco.toFixed(0)} en banco/tarjeta`
              : 'Ventas Ef. - Gastos'}
          </div>
        </div>

        {/* Metric 5: Top Seller & Combos */}
        <div className="col-span-2 sm:col-span-1 relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#141417] border border-white/[0.08] p-3 sm:p-5 hover:border-white/[0.15] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Más Vendido
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 text-[#e59b38]" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xs sm:text-sm font-semibold text-[#f5f0eb] truncate">
              {topProduct ? topProduct.name : 'Sin ventas'}
            </div>
            <div className="text-[10px] sm:text-xs text-[#e59b38] font-mono mt-0.5 truncate">
              {topProduct ? `${topCount} uds (${comboRate}% c/papas)` : 'Registra ventas'}
            </div>
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-neutral-500 truncate">
            Líder {timeframeLabels[timeframe]}
          </div>
        </div>

      </div>
    </div>
  );
};
