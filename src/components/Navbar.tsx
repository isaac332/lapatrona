'use client';

import React from 'react';
import { TimeframeFilter } from '@/types/accounting';
import { History, DollarSign } from 'lucide-react';

interface NavbarProps {
  timeframe: TimeframeFilter;
  onTimeframeChange: (tf: TimeframeFilter) => void;
  onOpenPriceManager: () => void;
  onOpenHistory: () => void;
  totalUnitsInTimeframe: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  timeframe,
  onTimeframeChange,
  onOpenPriceManager,
  onOpenHistory,
  totalUnitsInTimeframe,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#0d0d0f]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="font-sans font-black tracking-[0.2em] text-xl sm:text-2xl text-[#f5f0eb] uppercase">
              PHILLY & FRY
            </span>
            <span className="text-[10px] tracking-widest uppercase text-[#e59b38] font-semibold">
              Sales Desk & Accounting
            </span>
          </div>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="hidden md:flex items-center bg-[#17171a] p-1 rounded-full border border-white/[0.08]">
          {(['today', 'week', 'month', 'all'] as TimeframeFilter[]).map((tf) => {
            const labels: Record<TimeframeFilter, string> = {
              today: 'Today',
              week: 'This Week',
              month: 'This Month',
              all: 'All-Time',
            };
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
                {labels[tf]}
              </button>
            );
          })}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenPriceManager}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-neutral-300 hover:text-[#f5f0eb] hover:bg-white/[0.06] border border-white/[0.08] transition-colors"
            title="Configure Selling Prices & Costs"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#e59b38]" />
            <span className="hidden sm:inline">Set Prices & Costs</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-neutral-300 hover:text-[#f5f0eb] hover:bg-white/[0.06] border border-white/[0.08] transition-colors"
            title="View Sales History & Audit Log"
          >
            <History className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Log</span>
          </button>

          {/* Golden Badge Counter Button like the 'ORDER NOW' button in the reference image */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 bg-[#e59b38] hover:bg-[#d48b28] text-black font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all shadow-md active:scale-95"
          >
            <span>Units:</span>
            <span className="bg-black/20 text-black px-2 py-0.5 rounded-full text-[11px] font-mono">
              {totalUnitsInTimeframe}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Timeframe Selector */}
      <div className="md:hidden flex items-center justify-around border-t border-white/[0.06] px-4 py-2 bg-[#121214]">
        {(['today', 'week', 'month', 'all'] as TimeframeFilter[]).map((tf) => {
          const labels: Record<TimeframeFilter, string> = {
            today: 'Today',
            week: 'Week',
            month: 'Month',
            all: 'All',
          };
          const isActive = timeframe === tf;
          return (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                isActive
                  ? 'bg-[#e59b38] text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {labels[tf]}
            </button>
          );
        })}
      </div>
    </header>
  );
};
