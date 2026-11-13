'use client';

import React, { useEffect, useState, useRef, useSyncExternalStore } from 'react';
import { TimeframeFilter } from '@/types/accounting';
import {
  History,
  DollarSign,
  Receipt,
  Wallet,
  Calculator,
  ShoppingBag,
  WifiOff,
  FileText,
  Keyboard,
  Package,
  Volume2,
  VolumeX,
  ChefHat,
  Store,
  FileSpreadsheet,
  ChevronDown,
  MoreHorizontal,
  SlidersHorizontal,
} from 'lucide-react';

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
  onOpenCorte: () => void;
  onOpenGastos: () => void;
  onOpenCalculadora: () => void;
  onOpenNuevaOrden: () => void;
  onOpenHistorialCortes?: () => void;
  onOpenAtajos?: () => void;
  onOpenStockManager?: () => void;
  onOpenHistorialComandas?: () => void;
  onOpenPantallaCocina?: () => void;
  onOpenExportesContables?: () => void;
  activeKitchenOrdersCount?: number;
  onOpenConfiguracionNegocio?: () => void;
  lowStockCount?: number;
  totalUnitsInTimeframe: number;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  isAdvancedView?: boolean;
  onToggleAdvancedView?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  timeframe,
  onTimeframeChange,
  onOpenPriceManager,
  onOpenHistory,
  onOpenCorte,
  onOpenGastos,
  onOpenCalculadora,
  onOpenNuevaOrden,
  onOpenHistorialCortes,
  onOpenAtajos,
  onOpenStockManager,
  onOpenHistorialComandas,
  onOpenPantallaCocina,
  onOpenExportesContables,
  activeKitchenOrdersCount = 0,
  onOpenConfiguracionNegocio,
  lowStockCount = 0,
  totalUnitsInTimeframe,
  soundEnabled = true,
  onToggleSound,
  isAdvancedView = false,
  onToggleAdvancedView,
}) => {
  // Hide Nueva Orden, Cocina, Órdenes, Porciones for now
  const HIDE_ORDER_MODULES = true;
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getOnlineServerSnapshot);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => reg.update().catch(() => {}))
        .catch((err) => {
          console.warn('SW registration failed:', err);
        });
    }
  }, []);

  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isToolsMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isToolsMenuOpen]);

  const timeframeLabels: Record<TimeframeFilter, string> = {
    today: 'Hoy',
    week: 'Semana',
    month: 'Mes',
    all: 'Todo',
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.08] bg-[#0d0d0f]/95 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-safe sm:px-6 min-h-14 sm:min-h-16 py-1.5 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-sans font-black tracking-[0.1em] sm:tracking-[0.16em] text-sm sm:text-lg text-[#f5f0eb] uppercase leading-tight">
                LA PATRONA
              </span>
              {isOnline ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[9px] text-emerald-400 font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] text-amber-300 font-mono font-medium animate-pulse">
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  Offline
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-wider uppercase text-[#e59b38] font-semibold leading-tight">
              Los Phillys • Aguilas #1
            </span>
          </div>
        </div>

        {/* Timeframe Selector Pills (Desktop) */}
        <div className="hidden lg:flex items-center bg-[#17171a] p-1 rounded-lg border border-white/[0.08] flex-shrink-0">
          {(['today', 'week', 'month', 'all'] as TimeframeFilter[]).map((tf) => {
            const isActive = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                  isActive
                    ? 'bg-[#e59b38] text-black font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {timeframeLabels[tf]}
              </button>
            );
          })}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
          {/* NUEVA ORDEN BUTTON (hidden for now) */}
          {!HIDE_ORDER_MODULES && (
            <button
              onClick={onOpenNuevaOrden}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-[#e59b38] hover:bg-[#d48b28] text-black shadow-md transition-all active:scale-95"
              title="Armar orden para llevar"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-black" />
              <span>+ Orden</span>
            </button>
          )}

          {/* PANTALLA DE COCINA / KDS BUTTON (hidden for now) */}
          {!HIDE_ORDER_MODULES && onOpenPantallaCocina && (
            <button
              onClick={onOpenPantallaCocina}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm active:scale-95 ${
                activeKitchenOrdersCount > 0
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.06] border-white/[0.08]'
              }`}
              title="Pantalla de Cocina / Órdenes en preparación"
            >
              <ChefHat className="w-3.5 h-3.5 text-[#e59b38]" />
              <span>Cocina</span>
              {activeKitchenOrdersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center font-mono animate-pulse">
                  {activeKitchenOrdersCount}
                </span>
              )}
            </button>
          )}

          {/* ABRIR / CERRAR CAJA BUTTON */}
          <button
            onClick={onOpenCorte}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#e59b38] hover:bg-[#e59b38]/10 border border-[#e59b38]/30 transition-all active:scale-95"
            title="Abrir / Cerrar Caja y Corte"
          >
            <Receipt className="w-3.5 h-3.5 text-[#e59b38]" />
            <span>Corte</span>
          </button>

          {/* GASTOS DE CAJA BUTTON */}
          <button
            onClick={onOpenGastos}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/25 transition-all active:scale-95"
            title="Registrar salida o gasto de caja"
          >
            <Wallet className="w-3.5 h-3.5 text-rose-400" />
            <span>Gastos</span>
          </button>

          {/* Price Manager Button */}
          <button
            onClick={onOpenPriceManager}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-[#f5f0eb] hover:bg-white/[0.06] border border-white/[0.08] transition-colors"
            title="Catálogo de Precios y Costeo"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#e59b38]" />
            <span>Precios</span>
          </button>

          {/* Exportaciones Contables */}
          {onOpenExportesContables && (
            <button
              onClick={onOpenExportesContables}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 border border-sky-500/30 transition-all active:scale-95"
              title="Exportar reportes en CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
              <span>CSV</span>
            </button>
          )}

          {/* Vista Avanzada Button */}
          {onToggleAdvancedView && (
            <button
              type="button"
              onClick={onToggleAdvancedView}
              aria-pressed={isAdvancedView}
              aria-label={isAdvancedView ? 'Ocultar vista avanzada de utilidad' : 'Mostrar vista avanzada de utilidad'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
                isAdvancedView
                  ? 'bg-amber-500/20 text-[#e59b38] border-amber-500/40 shadow-sm'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.06] border-white/[0.08]'
              }`}
              title="Activar / Desactivar Vista Avanzada (Utilidad & Insights)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Avanzada</span>
            </button>
          )}

          {/* Menú Más Herramientas */}
          <div className="relative" ref={toolsMenuRef}>
            <button
              onClick={() => setIsToolsMenuOpen((prev) => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isToolsMenuOpen
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.06] border-white/[0.08]'
              }`}
              title="Más herramientas y reportes"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-neutral-400" />
              <span>Más</span>
              <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${isToolsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isToolsMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl bg-[#141418] border border-white/10 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    onOpenHistory();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                >
                  <History className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium">Libro de Ventas</span>
                    <span className="text-[10px] text-neutral-500">Historial completo y auditoría</span>
                  </div>
                </button>

                {onOpenHistorialCortes && (
                  <button
                    onClick={() => {
                      setIsToolsMenuOpen(false);
                      onOpenHistorialCortes();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">Historial de Cierres Z</span>
                      <span className="text-[10px] text-neutral-500">Arqueos y cortes anteriores</span>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsToolsMenuOpen(false);
                    onOpenCalculadora();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                >
                  <Calculator className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium">Calculadora de Cambio</span>
                    <span className="text-[10px] text-neutral-500">Cálculo rápido de vuelto</span>
                  </div>
                </button>

                {onOpenConfiguracionNegocio && (
                  <button
                    onClick={() => {
                      setIsToolsMenuOpen(false);
                      onOpenConfiguracionNegocio();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <Store className="w-4 h-4 text-[#e59b38] flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">Membrete del Negocio</span>
                      <span className="text-[10px] text-neutral-500">Personalizar ticket y datos</span>
                    </div>
                  </button>
                )}

                {onOpenAtajos && (
                  <>
                    <div className="my-1 border-t border-white/[0.06]" />
                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        onOpenAtajos();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Keyboard className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <span className="font-medium">Atajos de Teclado</span>
                      </div>
                      <kbd className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-neutral-300">?</kbd>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Separador */}
          <div className="h-4 w-px bg-white/10 mx-0.5" />

          {/* Audio Chime Toggle Button */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all active:scale-95 ${
                soundEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-white/[0.04] border-white/[0.08] text-neutral-500 hover:text-neutral-300'
              }`}
              title={soundEnabled ? 'Sonido de cobro activo' : 'Sonido silenciado'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Units Counter Badge Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 bg-[#e59b38]/15 hover:bg-[#e59b38]/25 border border-[#e59b38]/35 text-[#e59b38] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ml-0.5"
            title="Ver libro de ventas y unidades"
          >
            <span className="text-[10px] uppercase font-bold text-neutral-400">U:</span>
            <span className="font-mono font-bold text-white text-xs">{totalUnitsInTimeframe}</span>
          </button>
        </div>

        {/* Mobile Header Quick Stats */}
        <div className="flex lg:hidden items-center gap-1.5 shrink-0">
          {onToggleAdvancedView && (
            <button
              type="button"
              onClick={onToggleAdvancedView}
              aria-label={isAdvancedView ? 'Ocultar vista avanzada de utilidad' : 'Mostrar vista avanzada de utilidad'}
              aria-pressed={isAdvancedView}
              className={`flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
                isAdvancedView
                  ? 'bg-amber-500/20 text-[#e59b38] border-amber-500/40 shadow-sm'
                  : 'bg-white/[0.04] text-neutral-400 border-white/[0.08]'
              }`}
              title="Vista Avanzada (Utilidad & Insights)"
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="text-[11px] hidden xs:inline">Avanzada</span>
            </button>
          )}

          {onToggleSound && (
            <button
              type="button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Silenciar sonido de cobro' : 'Activar sonido de cobro'}
              aria-pressed={soundEnabled}
              className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-lg border flex items-center justify-center transition-all active:scale-95 ${
                soundEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/[0.04] border-white/[0.08] text-neutral-400'
              }`}
              title="Sonido de cobro"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" aria-hidden="true" /> : <VolumeX className="w-4 h-4" aria-hidden="true" />}
            </button>
          )}

          {!HIDE_ORDER_MODULES && (
            <button
              type="button"
              onClick={onOpenNuevaOrden}
              className="flex items-center justify-center gap-1 bg-[#e59b38] active:bg-[#d48b28] text-black font-extrabold px-3 min-h-[44px] rounded-lg text-xs shadow-sm active:scale-95"
              title="Armar nueva orden"
            >
              <ShoppingBag className="w-4 h-4 text-black shrink-0" aria-hidden="true" />
              <span>+ Orden</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenHistory}
            aria-label={`Ver libro de ventas (${timeframeLabels[timeframe]}: ${totalUnitsInTimeframe})`}
            className="flex items-center justify-center gap-1.5 bg-[#1a1a1f] border border-white/10 px-2.5 min-h-[44px] rounded-lg text-xs active:scale-95 transition-transform"
          >
            <span className="text-[11px] text-neutral-400 uppercase font-medium">{timeframeLabels[timeframe]}:</span>
            <span className="font-mono font-bold text-[#e59b38]">{totalUnitsInTimeframe}</span>
          </button>
        </div>
      </div>
    </header>
  );
};