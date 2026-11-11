'use client';

import React from 'react';
import { TimeframeFilter } from '@/types/accounting';
import { DollarSign, RotateCcw, Clock, Calendar, TrendingUp, BarChart3, Receipt, Wallet, Calculator, ShoppingBag } from 'lucide-react';

interface MobileBottomDockProps {
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

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  timeframe,
  onTimeframeChange,
  onOpenPriceManager,
  onOpenHistory,
  onOpenZeroOut,
  onOpenCorte,
  onOpenGastos,
  onOpenCalculadora,
  onOpenNuevaOrden,
  totalUnitsInTimeframe,
}) => {
  const tabs: { id: TimeframeFilter; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'today', label: 'Hoy', icon: Clock },
    { id: 'week', label: 'Semana', icon: Calendar },
    { id: 'month', label: 'Mes', icon: TrendingUp },
    { id: 'all', label: 'Total', icon: BarChart3 },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#121215]/95 backdrop-blur-xl border-t border-white/[0.1] px-2 pt-2 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between gap-1 max-w-md mx-auto">
        
        {/* Timeframe Selector Pills (Thumb friendly) */}
        <div className="flex items-center bg-[#1b1b20] p-1 rounded-xl border border-white/[0.06] flex-1 justify-between">
          {tabs.map((tab) => {
            const isActive = timeframe === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTimeframeChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-all duration-150 active:scale-95 touch-manipulation select-none ${
                  isActive
                    ? 'bg-[#e59b38] text-black font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-neutral-400'}`} />
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Vertical divider */}
        <div className="w-[1px] h-8 bg-white/[0.08] mx-1 shrink-0" />

        {/* Action Icon Buttons for Thumb */}
        <div className="flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={onOpenNuevaOrden}
            aria-label="Armar nueva comanda"
            title="Armar Comanda / Orden"
            className="w-10 h-10 rounded-xl bg-[#e59b38] active:bg-[#d48b28] text-black font-extrabold flex flex-col items-center justify-center shadow-md active:scale-95 touch-manipulation select-none shrink-0"
          >
            <ShoppingBag className="w-4 h-4 text-black" />
            <span className="text-[7.5px] font-black uppercase mt-0.5">+Orden</span>
          </button>

          <button
            onClick={onOpenCorte}
            aria-label="Corte de caja"
            title="Ticket de Corte de Caja"
            className="w-10 h-10 rounded-xl bg-[#e59b38]/15 active:bg-[#e59b38]/30 border border-[#e59b38]/30 flex flex-col items-center justify-center text-[#e59b38] active:scale-95 touch-manipulation select-none shrink-0"
          >
            <Receipt className="w-4 h-4" />
            <span className="text-[8px] font-bold uppercase mt-0.5">Corte</span>
          </button>

          <button
            onClick={onOpenGastos}
            aria-label="Gastos de caja"
            title="Gastos y Salidas de Caja"
            className="w-10 h-10 rounded-xl bg-rose-500/15 active:bg-rose-500/30 border border-rose-500/30 flex flex-col items-center justify-center text-rose-400 active:scale-95 touch-manipulation select-none shrink-0"
          >
            <Wallet className="w-4 h-4" />
            <span className="text-[8px] font-bold uppercase mt-0.5">Gastos</span>
          </button>

          <button
            onClick={onOpenCalculadora}
            aria-label="Calculadora de cambio"
            title="Calcular Cambio"
            className="w-10 h-10 rounded-xl bg-emerald-500/15 active:bg-emerald-500/30 border border-emerald-500/30 flex flex-col items-center justify-center text-emerald-400 active:scale-95 touch-manipulation select-none shrink-0"
          >
            <Calculator className="w-4 h-4" />
            <span className="text-[8px] font-bold uppercase mt-0.5">Cambio</span>
          </button>

          <button
            onClick={onOpenZeroOut}
            aria-label="Poner en ceros"
            title="Poner en Ceros"
            className="w-10 h-10 rounded-xl bg-red-500/10 active:bg-red-500/25 border border-red-500/25 flex flex-col items-center justify-center text-red-400 active:scale-95 touch-manipulation select-none shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[8px] font-bold uppercase mt-0.5">Ceros</span>
          </button>

          <button
            onClick={onOpenPriceManager}
            aria-label="Gestionar precios"
            title="Precios y Costos"
            className="w-10 h-10 rounded-xl bg-white/[0.04] active:bg-white/[0.1] border border-white/[0.08] flex flex-col items-center justify-center text-neutral-300 active:scale-95 touch-manipulation select-none shrink-0"
          >
            <DollarSign className="w-4 h-4 text-[#e59b38]" />
            <span className="text-[8px] uppercase mt-0.5">Costos</span>
          </button>

          <button
            onClick={onOpenHistory}
            aria-label="Ver registro de ventas"
            title="Libro Contable"
            className="h-10 px-2.5 rounded-xl bg-[#e59b38] active:bg-[#d48b28] text-black font-extrabold flex flex-col items-center justify-center shadow-md active:scale-95 touch-manipulation select-none shrink-0"
          >
            <span className="text-[11px] font-mono leading-none">{totalUnitsInTimeframe}</span>
            <span className="text-[8px] uppercase tracking-wider leading-none mt-0.5">Uds</span>
          </button>
        </div>

      </div>
    </div>
  );
};
