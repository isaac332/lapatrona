'use client';

import React, { useState, useMemo, useRef } from 'react';
import { CustomerOrder, PaymentMethod } from '@/types/accounting';
import { generateEscPosComandaTicket, formatCurrencyMXN } from '@/utils/escpos';
import {
  X,
  Search,
  Receipt,
  Printer,
  Copy,
  Check,
  Banknote,
  CreditCard,
  Smartphone,
  AlertTriangle,
  RefreshCw,
  Ban,
  ArrowLeft,
} from 'lucide-react';
import { ModalShell } from './ModalShell';

interface HistorialComandasModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CustomerOrder[];
  onCancelOrder?: (orderId: string, reason: string, restock: boolean) => void;
  onChangeOrderPaymentMethod?: (orderId: string, newMethod: PaymentMethod) => void;
}

export const HistorialComandasModal: React.FC<HistorialComandasModalProps> = ({
  isOpen,
  onClose,
  orders,
  onCancelOrder,
  onChangeOrderPaymentMethod,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'canceladas'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [copiedEscPos, setCopiedEscPos] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Error de captura');
  const [customReasonText, setCustomReasonText] = useState('');
  const [restockOnCancel, setRestockOnCancel] = useState(true);
  const [isChangingPayment, setIsChangingPayment] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filterType === 'canceladas' && !order.isCancelled) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchFolio =
        order.orderNumber.toString().includes(q) ||
        `#${order.orderNumber}`.includes(q) ||
        `#${order.orderNumber.toString().padStart(3, '0')}`.includes(q);
      const matchCustomer = order.customerName ? order.customerName.toLowerCase().includes(q) : false;
      const matchNotes = order.notes ? order.notes.toLowerCase().includes(q) : false;
      const matchItem = order.items.some((item) => item.productName.toLowerCase().includes(q));

      return matchFolio || matchCustomer || matchNotes || matchItem;
    });
  }, [orders, filterType, searchQuery]);

  const activeOrder = useMemo(() => {
    if (!orders.length) return null;
    if (selectedOrderId) {
      const found = orders.find((o) => o.id === selectedOrderId);
      if (found) return found;
    }
    return filteredOrders[0] || orders[0] || null;
  }, [orders, selectedOrderId, filteredOrders]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyEscPos = async () => {
    if (!activeOrder) return;
    try {
      const ticketText = generateEscPosComandaTicket(activeOrder);
      await navigator.clipboard.writeText(ticketText);
      setCopiedEscPos(true);
      setTimeout(() => setCopiedEscPos(false), 2500);
    } catch (e) {
      console.error('Failed to copy ESC/POS text', e);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="historial-comandas-title"
      maxWidthClass="max-w-5xl"
      panelClassName="bg-[#0d0d0f]"
    >
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 border-b border-white/[0.08] flex items-center justify-between gap-3 bg-white/[0.02] shrink-0 print:hidden">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#e59b38]/10 border border-[#e59b38]/30 flex items-center justify-center text-[#e59b38] shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 id="historial-comandas-title" className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide leading-tight">
              Historial y Reimpresión de Órdenes
            </h2>
            <p className="text-xs text-neutral-400">
              Consulta y reimprime órdenes para llevar por número de folio o cliente
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar historial de órdenes"
          className="w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-neutral-400 hover:text-white transition-colors shrink-0 touch-manipulation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="px-4 sm:px-5 py-3 bg-[#141417] border-b border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 print:hidden">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar por folio (#001), cliente o producto..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setMobileView('list');
            }}
            className="w-full min-h-[44px] sm:min-h-[38px] pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-base sm:text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#e59b38]/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setFilterType('all');
              setMobileView('list');
            }}
            className={`min-h-[44px] sm:min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all touch-manipulation ${
              filterType === 'all'
                ? 'bg-[#e59b38] text-black font-bold'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white'
            }`}
          >
            Todas ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterType('canceladas');
              setMobileView('list');
            }}
            className={`min-h-[44px] sm:min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all touch-manipulation ${
              filterType === 'canceladas'
                ? 'bg-red-500 text-white font-bold shadow-md shadow-red-500/20'
                : 'bg-white/[0.04] text-neutral-400 hover:text-red-400'
            }`}
          >
            <Ban className="w-3 h-3" />
            <span>Canceladas ({orders.filter((o) => o.isCancelled).length})</span>
          </button>
        </div>
      </div>

      {/* Content Body: Mobile view-switcher / Desktop Split View */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0 print:block print:overflow-visible">
        {/* Order List (Left) */}
        <div
          className={`lg:col-span-5 border-b lg:border-b-0 lg:border-r border-white/[0.06] overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-2 print:hidden ${
            mobileView === 'detail' ? 'hidden lg:block' : 'block'
          }`}
        >
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 px-4 text-neutral-500">
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No se encontraron órdenes</p>
              <p className="text-xs mt-1">
                {orders.length === 0
                  ? 'Aún no se han registrado órdenes.'
                  : 'Intenta con otro término de búsqueda.'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isSelected = activeOrder?.id === order.id;
              const date = new Date(order.timestamp);
              const timeStr = !isNaN(date.getTime())
                ? date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setIsCancelConfirmOpen(false);
                    setIsChangingPayment(false);
                    setMobileView('detail');
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all touch-manipulation ${
                    isSelected
                      ? 'bg-[#e59b38]/10 border-[#e59b38]/50 shadow-md'
                      : order.isCancelled
                      ? 'bg-red-950/10 border-red-900/30 opacity-70 hover:opacity-100 hover:border-red-500/40'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`font-mono font-black text-sm tabular-nums ${order.isCancelled ? 'line-through text-red-400' : 'text-[#e59b38]'}`}>
                        #{order.orderNumber.toString().padStart(3, '0')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        Para Llevar
                      </span>
                      {order.isCancelled && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
                          Cancelada
                        </span>
                      )}
                    </div>

                    <span className={`font-mono font-bold text-sm shrink-0 tabular-nums ${order.isCancelled ? 'line-through text-neutral-500' : 'text-white'}`}>
                      {formatCurrencyMXN(order.total)}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-neutral-400">
                    <span className="font-medium text-neutral-300">
                      {order.customerName ? order.customerName : 'Mostrador'}
                    </span>
                    <span className="font-mono text-[11px] text-neutral-500 shrink-0 tabular-nums">
                      {timeStr}
                    </span>
                  </div>

                  <div className="mt-1 text-[11px] text-neutral-500 leading-snug">
                    {order.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Ticket Preview & Actions (Right) */}
        <div
          className={`lg:col-span-7 overflow-y-auto overscroll-contain p-4 sm:p-6 bg-[#0a0a0c] print:bg-white print:p-0 print:overflow-visible ${
            mobileView === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <button
            type="button"
            onClick={() => setMobileView('list')}
            className="lg:hidden min-h-[44px] mb-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-xs font-semibold text-white touch-manipulation print:hidden"
          >
            <ArrowLeft className="w-4 h-4 text-[#e59b38]" />
            <span>Volver a órdenes</span>
          </button>

          {activeOrder ? (
            <div className="max-w-md mx-auto space-y-4">
              {activeOrder.isCancelled && (
                <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs flex items-start gap-3 shadow-lg print:hidden">
                  <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold uppercase tracking-wider text-red-300">
                        Orden Cancelada
                      </span>
                      {activeOrder.cancelledAt && (
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {new Date(activeOrder.cancelledAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-300 mt-0.5">
                      Motivo: <span className="font-semibold text-white">{activeOrder.cancellationReason || 'Cancelación directa'}</span>
                    </p>
                  </div>
                </div>
              )}

              {isChangingPayment && !activeOrder.isCancelled && (
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2.5 animate-in fade-in duration-150 print:hidden">
                  <div className="flex items-center justify-between gap-2 text-xs text-neutral-300">
                    <span className="font-bold uppercase tracking-wider text-neutral-400">Seleccionar nuevo método de pago:</span>
                    <button type="button" onClick={() => setIsChangingPayment(false)} className="min-h-[36px] px-2 text-neutral-400 hover:text-white text-xs touch-manipulation">Cerrar</button>
                  </div>
                  <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onChangeOrderPaymentMethod?.(activeOrder.id, 'efectivo');
                        setIsChangingPayment(false);
                      }}
                      className={`min-h-[44px] py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all touch-manipulation ${
                        activeOrder.paymentMethod === 'efectivo'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-white/[0.04] border-white/[0.08] text-neutral-300 hover:bg-white/[0.08]'
                      }`}
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Efectivo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onChangeOrderPaymentMethod?.(activeOrder.id, 'tarjeta');
                        setIsChangingPayment(false);
                      }}
                      className={`min-h-[44px] py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all touch-manipulation ${
                        activeOrder.paymentMethod === 'tarjeta'
                          ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                          : 'bg-white/[0.04] border-white/[0.08] text-neutral-300 hover:bg-white/[0.08]'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Tarjeta</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onChangeOrderPaymentMethod?.(activeOrder.id, 'transferencia');
                        setIsChangingPayment(false);
                      }}
                      className={`min-h-[44px] py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all touch-manipulation ${
                        activeOrder.paymentMethod === 'transferencia'
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                          : 'bg-white/[0.04] border-white/[0.08] text-neutral-300 hover:bg-white/[0.08]'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Transferencia</span>
                    </button>
                  </div>
                </div>
              )}

              {isCancelConfirmOpen && !activeOrder.isCancelled && (
                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/40 space-y-3 animate-in fade-in duration-150 print:hidden">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wider text-red-300">
                      Confirmar Cancelación de Orden #{activeOrder.orderNumber.toString().padStart(3, '0')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Al cancelar la orden, se descontará su monto (${activeOrder.total.toFixed(2)} MXN) de la contabilidad.
                  </p>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Motivo:
                    </label>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full min-h-[44px] bg-[#121215] border border-white/[0.12] rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Error de captura">Error de captura</option>
                      <option value="Cliente canceló">Cliente canceló</option>
                      <option value="Orden duplicada">Orden duplicada</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  {cancelReason === 'Otro' && (
                    <input
                      type="text"
                      placeholder="Escribe el motivo..."
                      value={customReasonText}
                      onChange={(e) => setCustomReasonText(e.target.value)}
                      className="w-full min-h-[44px] bg-[#121215] border border-white/[0.12] rounded-xl px-3 py-2 text-base sm:text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                    />
                  )}
                  <label className="min-h-[36px] flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                    <input
                      type="checkbox"
                      checked={restockOnCancel}
                      onChange={(e) => setRestockOnCancel(e.target.checked)}
                      className="w-4 h-4 rounded bg-white/[0.08] border-white/20 text-[#e59b38] focus:ring-0"
                    />
                    <span>Regresar porciones al inventario</span>
                  </label>
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCancelConfirmOpen(false)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-neutral-300 hover:text-white touch-manipulation"
                    >
                      Cerrar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const finalReason = cancelReason === 'Otro' && customReasonText.trim() ? customReasonText.trim() : cancelReason;
                        onCancelOrder?.(activeOrder.id, finalReason, restockOnCancel);
                        setIsCancelConfirmOpen(false);
                      }}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 touch-manipulation"
                    >
                      Confirmar Cancelación
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Orden • #{activeOrder.orderNumber.toString().padStart(3, '0')}
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  {!activeOrder.isCancelled && onChangeOrderPaymentMethod && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPayment((prev) => !prev);
                        setIsCancelConfirmOpen(false);
                      }}
                      className="min-h-[44px] sm:min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white transition-all active:scale-95 touch-manipulation"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#e59b38]" />
                      <span>Cambiar Pago</span>
                    </button>
                  )}

                  {!activeOrder.isCancelled && onCancelOrder && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCancelConfirmOpen((prev) => !prev);
                        setIsChangingPayment(false);
                      }}
                      className="min-h-[44px] sm:min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-300 hover:text-red-200 transition-all active:scale-95 touch-manipulation"
                    >
                      <Ban className="w-3.5 h-3.5 text-red-400" />
                      <span>Cancelar</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopyEscPos}
                    className="min-h-[44px] sm:min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white transition-all active:scale-95 touch-manipulation"
                  >
                    {copiedEscPos ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#e59b38]" />
                        <span>Copiar Ticket</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="min-h-[44px] sm:min-h-[36px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#e59b38] hover:bg-[#f0aa49] text-black font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-[#e59b38]/20 touch-manipulation"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Reimprimir</span>
                  </button>
                </div>
              </div>

              {/* Printable Ticket */}
              <div
                ref={printAreaRef}
                className="bg-[#121215] border border-white/[0.1] rounded-2xl p-4 sm:p-6 font-mono text-xs text-neutral-300 shadow-xl space-y-3 print:bg-white print:text-black print:border-none print:p-0"
              >
                <div className="text-center space-y-1 border-b border-dashed border-white/20 pb-3 print:border-black/30">
                  <div className="font-serif text-lg font-bold tracking-widest text-white print:text-black uppercase">
                    LOS PHILLYS DE LA PATRONA
                  </div>
                  <div className="text-[10px] text-[#e59b38] print:text-black uppercase font-semibold">
                    Aguilas #1 - Nogales • Orden Para Llevar
                  </div>
                  <div className="font-black text-xl text-white print:text-black tracking-wider pt-1">
                    ORDEN #{activeOrder.orderNumber.toString().padStart(3, '0')}
                  </div>
                  <div className="text-[10px] text-neutral-400 print:text-neutral-600">
                    {new Date(activeOrder.timestamp).toLocaleString('es-MX')}
                  </div>

                  {activeOrder.isCancelled && (
                    <div className="py-1 px-3 bg-red-600 text-white font-black text-center tracking-widest uppercase text-xs rounded my-1 print:border print:border-black print:text-black">
                      *** ORDEN CANCELADA ***
                    </div>
                  )}
                </div>

                {activeOrder.customerName && (
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center font-bold text-sm text-[#e59b38] print:text-black">
                    CLIENTE: {activeOrder.customerName}
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2 py-2 border-b border-dashed border-white/20 print:border-black/30">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-2">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-white print:text-black">
                          {item.quantity}x {item.productName}
                        </span>
                        <span className="block text-[10px] text-neutral-400 print:text-neutral-600">
                          {item.variantLabel}
                        </span>
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
                      <span className="font-bold text-white print:text-black shrink-0 tabular-nums">
                        {formatCurrencyMXN(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="space-y-1 pt-1 text-xs">
                  <div className="flex justify-between items-center text-sm font-black text-white print:text-black pt-1">
                    <span>TOTAL COBRADO:</span>
                    <span className="text-[#e59b38] print:text-black tabular-nums">
                      {formatCurrencyMXN(activeOrder.total)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-neutral-400 print:text-black pt-1">
                    <span>MÉTODO DE PAGO:</span>
                    <span className="uppercase font-bold text-white print:text-black flex items-center gap-1">
                      {activeOrder.paymentMethod === 'efectivo' && <Banknote className="w-3 h-3 text-emerald-400" />}
                      {activeOrder.paymentMethod === 'tarjeta' && <CreditCard className="w-3 h-3 text-sky-400" />}
                      {activeOrder.paymentMethod === 'transferencia' && <Smartphone className="w-3 h-3 text-purple-400" />}
                      {activeOrder.paymentMethod}
                    </span>
                  </div>
                </div>

                {activeOrder.notes && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 print:text-black print:border-black">
                    <span className="font-bold block">NOTA:</span>
                    {activeOrder.notes}
                  </div>
                )}

                <div className="text-center text-[10px] text-neutral-500 pt-3 border-t border-dashed border-white/20">
                  ¡Gracias por su preferencia! • Los Phillys de La Patrona
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-neutral-500">
              <Receipt className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Selecciona una orden de la lista para ver su detalle</p>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
};