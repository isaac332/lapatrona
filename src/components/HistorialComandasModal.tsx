'use client';

import React, { useState, useMemo, useRef } from 'react';
import { CustomerOrder } from '@/types/accounting';
import { generateEscPosComandaTicket, formatCurrencyMXN } from '@/utils/escpos';
import { X, Search, Receipt, Printer, Copy, Check, UtensilsCrossed, ShoppingBag, Banknote, CreditCard, Smartphone } from 'lucide-react';

interface HistorialComandasModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CustomerOrder[];
}

export const HistorialComandasModal: React.FC<HistorialComandasModalProps> = ({
  isOpen,
  onClose,
  orders,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'aqui' | 'llevar'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [copiedEscPos, setCopiedEscPos] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Type filter
      if (filterType !== 'all' && order.orderType !== filterType) {
        return false;
      }
      // Query filter
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

  // Set default selection
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-[#0d0d0f] border border-white/[0.1] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e59b38]/10 border border-[#e59b38]/30 flex items-center justify-center text-[#e59b38]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide">
                Historial y Reimpresión de Comandas
              </h2>
              <p className="text-xs text-neutral-400">
                Consulta y reimprime notas de consumo por número de folio o cliente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-5 py-3 bg-[#141417] border-b border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar por folio (#001), cliente, mesa o platillo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#e59b38]/50"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-[#e59b38] text-black font-bold'
                  : 'bg-white/[0.04] text-neutral-400 hover:text-white'
              }`}
            >
              Todas ({orders.length})
            </button>
            <button
              onClick={() => setFilterType('aqui')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                filterType === 'aqui'
                  ? 'bg-[#e59b38] text-black font-bold'
                  : 'bg-white/[0.04] text-neutral-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3 h-3" />
              <span>Aquí</span>
            </button>
            <button
              onClick={() => setFilterType('llevar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                filterType === 'llevar'
                  ? 'bg-[#e59b38] text-black font-bold'
                  : 'bg-white/[0.04] text-neutral-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Llevar</span>
            </button>
          </div>
        </div>

        {/* Content Body: Split View */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Order List (Left) */}
          <div className="lg:col-span-5 border-r border-white/[0.06] overflow-y-auto p-3 sm:p-4 space-y-2">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 px-4 text-neutral-500">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">No se encontraron comandas</p>
                <p className="text-xs mt-1">
                  {orders.length === 0
                    ? 'Aún no se han cobrado comandas en este turno.'
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
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#e59b38]/10 border-[#e59b38]/50 shadow-md'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-[#e59b38]">
                          #{order.orderNumber.toString().padStart(3, '0')}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            order.orderType === 'aqui'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {order.orderType === 'aqui' ? 'Aquí' : 'Llevar'}
                        </span>
                      </div>

                      <span className="font-mono font-bold text-sm text-white">
                        {formatCurrencyMXN(order.total)}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-xs text-neutral-400">
                      <span className="truncate max-w-[180px] font-medium text-neutral-300">
                        {order.customerName ? order.customerName : 'Mostrador'}
                      </span>
                      <span className="font-mono text-[11px] text-neutral-500">
                        {timeStr}
                      </span>
                    </div>

                    <div className="mt-1 text-[11px] text-neutral-500 truncate">
                      {order.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Ticket Preview & Actions (Right) */}
          <div className="lg:col-span-7 overflow-y-auto p-4 sm:p-6 bg-[#0a0a0c]">
            {activeOrder ? (
              <div className="max-w-md mx-auto space-y-4">
                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Vista de Comanda • #{activeOrder.orderNumber.toString().padStart(3, '0')}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyEscPos}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white transition-all active:scale-95"
                      title="Copiar texto monoespaciado para app Bluetooth (RawBT)"
                    >
                      {copiedEscPos ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#e59b38]" />
                          <span>Copiar ESC/POS</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e59b38] hover:bg-[#f0aa49] text-black font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-[#e59b38]/20"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Reimprimir</span>
                    </button>
                  </div>
                </div>

                {/* Printable Ticket */}
                <div
                  ref={printAreaRef}
                  className="bg-[#121215] border border-white/[0.1] rounded-2xl p-6 font-mono text-xs text-neutral-300 shadow-xl space-y-3 print:bg-white print:text-black print:border-none print:p-0"
                >
                  <div className="text-center space-y-1 border-b border-dashed border-white/20 pb-3 print:border-black/30">
                    <div className="font-serif text-lg font-bold tracking-widest text-white print:text-black uppercase">
                      LA PATRONA
                    </div>
                    <div className="text-[10px] text-[#e59b38] print:text-black uppercase font-semibold">
                      Philly & Fry POS • Comanda de Cocina
                    </div>
                    <div className="font-black text-xl text-white print:text-black tracking-wider pt-1">
                      FOLIO #{activeOrder.orderNumber.toString().padStart(3, '0')}
                    </div>
                    <div className="text-[10px] text-neutral-400 print:text-neutral-600">
                      {new Date(activeOrder.timestamp).toLocaleString('es-MX')}
                    </div>
                    <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/[0.08] text-white print:border print:border-black print:text-black">
                      SERVICIO: {activeOrder.orderType === 'aqui' ? 'COMER AQUÍ' : 'PARA LLEVAR'}
                    </div>
                  </div>

                  {activeOrder.customerName && (
                    <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center font-bold text-sm text-[#e59b38] print:text-black">
                      CLIENTE: {activeOrder.customerName}
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-2 py-2 border-b border-dashed border-white/20 print:border-black/30">
                    {activeOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-white print:text-black">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="block text-[10px] text-neutral-400 print:text-neutral-600">
                            {item.variantLabel}
                          </span>
                        </div>
                        <span className="font-bold text-white print:text-black shrink-0">
                          {formatCurrencyMXN(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Subtotal, Tips, Total */}
                  <div className="space-y-1 pt-1 text-xs">
                    {activeOrder.tip !== undefined && activeOrder.tip > 0 && (
                      <div className="flex justify-between text-neutral-400 print:text-neutral-600">
                        <span>Subtotal Alimentos:</span>
                        <span>{formatCurrencyMXN(activeOrder.total - activeOrder.tip)}</span>
                      </div>
                    )}

                    {activeOrder.tip !== undefined && activeOrder.tip > 0 && (
                      <div className="flex justify-between text-[#e59b38] print:text-black font-semibold">
                        <span>(+) Propina Personal:</span>
                        <span>+{formatCurrencyMXN(activeOrder.tip)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm font-black text-white print:text-black pt-1 border-t border-dashed border-white/20">
                      <span>TOTAL COBRADO:</span>
                      <span className="text-[#e59b38] print:text-black">
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

                    {activeOrder.paymentMethod === 'efectivo' && activeOrder.amountReceived !== undefined && (
                      <div className="flex justify-between text-[11px] text-neutral-400 pt-0.5">
                        <span>Efectivo recibido:</span>
                        <span>{formatCurrencyMXN(activeOrder.amountReceived)} (Cambio: {formatCurrencyMXN(activeOrder.change || 0)})</span>
                      </div>
                    )}
                  </div>

                  {activeOrder.notes && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 print:text-black print:border-black">
                      <span className="font-bold block">NOTA DE COCINA:</span>
                      {activeOrder.notes}
                    </div>
                  )}

                  <div className="text-center text-[10px] text-neutral-500 pt-3 border-t border-dashed border-white/20">
                    ¡Gracias por su preferencia! • La Patrona
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
      </div>
    </div>
  );
};
