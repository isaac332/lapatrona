'use client';

import React from 'react';
import { TimeframeFilter, ProductItem, SaleRecord } from '@/types/accounting';
import { ShoppingBag, DollarSign, Award, Layers, Sparkles } from 'lucide-react';

interface KPICardsProps {
  timeframe: TimeframeFilter;
  sales: SaleRecord[];
  products: ProductItem[];
  onLoadSample: () => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  timeframe,
  sales,
  products,
  onLoadSample,
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
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    all: 'All-Time',
  };

  return (
    <div className="space-y-4">
      {/* Top Bar with Filter Context and Sample Loader */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-neutral-300 uppercase">
            Performance Overview — {timeframeLabels[timeframe]}
          </h2>
          <p className="text-xs text-neutral-500">
            Real-time calculations based on {sales.length} logged sales events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sales.length === 0 ? (
            <button
              onClick={onLoadSample}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[#e59b38]/10 text-[#e59b38] border border-[#e59b38]/30 hover:bg-[#e59b38]/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Shift Data</span>
            </button>
          ) : (
            <button
              onClick={onLoadSample}
              className="text-xs text-neutral-400 hover:text-neutral-200 underline underline-offset-4 decoration-neutral-600 hover:decoration-white transition-colors"
            >
              Reload Sample Data
            </button>
          )}
        </div>
      </div>

      {/* 4 Sleek KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Units */}
        <div className="relative overflow-hidden rounded-2xl bg-[#141417] border border-white/[0.08] p-5 hover:border-white/[0.15] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Total Units Sold
            </span>
            <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
              <ShoppingBag className="w-4 h-4 text-[#e59b38]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#f5f0eb]">
              {totalUnits}
            </span>
            <span className="text-xs text-neutral-400 font-mono">items</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            Across 4 categories & variants
          </div>
        </div>

        {/* Metric 2: Estimated Revenue */}
        <div className="relative overflow-hidden rounded-2xl bg-[#141417] border border-white/[0.08] p-5 hover:border-white/[0.15] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Gross Sales (Est.)
            </span>
            <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-white">
              ${totalRevenue.toFixed(2)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            Based on configured unit prices
          </div>
        </div>

        {/* Metric 3: Top Seller */}
        <div className="relative overflow-hidden rounded-2xl bg-[#141417] border border-white/[0.08] p-5 hover:border-white/[0.15] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Top Selling Item
            </span>
            <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
              <Award className="w-4 h-4 text-[#e59b38]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-semibold text-[#f5f0eb] truncate">
              {topProduct ? `${topProduct.name}` : 'No sales yet'}
            </div>
            <div className="text-xs text-[#e59b38] font-mono mt-0.5">
              {topProduct ? `${topProduct.variantLabel} (${topCount} sold)` : 'Log a sale below'}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            Highest volume item in {timeframeLabels[timeframe]}
          </div>
        </div>

        {/* Metric 4: Combo Attachment */}
        <div className="relative overflow-hidden rounded-2xl bg-[#141417] border border-white/[0.08] p-5 hover:border-white/[0.15] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Combo Attachment
            </span>
            <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center border border-white/[0.08]">
              <Layers className="w-4 h-4 text-amber-300" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-white">
              {comboRate}%
            </span>
            <span className="text-xs text-neutral-400">ordered w/ fries</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            {totalFriesCombos} of {totalMains} mains upgraded
          </div>
        </div>

      </div>
    </div>
  );
};
