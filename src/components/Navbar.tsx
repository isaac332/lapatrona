'use client';

import React from 'react';
import { TimeframeFilter } from '@/types/accounting';
import { History, DollarSign, RotateCcw } from 'lucide-react';

interface NavbarProps {
  timeframe: TimeframeFilter;
  onTimeframeChange: (tf: TimeframeFilter) => void;
  onOpenPriceManager: () => void;
  onOpenHistory: () => void;
  onOpenZeroOut: () => void;
  totalUnitsInTimeframe: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  timeframe,
  onTimeframeChange,
  onOpenPriceManager,
  onOpenHistory,
  onOpenZeroOut,
  totalUnitsInTimeframe,
}) => {
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
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse lg:hidden" />
          <div className="flex flex-col">
            <span className="font-sans font-black tracking-[0.15em] sm:tracking-[0.2em] text-base sm:text-2xl text-[#f5f0eb] uppercase leading-tight">
              PHILLY & FRY
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-widest uppercase text-[#e59b38] font-semibold leading-tight">
              Mostrador POS • Ventas
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

        {/* Mobile Header Quick Stats / Pill */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 bg-[#1a1a1f] border border-white/10 px-3 py-1.5 rounded-full text-xs"
          >
            <span className="text-[10px] text-neutral-400 uppercase font-medium">{timeframeLabels[timeframe]}:</span>
            <span className="font-mono font-bold text-[#e59b38]">{totalUnitsInTimeframe} uds</span>
          </button>
        </div>
      </div>
    </header>
  );
};
