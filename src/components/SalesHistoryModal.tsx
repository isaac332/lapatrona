'use client';

import React, { useState } from 'react';
import { SaleRecord, ProductItem, TimeframeFilter } from '@/types/accounting';
import { X, Trash2, Download, History, AlertTriangle } from 'lucide-react';

interface SalesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: SaleRecord[];
  products: ProductItem[];
  timeframe: TimeframeFilter;
  onDeleteSale: (saleId: string) => void;
  onClearAllSales: () => void;
}

export const SalesHistoryModal: React.FC<SalesHistoryModalProps> = ({
  isOpen,
  onClose,
  sales,
  products,
  timeframe,
  onDeleteSale,
  onClearAllSales,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const productMap = new Map(products.map((p) => [p.id, p]));

  // CSV Export feature for accounting
  const handleExportCSV = () => {
    if (sales.length === 0) return;

    const headers = ['Sale ID', 'Timestamp', 'Product Name', 'Variant', 'Quantity', 'Unit Price ($)', 'Total ($)', 'Unit Cost ($)'];
    const rows = sales.map((s) => {
      const prod = productMap.get(s.productId);
      const total = (s.quantity * s.unitPrice).toFixed(2);
      return [
        s.id,
        new Date(s.timestamp).toLocaleString(),
        `"${prod?.name || s.productId}"`,
        `"${prod?.variantLabel || ''}"`,
        s.quantity,
        s.unitPrice.toFixed(2),
        total,
        s.unitCost.toFixed(2),
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `philly-fry-sales-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08] bg-[#19191d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <History className="w-5 h-5 text-[#e59b38]" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-white">
                Sales Transaction Ledger
              </h2>
              <p className="text-xs text-neutral-400">
                Audited transaction log • {sales.length} records in this view
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

        {/* Action Bar */}
        <div className="px-6 py-3 bg-[#17171b] border-b border-white/[0.06] flex items-center justify-between">
          <div className="text-xs text-neutral-400">
            Showing all logged entries. Click undo to remove mistakes.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={sales.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-semibold text-neutral-200 transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-[#e59b38]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Scrollable Ledger Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {sales.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <p className="text-sm font-medium">No sales recorded yet.</p>
              <p className="text-xs mt-1">Tap + on any product card to start tallying sales.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sales.map((sale) => {
                const prod = productMap.get(sale.productId);
                const subtotal = sale.quantity * sale.unitPrice;
                const formattedTime = new Date(sale.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const formattedDate = new Date(sale.timestamp).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center font-mono text-xs text-[#e59b38] font-bold">
                        +{sale.quantity}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-[#f5f0eb]">
                          {prod ? prod.name : sale.productId}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                          <span className="text-[#e59b38]">{prod?.variantLabel}</span>
                          <span>•</span>
                          <span>{formattedDate} at {formattedTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-white">
                          ${subtotal.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          ${sale.unitPrice.toFixed(2)} ea
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteSale(sale.id)}
                        title="Remove this entry"
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/[0.08] bg-[#19191d] flex items-center justify-between">
          {confirmClear ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-red-400 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-4 h-4" />
                Clear all records?
              </span>
              <button
                onClick={() => {
                  onClearAllSales();
                  setConfirmClear(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-neutral-300 text-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              disabled={sales.length === 0}
              className="text-xs text-neutral-500 hover:text-red-400 transition-colors disabled:opacity-40"
            >
              Reset / Clear All Sales
            </button>
          )}

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#e59b38] hover:bg-[#d48b28] text-black font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Close Ledger
          </button>
        </div>

      </div>
    </div>
  );
};
