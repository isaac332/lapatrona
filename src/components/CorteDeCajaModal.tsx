'use client';

import React, { useRef } from 'react';
import { SaleRecord, ProductItem, TimeframeFilter, HourlyBlock, ExpenseRecord } from '@/types/accounting';
import { X, Printer, RotateCcw, Receipt } from 'lucide-react';

interface CorteDeCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: SaleRecord[];
  products: ProductItem[];
  expenses: ExpenseRecord[];
  timeframe: TimeframeFilter;
  hourlyBlocks: HourlyBlock[];
  onConfirmZeroOut: () => void;
}

export const CorteDeCajaModal: React.FC<CorteDeCajaModalProps> = ({
  isOpen,
  onClose,
  sales,
  products,
  expenses,
  timeframe,
  hourlyBlocks,
  onConfirmZeroOut,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netCash = totalRevenue - totalExpenses;

  // Group by product
  const productStats = products.map((prod) => {
    const prodSales = sales.filter((s) => s.productId === prod.id);
    const units = prodSales.reduce((sum, s) => sum + s.quantity, 0);
    const revenue = prodSales.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
    return {
      id: prod.id,
      name: prod.name,
      variant: prod.variantLabel,
      units,
      unitPrice: prod.defaultPrice,
      revenue,
    };
  }).filter((item) => item.units > 0);

  // Combo attachment calculation
  const sandwichFries = sales.filter((s) => s.productId === 'sandwich-fries').reduce((sum, s) => sum + s.quantity, 0);
  const sandwichAlone = sales.filter((s) => s.productId === 'sandwich-alone').reduce((sum, s) => sum + s.quantity, 0);
  const quesadillaFries = sales.filter((s) => s.productId === 'quesadilla-fries').reduce((sum, s) => sum + s.quantity, 0);
  const quesadillaAlone = sales.filter((s) => s.productId === 'quesadilla-alone').reduce((sum, s) => sum + s.quantity, 0);
  const totalMains = sandwichFries + sandwichAlone + quesadillaFries + quesadillaAlone;
  const totalCombos = sandwichFries + quesadillaFries;
  const comboRate = totalMains > 0 ? Math.round((totalCombos / totalMains) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  const timeframeLabels: Record<TimeframeFilter, string> = {
    today: 'Corte del Día (Hoy)',
    week: 'Corte Semanal',
    month: 'Corte Mensual',
    all: 'Corte Total Acumulado',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden">
        
        {/* Header - Screen only */}
        <div className="print:hidden flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#19191d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e59b38]/15 border border-[#e59b38]/30 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-[#e59b38]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                Ticket de Corte de Caja
              </h2>
              <p className="text-[11px] text-neutral-400">
                Resumen de cierre y auditoría de turno
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

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Physical Ticket Preview Card */}
          <div
            ref={printAreaRef}
            className="bg-[#0d0d0f] p-6 rounded-2xl border border-white/[0.08] shadow-inner font-mono text-xs text-neutral-300 space-y-4 print:bg-white print:text-black print:border-none print:p-0"
          >
            {/* Ticket Header */}
            <div className="text-center space-y-1 border-b border-dashed border-white/20 pb-4 print:border-black/30">
              <div className="font-black tracking-[0.2em] text-lg text-white print:text-black uppercase">
                PHILLY & FRY
              </div>
              <div className="text-[11px] text-[#e59b38] print:text-black uppercase tracking-wider font-semibold">
                Mostrador de Ventas y Contabilidad
              </div>
              <div className="text-[10px] text-neutral-400 print:text-neutral-600 mt-1">
                {timeframeLabels[timeframe]}
              </div>
              <div className="text-[10px] text-neutral-400 print:text-neutral-600">
                Fecha del corte: {new Date().toLocaleDateString('es-MX', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-1.5 py-1 border-b border-dashed border-white/20 print:border-black/30">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 print:text-black">VENTA BRUTA TOTAL:</span>
                <span className="font-bold text-white print:text-black">${totalRevenue.toFixed(2)} MXN</span>
              </div>

              {totalExpenses > 0 && (
                <div className="flex justify-between items-center text-xs text-rose-400 print:text-black">
                  <span>(-) GASTOS DE CAJA:</span>
                  <span className="font-bold font-mono">-${totalExpenses.toFixed(2)} MXN</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 mt-1 border-t border-dashed border-white/10 print:border-black/20">
                <span className="text-sm font-black uppercase text-emerald-300 print:text-black">EFECTIVO NETO:</span>
                <span className="text-xl font-black text-emerald-400 print:text-black">
                  ${netCash.toFixed(2)} MXN
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center py-1 text-xs">
              <span>Total de piezas vendidas:</span>
              <span className="font-bold text-white print:text-black">{totalUnits} uds</span>
            </div>

            <div className="flex justify-between items-center py-1 text-xs">
              <span>Tasa de combos con papas:</span>
              <span className="font-bold text-emerald-400 print:text-black">{comboRate}%</span>
            </div>

            {/* Shift Breakdown */}
            {hourlyBlocks.length > 0 && (
              <div className="pt-2 border-t border-dashed border-white/10 print:border-black/20 space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-neutral-400 print:text-black">
                  Desglose por Turno:
                </div>
                {hourlyBlocks.map((block) => (
                  <div key={block.id} className="flex justify-between text-[11px]">
                    <span className="text-neutral-400 print:text-black">{block.label} ({block.timeRange}):</span>
                    <span>{block.count} uds • ${block.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Expenses Detail */}
            {expenses.length > 0 && (
              <div className="pt-2 border-t border-dashed border-white/10 print:border-black/20 space-y-1">
                <div className="text-[10px] uppercase font-bold text-rose-300 print:text-black">
                  Salidas de Caja Registradas ({expenses.length}):
                </div>
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex justify-between text-[11px] text-neutral-400 print:text-black">
                    <span>• {exp.description}</span>
                    <span className="font-mono text-rose-400 print:text-black">-${exp.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Products Breakdown Table */}
            <div className="pt-2 border-t border-dashed border-white/20 print:border-black/30 space-y-2">
              <div className="text-[10px] uppercase font-bold text-neutral-400 print:text-black flex justify-between">
                <span>Platillo / Variante</span>
                <span>Cant • Importe</span>
              </div>
              {productStats.length === 0 ? (
                <div className="text-center py-4 text-neutral-500">
                  Sin ventas registradas en este periodo.
                </div>
              ) : (
                productStats.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-1 border-b border-white/[0.04] print:border-black/10">
                    <div>
                      <div className="font-semibold text-white print:text-black">{item.name}</div>
                      <div className="text-[10px] text-[#e59b38] print:text-neutral-700">{item.variant}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white print:text-black">{item.units} x ${item.unitPrice.toFixed(2)}</div>
                      <div className="text-[10px] text-neutral-400 print:text-black">${item.revenue.toFixed(2)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Ticket Footer */}
            <div className="text-center text-[10px] text-neutral-500 print:text-neutral-700 pt-3 border-t border-dashed border-white/20 print:border-black/30">
              *** FIN DEL CORTE DE CAJA ***
              <div className="mt-1">Gracias por preferir Philly & Fry</div>
            </div>
          </div>

        </div>

        {/* Footer Actions - Screen only */}
        <div className="print:hidden p-4 sm:p-5 border-t border-white/[0.08] bg-[#19191d] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all active:scale-95 touch-manipulation"
          >
            <Printer className="w-4 h-4 text-[#e59b38]" />
            <span>Imprimir Ticket / PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirmZeroOut();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 touch-manipulation"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Cerrar Turno y Poner en Ceros</span>
          </button>
        </div>

      </div>
    </div>
  );
};
