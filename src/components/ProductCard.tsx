'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductItem, TimeframeFilter } from '@/types/accounting';
import { Plus, Minus } from 'lucide-react';

interface ProductCardProps {
  product: ProductItem;
  counts: {
    today: number;
    week: number;
    month: number;
    all: number;
  };
  timeframe: TimeframeFilter;
  onIncrement: (productId: string, amount: number) => void;
  onDecrement: (productId: string, amount: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  counts,
  timeframe,
  onIncrement,
  onDecrement,
}) => {
  const [justUpdated, setJustUpdated] = useState(false);

  const activeCount = counts[timeframe];
  const subtotal = activeCount * product.defaultPrice;

  const triggerUpdateAnimation = () => {
    setJustUpdated(true);
    setTimeout(() => setJustUpdated(false), 300);
  };

  const handleIncrement = (amount: number) => {
    triggerUpdateAnimation();
    onIncrement(product.id, amount);
  };

  const handleDecrement = (amount: number) => {
    if (activeCount > 0) {
      triggerUpdateAnimation();
      onDecrement(product.id, amount);
    }
  };

  const getVariantBadgeColor = (variant: string) => {
    if (variant.toLowerCase().includes('fries')) {
      return 'bg-[#e59b38]/15 text-[#e59b38] border-[#e59b38]/30';
    }
    if (variant.toLowerCase().includes('cheese')) {
      return 'bg-amber-400/15 text-amber-300 border-amber-400/30';
    }
    return 'bg-neutral-800 text-neutral-300 border-neutral-700';
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl bg-[#141417] border transition-all duration-200 overflow-hidden ${
        justUpdated
          ? 'border-[#e59b38] ring-1 ring-[#e59b38]/40 shadow-lg shadow-[#e59b38]/10'
          : 'border-white/[0.08] hover:border-white/[0.18]'
      }`}
    >
      {/* Top Banner with Image & Variant Badge */}
      <div className="relative h-44 w-full bg-neutral-900 overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 380px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141417] via-[#141417]/40 to-black/30" />

        {/* Variant Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full border backdrop-blur-md ${getVariantBadgeColor(
              product.variantLabel
            )}`}
          >
            {product.variantLabel}
          </span>
        </div>

        {/* Unit Price Tag */}
        <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-xs font-mono font-bold text-white">
          {product.defaultPrice > 0 ? `$${product.defaultPrice.toFixed(2)}` : 'Set Price'}
        </div>

        {/* Category Label */}
        <div className="absolute bottom-2 left-4 text-[10px] tracking-widest uppercase font-semibold text-neutral-400">
          {product.category}
        </div>
      </div>

      {/* Body Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-[#f5f0eb] tracking-tight group-hover:text-white transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-neutral-400 font-light leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Tally Box: Displays current timeframe count in large typography */}
        <div className="bg-[#19191d] rounded-xl p-3 border border-white/[0.06] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
              Sales ({timeframe})
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className={`font-serif text-3xl font-extrabold transition-transform duration-200 ${
                  justUpdated ? 'scale-110 text-[#e59b38]' : 'text-white'
                }`}
              >
                {activeCount}
              </span>
              <span className="text-xs text-neutral-500 font-mono">units</span>
            </div>
          </div>

          {/* Subtotal preview */}
          {product.defaultPrice > 0 && (
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                Gross Sales
              </span>
              <div className="text-sm font-mono font-bold text-[#e59b38] mt-0.5">
                ${subtotal.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Breakdown comparison pills (Today / Week / Month) */}
        <div className="grid grid-cols-3 gap-1.5 text-center bg-black/30 p-2 rounded-lg border border-white/[0.04] text-[11px]">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-neutral-500">Today</div>
            <div className={`font-mono font-semibold ${timeframe === 'today' ? 'text-[#e59b38]' : 'text-neutral-300'}`}>
              {counts.today}
            </div>
          </div>
          <div className="border-x border-white/[0.06]">
            <div className="text-[9px] uppercase tracking-wider text-neutral-500">Week</div>
            <div className={`font-mono font-semibold ${timeframe === 'week' ? 'text-[#e59b38]' : 'text-neutral-300'}`}>
              {counts.week}
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-neutral-500">Month</div>
            <div className={`font-mono font-semibold ${timeframe === 'month' ? 'text-[#e59b38]' : 'text-neutral-300'}`}>
              {counts.month}
            </div>
          </div>
        </div>

        {/* Counter Action Controls */}
        <div className="space-y-2 pt-2">
          {/* Main + and - Tactile Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDecrement(1)}
              disabled={activeCount <= 0}
              aria-label={`Decrease count for ${product.name}`}
              className={`flex-1 h-11 flex items-center justify-center rounded-xl border font-bold text-base transition-all duration-150 active:scale-95 ${
                activeCount > 0
                  ? 'border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white hover:border-neutral-500'
                  : 'border-white/[0.04] bg-transparent text-neutral-600 cursor-not-allowed'
              }`}
            >
              <Minus className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleIncrement(1)}
              aria-label={`Increase count for ${product.name}`}
              className="flex-[2] h-11 flex items-center justify-center gap-2 rounded-xl bg-[#e59b38] hover:bg-[#d48b28] text-black font-extrabold text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all duration-150"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+1 Count</span>
            </button>
          </div>

          {/* Quick Increment Chips (+1 and +5 for rush hour service) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleIncrement(5)}
              className="flex-1 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-neutral-300 hover:text-white text-xs font-mono font-medium transition-colors"
            >
              +5 Rush
            </button>
            <button
              onClick={() => handleIncrement(10)}
              className="flex-1 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-neutral-300 hover:text-white text-xs font-mono font-medium transition-colors"
            >
              +10 Bulk
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
