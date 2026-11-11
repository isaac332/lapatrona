'use client';

import React from 'react';
import Image from 'next/image';
import { TimeframeFilter } from '@/types/accounting';
import { ArrowDown, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  timeframe: TimeframeFilter;
  onScrollToProducts: () => void;
  onOpenHistory: () => void;
  todayCount: number;
  todayRevenue: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  timeframe,
  onScrollToProducts,
  onOpenHistory,
  todayCount,
  todayRevenue,
}) => {
  const timeframeLabel =
    timeframe === 'today'
      ? 'Today'
      : timeframe === 'week'
      ? 'This Week'
      : timeframe === 'month'
      ? 'This Month'
      : 'All-Time';

  return (
    <section className="relative w-full border-b border-white/[0.08] overflow-hidden bg-[#0d0d0f] bg-vertical-grid py-12 md:py-16">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#e59b38]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Bold Editorial Typography matching reference */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] w-fit">
              <Sparkles className="w-3.5 h-3.5 text-[#e59b38]" />
              <span className="text-xs uppercase tracking-widest text-neutral-300 font-medium">
                Live Sales Tracker • {timeframeLabel}
              </span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#f5f0eb] leading-[1.05] uppercase">
              CRAVE THE <br />
              <span className="text-[#f5f0eb]">CRAFT.</span>
            </h1>

            <p className="text-neutral-400 text-base sm:text-lg max-w-xl font-light leading-relaxed">
              The ultimate cheesesteak & fries counter. Monitor real-time daily, weekly, 
              and monthly unit sales for sandwiches, quesadillas, steak frites, and cheese fries.
            </p>

            {/* Action buttons styled identically to reference image */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onScrollToProducts}
                className="bg-[#e59b38] hover:bg-[#d48b28] text-black font-bold text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 rounded-full shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <span>Counter Desk</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenHistory}
                className="border border-[#e59b38]/50 hover:border-[#e59b38] bg-transparent hover:bg-white/[0.03] text-[#f5f0eb] font-semibold text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 rounded-full transition-all duration-200"
              >
                View Sales Log
              </button>
            </div>

            {/* Quick Live Highlight */}
            <div className="pt-4 flex items-center gap-6 text-xs text-neutral-400 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Service Active</span>
              </div>
              <div>
                Units Logged Today:{' '}
                <strong className="text-white font-mono text-sm">{todayCount}</strong>
              </div>
              {todayRevenue > 0 && (
                <div>
                  Est. Sales:{' '}
                  <strong className="text-[#e59b38] font-mono text-sm">
                    ${todayRevenue.toFixed(2)}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Hero Food Photography like the reference */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.12] shadow-2xl bg-neutral-900 group">
              <Image
                src="https://images.unsplash.com/photo-1549611016-3a70d82b5040?auto=format&fit=crop&w=1200&q=85"
                alt="Philly Cheesesteak with hot fries"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Signature Philly Cheesesteak</span>
                  <span className="text-[11px] text-[#e59b38]">Ribeye, Provolone & Hand-Cut Fries</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-full font-mono text-white/80">
                  Philly & Fry
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Section Ticker Footer from Reference Image */}
        <div className="mt-12 pt-6 border-t border-white/[0.08] flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-neutral-400">
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 font-medium">
            <span className="hover:text-white transition-colors cursor-pointer" onClick={onScrollToProducts}>
              <strong className="text-white">01</strong> / Sandwiches
            </span>
            <span className="text-neutral-600">•</span>
            <span className="hover:text-white transition-colors cursor-pointer" onClick={onScrollToProducts}>
              <strong className="text-white">02</strong> / Quesadillas
            </span>
            <span className="text-neutral-600">•</span>
            <span className="hover:text-white transition-colors cursor-pointer" onClick={onScrollToProducts}>
              <strong className="text-white">03</strong> / Steak Frites
            </span>
            <span className="text-neutral-600">•</span>
            <span className="hover:text-white transition-colors cursor-pointer" onClick={onScrollToProducts}>
              <strong className="text-white">04</strong> / Fries & Cheese
            </span>
          </div>

          {/* Reference pill indicator */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-5 h-9 rounded-full border border-neutral-700 flex items-start justify-center p-1">
              <div className="w-1.5 h-2.5 bg-[#e59b38] rounded-full animate-bounce" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
