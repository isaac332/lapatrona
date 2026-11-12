'use client';

import React, { useState } from 'react';
import { SaleRecord, ProductItem } from '@/types/accounting';
import { AlertOctagon, Download, RefreshCw, X } from 'lucide-react';
import { ModalShell } from './ModalShell';

interface ZeroOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmZeroOut: () => void;
  sales: SaleRecord[];
  products: ProductItem[];
}

export const ZeroOutModal: React.FC<ZeroOutModalProps> = ({
  isOpen,
  onClose,
  onConfirmZeroOut,
  sales,
  products,
}) => {
  const [downloadedBackup, setDownloadedBackup] = useState(false);

  if (!isOpen) return null;

  const safeSales = Array.isArray(sales) ? sales : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const totalUnits = safeSales.reduce((sum, s) => sum + (s?.quantity || 0), 0);
  const totalRevenue = safeSales.reduce((sum, s) => sum + (s?.quantity || 0) * (s?.unitPrice || 0), 0);

  const handleExportBackup = () => {
    if (safeSales.length === 0) return;

    const productMap = new Map(safeProducts.map((p) => [p.id, p]));
    const headers = [
      'ID Venta',
      'Fecha y Hora',
      'Producto',
      'Variante',
      'Cantidad',
      'Precio Unitario ($)',
      'Total ($)',
      'Costo Insumo ($)',
      'Forma de Pago',
    ];

    const rows = safeSales.map((s) => {
      const prod = productMap.get(s.productId);
      const total = (s.quantity * s.unitPrice).toFixed(2);
      const methodLabel =
        s.paymentMethod === 'tarjeta'
          ? 'Tarjeta / Clip'
          : s.paymentMethod === 'transferencia'
          ? 'Transferencia SPEI'
          : 'Efectivo';

      return [
        s.id,
        new Date(s.timestamp).toLocaleString('es-MX'),
        `"${prod?.name || s.productId}"`,
        `"${prod?.variantLabel || ''}"`,
        s.quantity,
        s.unitPrice.toFixed(2),
        total,
        s.unitCost.toFixed(2),
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
      `respaldo-contabilidad-philly-fry-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedBackup(true);
  };

  const handleConfirm = () => {
    onConfirmZeroOut();
    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="zero-out-title"
      maxWidthClass="max-w-lg"
      panelClassName="border-red-500/30"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-b border-white/[0.08] bg-[#1a1215] shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 id="zero-out-title" className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
              ¿Poner Contabilidad en Ceros?
            </h2>
            <p className="text-[11px] sm:text-xs text-red-300/80">
              Corte total y reseteo del sistema
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar confirmación"
          className="w-11 h-11 sm:w-9 sm:h-9 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors shrink-0 touch-manipulation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3 sm:space-y-4">
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          Esta acción restablecerá <strong className="text-white">a cero (0)</strong> todos los contadores de ventas de <strong className="text-white">Hoy, Esta Semana, Este Mes</strong> y el registro histórico acumulado.
        </p>

        {/* Current Impact stats box */}
        <div className="p-3 sm:p-4 rounded-xl bg-black/40 border border-white/[0.06] grid grid-cols-1 min-[360px]:grid-cols-2 gap-2.5 sm:gap-3 text-center">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-400">
              Registros a Borrar
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-white mt-0.5 tabular-nums">
              {sales.length} <span className="text-[11px] font-normal text-neutral-400">ventas</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-400">
              Volumen Total
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#e59b38] mt-0.5 tabular-nums">
              {totalUnits} <span className="text-[11px] font-normal text-neutral-400">piezas</span>
            </div>
          </div>
          <div className="min-[360px]:col-span-2 pt-2 border-t border-white/[0.04] text-xs text-neutral-400">
            Venta bruta acumulada: <strong className="text-white font-mono tabular-nums">${totalRevenue.toFixed(2)}</strong>
          </div>
        </div>

        {/* CSV Backup Recommendation */}
        {sales.length > 0 && (
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-wrap items-center justify-between gap-2.5">
            <div className="text-[11px] sm:text-xs text-neutral-300 min-w-0">
              <span className="font-semibold block text-white">¿Guardar respaldo?</span>
              Descarga el archivo CSV antes de reiniciar.
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 active:bg-white/20 text-white font-medium text-xs transition-colors shrink-0 touch-manipulation"
            >
              <Download className="w-3.5 h-3.5 text-[#e59b38]" />
              <span>{downloadedBackup ? '✓ Guardado' : 'Bajar CSV'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3.5 sm:p-5 border-t border-white/[0.08] bg-[#19191d] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-full border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors order-2 sm:order-1 touch-manipulation active:scale-95"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 bg-red-600 active:bg-red-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-full transition-all shadow-lg active:scale-95 order-1 sm:order-2 touch-manipulation"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sí, Poner Todo en Ceros</span>
        </button>
      </div>
    </ModalShell>
  );
};
