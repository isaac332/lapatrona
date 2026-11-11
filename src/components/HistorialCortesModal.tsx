'use client';

import React, { useState } from 'react';
import { ClosedShiftRecord } from '@/types/accounting';
import { X, Receipt, Printer, CheckCircle2, AlertTriangle, AlertCircle, Calendar } from 'lucide-react';

interface HistorialCortesModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: ClosedShiftRecord[];
  onClearHistory?: () => void;
}

export const HistorialCortesModal: React.FC<HistorialCortesModalProps> = ({
  isOpen,
  onClose,
  shifts,
  onClearHistory,
}) => {
  const [selectedShift, setSelectedShift] = useState<ClosedShiftRecord | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden pb-safe sm:pb-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.08] bg-[#19191d] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e59b38]/15 border border-[#e59b38]/30 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-[#e59b38]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                Historial de Cortes de Turno
              </h2>
              <p className="text-[11px] text-neutral-400">
                Auditoría histórica de cierres de caja y arqueos ({shifts.length} turnos guardados)
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Shift Cards List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
              Turnos Cerrados
            </div>

            {shifts.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-neutral-400 text-xs">
                Aún no hay turnos cerrados en el historial. Al realizar un corte de caja y cerrar turno, se archivará aquí automáticamente.
              </div>
            ) : (
              shifts.map((s) => {
                const isSelected = selectedShift?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedShift(s)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#1e1e24] border-[#e59b38] shadow-md'
                        : 'bg-[#18181c] border-white/[0.06] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span>Turno #{s.shiftNumber}</span>
                      <span className="font-mono text-[#e59b38] font-bold">
                        ${s.totalGrossRevenue.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-1">
                      <Calendar className="w-3 h-3 text-neutral-500" />
                      <span>{new Date(s.closedAt).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.06] text-[10px]">
                      <span className="text-neutral-400">
                        {s.totalUnits} uds • Cajón: ${s.expectedCashInDrawer.toFixed(0)}
                      </span>
                      {s.differenceStatus === 'cuadrada' ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Cuadrada
                        </span>
                      ) : s.differenceStatus === 'sobrante' ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> +${s.difference?.toFixed(0)}
                        </span>
                      ) : s.differenceStatus === 'faltante' ? (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> -${Math.abs(s.difference || 0).toFixed(0)}
                        </span>
                      ) : (
                        <span className="text-neutral-500">Sin arqueo</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}

            {shifts.length > 0 && onClearHistory && (
              <button
                type="button"
                onClick={onClearHistory}
                className="w-full text-center py-2 text-xs text-red-400/80 hover:text-red-300 transition-colors"
              >
                Limpiar historial de turnos
              </button>
            )}
          </div>

          {/* Right Column: Ticket Preview & Reprint */}
          <div className="lg:col-span-7">
            {selectedShift ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
                    Detalle del Ticket • Turno #{selectedShift.shiftNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white transition-all active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#e59b38]" />
                    <span>Reimprimir Ticket</span>
                  </button>
                </div>

                {/* Printable Ticket Card */}
                <div className="bg-[#0d0d0f] p-5 rounded-2xl border border-white/[0.08] shadow-inner font-mono text-xs text-neutral-300 space-y-3 print:bg-white print:text-black print:border-none print:p-0">
                  <div className="text-center space-y-1 border-b border-dashed border-white/20 pb-3 print:border-black/30">
                    <div className="font-black tracking-[0.2em] text-base text-white print:text-black uppercase">
                      LA PATRONA
                    </div>
                    <div className="text-[10px] text-[#e59b38] print:text-black uppercase font-semibold">
                      Philly & Fry POS • Ticket de Corte #{selectedShift.shiftNumber}
                    </div>
                    <div className="text-[10px] text-neutral-400 print:text-neutral-600">
                      Cierre: {new Date(selectedShift.closedAt).toLocaleString('es-MX')}
                    </div>
                  </div>

                  <div className="space-y-1.5 py-1.5 border-b border-dashed border-white/20 print:border-black/30">
                    <div className="flex justify-between">
                      <span>Venta Bruta Total:</span>
                      <span className="font-bold text-white print:text-black">
                        ${selectedShift.totalGrossRevenue.toFixed(2)} MXN
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-400 print:text-black text-[11px]">
                      <span>(+) Fondo Inicial:</span>
                      <span>${selectedShift.startingCash.toFixed(2)} MXN</span>
                    </div>
                    <div className="flex justify-between text-neutral-400 print:text-black text-[11px]">
                      <span>(+) Ventas Efectivo:</span>
                      <span>${selectedShift.cashSalesTotal.toFixed(2)} MXN</span>
                    </div>
                    {selectedShift.totalExpenses > 0 && (
                      <div className="flex justify-between text-rose-400 print:text-black text-[11px]">
                        <span>(-) Salidas / Gastos:</span>
                        <span>-${selectedShift.totalExpenses.toFixed(2)} MXN</span>
                      </div>
                    )}
                    {selectedShift.totalTipsCollected !== undefined && selectedShift.totalTipsCollected > 0 && (
                      <div className="flex justify-between text-[#e59b38] print:text-black text-[11px]">
                        <span>(+) Propinas Personal:</span>
                        <span>+${selectedShift.totalTipsCollected.toFixed(2)} MXN</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-dashed border-white/10 text-emerald-400 font-bold">
                      <span>Efectivo Esperado Cajón:</span>
                      <span>${selectedShift.expectedCashInDrawer.toFixed(2)} MXN</span>
                    </div>
                  </div>

                  {selectedShift.countedCash !== undefined && (
                    <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] print:border-black/30 space-y-1">
                      <div className="flex justify-between">
                        <span>Efectivo Contado Físico:</span>
                        <span className="font-bold text-white print:text-black">
                          ${selectedShift.countedCash.toFixed(2)} MXN
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] pt-1 border-t border-dashed border-white/10">
                        <span>Resultado Arqueo:</span>
                        <span className="font-bold">
                          {selectedShift.differenceStatus === 'cuadrada'
                            ? '✓ CAJA CUADRADA ($0.00)'
                            : selectedShift.differenceStatus === 'sobrante'
                            ? `▲ SOBRANTE: +$${selectedShift.difference?.toFixed(2)}`
                            : `▼ FALTANTE: -$${Math.abs(selectedShift.difference || 0).toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 pt-1 text-[11px] text-cyan-300 print:text-black">
                    <div className="flex justify-between">
                      <span>Tarjetas / Clip:</span>
                      <span>${selectedShift.cardSalesTotal.toFixed(2)} MXN</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transferencias SPEI:</span>
                      <span>${selectedShift.transferSalesTotal.toFixed(2)} MXN</span>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-neutral-500 pt-2 border-t border-dashed border-white/20">
                    *** COPIA DE AUDITORÍA DE TURNO ***
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-neutral-400 space-y-2">
                <Receipt className="w-8 h-8 text-neutral-500" />
                <div className="text-sm font-semibold text-neutral-300">
                  Selecciona un corte del listado
                </div>
                <div className="text-xs max-w-xs text-neutral-500">
                  Podrás ver el resumen detallado de la auditoría y reimprimir el ticket térmico oficial.
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
