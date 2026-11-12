'use client';

import React from 'react';
import { ProductItem, ProductStockConfig } from '@/types/accounting';
import { X, Package, RotateCcw, AlertTriangle, AlertCircle, CheckCircle2, ShieldCheck, ChefHat } from 'lucide-react';
import { ModalShell } from './ModalShell';

interface StockManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  stockMap: Record<string, ProductStockConfig>;
  onUpdateStock: (productId: string, newStock: number) => void;
  onAddStock: (productId: string, amount: number) => void;
  onToggleTrackStock: (productId: string) => void;
  onResetAllStock: () => void;
  onOpenMiseEnPlace?: () => void;
}

export const StockManagerModal: React.FC<StockManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  stockMap,
  onUpdateStock,
  onAddStock,
  onToggleTrackStock,
  onResetAllStock,
  onOpenMiseEnPlace,
}) => {
  if (!isOpen) return null;

  const totalRemainingPortions = Object.values(stockMap).reduce((acc, curr) => {
    return curr.trackStock ? acc + Math.max(0, curr.currentStock) : acc;
  }, 0);

  const lowOrExhaustedCount = Object.values(stockMap).filter((item) => {
    return item.trackStock && item.currentStock <= item.lowStockThreshold;
  }).length;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="stock-manager-title"
      maxWidthClass="max-w-3xl"
      panelClassName="bg-[#0d0d0f]"
    >
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-[#e59b38]/10 border border-[#e59b38]/30 flex items-center justify-center text-[#e59b38] shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 id="stock-manager-title" className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide leading-tight">
              Control de Porciones y Stock
            </h2>
            <p className="text-xs text-neutral-400">
              Inventario disponible para venta del día
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onOpenMiseEnPlace && (
            <button
              type="button"
              onClick={onOpenMiseEnPlace}
              className="min-h-[44px] sm:min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e59b38]/15 hover:bg-[#e59b38]/25 border border-[#e59b38]/30 text-xs font-bold text-[#e59b38] transition-all active:scale-95 shadow-sm touch-manipulation"
            >
              <ChefHat className="w-3.5 h-3.5 shrink-0" />
              <span>Mise en Place</span>
            </button>
          )}

          <button
            type="button"
            onClick={onResetAllStock}
            className="hidden sm:flex min-h-[36px] items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white transition-all active:scale-95 touch-manipulation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#e59b38]" />
            <span>Reiniciar Stock</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar control de stock"
            className="w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-neutral-400 hover:text-white transition-colors touch-manipulation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Summary Banner */}
      <div className="px-4 sm:px-5 py-3 bg-[#141417] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-neutral-500 uppercase tracking-wider text-[10px] block">
              Porciones Totales
            </span>
            <span className="font-mono font-bold text-white text-sm tabular-nums">
              {totalRemainingPortions} disponibles
            </span>
          </div>
          <div className="h-6 w-px bg-white/10 hidden min-[360px]:block" />
          <div>
            <span className="text-neutral-500 uppercase tracking-wider text-[10px] block">
              Alertas Activas
            </span>
            <span className={`font-mono font-bold text-sm tabular-nums ${lowOrExhaustedCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {lowOrExhaustedCount} productos críticos
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetAllStock}
          className="sm:hidden min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs font-semibold text-neutral-200 active:scale-95 touch-manipulation"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#e59b38]" />
          <span>Reiniciar Stock</span>
        </button>
      </div>

      {/* Product List */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto overscroll-contain space-y-3 divide-y divide-white/[0.04]">
        {products.map((product) => {
          const stock = stockMap[product.id] || {
            productId: product.id,
            currentStock: 0,
            initialStock: 0,
            lowStockThreshold: 5,
            trackStock: true,
          };

          const isExhausted = stock.trackStock && stock.currentStock <= 0;
          const isLow = stock.trackStock && stock.currentStock > 0 && stock.currentStock <= stock.lowStockThreshold;

          return (
            <div
              key={product.id}
              className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 shrink-0 border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-white leading-snug">
                      {product.name}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.05] text-[#e59b38] font-mono shrink-0">
                      {product.variantLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {stock.trackStock ? (
                      isExhausted ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                          <AlertCircle className="w-3 h-3" /> AGOTADO
                        </span>
                      ) : isLow ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" /> Últimas {stock.currentStock} porciones
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> {stock.currentStock} disponibles
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-neutral-500">
                        Control de stock pausado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stock Controls */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-stretch sm:self-center justify-end shrink-0">
                <div className="flex items-center border border-white/[0.1] rounded-xl bg-white/[0.03] overflow-hidden">
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="999"
                    value={stock.currentStock}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onUpdateStock(product.id, isNaN(val) ? 0 : Math.max(0, val));
                    }}
                    aria-label={`Stock de ${product.name}`}
                    className="w-16 min-h-[44px] sm:min-h-[36px] py-1.5 text-center font-mono font-bold text-base sm:text-sm bg-transparent text-white focus:outline-none tabular-nums"
                  />
                  <span className="pr-2.5 text-[10px] text-neutral-500 font-mono">
                    uds
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAddStock(product.id, 1)}
                    className="min-w-[44px] min-h-[44px] sm:min-w-[38px] sm:min-h-[36px] px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-[#e59b38]/20 hover:text-[#e59b38] border border-white/[0.08] text-xs font-mono font-bold text-neutral-300 transition-all active:scale-95 touch-manipulation"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddStock(product.id, 5)}
                    className="min-w-[44px] min-h-[44px] sm:min-w-[38px] sm:min-h-[36px] px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-[#e59b38]/20 hover:text-[#e59b38] border border-white/[0.08] text-xs font-mono font-bold text-neutral-300 transition-all active:scale-95 touch-manipulation"
                  >
                    +5
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleTrackStock(product.id)}
                  aria-label={`${stock.trackStock ? 'Pausar' : 'Activar'} control de stock para ${product.name}`}
                  aria-pressed={stock.trackStock}
                  className={`min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] p-2 rounded-xl border flex items-center justify-center transition-all touch-manipulation ${
                    stock.trackStock
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-white/[0.03] border-white/[0.08] text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <p className="text-[11px] text-neutral-500">
          * El stock disminuye automáticamente con cada venta u orden registrada.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-[#e59b38] hover:bg-[#f0aa49] text-black font-bold text-xs uppercase tracking-wider transition-all active:scale-95 touch-manipulation"
        >
          Listo
        </button>
      </div>
    </ModalShell>
  );
};