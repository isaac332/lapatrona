'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ProductItem, TimeframeFilter, ProductStockConfig } from '@/types/accounting';
import { triggerHaptic } from '@/utils/haptics';
import { Plus, Minus, Pencil, Check, X, AlertCircle, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: ProductItem;
  counts: {
    today: number;
    week: number;
    month: number;
    all: number;
  };
  timeframe: TimeframeFilter;
  shortcutKey?: string;
  stockConfig?: ProductStockConfig;
  onIncrement: (productId: string, amount: number) => void;
  onDecrement: (productId: string, amount: number) => void;
  onUpdatePrice: (productId: string, newPrice: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  counts,
  timeframe,
  shortcutKey,
  stockConfig,
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

  // Stock checking commented out - allow logging sales freely without stock restrictions
  // const isStockTracked = stockConfig?.trackStock ?? false;
  // const currentStock = stockConfig?.currentStock ?? 999;
  // const isExhausted = isStockTracked && currentStock <= 0;
  // const isLowStock = isStockTracked && currentStock > 0 && currentStock <= (stockConfig?.lowStockThreshold ?? 5);
  const isStockTracked = false;
  const currentStock = 999;
  const isExhausted = false;
  const isLowStock = false;

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
    triggerHaptic(amount > 1 ? 'medium' : 'light');
    triggerUpdateAnimation();
    onIncrement(product.id, amount);
  };

  const handleDecrement = (amount: number) => {
    if (activeCount > 0) {
      triggerHaptic('medium');
      triggerUpdateAnimation();
      onDecrement(product.id, amount);
    }
  };

  const handleSavePrice = () => {
    const parsed = parseFloat(tempPrice);
    if (!isNaN(parsed) && parsed >= 0) {
      triggerHaptic('success');
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
    if (lower.includes('sin papas') || lower.includes('solo') || lower.includes('sola')) {
      return 'bg-neutral-800 text-neutral-200 border-neutral-600';
    }
    if (lower.includes('con papas')) {
      return 'bg-[#e59b38]/20 text-[#e59b38] border-[#e59b38]/40';
    }
    if (lower.includes('queso') || lower.includes('preparadas')) {
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
    'steak-frites': 'Papas Lokas',
    fries: 'Papas con Queso',
    bebidas: 'Champurro',
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl bg-[#141417] border transition-all duration-200 overflow-hidden shadow-lg ${
        justUpdated
          ? 'border-[#e59b38] ring-2 ring-[#e59b38]/40 shadow-[#e59b38]/20'
          : 'border-white/[0.08] hover:border-white/[0.18]'
      }`}
    >
      {/* Top Banner with Image, Variant Badge & On-The-Fly Price Tag */}
      <div className="relative h-36 sm:h-44 w-full bg-neutral-900 overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 380px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141417] via-[#141417]/40 to-black/40" />

        {/* Top Row: Variant Tag + Shortcut + Editable Price Tag */}
        <div className="absolute top-2.5 inset-x-2.5 sm:top-3 sm:inset-x-3 flex items-start justify-between gap-2 z-20 pointer-events-none">
          <div className={`${isEditingPrice ? 'hidden sm:flex' : 'flex'} items-center gap-1.5 min-w-0 pointer-events-auto`}>
            <span
              className={`text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border backdrop-blur-md truncate ${getVariantBadgeColor(
                product.variantLabel
              )}`}
            >
              {product.variantLabel}
            </span>
            {shortcutKey && (
              <kbd
                className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-black text-black bg-[#e59b38] rounded-full shadow border border-black/20 shrink-0"
                title={`Presiona ${shortcutKey} para registrar venta rápida`}
              >
                {shortcutKey}
              </kbd>
            )}
          </div>

          <div className="ml-auto pointer-events-auto shrink-0">
            {isEditingPrice ? (
              <div
                className="flex items-center gap-1 bg-[#19191d]/95 backdrop-blur-md border border-[#e59b38] rounded-full pl-2.5 pr-1 py-1 shadow-2xl animate-fade-in ring-2 ring-[#e59b38]/30"
                onClick={(e) => e.stopPropagation()}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    handleSavePrice();
                  }
                }}
              >
                <span className="text-sm font-mono font-bold text-[#e59b38] pl-0.5">$</span>
                <input
                  ref={priceInputRef}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={tempPrice}
                  onChange={(e) => setTempPrice(e.target.value)}
                  onKeyDown={handlePriceKeyDown}
                  className="w-20 sm:w-20 bg-transparent text-base sm:text-xs font-mono font-bold text-white focus:outline-none min-h-[36px]"
                  placeholder="0.00"
                  aria-label={`Editar precio de ${product.name}`}
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleSavePrice}
                  title="Guardar precio (Enter)"
                  aria-label="Guardar precio"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] sm:w-8 sm:h-8 sm:min-w-[32px] sm:min-h-[32px] rounded-full bg-[#e59b38] text-black flex items-center justify-center hover:bg-[#d48b28] transition-colors shrink-0 touch-manipulation active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleCancelPrice}
                  title="Cancelar (Esc)"
                  aria-label="Cancelar edición de precio"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] sm:w-8 sm:h-8 sm:min-w-[32px] sm:min-h-[32px] rounded-full bg-white/10 text-neutral-300 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 touch-manipulation active:scale-95"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartEditPrice}
                title="Toca para cambiar precio al vuelo"
                aria-label={`Editar precio de ${product.name}: $${product.defaultPrice.toFixed(2)}`}
                className={`min-h-[44px] flex items-center gap-1.5 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all touch-manipulation active:scale-95 select-none ${
                  priceFlash
                    ? 'bg-emerald-500 text-black border border-emerald-400 scale-105 shadow-md shadow-emerald-500/30'
                    : 'bg-black/85 hover:bg-black text-white hover:text-[#e59b38] border border-white/20 hover:border-[#e59b38]/50 shadow-md'
                }`}
              >
                <span>${product.defaultPrice.toFixed(2)}</span>
                <Pencil className="w-3 h-3 text-[#e59b38] opacity-80" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Category Label and Stock Status Badge */}
        <div className="absolute bottom-2 left-3 sm:left-4 right-3 flex items-center justify-between z-10">
          <div className="text-[9px] sm:text-[10px] tracking-widest uppercase font-semibold text-neutral-400">
            {categoryNameMap[product.category] || product.category}
          </div>

          {isStockTracked && (
            <div>
              {isExhausted ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40 backdrop-blur-md">
                  <AlertCircle className="w-3 h-3" /> AGOTADO
                </span>
              ) : isLowStock ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 backdrop-blur-md animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> Quedan {currentStock}
                </span>
              ) : (
                <span className="text-[10px] text-neutral-400 font-mono bg-black/60 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md">
                  {currentStock} disp.
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body Information */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
        <div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#f5f0eb] tracking-tight group-hover:text-white transition-colors leading-snug">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-neutral-400 font-light leading-relaxed line-clamp-1 sm:line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Tally Box */}
        <div className="bg-[#19191d] rounded-xl p-2.5 sm:p-3 border border-white/[0.06] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
              Ventas ({timeframeDisplayMap[timeframe]})
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={`font-serif text-2xl sm:text-3xl font-extrabold transition-transform duration-200 ${
                  justUpdated ? 'scale-110 text-[#e59b38]' : 'text-white'
                }`}
              >
                {activeCount}
              </span>
              <span className="text-[11px] sm:text-xs text-neutral-500 font-mono">piezas</span>
            </div>
          </div>

          {product.defaultPrice > 0 && (
            <div className="text-right">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-neutral-500">
                Venta Bruta
              </span>
              <div className="text-xs sm:text-sm font-mono font-bold text-[#e59b38] mt-0.5">
                ${subtotal.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Breakdown comparison pills (Hoy / Semana / Mes) */}
        <div className="grid grid-cols-3 gap-1 text-center bg-black/40 p-1.5 sm:p-2 rounded-lg border border-white/[0.04] text-[10px] sm:text-[11px]">
          <div>
            <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-500">Hoy</div>
            <div
              className={`font-mono font-semibold ${
                timeframe === 'today' ? 'text-[#e59b38]' : 'text-neutral-300'
              }`}
            >
              {counts.today}
            </div>
          </div>
          <div className="border-x border-white/[0.06]">
            <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-500">Semana</div>
            <div
              className={`font-mono font-semibold ${
                timeframe === 'week' ? 'text-[#e59b38]' : 'text-neutral-300'
              }`}
            >
              {counts.week}
            </div>
          </div>
          <div>
            <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-500">Mes</div>
            <div
              className={`font-mono font-semibold ${
                timeframe === 'month' ? 'text-[#e59b38]' : 'text-neutral-300'
              }`}
            >
              {counts.month}
            </div>
          </div>
        </div>

        {/* Counter Action Controls (Single Unit Only, Batch Buttons Removed) */}
        <div className="pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDecrement(1)}
              disabled={activeCount <= 0}
              aria-label={`Disminuir conteo de ${product.name}`}
              className={`flex-1 h-12 flex items-center justify-center rounded-xl border font-bold text-base transition-all duration-150 active:scale-95 touch-manipulation select-none ${
                activeCount > 0
                  ? 'border-white/[0.12] bg-white/[0.05] active:bg-white/[0.12] text-white'
                  : 'border-white/[0.04] bg-transparent text-neutral-600 cursor-not-allowed'
              }`}
            >
              <Minus className="w-5 h-5" aria-hidden="true" />
            </button>

            {isExhausted ? (
              <button
                type="button"
                disabled
                aria-label={`Producto agotado: ${product.name}`}
                className="flex-[2.2] h-12 flex items-center justify-center gap-2 rounded-xl bg-neutral-800/80 text-neutral-500 font-extrabold text-sm uppercase tracking-wider border border-white/10 cursor-not-allowed select-none"
              >
                <AlertCircle className="w-4 h-4 text-rose-400" aria-hidden="true" />
                <span>Agotado</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleIncrement(1)}
                aria-label={`Registrar venta de ${product.name}`}
                className="flex-[2.2] h-12 flex items-center justify-center gap-2 rounded-xl bg-[#e59b38] active:bg-[#d48b28] text-black font-extrabold text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all duration-150 touch-manipulation select-none"
              >
                <Plus className="w-5 h-5 stroke-[3]" aria-hidden="true" />
                <span>+1 Venta</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};