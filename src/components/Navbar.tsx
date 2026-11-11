'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { TimeframeFilter } from '@/types/accounting';
import { History, DollarSign, RotateCcw, Receipt, Wallet, Calculator, ShoppingBag, WifiOff, FileText, Keyboard, Package, Volume2, VolumeX, Maximize, Minimize, ChefHat, Store, Users } from 'lucide-react';

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
  onOpenMesas?: () => void;
  openTabsCount?: number;
  onOpenHistorialCortes?: () => void;
  onOpenAtajos?: () => void;
  onOpenStockManager?: () => void;
  onOpenHistorialComandas?: () => void;
  onOpenPantallaCocina?: () => void;
  activeKitchenOrdersCount?: number;
  onOpenConfiguracionNegocio?: () => void;
  lowStockCount?: number;
  totalUnitsInTimeframe: number;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
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
  onOpenMesas,
  openTabsCount = 0,
  onOpenHistorialCortes,
  onOpenAtajos,
  onOpenStockManager,
  onOpenHistorialComandas,
  onOpenPantallaCocina,
  activeKitchenOrdersCount = 0,
  onOpenConfiguracionNegocio,
  lowStockCount = 0,
  totalUnitsInTimeframe,
  soundEnabled = true,
  onToggleSound,
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

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (typeof window === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

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

          {/* MESAS Y CUENTAS ABIERTAS BUTTON */}
          {onOpenMesas && (
            <button
              onClick={onOpenMesas}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all shadow-sm active:scale-95 ${
                openTabsCount > 0
                  ? 'bg-[#e59b38]/15 border-[#e59b38]/40 text-[#e59b38] hover:bg-[#e59b38]/25'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.06] border-white/[0.08]'
              }`}
              title="Mesas y Cuentas Abiertas con pre-cuenta y cobro final"
            >
              <Users className="w-3.5 h-3.5 text-[#e59b38]" />
              <span>Mesas</span>
              {openTabsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#e59b38] text-black text-[9px] font-black flex items-center justify-center font-mono">
                  {openTabsCount}
                </span>
              )}
            </button>
          )}

          {/* PANTALLA DE COCINA / KDS BUTTON */}
          {onOpenPantallaCocina && (
            <button
              onClick={onOpenPantallaCocina}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all shadow-sm active:scale-95 ${
                activeKitchenOrdersCount > 0
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.06] border-white/[0.08]'
              }`}
              title="Pantalla de Cocina / KDS en vivo para comandas en parrilla"
            >
              <ChefHat className="w-3.5 h-3.5 text-[#e59b38]" />
              <span>Cocina KDS</span>
              {activeKitchenOrdersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center font-mono animate-pulse">
                  {activeKitchenOrdersCount}
                </span>
              )}
            </button>
          )}

          {/* HISTORIAL Y BUSCADOR DE COMANDAS BUTTON */}
          {onOpenHistorialComandas && (
            <button
              onClick={onOpenHistorialComandas}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-all shadow-sm active:scale-95"
              title="Buscar y reimprimir notas de consumo anteriores por folio o cliente"
            >
              <Receipt className="w-3.5 h-3.5 text-[#e59b38]" />
              <span>Comandas</span>
            </button>
          )}

          {/* CONTROL DE STOCK Y PORCIONES BUTTON */}
          {onOpenStockManager && (
            <button
              onClick={onOpenStockManager}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all shadow-sm active:scale-95 ${
                lowStockCount > 0
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 animate-pulse'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.06] border-white/[0.08]'
              }`}
              title="Control de porciones e inventario de cocina"
            >
              <Package className="w-3.5 h-3.5 text-[#e59b38]" />
              <span>Porciones</span>
              {lowStockCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center font-mono">
                  {lowStockCount}
                </span>
              )}
            </button>
          )}

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

          {/* Business Profile & Ticket Header Settings */}
          {onOpenConfiguracionNegocio && (
            <button
              onClick={onOpenConfiguracionNegocio}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-neutral-300 hover:text-[#f5f0eb] hover:bg-white/[0.06] border border-white/[0.08] transition-colors"
              title="Personalizar membrete de tickets, datos del negocio y mensaje al pie"
            >
              <Store className="w-3.5 h-3.5 text-[#e59b38]" />
              <span>Membrete</span>
            </button>
          )}

          {/* History / Audit Log */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-neutral-300 hover:text-[#f5f0eb] hover:bg-white/[0.06] border border-white/[0.08] transition-colors"
            title="Ver Libro de Ventas y Registro Auditado"
          >
            <History className="w-3.5 h-3.5 text-neutral-400" />
            <span>Libro Contable</span>
          </button>

          {/* POS Keyboard Shortcuts Guide Button */}
          {onOpenAtajos && (
            <button
              onClick={onOpenAtajos}
              className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-all shadow-sm active:scale-95"
              title="Atajos de teclado POS (Presiona ?)"
            >
              <Keyboard className="w-3.5 h-3.5 text-[#e59b38]" />
              <span className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-neutral-300">?</span>
            </button>
          )}

          {/* Audio Chime Toggle Button */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-full border transition-all active:scale-95 ${
                soundEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-white/[0.04] border-white/[0.08] text-neutral-500 hover:text-neutral-300'
              }`}
              title={soundEnabled ? 'Sonido de cobro activo (Clic para silenciar)' : 'Sonido silenciado (Clic para activar)'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Fullscreen Kiosk Mode Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-all active:scale-95"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa / Modo Terminal POS'}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
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
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className={`p-1.5 rounded-full border transition-all ${
                soundEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/[0.04] border-white/[0.08] text-neutral-500'
              }`}
              title="Sonido de cobro"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-neutral-400"
            title="Pantalla completa"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>

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
