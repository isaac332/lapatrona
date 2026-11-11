'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ProductItem, TimeframeFilter } from '@/types/accounting';
import { Plus, Minus, Pencil, Check, X } from 'lucide-react';

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
  onUpdatePrice: (productId: string, newPrice: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  counts,
  timeframe,
  onIncrement,
  onDecrement,
  onUpdatePrice,
}) => {
  const [justUpdated, setJustUpdated] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState(product.defaultPrice.toString());
  const [priceFlash, setPriceFlash] = useState(false);
  const priceInputRef = useRef<HTMLInputElement>(null);

  const activeCount = counts[timeframe];
  const subtotal = activeCount * product.defaultPrice;

  // Focus and select input when entering edit mode
  useEffect(() => {
    if (isEditingPrice) {
      priceInputRef.current?.focus();
      priceInputRef.current?.select();
    }
  }, [isEditingPrice]);

  const handleStartEditPrice = () => {
    setTempPrice(product.defaultPrice.toString());
    setIsEditingPrice(true);
  };

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

  const handleSavePrice = () => {
    const parsed = parseFloat(tempPrice);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdatePrice(product.id, parsed);
      setPriceFlash(true);
      setTimeout(() => setPriceFlash(false), 800);
    } else {
      setTempPrice(product.defaultPrice.toString());
    }
    setIsEditingPrice(false);
  };

  const handleCancelPrice = () => {
    setTempPrice(product.defaultPrice.toString());
    setIsEditingPrice(false);
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSavePrice();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelPrice();
    }
  };

  const getVariantBadgeColor = (variant: string) => {
    const lower = variant.toLowerCase();
    if (lower.includes('papas') || lower.includes('combo')) {
      return 'bg-[#e59b38]/15 text-[#e59b38] border-[#e59b38]/30';
    }
    if (lower.includes('queso') || lower.includes('fundido')) {
      return 'bg-amber-400/15 text-amber-300 border-amber-400/30';
    }
    return 'bg-neutral-800 text-neutral-300 border-neutral-700';
  };

  const timeframeDisplayMap: Record<TimeframeFilter, string> = {
    today: 'Hoy',
    week: 'Esta Semana',
    month: 'Este Mes',
    all: 'Total',
  };

  const categoryNameMap: Record<string, string> = {
    sandwiches: 'Sándwiches',
    quesadillas: 'Quesadillas',
    'steak-frites': 'Steak Frites',
    fries: 'Papas Fritas',
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl bg-[#141417] border transition-all duration-200 overflow-hidden ${
        justUpdated
          ? 'border-[#e59b38] ring-1 ring-[#e59b38]/40 shadow-lg shadow-[#e59b38]/10'
          : 'border-white/[0.08] hover:border-white/[0.18]'
      }`}
    >
      {/* Top Banner with Image, Variant Badge & On-The-Fly Price Tag */}
      <div className="relative h-44 w-full bg-neutral-900 overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 380px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141417] via-[#141417]/40 to-black/40" />

        {/* Variant Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span
            className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full border backdrop-blur-md ${getVariantBadgeColor(
              product.variantLabel
            )}`}
          >
            {product.variantLabel}
          </span>
        </div>

        {/* ON-THE-FLY EDITABLE PRICE TAG */}
        <div className="absolute top-3 right-3 z-20">
          {isEditingPrice ? (
            <div
              className="flex items-center gap-1 bg-[#19191d]/95 backdrop-blur-md border border-[#e59b38] rounded-full px-2.5 py-1 shadow-xl animate-fade-in ring-2 ring-[#e59b38]/20"
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  handleSavePrice();
                }
              }}
            >
              <span className="text-xs font-mono font-bold text-[#e59b38] pl-1">$</span>
              <input
                ref={priceInputRef}
                type="number"
                step="any"
                min="0"
                value={tempPrice}
                onChange={(e) => setTempPrice(e.target.value)}
                onKeyDown={handlePriceKeyDown}
                className="w-20 bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
                placeholder="0.00"
                aria-label={`Editar precio de ${product.name}`}
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleSavePrice}
                title="Guardar precio (Enter)"
                className="w-5 h-5 rounded-full bg-[#e59b38] text-black flex items-center justify-center hover:bg-[#d48b28] transition-colors shrink-0"
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleCancelPrice}
                title="Cancelar (Esc)"
                className="w-5 h-5 rounded-full bg-white/10 text-neutral-300 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartEditPrice}
              title="Clic para cambiar precio al vuelo"
              className={`flex items-center gap-1.5 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                priceFlash
                  ? 'bg-emerald-500 text-black border border-emerald-400 scale-105 shadow-md shadow-emerald-500/30'
                  : 'bg-black/80 hover:bg-black text-white hover:text-[#e59b38] border border-white/15 hover:border-[#e59b38]/50 shadow-md'
              }`}
            >
              <span>${product.defaultPrice.toFixed(2)}</span>
              <Pencil className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        {/* Category Label */}
        <div className="absolute bottom-2 left-4 text-[10px] tracking-widest uppercase font-semibold text-neutral-400">
          {categoryNameMap[product.category] || product.category}
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
              Ventas ({timeframeDisplayMap[timeframe]})
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className={`font-serif text-3xl font-extrabold transition-transform duration-200 ${
                  justUpdated ? 'scale-110 text-[#e59b38]' : 'text-white'
                }`}
              >
                {activeCount}
              </span>
              <span className="text-xs text-neutral-500 font-mono">piezas</span>
            </div>
          </div>

          {/* Subtotal preview */}
          {product.defaultPrice > 0 && (
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                Venta Bruta
              </span>
              <div className="text-sm font-mono font-bold text-[#e59b38] mt-0.5">
                ${subtotal.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Breakdown comparison pills (Hoy / Semana / Mes) */}
        <div className="grid grid-cols-3 gap-1.5 text-center bg-black/30 p-2 rounded-lg border border-white/[0.04] text-[11px]">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-neutral-500">Hoy</div>
            <div
              className={`font-mono font-semibold ${
                timeframe === 'today' ? 'text-[#e59b38]' : 'text-neutral-300'
              }`}
            >
              {counts.today}
            </div>
          </div>
          <div className="border-x border-white/[0.06]">
            <div className="text-[9px] uppercase tracking-wider text-neutral-500">Semana</div>
            <div
              className={`font-mono font-semibold ${
                timeframe === 'week' ? 'text-[#e59b38]' : 'text-neutral-300'
              }`}
            >
              {counts.week}
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-neutral-500">Mes</div>
            <div
              className={`font-mono font-semibold ${
                timeframe === 'month' ? 'text-[#e59b38]' : 'text-neutral-300'
              }`}
            >
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
              aria-label={`Disminuir conteo de ${product.name}`}
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
              aria-label={`Registrar venta de ${product.name}`}
              className="flex-[2] h-11 flex items-center justify-center gap-2 rounded-xl bg-[#e59b38] hover:bg-[#d48b28] text-black font-extrabold text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all duration-150"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+1 Venta</span>
            </button>
          </div>

          {/* Quick Increment Chips (+5 Rush and +10 Bulk) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleIncrement(5)}
              className="flex-1 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-neutral-300 hover:text-white text-xs font-mono font-medium transition-colors"
            >
              +5 Racha
            </button>
            <button
              onClick={() => handleIncrement(10)}
              className="flex-1 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-neutral-300 hover:text-white text-xs font-mono font-medium transition-colors"
            >
              +10 Lote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
