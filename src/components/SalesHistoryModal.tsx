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
                Libro de Registro de Transacciones
              </h2>
              <p className="text-xs text-neutral-400">
                Historial de ventas auditado • {sales.length} registros en esta vista
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
            Mostrando ventas registradas. Puedes eliminar cualquier entrada errónea.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={sales.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-semibold text-neutral-200 transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-[#e59b38]" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Scrollable Ledger Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {sales.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <p className="text-sm font-medium">No hay ventas registradas aún.</p>
              <p className="text-xs mt-1">Presiona + en cualquier producto del mostrador para registrar ventas.</p>
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
                          <span>{formattedDate} a las {formattedTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-white">
                          ${subtotal.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          ${sale.unitPrice.toFixed(2)} c/u
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteSale(sale.id)}
                        title="Eliminar este registro"
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
          <button
            onClick={() => {
              onClose();
              onOpenZeroOut();
            }}
            disabled={sales.length === 0}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Poner en Ceros Toda la Contabilidad</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#e59b38] hover:bg-[#d48b28] text-black font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Cerrar Registro
          </button>
        </div>

      </div>
    </div>
  );
};
