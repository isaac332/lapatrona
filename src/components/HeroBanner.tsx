'use client';

import React from 'react';
import Image from 'next/image';
import { TimeframeFilter } from '@/types/accounting';
import { ArrowDown, Sparkles, RotateCcw } from 'lucide-react';

interface HeroBannerProps {
  timeframe: TimeframeFilter;
  onScrollToProducts: () => void;
  onOpenHistory: () => void;
  onOpenZeroOut: () => void;
  todayCount: number;
  todayRevenue: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  timeframe,
  onScrollToProducts,
  onOpenHistory,
  onOpenZeroOut,
  todayCount,
  todayRevenue,
}) => {
  const timeframeLabel =
    timeframe === 'today'
      ? 'Hoy'
      : timeframe === 'week'
      ? 'Esta Semana'
      : timeframe === 'month'
      ? 'Este Mes'
      : 'Histórico Total';

  return (
    <section className="relative w-full border-b border-white/[0.08] overflow-hidden bg-[#0d0d0f] bg-vertical-grid py-6 sm:py-12 md:py-16">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-[#e59b38]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* Left Column: Bold Editorial Typography */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] w-fit">
              <Sparkles className="w-3.5 h-3.5 text-[#e59b38]" />
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-neutral-300 font-medium">
                Contador en Vivo • {timeframeLabel}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#f5f0eb] leading-[1.1] uppercase">
              EL AUTÉNTICO <br />
              <span className="text-[#e59b38]">PHILLY & FRY.</span>
            </h1>

            <p className="text-neutral-400 text-sm sm:text-base max-w-xl font-light leading-relaxed hidden sm:block">
              El mostrador definitivo de ribeye cheesesteaks y papas fritas artesanales. Monitorea en tiempo real el corte diario, ventas de la semana y rendimiento mensual con control de precios al vuelo.
            </p>

            {/* Action buttons styled to Philly & Fry aesthetics */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
              <button
                onClick={onScrollToProducts}
                className="flex-1 sm:flex-initial bg-[#e59b38] active:bg-[#d48b28] hover:bg-[#d48b28] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider px-5 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-lg transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 touch-manipulation select-none"
              >
                <span>Ir al Mostrador</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenHistory}
                className="flex-1 sm:flex-initial border border-[#e59b38]/50 active:border-[#e59b38] hover:border-[#e59b38] bg-transparent active:bg-white/[0.05] hover:bg-white/[0.03] text-[#f5f0eb] font-semibold text-xs sm:text-sm uppercase tracking-wider px-5 sm:px-7 py-3 sm:py-3.5 rounded-full transition-all duration-150 active:scale-95 text-center touch-manipulation select-none"
              >
                Ver Registro
              </button>

              <button
                onClick={onOpenZeroOut}
                className="border border-red-500/30 active:border-red-500/60 hover:border-red-500/60 bg-red-500/10 active:bg-red-500/25 text-red-300 font-semibold text-xs sm:text-sm uppercase tracking-wider px-4 sm:px-5 py-3 sm:py-3.5 rounded-full transition-all duration-150 active:scale-95 flex items-center gap-1.5 touch-manipulation select-none"
                title="Poner en ceros toda la contabilidad"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                <span className="inline">Poner en Ceros</span>
              </button>
            </div>

            {/* Quick Live Highlight */}
            <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-neutral-400 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-neutral-300 font-medium text-[11px] sm:text-xs">Servicio Activo</span>
              </div>
              <div className="text-[11px] sm:text-xs">
                Piezas Hoy:{' '}
                <strong className="text-white font-mono text-xs sm:text-sm">{todayCount}</strong>
              </div>
              {todayRevenue > 0 && (
                <div className="text-[11px] sm:text-xs">
                  Venta Estimada:{' '}
                  <strong className="text-[#e59b38] font-mono text-xs sm:text-sm">
                    ${todayRevenue.toFixed(2)}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Hero Food Photography */}
          <div className="lg:col-span-5 relative hidden sm:block">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.12] shadow-2xl bg-neutral-900 group">
              <Image
                src="https://images.unsplash.com/photo-1549611016-3a70d82b5040?auto=format&fit=crop&w=1200&q=85"
                alt="Philly Cheesesteak con papas calientes"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Philly Cheesesteak Artesanal</span>
                  <span className="text-[11px] text-[#e59b38]">Ribeye, Provolone y Papas al Momento</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-full font-mono text-white/80">
                  Philly & Fry
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Section Ticker Footer - Horizontally scrollable on mobile */}
        <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-white/[0.08] flex items-center justify-between text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-neutral-400">
          <div className="flex items-center gap-3 sm:gap-8 font-medium overflow-x-auto no-scrollbar whitespace-nowrap py-1">
            <span className="hover:text-white transition-colors cursor-pointer shrink-0" onClick={onScrollToProducts}>
              <strong className="text-white">01</strong> / Sandwiches
            </span>
            <span className="text-neutral-600 shrink-0">•</span>
            <span className="hover:text-white transition-colors cursor-pointer shrink-0" onClick={onScrollToProducts}>
              <strong className="text-white">02</strong> / Quesadillas
            </span>
            <span className="text-neutral-600 shrink-0">•</span>
            <span className="hover:text-white transition-colors cursor-pointer shrink-0" onClick={onScrollToProducts}>
              <strong className="text-white">03</strong> / Steak Frites
            </span>
            <span className="text-neutral-600 shrink-0">•</span>
            <span className="hover:text-white transition-colors cursor-pointer shrink-0" onClick={onScrollToProducts}>
              <strong className="text-white">04</strong> / Papas y Queso
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="w-5 h-9 rounded-full border border-neutral-700 flex items-start justify-center p-1">
              <div className="w-1.5 h-2.5 bg-[#e59b38] rounded-full animate-bounce" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
