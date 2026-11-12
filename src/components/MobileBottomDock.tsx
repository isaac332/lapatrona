'use client';

import React, { useState } from 'react';
import { TimeframeFilter } from '@/types/accounting';
import { ModalShell } from '@/components/ModalShell';
import {
  DollarSign,
  Clock,
  Calendar,
  TrendingUp,
  BarChart3,
  Receipt,
  Wallet,
  Calculator,
  UtensilsCrossed,
  Store,
  FileSpreadsheet,
  MoreHorizontal,
  X,
  History,
  FileText,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface MobileBottomDockProps {
  timeframe: TimeframeFilter;
  onTimeframeChange: (tf: TimeframeFilter) => void;
  onOpenPriceManager: () => void;
  onOpenHistory: () => void;
  onOpenCorte: () => void;
  onOpenGastos: () => void;
  onOpenCalculadora: () => void;
  onOpenNuevaOrden?: () => void;
  onOpenHistorialCortes?: () => void;
  onOpenAtajos?: () => void;
  onOpenStockManager?: () => void;
  onOpenHistorialComandas?: () => void;
  onOpenPantallaCocina?: () => void;
  onOpenExportesContables?: () => void;
  onOpenMermas?: () => void;
  onOpenConfiguracionNegocio?: () => void;
  totalUnitsInTimeframe: number;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onScrollToProducts?: () => void;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  timeframe,
  onTimeframeChange,
  onOpenPriceManager,
  onOpenHistory,
  onOpenCorte,
  onOpenGastos,
  onOpenCalculadora,
  onOpenHistorialCortes,
  onOpenExportesContables,
  onOpenMermas,
  onOpenConfiguracionNegocio,
  totalUnitsInTimeframe,
  soundEnabled = true,
  onToggleSound,
  onScrollToProducts,
}) => {
  const [isToolsSheetOpen, setIsToolsSheetOpen] = useState(false);

  const tabs: { id: TimeframeFilter; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'today', label: 'Hoy', icon: Clock },
    { id: 'week', label: 'Semana', icon: Calendar },
    { id: 'month', label: 'Mes', icon: TrendingUp },
    { id: 'all', label: 'Total', icon: BarChart3 },
  ];

  return (
    <>
      {/* ===================================================================
          MOBILE TOOLS DRAWER (BOTTOM SHEET)
         =================================================================== */}
      {isToolsSheetOpen && (
        <ModalShell
          isOpen={isToolsSheetOpen}
          onClose={() => setIsToolsSheetOpen(false)}
          labelledBy="mobile-tools-sheet-title"
          maxWidthClass="max-w-lg"
          panelClassName="border-t border-white/[0.15]"
        >
          <div className="p-4 sm:p-5 flex flex-col min-h-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.08] mb-3 shrink-0">
              <div className="min-w-0">
                <h3 id="mobile-tools-sheet-title" className="font-serif text-base font-bold text-white">
                  Herramientas y Reportes
                </h3>
                <p className="text-xs text-neutral-400">
                  Acceso rápido a todas las funciones
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsToolsSheetOpen(false)}
                aria-label="Cerrar menú de herramientas"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Responsive Grid of Large Touch Cards */}
            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2.5 max-h-[62dvh] overflow-y-auto overscroll-contain no-scrollbar py-1">
              
              {/* Calculadora de Cambio */}
              <button
                type="button"
                onClick={() => {
                  setIsToolsSheetOpen(false);
                  onOpenCalculadora();
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] active:bg-emerald-500/10 border border-white/[0.06] active:border-emerald-500/30 text-left transition-all active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">Calculadora</span>
                  <span className="text-[10px] text-neutral-400 block truncate">Cambio en efectivo</span>
                </div>
              </button>

              {/* Libro de Ventas */}
              <button
                type="button"
                onClick={() => {
                  setIsToolsSheetOpen(false);
                  onOpenHistory();
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] active:bg-amber-500/10 border border-white/[0.06] active:border-amber-500/30 text-left transition-all active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                  <History className="w-4 h-4 text-[#e59b38]" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">Libro Ventas</span>
                  <span className="text-[10px] text-neutral-400 block truncate">{totalUnitsInTimeframe} piezas vendidas</span>
                </div>
              </button>

              {/* Precios y Costeo */}
              <button
                type="button"
                onClick={() => {
                  setIsToolsSheetOpen(false);
                  onOpenPriceManager();
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] active:bg-amber-500/10 border border-white/[0.06] active:border-amber-500/30 text-left transition-all active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 text-[#e59b38]" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">Precios / Recetas</span>
                  <span className="text-[10px] text-neutral-400 block truncate">Costeo de platillos</span>
                </div>
              </button>

              {/* Historial de Cortes Z */}
              {onOpenHistorialCortes && (
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsSheetOpen(false);
                    onOpenHistorialCortes();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] active:bg-amber-500/10 border border-white/[0.06] active:border-amber-500/30 text-left transition-all active:scale-95"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">Cortes Z</span>
                    <span className="text-[10px] text-neutral-400 block truncate">Arqueos pasados</span>
                  </div>
                </button>
              )}

              {/* Membrete y Datos del Negocio */}
              {onOpenConfiguracionNegocio && (
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsSheetOpen(false);
                    onOpenConfiguracionNegocio();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] active:bg-amber-500/10 border border-white/[0.06] active:border-amber-500/30 text-left transition-all active:scale-95"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4 text-[#e59b38]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">Membrete Ticket</span>
                    <span className="text-[10px] text-neutral-400 block truncate">Datos del negocio</span>
                  </div>
                </button>
              )}

              {/* Exportar Reporte CSV */}
              {onOpenExportesContables && (
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsSheetOpen(false);
                    onOpenExportesContables();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] active:bg-sky-500/10 border border-white/[0.06] active:border-sky-500/30 text-left transition-all active:scale-95"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">Exportar CSV</span>
                    <span className="text-[10px] text-neutral-400 block truncate">Descargar para Excel</span>
                  </div>
                </button>
              )}

              {/* Mermas */}
              {onOpenMermas && (
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsSheetOpen(false);
                    onOpenMermas();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] active:bg-rose-500/10 border border-white/[0.06] active:border-rose-500/30 text-left transition-all active:scale-95"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">Mermas</span>
                    <span className="text-[10px] text-neutral-400 block truncate">Control de pérdidas</span>
                  </div>
                </button>
              )}

              {/* Audio Toggle */}
              {onToggleSound && (
                <button
                  type="button"
                  onClick={onToggleSound}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                    soundEnabled
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/[0.03] border-white/[0.06] text-neutral-400'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">Sonido Cobro</span>
                    <span className="text-[10px] text-neutral-400 block truncate">
                      {soundEnabled ? 'Activo (chime)' : 'Silenciado'}
                    </span>
                  </div>
                </button>
              )}

            </div>
          </div>
        </ModalShell>
      )}

      {/* ===================================================================
          FIXED MOBILE BOTTOM DOCK (PRIMARY NAVIGATION)
         =================================================================== */}
      <nav
        aria-label="Navegación Móvil"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#0e0e11]/95 backdrop-blur-xl border-t border-white/[0.1] px-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))] pt-2 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.6)]"
      >
        <div className="max-w-md mx-auto space-y-1.5">
          
          {/* Level 1: Full-Width Timeframe Pills */}
          <div className="flex items-center gap-0.5 bg-[#18181c] p-1 rounded-xl border border-white/[0.06] justify-between">
            {tabs.map((tab) => {
              const isActive = timeframe === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTimeframeChange(tab.id)}
                  aria-pressed={isActive}
                  className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1.5 sm:px-2 rounded-lg transition-all duration-150 active:scale-95 touch-manipulation select-none min-h-[44px] ${
                    isActive
                      ? 'bg-[#e59b38] text-black font-extrabold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-black' : 'text-neutral-400'}`} aria-hidden="true" />
                  <span className="text-[11px] tracking-tight truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Level 2: 4 Ergonomic Thumb Actions (min-h-[48px] for WCAG 2.5.5 touch targets) */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            
            {/* 1. MOSTRADOR / MENU */}
            <button
              type="button"
              onClick={onScrollToProducts}
              aria-label="Ir al mostrador de ventas"
              className="flex flex-col items-center justify-center min-h-[48px] px-1 rounded-xl bg-white/[0.04] active:bg-white/[0.1] border border-white/[0.06] text-neutral-300 active:scale-95 touch-manipulation select-none relative overflow-hidden"
            >
              <UtensilsCrossed className="w-4 h-4 text-[#e59b38]" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase mt-1 tracking-tight leading-none">Menú</span>
              {totalUnitsInTimeframe > 0 && (
                <span className="absolute top-0.5 right-0.5 px-1.5 py-0.5 rounded-full bg-[#e59b38] text-black text-[9px] font-mono font-black shadow-sm leading-none">
                  {totalUnitsInTimeframe}
                </span>
              )}
            </button>

            {/* 2. CORTE DE CAJA */}
            <button
              type="button"
              onClick={onOpenCorte}
              aria-label="Abrir corte de caja"
              className="flex flex-col items-center justify-center min-h-[48px] px-1 rounded-xl bg-[#e59b38]/10 active:bg-[#e59b38]/25 border border-[#e59b38]/30 text-[#e59b38] active:scale-95 touch-manipulation select-none"
            >
              <Receipt className="w-4 h-4" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase mt-1 tracking-tight leading-none">Caja</span>
            </button>

            {/* 3. GASTOS E INSUMOS */}
            <button
              type="button"
              onClick={onOpenGastos}
              aria-label="Tickets de compra y gastos"
              className="flex flex-col items-center justify-center min-h-[48px] px-1 rounded-xl bg-rose-500/10 active:bg-rose-500/25 border border-rose-500/25 text-rose-400 active:scale-95 touch-manipulation select-none"
            >
              <Wallet className="w-4 h-4" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase mt-1 tracking-tight leading-none">Gastos</span>
            </button>

            {/* 4. MÁS HERRAMIENTAS (DRAWER TRIGGER) */}
            <button
              type="button"
              onClick={() => setIsToolsSheetOpen(true)}
              aria-label="Abrir más herramientas"
              className="flex flex-col items-center justify-center min-h-[48px] px-1 rounded-xl bg-white/[0.04] active:bg-white/[0.1] border border-white/[0.06] text-neutral-300 active:scale-95 touch-manipulation select-none"
            >
              <MoreHorizontal className="w-4 h-4 text-neutral-400" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase mt-1 tracking-tight leading-none">Más</span>
            </button>

          </div>

        </div>
      </nav>
    </>
  );
};
