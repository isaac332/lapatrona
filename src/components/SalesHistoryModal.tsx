'use client';

import React, { useState } from 'react';
import { SaleRecord, ProductItem, TimeframeFilter, PaymentMethod } from '@/types/accounting';
import { X, Trash2, Download, History } from 'lucide-react';
import { ModalShell } from '@/components/ModalShell';

interface SalesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: SaleRecord[];
  products: ProductItem[];
  timeframe: TimeframeFilter;
  onDeleteSale: (saleId: string) => void;
  onUpdatePaymentMethod?: (saleId: string, method: PaymentMethod) => void;
}

export const SalesHistoryModal: React.FC<SalesHistoryModalProps> = ({
  isOpen,
  onClose,
  sales,
  products,
  timeframe,
  onDeleteSale,
  onUpdatePaymentMethod,
}) => {
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'all'>('all');

  if (!isOpen) return null;

  const safeSales = Array.isArray(sales) ? sales : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const productMap = new Map(safeProducts.map((p) => [p.id, p]));

  const displayedSales = safeSales.filter((s) => {
    if (paymentFilter === 'all') return true;
    return (s.paymentMethod || 'efectivo') === paymentFilter;
  });

  const handleExportCSV = () => {
    if (safeSales.length === 0) return;

    const headers = [
      'ID Venta',
      'Folio Orden',
      'Fecha y Hora',
      'Producto',
      'Variante',
      'Cantidad',
      'Precio Unitario ($)',
      'Total ($)',
      'Costo Insumo ($)',
      'Utilidad Bruta ($)',
      'Margen (%)',
      'Forma de Pago',
    ];
    const rows = safeSales.map((s) => {
      const prod = productMap.get(s.productId);
      const subtotal = s.quantity * s.unitPrice;
      const subcost = s.quantity * s.unitCost;
      const profit = subtotal - subcost;
      const margin = subtotal > 0 ? Math.round((profit / subtotal) * 100) : 0;
      const total = subtotal.toFixed(2);
      const methodLabel =
        s.paymentMethod === 'tarjeta'
          ? 'Tarjeta'
          : s.paymentMethod === 'transferencia'
          ? 'Transferencia'
          : 'Efectivo';

      return [
        s.id,
        s.orderNumber ? `#${s.orderNumber}` : 'Mostrador',
        new Date(s.timestamp).toLocaleString('es-MX'),
        `"${prod?.name || s.productId}"`,
        `"${prod?.variantLabel || ''}"`,
        s.quantity,
        s.unitPrice.toFixed(2),
        total,
        subcost.toFixed(2),
        profit.toFixed(2),
        `${margin}%`,
        `"${methodLabel}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `ventas-lapatrona-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="history-modal-title"
      maxWidthClass="max-w-3xl"
      maxHeightClass="max-h-[90dvh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-4 sm:p-6 border-b border-white/[0.08] bg-[#19191d] shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0" aria-hidden="true">
            <History className="w-4 h-4 sm:w-5 sm:h-5 text-[#e59b38]" />
          </div>
          <div className="min-w-0">
            <h2 id="history-modal-title" className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
              Libro de Ventas
            </h2>
            <p className="text-[11px] sm:text-xs text-neutral-400">
              Historial de transacciones • {sales.length} registros
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar libro de ventas"
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors touch-manipulation shrink-0 active:scale-95"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Action Bar with Payment Filters */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-[#17171b] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: `Todos (${safeSales.length})` },
            { id: 'efectivo', label: '💵 Efectivo' },
            { id: 'tarjeta', label: '💳 Tarjeta' },
            { id: 'transferencia', label: '📱 Transf.' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={paymentFilter === tab.id}
              onClick={() => setPaymentFilter(tab.id as PaymentMethod | 'all')}
              className={`px-3 min-h-[44px] sm:min-h-[34px] rounded-lg text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                paymentFilter === tab.id
                  ? 'bg-[#e59b38] text-black font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={safeSales.length === 0}
          className="flex items-center justify-center gap-1.5 px-3.5 min-h-[44px] sm:min-h-[34px] rounded-lg bg-white/[0.04] active:bg-white/[0.08] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-semibold text-neutral-200 transition-colors disabled:opacity-40 shrink-0 touch-manipulation"
        >
          <Download className="w-3.5 h-3.5 text-[#e59b38]" aria-hidden="true" />
          <span>Exportar CSV</span>
        </button>
      </div>

        {/* Scrollable Ledger Table */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-6">
          {displayedSales.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <p className="text-sm font-medium">No hay ventas registradas en esta categoría.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayedSales.map((sale) => {
                const prod = productMap.get(sale.productId);
                const subtotal = sale.quantity * sale.unitPrice;
                const dateObj = new Date(sale.timestamp);
                const formattedDate = dateObj.toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  timeZone: 'UTC',
                });
                const currentMethod = sale.paymentMethod || 'efectivo';

                return (
                  <div
                    key={sale.id}
                    className="flex items-start sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center font-mono text-xs text-[#e59b38] font-bold shrink-0">
                        +{sale.quantity}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs sm:text-sm text-[#f5f0eb] leading-tight">
                          {prod ? prod.name : sale.productId}
                        </div>
                        {sale.modifiersText && (
                          <div className="text-[10px] text-[#e59b38] font-semibold mt-0.5">
                            + {sale.modifiersText}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] sm:text-[11px] text-neutral-400 mt-1">
                          {sale.orderNumber && (
                            <>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#e59b38]/15 text-[#e59b38] border border-[#e59b38]/30">
                                #{String(sale.orderNumber).padStart(3, '0')}
                              </span>
                              <span aria-hidden="true">•</span>
                            </>
                          )}
                          <span className="text-[#e59b38]">{prod?.variantLabel}</span>
                          <span aria-hidden="true">•</span>
                          <span>{formattedDate}</span>
                          <span aria-hidden="true">•</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (!onUpdatePaymentMethod) return;
                              const next: PaymentMethod =
                                currentMethod === 'efectivo' ? 'tarjeta' : currentMethod === 'tarjeta' ? 'transferencia' : 'efectivo';
                              onUpdatePaymentMethod(sale.id, next);
                            }}
                            title="Toca para cambiar la forma de pago de esta venta"
                            className={`px-2 py-1 min-h-[32px] sm:min-h-[26px] rounded-md text-[10px] font-bold border transition-colors touch-manipulation cursor-pointer ${
                              currentMethod === 'tarjeta'
                                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
                                : currentMethod === 'transferencia'
                                ? 'bg-violet-500/10 text-violet-300 border-violet-500/30 hover:bg-violet-500/20'
                                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                            }`}
                          >
                            {currentMethod === 'tarjeta'
                              ? '💳 Tarjeta'
                              : currentMethod === 'transferencia'
                              ? '📱 Transf.'
                              : '💵 Efectivo'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-mono font-bold text-xs sm:text-sm text-white tabular-nums">
                          ${subtotal.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono tabular-nums">
                          ${sale.unitPrice.toFixed(2)} c/u
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteSale(sale.id)}
                        title="Eliminar este registro"
                        aria-label={`Eliminar venta de ${prod ? prod.name : sale.productId}`}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg text-neutral-400 hover:text-red-400 active:text-red-400 active:bg-red-500/10 flex items-center justify-center transition-colors touch-manipulation"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-5 border-t border-white/[0.08] bg-[#19191d] flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 min-h-[44px] rounded-full bg-[#e59b38] active:bg-[#d48b28] text-black font-bold text-xs uppercase tracking-wider transition-colors touch-manipulation text-center"
          >
            Cerrar Registro
          </button>
        </div>
    </ModalShell>
  );
};