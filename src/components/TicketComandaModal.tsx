'use client';

import React, { useRef, useState } from 'react';
import { CustomerOrder } from '@/types/accounting';
import { X, Printer, CheckCircle2, ShoppingBag, Copy, Check } from 'lucide-react';
import { generateOrderThermalText } from '@/utils/escpos';

interface TicketComandaModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: CustomerOrder | null;
  onNewOrder?: () => void;
}

export const TicketComandaModal: React.FC<TicketComandaModalProps> = ({
  isOpen,
  onClose,
  order,
  onNewOrder,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRaw = () => {
    const text = generateOrderThermalText(order);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const formattedDate = new Date(order.timestamp).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const paymentLabels: Record<string, string> = {
    efectivo: 'EFECTIVO',
    tarjeta: 'TARJETA / CLIP',
    transferencia: 'TRANSFERENCIA SPEI',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="relative w-full max-w-md flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Header - Hidden when printing */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-[#19191d] print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-white leading-tight">
                Comanda Registrada Exitosamente
              </h2>
              <p className="text-[11px] text-neutral-400">
                Folio #{order.orderNumber} • Listo para cocina o cliente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Ticket Body (Receipt) */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] print:max-h-none print:p-2 bg-[#0e0e11] print:bg-white text-white print:text-black">
          <div
            ref={printAreaRef}
            className="w-full max-w-[320px] mx-auto font-mono text-xs space-y-3 bg-[#131317] print:bg-white p-4 rounded-xl border border-dashed border-white/20 print:border-none"
          >
            {/* Header */}
            <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-white/20 print:border-black/30">
              <div className="text-base font-black tracking-widest uppercase">
                PHILLY & FRY
              </div>
              <div className="text-[10px] text-[#e59b38] print:text-black uppercase font-bold tracking-wider">
                • LA PATRONA •
              </div>
              <div className="text-[9px] text-neutral-400 print:text-neutral-600 mt-1">
                Comanda de Mostrador y Cocina
              </div>
            </div>

            {/* Folio & Order Type */}
            <div className="py-1 border-b border-dashed border-white/20 print:border-black/30 flex justify-between items-center text-xs">
              <span className="font-bold">FOLIO: #{String(order.orderNumber).padStart(3, '0')}</span>
              <span className={`px-2 py-0.5 rounded font-black uppercase text-[10px] ${
                order.orderType === 'llevar'
                  ? 'bg-amber-500/20 text-amber-300 print:text-black'
                  : 'bg-emerald-500/20 text-emerald-300 print:text-black'
              }`}>
                {order.orderType === 'llevar' ? '*** PARA LLEVAR ***' : '*** COMER AQUÍ ***'}
              </span>
            </div>

            {/* Order Details Metadata */}
            <div className="text-[10px] space-y-0.5 text-neutral-400 print:text-neutral-700">
              <div>Fecha: {formattedDate}</div>
              {order.customerName && (
                <div className="font-bold text-white print:text-black">
                  Cliente / Mesa: {order.customerName}
                </div>
              )}
              {order.notes && (
                <div className="italic text-[#e59b38] print:text-black">
                  Nota: {order.notes}
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="pt-2 border-t border-dashed border-white/20 print:border-black/30 space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase text-neutral-400 print:text-black border-b border-dashed border-white/10 pb-1">
                <span>CANT • DESCRIPCIÓN</span>
                <span>IMPORTE</span>
              </div>

              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs">
                  <div className="max-w-[70%]">
                    <span className="font-bold mr-1">{item.quantity}x</span>
                    <span className="font-medium">{item.productName}</span>
                    <div className="text-[10px] text-neutral-400 print:text-neutral-600">
                      ({item.variantLabel})
                    </div>
                  </div>
                  <span className="font-bold font-mono">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total & Payment Method */}
            <div className="pt-2 border-t border-dashed border-white/20 print:border-black/30 space-y-1">
              <div className="flex justify-between items-center text-sm font-black">
                <span>TOTAL A PAGAR:</span>
                <span className="text-base text-[#e59b38] print:text-black">
                  ${order.total.toFixed(2)} MXN
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-neutral-400 print:text-black pt-1">
                <span>Forma de Pago:</span>
                <span className="font-bold text-white print:text-black">
                  {paymentLabels[order.paymentMethod] || order.paymentMethod.toUpperCase()}
                </span>
              </div>

              {order.paymentMethod === 'efectivo' && typeof order.amountReceived === 'number' && order.amountReceived > 0 && (
                <>
                  <div className="flex justify-between text-[11px] text-neutral-400 print:text-black">
                    <span>Recibido en efectivo:</span>
                    <span className="font-mono">${order.amountReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black text-emerald-400 print:text-black pt-0.5">
                    <span>CAMBIO:</span>
                    <span className="font-mono">${(order.change || 0).toFixed(2)} MXN</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer Message */}
            <div className="pt-3 border-t border-dashed border-white/20 print:border-black/30 text-center space-y-0.5">
              <div className="font-bold text-[11px]">¡GRACIAS POR SU PREFERENCIA!</div>
              <div className="text-[9px] text-neutral-500 print:text-neutral-600">
                Conservar este comprobante para recoger su orden
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Actions - Hidden when printing */}
        <div className="p-3.5 sm:p-4 border-t border-white/[0.08] bg-[#19191d] flex items-center justify-between gap-2 print:hidden">
          {onNewOrder ? (
            <button
              onClick={() => {
                onClose();
                onNewOrder();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#e59b38]" />
              <span>+ Nueva Comanda</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRaw}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all active:scale-95"
              title="Copiar texto formateado para impresoras Bluetooth térmicas (RawBT, ESC/POS)"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Copiar Texto Térmico</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#e59b38] hover:bg-[#d48b28] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Ticket</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-white/10 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
