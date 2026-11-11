'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { TimeframeFilter } from '@/types/accounting';
import { History, DollarSign, RotateCcw, Receipt, Wallet, Calculator, ShoppingBag, WifiOff, FileText } from 'lucide-react';

const subscribeOnline = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
};

const getOnlineSnapshot = () => (typeof navigator !== 'undefined' ? navigator.onLine : true);
const getOnlineServerSnapshot = () => true;

interface NavbarProps {
  timeframe: TimeframeFilter;
  onTimeframeChange: (tf: TimeframeFilter) => void;
  onOpenPriceManager: () => void;
  onOpenHistory: () => void;
  onOpenZeroOut: () => void;
  onOpenCorte: () => void;
  onOpenGastos: () => void;
  onOpenCalculadora: () => void;
  onOpenNuevaOrden: () => void;
  onOpenHistorialCortes?: () => void;
  totalUnitsInTimeframe: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  timeframe,
  onTimeframeChange,
  onOpenPriceManager,
  onOpenHistory,
  onOpenZeroOut,
  onOpenCorte,
  onOpenGastos,
  onOpenCalculadora,
  onOpenNuevaOrden,
  onOpenHistorialCortes,
  totalUnitsInTimeframe,
}) => {
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getOnlineServerSnapshot);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }
  }, []);

  const timeframeLabels: Record<TimeframeFilter, string> = {
    today: 'Hoy',
    week: 'Esta Semana',
    month: 'Este Mes',
    all: 'Total Histórico',
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.08] bg-[#0d0d0f]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-sans font-black tracking-[0.15em] sm:tracking-[0.2em] text-base sm:text-2xl text-[#f5f0eb] uppercase leading-tight">
                LA PATRONA
              </span>
              {/* Online/Offline status badge */}
              {isOnline ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[9px] text-emerald-400 font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] text-amber-300 font-mono font-medium animate-pulse">
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  Offline
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-[#e59b38] font-semibold leading-tight">
              Philly & Fry POS • Mostrador
            </span>
          </div>
        </div>

        {/* Timeframe Selector Pills (Desktop) */}
        <div className="hidden lg:flex items-center bg-[#17171a] p-1 rounded-full border border-white/[0.08]">
          {(['today', 'week', 'month', 'all'] as TimeframeFilter[]).map((tf) => {
            const isActive = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-[#e59b38] text-black font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {timeframeLabels[tf]}
              </button>
            );
          })}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden lg:flex items-center gap-2">
          {/* NUEVA COMANDA BUTTON */}
          <button
            onClick={onOpenNuevaOrden}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black bg-[#e59b38] hover:bg-[#d48b28] text-black shadow-md transition-all active:scale-95"
            title="Armar comanda completa con ticket para cocina o cliente"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-black" />
            <span>+ Armar Comanda</span>
          </button>

          {/* CORTE DE CAJA BUTTON */}
          <button
            onClick={onOpenCorte}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-[#e59b38] hover:bg-[#e59b38]/10 border border-[#e59b38]/30 transition-all shadow-sm active:scale-95"
            title="Generar Ticket de Corte de Turno o Jornada"
          >
            <Receipt className="w-3.5 h-3.5 text-[#e59b38]" />
            <span>Corte de Caja</span>
          </button>

          {/* TURNOS CERRADOS ANTERIORES BUTTON */}
          {onOpenHistorialCortes && (
            <button
              onClick={onOpenHistorialCortes}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-all shadow-sm active:scale-95"
              title="Historial de turnos archivados y reimpresión de tickets"
            >
              <FileText className="w-3.5 h-3.5 text-neutral-400" />
              <span>Turnos Archivados</span>
            </button>
          )}

          {/* GASTOS DE CAJA BUTTON */}
          <button
            onClick={onOpenGastos}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/25 transition-all shadow-sm active:scale-95"
            title="Registrar salida o gasto de caja menor"
          >
            <Wallet className="w-3.5 h-3.5 text-rose-400" />
            <span>Gastos</span>
          </button>

          {/* CALCULADORA DE CAMBIO BUTTON */}
          <button
            onClick={onOpenCalculadora}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/25 transition-all shadow-sm active:scale-95"
            title="Calculadora rápida de cambio"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cambio</span>
          </button>

          {/* ZERO OUT ACTION BUTTON */}
          <button
            onClick={onOpenZeroOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/25 transition-all shadow-sm active:scale-95"
            title="Poner en ceros toda la contabilidad (Reset general)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400" />
            <span>Poner en Ceros</span>
          </button>

          {/* Price Manager Button */}
          <button
            onClick={onOpenPriceManager}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-neutral-300 hover:text-[#f5f0eb] hover:bg-white/[0.06] border border-white/[0.08] transition-colors"
            title="Catálogo de Precios y Costeo de Alimentos"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#e59b38]" />
            <span>Precios y Costos</span>
          </button>

          {/* History / Audit Log */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-neutral-300 hover:text-[#f5f0eb] hover:bg-white/[0.06] border border-white/[0.08] transition-colors"
            title="Ver Libro de Ventas y Registro Auditado"
          >
            <History className="w-3.5 h-3.5 text-neutral-400" />
            <span>Libro Contable</span>
          </button>

          {/* Units Counter Badge Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 bg-[#e59b38] hover:bg-[#d48b28] text-black font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all shadow-md active:scale-95"
          >
            <span>Unidades:</span>
            <span className="bg-black/20 text-black px-2 py-0.5 rounded-full text-[11px] font-mono">
              {totalUnitsInTimeframe}
            </span>
          </button>
        </div>

        {/* Mobile Header Quick Stats & Nueva Comanda Button */}
        <div className="flex lg:hidden items-center gap-1.5">
          <button
            onClick={onOpenNuevaOrden}
            className="flex items-center gap-1 bg-[#e59b38] active:bg-[#d48b28] text-black font-extrabold px-2.5 py-1.5 rounded-full text-xs shadow-sm active:scale-95"
            title="Armar nueva comanda"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-black" />
            <span>+ Comanda</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 bg-[#1a1a1f] border border-white/10 px-2.5 py-1.5 rounded-full text-xs"
          >
            <span className="text-[10px] text-neutral-400 uppercase font-medium">{timeframeLabels[timeframe]}:</span>
            <span className="font-mono font-bold text-[#e59b38]">{totalUnitsInTimeframe}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
