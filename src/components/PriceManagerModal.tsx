'use client';

import React, { useState } from 'react';
import { ProductItem } from '@/types/accounting';
import { X, DollarSign, Save, Info, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export const RECIPE_ESCANDALLOS: Record<
  string,
  {
    cost: number;
    ingredients: string[];
  }
> = {
  'sandwich-alone': {
    cost: 71.50,
    ingredients: ['Pan Hoagie artesanal ($12.00)', 'Ribeye de res 150g ($45.00)', 'Queso provolone 50g ($9.50)', 'Cebollitas asadas ($1.00)', 'Papel y empaque ($4.00)'],
  },
  'sandwich-fries': {
    cost: 80.50,
    ingredients: ['Pan Hoagie artesanal ($12.00)', 'Ribeye de res 150g ($45.00)', 'Queso provolone 50g ($9.50)', 'Papas a la francesa 200g ($9.00)', 'Empaque combo ($5.00)'],
  },
  'quesadilla-alone': {
    cost: 55.90,
    ingredients: ['Tortilla de harina gigante ($4.50)', 'Ribeye de res 120g ($36.00)', 'Mezcla quesos fundir 60g ($11.40)', 'Empaque ($4.00)'],
  },
  'quesadilla-fries': {
    cost: 64.90,
    ingredients: ['Tortilla de harina gigante ($4.50)', 'Ribeye de res 120g ($36.00)', 'Mezcla quesos fundir 60g ($11.40)', 'Papas a la francesa 200g ($9.00)', 'Empaque combo ($4.00)'],
  },
  'steak-frites': {
    cost: 72.35,
    ingredients: ['Ribeye sellado 180g ($54.00)', 'Papas a la francesa 250g ($11.25)', 'Pimientos y cebolla salteada ($2.10)', 'Charola artesanal ($5.00)'],
  },
  'fries-alone': {
    cost: 15.90,
    ingredients: ['Papas corte casero 220g ($9.90)', 'Aceite doble fritura y sal ($3.00)', 'Cono / caja ($3.00)'],
  },
  'fries-cheese': {
    cost: 24.30,
    ingredients: ['Papas corte casero 220g ($9.90)', 'Salsa queso cheddar caliente 70g ($8.40)', 'Aceite y sal ($3.00)', 'Charola / contenedor ($3.00)'],
  },
};

interface PriceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  onSaveProducts: (updatedProducts: ProductItem[]) => void;
}

export const PriceManagerModal: React.FC<PriceManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  onSaveProducts,
}) => {
  if (!isOpen) return null;

  return (
    <PriceManagerModalDialog
      onClose={onClose}
      products={products}
      onSaveProducts={onSaveProducts}
    />
  );
};

interface PriceManagerModalDialogProps {
  onClose: () => void;
  products: ProductItem[];
  onSaveProducts: (updatedProducts: ProductItem[]) => void;
}

function PriceManagerModalDialog({
  onClose,
  products,
  onSaveProducts,
}: PriceManagerModalDialogProps) {
  const [formData, setFormData] = useState<ProductItem[]>(products);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  const handlePriceChange = (id: string, price: number) => {
    setFormData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, defaultPrice: price } : item))
    );
  };

  const handleCostChange = (id: string, cost: number) => {
    setFormData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cost: cost } : item))
    );
  };

  const handleApplyEscandallos = () => {
    setFormData((prev) =>
      prev.map((item) => {
        const recipe = RECIPE_ESCANDALLOS[item.id];
        return recipe ? { ...item, cost: recipe.cost } : item;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProducts(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden pb-safe sm:pb-0">
        
        {/* Mobile handle indicator */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.08] bg-[#19191d] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#e59b38]/15 border border-[#e59b38]/30 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#e59b38]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                Precios y Costeo de Alimentos
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                Ajusta precios de venta y costos de insumo por receta.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors touch-manipulation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative notice with Autocomplete Escandallos Button */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#e59b38]/10 border-b border-[#e59b38]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] sm:text-xs text-[#f5f0eb] shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#e59b38] shrink-0" />
            <span>Ingresa precios y costos unitarios para calcular tu margen bruto.</span>
          </div>
          <button
            type="button"
            onClick={handleApplyEscandallos}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e59b38] hover:bg-[#d48b28] text-black font-extrabold text-[11px] transition-all self-start sm:self-auto shadow-sm active:scale-95"
            title="Cargar costos sugeridos basados en insumos (Ribeye, pan, queso, papas)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autocompletar Escandallos</span>
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-12 gap-2 sm:gap-3 pb-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400 border-b border-white/[0.06]">
            <div className="col-span-6 sm:col-span-6">Producto y Variante</div>
            <div className="col-span-3 sm:col-span-3 text-right">Precio ($)</div>
            <div className="col-span-3 sm:col-span-3 text-right">Costo ($)</div>
          </div>

          {formData.map((item) => {
            const margin =
              item.defaultPrice > 0 && item.cost > 0
                ? Math.round(((item.defaultPrice - item.cost) / item.defaultPrice) * 100)
                : null;
            const recipe = RECIPE_ESCANDALLOS[item.id];
            const isExpanded = expandedRecipeId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors overflow-hidden"
              >
                <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center p-2.5 sm:p-3">
                  {/* Product Name & Variant */}
                  <div className="col-span-6 sm:col-span-6">
                    <div className="font-semibold text-xs sm:text-sm text-[#f5f0eb] leading-tight truncate">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] sm:text-[11px] text-[#e59b38] font-mono truncate">
                        {item.variantLabel}
                      </span>
                      {margin !== null && (
                        <span className="text-[9px] sm:text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded shrink-0">
                          {margin}%
                        </span>
                      )}
                      {recipe && (
                        <button
                          type="button"
                          onClick={() => setExpandedRecipeId(isExpanded ? null : item.id)}
                          className="text-[9px] text-neutral-400 hover:text-white flex items-center gap-0.5 underline decoration-white/20"
                        >
                          <span>Receta</span>
                          {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Selling Price Input */}
                  <div className="col-span-3 sm:col-span-3">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-mono">
                        $
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="0"
                        value={item.defaultPrice || ''}
                        onChange={(e) =>
                          handlePriceChange(item.id, parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                        className="w-full bg-[#1e1e23] border border-white/10 rounded-lg pl-5 pr-2 py-2 text-xs sm:text-sm text-right font-mono text-white focus:outline-none focus:border-[#e59b38]"
                      />
                    </div>
                  </div>

                  {/* Unit Cost Input */}
                  <div className="col-span-3 sm:col-span-3">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-mono">
                        $
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="0"
                        value={item.cost || ''}
                        onChange={(e) =>
                          handleCostChange(item.id, parseFloat(e.target.value) || 0)
                        }
                        placeholder="Pendiente"
                        className="w-full bg-[#1e1e23] border border-white/10 rounded-lg pl-5 pr-2 py-2 text-xs sm:text-sm text-right font-mono text-neutral-200 focus:outline-none focus:border-[#e59b38]"
                      />
                    </div>
                  </div>
                </div>

                {/* Expandable Recipe Insumos Breakdown */}
                {isExpanded && recipe && (
                  <div className="px-3 pb-3 pt-1 border-t border-white/[0.04] bg-black/20 text-[10px] text-neutral-400 space-y-1 animate-fade-in">
                    <div className="font-semibold text-neutral-300 uppercase tracking-wider">
                      Desglose de Escandallo (Insumos Base):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                      {recipe.ingredients.map((ing, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[#e59b38]" />
                          <span>{ing}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </form>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-5 border-t border-white/[0.08] bg-[#19191d] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors touch-manipulation active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-[#e59b38] hover:bg-[#d48b28] text-black font-bold text-xs uppercase tracking-wider px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-full transition-all shadow-md active:scale-95 touch-manipulation"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Precios</span>
          </button>
        </div>

      </div>
    </div>
  );
}
