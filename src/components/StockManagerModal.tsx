'use client';

import React from 'react';
import { ProductItem, ProductStockConfig } from '@/types/accounting';
import { X, Package, RotateCcw, AlertTriangle, AlertCircle, CheckCircle2, ShieldCheck, ChefHat } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-[#0d0d0f] border border-white/[0.1] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e59b38]/10 border border-[#e59b38]/30 flex items-center justify-center text-[#e59b38]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide">
                Control de Porciones y Stock
              </h2>
              <p className="text-xs text-neutral-400">
                Límites de inventario para cocina en el turno actual
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenMiseEnPlace && (
              <button
                onClick={onOpenMiseEnPlace}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e59b38]/15 hover:bg-[#e59b38]/25 border border-[#e59b38]/30 text-xs font-bold text-[#e59b38] transition-all active:scale-95 shadow-sm"
                title="Calcular insumos, kilos de carne, panes, papas y quesos para el turno"
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Mise en Place</span>
              </button>
            )}

            <button
              onClick={onResetAllStock}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white transition-all active:scale-95"
              title="Reiniciar stock a valores iniciales"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#e59b38]" />
              <span>Reiniciar Turno</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Summary Banner */}
        <div className="px-5 py-3 bg-[#141417] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-neutral-500 uppercase tracking-wider text-[10px] block">
                Porciones Totales
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {totalRemainingPortions} disponibles
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <span className="text-neutral-500 uppercase tracking-wider text-[10px] block">
                Alertas Activas
              </span>
              <span className={`font-mono font-bold text-sm ${lowOrExhaustedCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {lowOrExhaustedCount} productos críticos
              </span>
            </div>
          </div>

          <button
            onClick={onResetAllStock}
            className="sm:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-[11px] text-neutral-300 active:scale-95"
          >
            <RotateCcw className="w-3 h-3 text-[#e59b38]" />
            <span>Reiniciar Turno</span>
          </button>
        </div>

        {/* Product List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 divide-y divide-white/[0.04]">
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
                {/* Product Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 shrink-0 border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white truncate">
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
                <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center shrink-0">
                  {/* Current Quantity Input */}
                  <div className="flex items-center border border-white/[0.1] rounded-xl bg-white/[0.03] overflow-hidden">
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={stock.currentStock}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        onUpdateStock(product.id, isNaN(val) ? 0 : Math.max(0, val));
                      }}
                      className="w-16 py-1.5 text-center font-mono font-bold text-sm bg-transparent text-white focus:outline-none"
                    />
                    <span className="pr-2 text-[10px] text-neutral-500 font-mono">
                      uds
                    </span>
                  </div>

                  {/* Quick Increment Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onAddStock(product.id, 5)}
                      className="px-2 py-1.5 rounded-lg bg-white/[0.05] hover:bg-[#e59b38]/20 hover:text-[#e59b38] border border-white/[0.08] text-xs font-mono font-bold text-neutral-300 transition-all active:scale-95"
                      title="Agregar 5 porciones"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddStock(product.id, 10)}
                      className="px-2 py-1.5 rounded-lg bg-white/[0.05] hover:bg-[#e59b38]/20 hover:text-[#e59b38] border border-white/[0.08] text-xs font-mono font-bold text-neutral-300 transition-all active:scale-95"
                      title="Agregar 10 porciones"
                    >
                      +10
                    </button>
                  </div>

                  {/* Toggle Tracking */}
                  <button
                    type="button"
                    onClick={() => onToggleTrackStock(product.id)}
                    className={`p-2 rounded-xl border transition-all ${
                      stock.trackStock
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-white/[0.03] border-white/[0.08] text-neutral-500 hover:text-neutral-300'
                    }`}
                    title={stock.trackStock ? 'Monitoreo activo' : 'Monitoreo pausado'}
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
          <p className="text-[11px] text-neutral-500">
            * El stock disminuye automáticamente con cada venta directa o comanda registrada.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#e59b38] hover:bg-[#f0aa49] text-black font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
