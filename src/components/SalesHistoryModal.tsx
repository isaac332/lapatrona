'use client';

import React from 'react';
import { SaleRecord, ProductItem, TimeframeFilter } from '@/types/accounting';
import { X, Trash2, Download, History, RotateCcw } from 'lucide-react';

interface SalesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: SaleRecord[];
  products: ProductItem[];
  timeframe: TimeframeFilter;
  onDeleteSale: (saleId: string) => void;
  onOpenZeroOut: () => void;
}

export const SalesHistoryModal: React.FC<SalesHistoryModalProps> = ({
  isOpen,
  onClose,
  sales,
  products,
  timeframe,
  onDeleteSale,
  onOpenZeroOut,
}) => {
  if (!isOpen) return null;

  const productMap = new Map(products.map((p) => [p.id, p]));

  // CSV Export feature for accounting in Mexican Spanish
  const handleExportCSV = () => {
    if (sales.length === 0) return;

    const headers = [
      'ID Venta',
      'Fecha y Hora',
      'Producto',
      'Variante',
      'Cantidad',
      'Precio Unitario ($)',
      'Total ($)',
      'Costo Insumo ($)',
    ];
    const rows = sales.map((s) => {
      const prod = productMap.get(s.productId);
      const total = (s.quantity * s.unitPrice).toFixed(2);
      return [
        s.id,
        new Date(s.timestamp).toLocaleString('es-MX'),
        `"${prod?.name || s.productId}"`,
        `"${prod?.variantLabel || ''}"`,
        s.quantity,
        s.unitPrice.toFixed(2),
        total,
        s.unitCost.toFixed(2),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `ventas-philly-fry-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden pb-safe sm:pb-0">
        
        {/* Mobile handle indicator */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.08] bg-[#19191d] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-[#e59b38]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                Libro de Transacciones
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                Historial auditado • {sales.length} registros
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

        {/* Action Bar */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#17171b] border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div className="text-[11px] sm:text-xs text-neutral-400 truncate max-w-[200px] sm:max-w-none">
            Ventas registradas. Toca el bote para deshacer.
          </div>
          <button
            onClick={handleExportCSV}
            disabled={sales.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] active:bg-white/[0.08] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-semibold text-neutral-200 transition-colors disabled:opacity-40 shrink-0 touch-manipulation"
          >
            <Download className="w-3.5 h-3.5 text-[#e59b38]" />
            <span>Exportar CSV</span>
          </button>
        </div>

        {/* Scrollable Ledger Table */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6">
          {sales.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <p className="text-sm font-medium">No hay ventas registradas aún.</p>
              <p className="text-xs mt-1">Presiona + en cualquier producto para registrar ventas.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sales.map((sale) => {
                const prod = productMap.get(sale.productId);
                const subtotal = sale.quantity * sale.unitPrice;
                const dateObj = new Date(sale.timestamp);
                const formattedTime = dateObj.toLocaleTimeString('es-MX', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const formattedDate = dateObj.toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                });

                return (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center font-mono text-xs text-[#e59b38] font-bold shrink-0">
                        +{sale.quantity}
                      </div>
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-[#f5f0eb] leading-tight">
                          {prod ? prod.name : sale.productId}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
                          <span className="text-[#e59b38]">{prod?.variantLabel}</span>
                          <span>•</span>
                          <span>{formattedDate} {formattedTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <div className="text-right">
                        <div className="font-mono font-bold text-xs sm:text-sm text-white">
                          ${subtotal.toFixed(2)}
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-neutral-500 font-mono">
                          ${sale.unitPrice.toFixed(2)} c/u
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteSale(sale.id)}
                        title="Eliminar este registro"
                        className="p-2 rounded-lg text-neutral-500 hover:text-red-400 active:text-red-400 active:bg-red-500/10 transition-colors touch-manipulation"
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
        <div className="p-3.5 sm:p-5 border-t border-white/[0.08] bg-[#19191d] flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenZeroOut();
            }}
            disabled={sales.length === 0}
            className="w-full sm:w-auto text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 py-1.5 touch-manipulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Poner en Ceros Toda la Contabilidad</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#e59b38] active:bg-[#d48b28] text-black font-bold text-xs uppercase tracking-wider transition-colors touch-manipulation text-center"
          >
            Cerrar Registro
          </button>
        </div>

      </div>
    </div>
  );
};
