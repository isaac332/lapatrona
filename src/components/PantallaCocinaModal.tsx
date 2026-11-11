'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { CustomerOrder } from '@/types/accounting';
import { X, ChefHat, Clock, CheckCircle2, Flame, Utensils, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

const subscribeTimer = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const interval = setInterval(callback, 30000);
  return () => clearInterval(interval);
};

const getNowMinuteSnapshot = () => (typeof Date !== 'undefined' ? Math.floor(Date.now() / 60000) : 0);
const getServerMinuteSnapshot = () => 0;

interface PantallaCocinaModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CustomerOrder[];
  onUpdateOrderStatus: (orderId: string, status: 'pendiente' | 'preparando' | 'listo' | 'entregado') => void;
}

export const PantallaCocinaModal: React.FC<PantallaCocinaModalProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
}) => {
  if (!isOpen) return null;

  return (
    <PantallaCocinaDialog
      onClose={onClose}
      orders={orders}
      onUpdateOrderStatus={onUpdateOrderStatus}
    />
  );
};

function PantallaCocinaDialog({
  onClose,
  orders,
  onUpdateOrderStatus,
}: {
  onClose: () => void;
  orders: CustomerOrder[];
  onUpdateOrderStatus: (orderId: string, status: 'pendiente' | 'preparando' | 'listo' | 'entregado') => void;
}) {
  const [activeTab, setActiveTab] = useState<'activas' | 'entregadas'>('activas');
  const currentMinute = useSyncExternalStore(subscribeTimer, getNowMinuteSnapshot, getServerMinuteSnapshot);

  const getElapsedMinutes = (timestamp: string) => {
    if (!currentMinute) return 0;
    const orderMinute = Math.floor(new Date(timestamp).getTime() / 60000);
    return Math.max(0, currentMinute - orderMinute);
  };

  const activeOrders = orders.filter((o) => (o.status || 'pendiente') !== 'entregado');
  const completedOrders = orders.filter((o) => o.status === 'entregado');

  const pendingCount = orders.filter((o) => (o.status || 'pendiente') === 'pendiente').length;
  const preparingCount = orders.filter((o) => o.status === 'preparando').length;
  const readyCount = orders.filter((o) => o.status === 'listo').length;

  const displayedOrders = activeTab === 'activas' ? activeOrders : completedOrders;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl h-full sm:h-[92vh] flex flex-col bg-[#0f0f13] sm:rounded-2xl border border-white/[0.12] shadow-2xl overflow-hidden pb-safe sm:pb-0">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-white/[0.08] bg-[#16161b] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e59b38]/15 border border-[#e59b38]/30 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-[#e59b38]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide">
                  Pantalla de Cocina / KDS
                </h2>
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-mono animate-pulse">
                  EN VIVO
                </span>
              </div>
              <p className="text-xs text-neutral-400 hidden sm:block">
                Comandas en parrilla, tiempos de espera y control de preparación.
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <Flame className="w-3.5 h-3.5" />
              <span>{pendingCount} pendientes</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-mono hidden md:flex">
              <Utensils className="w-3.5 h-3.5" />
              <span>{preparingCount} en parrilla</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono hidden md:flex">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{readyCount} listos</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors touch-manipulation ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[#121216] border-b border-white/[0.06] text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('activas')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'activas'
                  ? 'bg-[#e59b38] text-black shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Comandas Activas ({activeOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('entregadas')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'entregadas'
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Historial Entregados ({completedOrders.length})
            </button>
          </div>

          <div className="text-[11px] text-neutral-400 font-mono hidden sm:block">
            Auto-actualizado cada 30s
          </div>
        </div>

        {/* Orders Grid */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6">
          {displayedOrders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-500">
                <ChefHat className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-neutral-300">
                {activeTab === 'activas'
                  ? 'No hay comandas activas en cocina'
                  : 'No hay pedidos en el historial de entregados'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm">
                {activeTab === 'activas'
                  ? 'Las nuevas órdenes registradas en mostrador o comanda aparecerán aquí automáticamente en tiempo real.'
                  : 'Las órdenes completadas que marques como entregadas aparecerán aquí.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {displayedOrders.map((order) => {
                const status = order.status || 'pendiente';
                const elapsedMin = getElapsedMinutes(order.timestamp);
                const isUrgent = elapsedMin >= 12 && status !== 'entregado';

                const statusStyles = {
                  pendiente: {
                    border: 'border-amber-500/40 hover:border-amber-500/60',
                    headerBg: 'bg-amber-500/10',
                    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                    label: 'Pendiente',
                  },
                  preparando: {
                    border: 'border-blue-500/50 hover:border-blue-500/70',
                    headerBg: 'bg-blue-500/10',
                    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                    label: 'En Parrilla',
                  },
                  listo: {
                    border: 'border-emerald-500/50 hover:border-emerald-500/70',
                    headerBg: 'bg-emerald-500/10',
                    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                    label: 'Listo p/ Entrega',
                  },
                  entregado: {
                    border: 'border-white/10',
                    headerBg: 'bg-white/[0.02]',
                    badgeBg: 'bg-neutral-800 text-neutral-400 border-white/10',
                    label: 'Entregado',
                  },
                }[status];

                return (
                  <div
                    key={order.id}
                    className={`flex flex-col rounded-2xl bg-[#15151a] border ${statusStyles.border} shadow-lg overflow-hidden transition-all`}
                  >
                    {/* Order Ticket Header */}
                    <div className={`p-3 sm:p-3.5 border-b border-white/[0.08] ${statusStyles.headerBg} flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-white">
                          #{String(order.orderNumber).padStart(3, '0')}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            order.orderType === 'llevar'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {order.orderType === 'llevar' ? 'Para Llevar' : 'Comer Aquí'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono border ${
                            isUrgent
                              ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse font-bold'
                              : 'bg-black/30 text-neutral-300 border-white/10'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{elapsedMin}m</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusStyles.badgeBg}`}>
                          {statusStyles.label}
                        </span>
                      </div>
                    </div>

                    {/* Customer / Table Info */}
                    {(order.customerName || order.notes) && (
                      <div className="px-3.5 py-2 bg-black/20 border-b border-white/[0.04] text-xs">
                        {order.customerName && (
                          <div className="font-semibold text-neutral-200">
                            Cliente / Mesa: <span className="text-[#e59b38]">{order.customerName}</span>
                          </div>
                        )}
                        {order.notes && (
                          <div className="text-[11px] text-amber-300 font-medium mt-0.5 flex items-center gap-1">
                            <span>Nota:</span>
                            <span className="italic">{order.notes}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Order Items List */}
                    <div className="flex-1 p-3 sm:p-3.5 space-y-2 text-xs">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-2 pb-1.5 border-b border-white/[0.04] last:border-b-0"
                        >
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-md bg-[#e59b38]/20 text-[#e59b38] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                              {item.quantity}
                            </span>
                            <div>
                              <div className="font-bold text-white text-[13px] leading-tight">
                                {item.productName}
                              </div>
                              <div className="text-[11px] text-neutral-400">
                                {item.variantLabel}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Progress & Status Action Buttons */}
                    <div className="p-3 bg-[#111115] border-t border-white/[0.08] flex items-center justify-between gap-2">
                      {status === 'pendiente' && (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('medium');
                            onUpdateOrderStatus(order.id, 'preparando');
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm active:scale-95 touch-manipulation"
                        >
                          <Flame className="w-4 h-4" />
                          <span>Poner en Parrilla</span>
                        </button>
                      )}

                      {status === 'preparando' && (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('medium');
                            onUpdateOrderStatus(order.id, 'listo');
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm active:scale-95 touch-manipulation"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Marcar Como Listo</span>
                        </button>
                      )}

                      {status === 'listo' && (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('medium');
                            onUpdateOrderStatus(order.id, 'entregado');
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#e59b38] hover:bg-[#d48b28] text-black font-extrabold text-xs uppercase tracking-wider transition-colors shadow-sm active:scale-95 touch-manipulation"
                        >
                          <ArrowRight className="w-4 h-4" />
                          <span>Entregar a Cliente</span>
                        </button>
                      )}

                      {status === 'entregado' && (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('medium');
                            onUpdateOrderStatus(order.id, 'preparando');
                          }}
                          className="text-[11px] text-neutral-400 hover:text-white underline"
                        >
                          Reabrir Comanda
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
