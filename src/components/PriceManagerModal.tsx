'use client';

import React, { useState } from 'react';
import { ProductItem } from '@/types/accounting';
import { X, DollarSign, Save, Info } from 'lucide-react';

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
  const [formData, setFormData] = useState<ProductItem[]>(products);

  if (!isOpen) return null;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProducts(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08] bg-[#19191d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e59b38]/15 border border-[#e59b38]/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#e59b38]" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-white">
                Product Pricing & Food Cost Desk
              </h2>
              <p className="text-xs text-neutral-400">
                Update selling prices and food costs. You can add or adjust costs anytime.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative notice */}
        <div className="px-6 py-3 bg-[#e59b38]/10 border-b border-[#e59b38]/20 flex items-center gap-2.5 text-xs text-[#f5f0eb]">
          <Info className="w-4 h-4 text-[#e59b38] flex-shrink-0" />
          <span>
            Enter your selling prices below. When you have your unit food costs ready, enter them to calculate gross profit margin.
          </span>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-12 gap-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 border-b border-white/[0.06]">
            <div className="col-span-5 sm:col-span-6">Product & Variant</div>
            <div className="col-span-3 sm:col-span-3 text-right">Selling Price ($)</div>
            <div className="col-span-4 sm:col-span-3 text-right">Unit Food Cost ($)</div>
          </div>

          {formData.map((item) => {
            const margin =
              item.defaultPrice > 0 && item.cost > 0
                ? Math.round(((item.defaultPrice - item.cost) / item.defaultPrice) * 100)
                : null;

            return (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-3 items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
              >
                {/* Product Name & Variant */}
                <div className="col-span-5 sm:col-span-6">
                  <div className="font-semibold text-sm text-[#f5f0eb]">{item.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-[#e59b38] font-mono">
                      {item.variantLabel}
                    </span>
                    {margin !== null && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 rounded">
                        {margin}% margin
                      </span>
                    )}
                  </div>
                </div>

                {/* Selling Price Input */}
                <div className="col-span-3 sm:col-span-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.defaultPrice || ''}
                      onChange={(e) =>
                        handlePriceChange(item.id, parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                      className="w-full bg-[#1e1e23] border border-white/10 rounded-lg pl-7 pr-3 py-2 text-sm text-right font-mono text-white focus:outline-none focus:border-[#e59b38]"
                    />
                  </div>
                </div>

                {/* Unit Cost Input */}
                <div className="col-span-4 sm:col-span-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.cost || ''}
                      onChange={(e) =>
                        handleCostChange(item.id, parseFloat(e.target.value) || 0)
                      }
                      placeholder="Pending"
                      className="w-full bg-[#1e1e23] border border-white/10 rounded-lg pl-7 pr-3 py-2 text-sm text-right font-mono text-neutral-200 focus:outline-none focus:border-[#e59b38]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </form>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/[0.08] bg-[#19191d] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-[#e59b38] hover:bg-[#d48b28] text-black font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-full transition-all shadow-md active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Pricing Updates</span>
          </button>
        </div>

      </div>
    </div>
  );
};
