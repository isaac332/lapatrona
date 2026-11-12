'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { CustomerOrder, RestaurantTableConfig, BusinessInfo } from '@/types/accounting';
import { triggerHaptic } from '@/utils/haptics';
import { generatePreCuentaThermalText } from '@/utils/escpos';
import {
  X,
  Users,
  Clock,
  Receipt,
  Plus,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  UtensilsCrossed,
} from 'lucide-react';
import { ModalShell } from './ModalShell';

const subscribeTimer = (callback: () => void) => {
  const interval = setInterval(callback, 30000);
  return () => clearInterval(interval);
};

let lastMinuteSnapshot = 0;
const getNowMinuteSnapshot = () => {
  const now = Date.now();
  if (!lastMinuteSnapshot || now - lastMinuteSnapshot > 30000) {
    lastMinuteSnapshot = now;
  }
  return lastMinuteSnapshot;
};

const getServerMinuteSnapshot = () => 0;

interface MesasModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: RestaurantTableConfig[];
  orders: CustomerOrder[];
  businessInfo?: BusinessInfo;
  onOpenNewOrderForTable: (tableName: string) => void;
  onAddItemsToOrder: (order: CustomerOrder) => void;
  onCheckoutTableOrder: (order: CustomerOrder) => void;
  onTransferTable?: (orderId: string, newTableName: string) => void;
}

export const MesasModal: React.FC<MesasModalProps> = ({
  isOpen,
  onClose,
  tables,
  orders,
  businessInfo,
  onOpenNewOrderForTable,
  onAddItemsToOrder,
  onCheckoutTableOrder,
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedOrderForPreCuenta, setSelectedOrderForPreCuenta] = useState<CustomerOrder | null>(null);
  const [copiedThermal, setCopiedThermal] = useState(false);
  const nowTimestamp = useSyncExternalStore(subscribeTimer, getNowMinuteSnapshot, getServerMinuteSnapshot);

  if (!isOpen) return null;

  // Filter open tabs
  const openOrders = orders.filter((o) => o.isOpenTab);
  const totalPendingAmount = openOrders.reduce((sum, o) => sum + o.total, 0);

  // Map active orders to tables
  const tableOrderMap: Record<string, CustomerOrder> = {};
  for (const o of openOrders) {
    if (o.tableNumber) {
      tableOrderMap[o.tableNumber] = o;
    }
  }

  const filteredTables = selectedZone === 'all'
    ? tables
    : tables.filter((t) => t.zone === selectedZone);

  const handleCopyPreCuenta = (order: CustomerOrder) => {
    triggerHaptic('light');
    const text = generatePreCuentaThermalText(order, businessInfo);
    navigator.clipboard.writeText(text);
    setCopiedThermal(true);
    setTimeout(() => setCopiedThermal(false), 2500);
  };

  const handlePrintWindow = () => {
    triggerHaptic('light');
    window.print();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="mesas-modal-title"
      maxWidthClass="max-w-5xl"
      maxHeightClass="max-h-[94dvh] sm:max-h-[90dvh]"
    >
      {/* Modal Header */}
      <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/[0.08] bg-[#19191d] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#e59b38]/15 border border-[#e59b38]/30 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#e59b38]" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="mesas-modal-title" className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                Mesas y Cuentas Abiertas
              </h2>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e59b38]/20 text-[#e59b38] border border-[#e59b38]/30 shrink-0 tabular-nums">
                {openOrders.length} activas
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Control de consumo por mesa • Total por cobrar:{' '}
              <span className="font-mono font-bold text-emerald-400 tabular-nums">${totalPendingAmount.toFixed(2)} MXN</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar mesas y cuentas abiertas"
          className="w-11 h-11 sm:w-9 sm:h-9 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors shrink-0 touch-manipulation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Zone Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 sm:px-6 py-2.5 border-b border-white/[0.06] bg-[#121215] shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'all', label: `Todas (${tables.length})` },
            { id: 'interior', label: 'Interior' },
            { id: 'barra', label: 'Barra' },
            { id: 'terraza', label: 'Terraza' },
          ].map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSelectedZone(z.id);
              }}
              className={`min-h-[44px] sm:min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all touch-manipulation ${
                selectedZone === z.id
                  ? 'bg-[#e59b38] text-black shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e59b38]" />
            <span>Con Cuenta Abierta</span>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 min-h-[260px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredTables.map((table) => {
            const activeOrder = tableOrderMap[table.name];
            const isOccupied = !!activeOrder;

            // Calculate elapsed minutes
            let elapsedMinutes = 0;
            if (activeOrder) {
              const orderTime = new Date(activeOrder.timestamp).getTime();
              if (!isNaN(orderTime) && nowTimestamp > 0) {
                elapsedMinutes = Math.max(0, Math.floor((nowTimestamp - orderTime) / 60000));
              }
            }

            return (
              <div
                key={table.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isOccupied
                    ? 'bg-gradient-to-br from-[#1b1915] to-[#141418] border-[#e59b38]/50 shadow-lg shadow-[#e59b38]/5'
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                {/* Top Bar of Card */}
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isOccupied ? 'bg-[#e59b38]' : 'bg-emerald-500'
                        }`}
                      />
                      <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                        {table.name}
                      </h3>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 border border-white/5">
                        {table.zone}
                      </span>
                    </div>

                    {isOccupied && activeOrder ? (
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#e59b38]/20 text-[#e59b38] border border-[#e59b38]/30 shrink-0 tabular-nums">
                        #{String(activeOrder.orderNumber).padStart(3, '0')}
                      </span>
                    ) : (
                      <span className="text-[11px] text-neutral-500 font-medium shrink-0">
                        Cap. {table.capacity || 4} pers.
                      </span>
                    )}
                  </div>

                  {/* Active Order Details */}
                  {isOccupied && activeOrder ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
                        <span className="text-white font-medium">
                          {activeOrder.customerName || 'Consumo en Sala'}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-400 shrink-0 tabular-nums">
                          <Clock className="w-3 h-3 text-[#e59b38]" />
                          <span>hace {elapsedMinutes} min</span>
                        </span>
                      </div>

                      {/* Items list preview */}
                      <div className="bg-[#0e0e11] p-2.5 rounded-xl border border-white/5 space-y-1 max-h-[120px] overflow-y-auto">
                        {activeOrder.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-start gap-2 text-xs">
                            <span className="text-neutral-300 min-w-0">
                              <b className="text-[#e59b38] mr-1">{it.quantity}x</b> {it.productName}
                            </span>
                            <span className="font-mono text-white text-[11px] shrink-0 tabular-nums">${it.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Running Subtotal */}
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                          Total Acumulado:
                        </span>
                        <span className="font-serif text-xl font-bold text-white tabular-nums">
                          ${activeOrder.total.toFixed(2)}{' '}
                          <span className="text-[10px] text-neutral-500 font-sans">MXN</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-neutral-500 text-xs">
                      Mesa libre para nuevos comensales.
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex flex-wrap items-center gap-2">
                  {isOccupied && activeOrder ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          onAddItemsToOrder(activeOrder);
                        }}
                        className="flex-1 min-h-[44px] py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all touch-manipulation"
                        title="Sumar otra ronda de productos a esta mesa"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#e59b38]" />
                        <span>+ Ronda</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setSelectedOrderForPreCuenta(activeOrder);
                        }}
                        className="min-h-[44px] py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all touch-manipulation"
                        title="Ver e imprimir pre-cuenta"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Pre-Cuenta</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('success');
                          onCheckoutTableOrder(activeOrder);
                        }}
                        className="min-h-[44px] py-2 px-3.5 rounded-xl bg-[#e59b38] hover:bg-[#d48b28] active:scale-95 text-black font-extrabold text-xs flex items-center gap-1 transition-all shadow-md touch-manipulation"
                        title="Cobrar cuenta y liberar mesa"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Cobrar</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        onOpenNewOrderForTable(table.name);
                      }}
                      className="w-full min-h-[44px] py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 touch-manipulation"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span>Abrir Comanda en {table.name}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pre-Cuenta Sheet / Dialog (if opened) */}
      {selectedOrderForPreCuenta && (
        <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-[#121215] border border-white/20 rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col max-h-[88dvh]">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Receipt className="w-5 h-5 text-[#e59b38] shrink-0" />
                <h3 className="font-serif text-lg font-bold text-white leading-tight">
                  Pre-Cuenta • {selectedOrderForPreCuenta.tableNumber || 'Mesa'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForPreCuenta(null)}
                aria-label="Cerrar pre-cuenta"
                className="w-11 h-11 sm:w-8 sm:h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white shrink-0 touch-manipulation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Monospace thermal slip preview */}
            <div className="my-3 p-3 rounded-xl bg-white text-black font-mono text-[11px] leading-tight overflow-y-auto overscroll-contain flex-1 shadow-inner select-all">
              <pre className="whitespace-pre-wrap font-mono">
                {generatePreCuentaThermalText(selectedOrderForPreCuenta, businessInfo)}
              </pre>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2 pt-2 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => handleCopyPreCuenta(selectedOrderForPreCuenta)}
                className="min-h-[44px] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/10 touch-manipulation"
              >
                {copiedThermal ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">¡Copiado a RawBT!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Bluetooth</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrintWindow}
                className="min-h-[44px] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#e59b38] hover:bg-[#d48b28] text-black text-xs font-extrabold transition-all shadow-md touch-manipulation"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Tira</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalShell>
  );
};
