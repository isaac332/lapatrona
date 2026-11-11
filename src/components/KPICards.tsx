'use client';

import React from 'react';
import { TimeframeFilter, ProductItem, SaleRecord } from '@/types/accounting';
import { ShoppingBag, DollarSign, Award, Layers, Sparkles, RotateCcw } from 'lucide-react';

interface KPICardsProps {
  timeframe: TimeframeFilter;
  sales: SaleRecord[];
  products: ProductItem[];
  onLoadSample: () => void;
  onOpenZeroOut: () => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  timeframe,
  sales,
  products,
  onLoadSample,
  onOpenZeroOut,
}) => {
  // Aggregate units and revenue
  const totalUnits = sales.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalRevenue = sales.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);

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

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
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

      {/* 4 Sleek KPI Cards - 2x2 Grid on Mobile for Maximum Thumb Ergonomics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
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

        {/* Metric 2: Estimated Revenue */}
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
            <span className="font-serif text-xl sm:text-4xl font-bold text-white truncate">
              ${totalRevenue.toFixed(2)}
            </span>
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-neutral-500 truncate">
            Precios vigentes
          </div>
        </div>

        {/* Metric 3: Top Seller */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#141417] border border-white/[0.08] p-3 sm:p-5 hover:border-white/[0.15] transition-all">
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
              {topProduct ? `${topCount} uds (${topProduct.variantLabel})` : 'Registra ventas'}
            </div>
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-neutral-500 truncate">
            Líder {timeframeLabels[timeframe]}
          </div>
        </div>

        {/* Metric 4: Combo Attachment */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#141417] border border-white/[0.08] p-3 sm:p-5 hover:border-white/[0.15] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Combos Papas
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
              <Layers className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
            <span className="font-serif text-2xl sm:text-4xl font-bold text-white">
              {comboRate}%
            </span>
            <span className="text-[10px] sm:text-xs text-neutral-400">c/ papas</span>
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-neutral-500 truncate">
            {totalFriesCombos} de {totalMains} combos
          </div>
        </div>

      </div>
    </div>
  );
};
