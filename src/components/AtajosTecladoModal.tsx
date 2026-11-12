'use client';

import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import { ProductItem } from '@/types/accounting';
import { ModalShell } from '@/components/ModalShell';

interface AtajosTecladoModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
}

export const AtajosTecladoModal: React.FC<AtajosTecladoModalProps> = ({
  isOpen,
  onClose,
  products,
}) => {
  if (!isOpen) return null;

  const generalShortcuts = [
    { key: 'C', action: 'Abrir y Cerrar Caja / Corte' },
    { key: 'G', action: 'Registrar Gasto o Salida de Caja' },
    { key: 'W', action: 'Registrar Merma de Cocina' },
    { key: 'K', action: 'Abrir Calculadora Rápida de Cambio' },
    { key: 'T', action: 'Ver Historial de Cierres de Caja' },
    { key: 'H', action: 'Ver Libro de Ventas e Historial' },
    { key: 'E', action: 'Exportar Reportes en CSV' },
    { key: 'P', action: 'Abrir Gestor de Precios y Costos' },
    { key: 'M', action: 'Configurar Membrete y Datos del Negocio' },
    { key: '?', action: 'Abrir / Cerrar esta guía de atajos' },
    { key: 'Esc', action: 'Cerrar cualquier ventana activa' },
  ];

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="atajos-modal-title"
      maxWidthClass="max-w-xl"
      maxHeightClass="max-h-[90dvh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-4 sm:p-5 border-b border-white/[0.08] bg-[#19191d] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#e59b38]/15 border border-[#e59b38]/30 flex items-center justify-center shrink-0" aria-hidden="true">
            <Keyboard className="w-5 h-5 text-[#e59b38]" />
          </div>
          <div className="min-w-0">
            <h2 id="atajos-modal-title" className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
              Atajos de Teclado POS
            </h2>
            <p className="text-[11px] text-neutral-400">
              Operación rápida para mostrador y caja
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar guía de atajos"
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors shrink-0 active:scale-95"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Shortcuts List Body */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6">
        
        <div className="space-y-2.5">
          <div className="text-[11px] uppercase font-bold text-[#e59b38] tracking-wider flex items-center gap-1.5">
            <Command className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Venta Rápida de Menú (+1)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {products.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/40 border border-white/[0.06]"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white">{p.name}</div>
                  <div className="text-[11px] text-neutral-400 font-mono">(${p.defaultPrice})</div>
                </div>
                <kbd className="px-2.5 py-1 text-xs font-mono font-black text-black bg-[#e59b38] rounded-lg shrink-0 shadow-sm">
                  {idx + 1}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
          <div className="text-[11px] uppercase font-bold text-neutral-300 tracking-wider">
            Navegación y Operaciones de Caja
          </div>
          <div className="space-y-1.5">
            {generalShortcuts.map((sc, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
              >
                <span className="text-xs text-neutral-300 min-w-0">{sc.action}</span>
                <kbd className="px-2.5 py-1 text-xs font-mono font-bold text-[#f5f0eb] bg-white/[0.08] border border-white/[0.15] rounded-md shadow-sm shrink-0">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="p-4 border-t border-white/[0.08] bg-[#19191d] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <span className="text-[11px] text-neutral-400">
          Presiona <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white/10 rounded">?</kbd> en cualquier momento para abrir esta guía.
        </span>
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto px-5 min-h-[44px] rounded-xl bg-[#e59b38] text-black font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
        >
          Entendido
        </button>
      </div>
    </ModalShell>
  );
};