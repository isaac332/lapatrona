'use client';

import React, { useState } from 'react';
import { TimeframeFilter } from '@/types/accounting';
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
  SlidersHorizontal,
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
  isAdvancedView?: boolean;
  onToggleAdvancedView?: () => void;
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
  isAdvancedView = false,
  onToggleAdvancedView,
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
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fade-in lg:hidden"
          onClick={() => setIsToolsSheetOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-t-3xl bg-[#141417] border-t border-white/[0.15] shadow-2xl p-4 sm:p-5 pb-safe animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-white">
                  Herramientas y Reportes
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Acceso rápido a todas las funciones
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsToolsSheetOpen(false)}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2-Column Grid of Large Touch Cards */}
            <div className="grid grid-cols-2 gap-2 max-h-[60dvh] overflow-y-auto no-scrollbar py-1">
              
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

              {/* Vista Avanzada Switcher in Drawer */}
              {onToggleAdvancedView && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleAdvancedView();
                  }}
                  className={`col-span-2 flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                    isAdvancedView
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-white/[0.03] border-white/[0.06] text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <SlidersHorizontal className="w-4 h-4 text-[#e59b38]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Vista Avanzada (Utilidad & Insights)</span>
                      <span className="text-[10px] text-neutral-400 block">
                        Márgenes unitarios por receta, análisis 80/20 y metas
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${
                      isAdvancedView
                        ? 'bg-[#e59b38] text-black border-[#e59b38]'
                        : 'bg-white/10 text-neutral-400 border-white/10'
                    }`}
                  >
                    {isAdvancedView ? 'ACTIVA' : 'OCULTA'}
                  </span>
                </button>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          FIXED MOBILE BOTTOM DOCK (PRIMARY NAVIGATION)
         =================================================================== */}
      <nav
        aria-label="Navegación Móvil"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#0e0e11]/95 backdrop-blur-xl border-t border-white/[0.1] px-2 pt-2 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.6)]"
      >
        <div className="max-w-md mx-auto space-y-1.5">
          
          {/* Level 1: Full-Width Timeframe Pills */}
          <div className="flex items-center bg-[#18181c] p-1 rounded-xl border border-white/[0.06] justify-between">
            {tabs.map((tab) => {
              const isActive = timeframe === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTimeframeChange(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all duration-150 active:scale-95 touch-manipulation select-none min-h-[36px] ${
                    isActive
                      ? 'bg-[#e59b38] text-black font-extrabold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-neutral-400'}`} />
                  <span className="text-[11px] tracking-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Level 2: 5 Ergonomic Thumb Actions (min-h-[44px] for WCAG 2.5.5 touch targets) */}
          <div className="grid grid-cols-5 gap-1 pt-0.5">
            
            {/* 1. MOSTRADOR / MENU */}
            <button
              type="button"
              onClick={onScrollToProducts}
              aria-label="Ir al mostrador de ventas"
              className="flex flex-col items-center justify-center min-h-[46px] rounded-xl bg-white/[0.04] active:bg-white/[0.1] border border-white/[0.06] text-neutral-300 active:scale-95 touch-manipulation select-none relative"
            >
              <UtensilsCrossed className="w-4 h-4 text-[#e59b38]" />
              <span className="text-[9px] font-bold uppercase mt-1 tracking-tight">Menú</span>
              {totalUnitsInTimeframe > 0 && (
                <span className="absolute -top-1 -right-0.5 px-1.5 py-0.2 rounded-full bg-[#e59b38] text-black text-[9px] font-mono font-black shadow-sm">
                  {totalUnitsInTimeframe}
                </span>
              )}
            </button>

            {/* 2. CORTE DE CAJA */}
            <button
              type="button"
              onClick={onOpenCorte}
              aria-label="Abrir corte de caja"
              className="flex flex-col items-center justify-center min-h-[46px] rounded-xl bg-[#e59b38]/10 active:bg-[#e59b38]/25 border border-[#e59b38]/30 text-[#e59b38] active:scale-95 touch-manipulation select-none"
            >
              <Receipt className="w-4 h-4" />
              <span className="text-[9px] font-bold uppercase mt-1 tracking-tight">Caja</span>
            </button>

            {/* 3. GASTOS E INSUMOS */}
            <button
              type="button"
              onClick={onOpenGastos}
              aria-label="Tickets de compra y gastos"
              className="flex flex-col items-center justify-center min-h-[46px] rounded-xl bg-rose-500/10 active:bg-rose-500/25 border border-rose-500/25 text-rose-400 active:scale-95 touch-manipulation select-none"
            >
              <Wallet className="w-4 h-4" />
              <span className="text-[9px] font-bold uppercase mt-1 tracking-tight">Gastos</span>
            </button>

            {/* 4. VISTA AVANZADA (UTILIDAD & INSIGHTS TOGGLE) */}
            <button
              type="button"
              onClick={onToggleAdvancedView}
              aria-label="Alternar vista avanzada de utilidad"
              className={`flex flex-col items-center justify-center min-h-[46px] rounded-xl border active:scale-95 touch-manipulation select-none transition-all ${
                isAdvancedView
                  ? 'bg-amber-500/20 border-amber-500/50 text-[#e59b38] shadow-sm shadow-amber-500/20'
                  : 'bg-white/[0.04] active:bg-white/[0.1] border-white/[0.06] text-neutral-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className={`w-4 h-4 ${isAdvancedView ? 'text-[#e59b38]' : 'text-neutral-400'}`} />
              <span className="text-[8.5px] font-bold uppercase mt-1 tracking-tight">
                {isAdvancedView ? 'Avanzada' : 'Avanzada'}
              </span>
            </button>

            {/* 5. MÁS HERRAMIENTAS (DRAWER TRIGGER) */}
            <button
              type="button"
              onClick={() => setIsToolsSheetOpen(true)}
              aria-label="Abrir más herramientas"
              className="flex flex-col items-center justify-center min-h-[46px] rounded-xl bg-white/[0.04] active:bg-white/[0.1] border border-white/[0.06] text-neutral-300 active:scale-95 touch-manipulation select-none"
            >
              <MoreHorizontal className="w-4 h-4 text-neutral-400" />
              <span className="text-[9px] font-bold uppercase mt-1 tracking-tight">Más ⋯</span>
            </button>

          </div>

        </div>
      </nav>
    </>
  );
};
