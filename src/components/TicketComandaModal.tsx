'use client';

import React, { useRef, useState } from 'react';
import { CustomerOrder, BusinessInfo } from '@/types/accounting';
import { X, Printer, CheckCircle2, ShoppingBag, Copy, Check } from 'lucide-react';
import { generateOrderThermalText } from '@/utils/escpos';
import { DEFAULT_BUSINESS_INFO } from '@/data/initialBusinessInfo';
import { ModalShell } from './ModalShell';

interface TicketComandaModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: CustomerOrder | null;
  onNewOrder?: () => void;
  businessInfo?: BusinessInfo;
}

export const TicketComandaModal: React.FC<TicketComandaModalProps> = ({
  isOpen,
  onClose,
  order,
  onNewOrder,
  businessInfo,
}) => {
  const info = businessInfo || DEFAULT_BUSINESS_INFO;
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRaw = () => {
    const text = generateOrderThermalText(order, info);
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
    tarjeta: 'TARJETA',
    transferencia: 'TRANSFERENCIA',
    mixto: 'PAGO MIXTO',
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="ticket-comanda-title"
      maxWidthClass="max-w-md"
      panelClassName="print:border-none print:shadow-none print:w-full print:max-w-none print:rounded-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4 border-b border-white/[0.08] bg-[#19191d] shrink-0 print:hidden">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h2 id="ticket-comanda-title" className="font-serif text-base font-bold text-white leading-tight">
              Orden Registrada Exitosamente
            </h2>
            <p className="text-[11px] text-neutral-400">
              Orden #{order.orderNumber} • Para Llevar
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ticket de orden"
          className="w-11 h-11 sm:w-9 sm:h-9 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors shrink-0 touch-manipulation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Printable Ticket Body */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto overscroll-contain print:overflow-visible print:p-2 bg-[#0e0e11] print:bg-white text-white print:text-black">
        <div
          ref={printAreaRef}
          className="w-full max-w-[320px] mx-auto font-mono text-xs space-y-3 bg-[#131317] print:bg-white p-4 rounded-xl border border-dashed border-white/20 print:border-none"
        >
          {/* Header */}
          <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-white/20 print:border-black/30">
            <div className="text-base font-black tracking-widest uppercase">
              {info.name}
            </div>
            {info.address && (
              <div className="text-[10px] text-[#e59b38] print:text-black font-bold">
                {info.address}
              </div>
            )}
            {info.phone && (
              <div className="text-[9px] text-neutral-400 print:text-neutral-600">
                Tel: {info.phone}
              </div>
            )}
            <div className="text-[9px] text-neutral-400 print:text-neutral-600 mt-1">
              Ticket de Orden (Para Llevar)
            </div>
          </div>

          {/* Folio */}
          <div className="py-1 border-b border-dashed border-white/20 print:border-black/30 flex justify-between items-center gap-2 text-xs">
            <span className="font-bold">ORDEN: #{String(order.orderNumber).padStart(3, '0')}</span>
            <span className="px-2 py-0.5 rounded font-black uppercase text-[10px] bg-amber-500/20 text-amber-300 print:text-black">
              PARA LLEVAR
            </span>
          </div>

          {/* Order Details Metadata */}
          <div className="text-[10px] space-y-0.5 text-neutral-400 print:text-neutral-700">
            <div>Fecha: {formattedDate}</div>
            {order.customerName && (
              <div className="font-bold text-white print:text-black">
                Cliente: {order.customerName}
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
            <div className="flex justify-between gap-2 text-[10px] font-bold uppercase text-neutral-400 print:text-black border-b border-dashed border-white/10 pb-1">
              <span>CANT • DESCRIPCIÓN</span>
              <span>IMPORTE</span>
            </div>

            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start gap-2 text-xs">
                <div className="min-w-0 flex-1">
                  <span className="font-bold mr-1">{item.quantity}x</span>
                  <span className="font-medium">{item.productName}</span>
                  <div className="text-[10px] text-neutral-400 print:text-neutral-600">
                    ({item.variantLabel})
                  </div>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="text-[10px] text-[#e59b38] print:text-black font-semibold">
                      {item.modifiers.map((m) => `+ ${m.name}${m.price > 0 ? ` (+$${m.price.toFixed(2)})` : ''}`).join(', ')}
                    </div>
                  )}
                  {item.instructions && (
                    <div className="text-[10px] italic text-amber-300 print:text-black">
                      * {item.instructions}
                    </div>
                  )}
                </div>
                <span className="font-bold font-mono shrink-0 tabular-nums">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Total & Payment Method */}
          <div className="pt-2 border-t border-dashed border-white/20 print:border-black/30 space-y-1">
            {order.discount && order.discount.amount > 0 && (
              <>
                <div className="flex justify-between items-center text-xs text-neutral-400 print:text-black">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums">${order.items.reduce((s, it) => s + it.subtotal, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-emerald-400 print:text-black font-semibold">
                  <span>(-) Descuento:</span>
                  <span className="font-mono tabular-nums">-${order.discount.amount.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between items-center text-sm font-black">
              <span>TOTAL A PAGAR:</span>
              <span className="text-base text-[#e59b38] print:text-black tabular-nums">
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
                  <span className="font-mono tabular-nums">${order.amountReceived.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-black text-emerald-400 print:text-black pt-0.5">
                  <span>CAMBIO:</span>
                  <span className="font-mono tabular-nums">${(order.change || 0).toFixed(2)} MXN</span>
                </div>
              </>
            )}
          </div>

          {/* Footer Message */}
          <div className="pt-3 border-t border-dashed border-white/20 print:border-black/30 text-center space-y-0.5">
            <div className="font-bold text-[11px]">{info.footerNote.toUpperCase()}</div>
          </div>

        </div>
      </div>

      {/* Modal Bottom Actions */}
      <div className="p-3.5 sm:p-4 border-t border-white/[0.08] bg-[#19191d] flex flex-wrap items-center justify-between gap-2 shrink-0 print:hidden">
        {onNewOrder ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              onNewOrder();
            }}
            className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 transition-colors touch-manipulation"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#e59b38]" />
            <span>+ Nueva Orden</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={handleCopyRaw}
            className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all active:scale-95 touch-manipulation"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
                <span>Copiar Ticket</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="min-h-[44px] flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#e59b38] hover:bg-[#d48b28] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 touch-manipulation"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Ticket</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 rounded-full border border-white/10 text-xs font-semibold text-neutral-400 hover:text-white transition-colors touch-manipulation"
          >
            Cerrar
          </button>
        </div>
      </div>
    </ModalShell>
  );
};