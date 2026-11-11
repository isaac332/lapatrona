'use client';

import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import { ProductItem } from '@/types/accounting';

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
    { key: 'Espacio / O', action: 'Abrir Armador de Comanda / Nueva Orden' },
    { key: 'U', action: 'Mesas y Cuentas Abiertas (Pre-cuenta y Cobro)' },
    { key: 'D', action: 'Pantalla de Cocina / KDS en Vivo' },
    { key: 'B', action: 'Buscar y Reimprimir Comandas Anteriores' },
    { key: 'S', action: 'Control de Porciones y Stock de Cocina' },
    { key: 'C', action: 'Abrir Corte de Caja y Arqueo de Efectivo' },
    { key: 'G', action: 'Registrar Gasto o Salida de Cajón' },
    { key: 'W', action: 'Registrar Merma o Desperdicio de Cocina' },
    { key: 'K', action: 'Abrir Calculadora Rápida de Cambio' },
    { key: 'T', action: 'Ver Turnos Archivados y Reimprimir Tickets' },
    { key: 'H', action: 'Ver Libro de Ventas e Historial' },
    { key: 'E', action: 'Centro de Exportaciones Contables e Informes SAT' },
    { key: 'P', action: 'Abrir Gestor de Precios y Costeo de Recetas' },
    { key: 'M', action: 'Configurar Membrete y Datos del Negocio' },
    { key: '?', action: 'Abrir / Cerrar esta guía de atajos' },
    { key: 'Esc', action: 'Cerrar cualquier ventana o modal activo' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden pb-safe sm:pb-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#19191d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e59b38]/15 border border-[#e59b38]/30 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-[#e59b38]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                Atajos de Teclado POS
              </h2>
              <p className="text-[11px] text-neutral-400">
                Operación a velocidad ultra-rápida para mostrador y caja
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Section 1: Quick product add hotkeys */}
          <div className="space-y-2.5">
            <div className="text-[11px] uppercase font-bold text-[#e59b38] tracking-wider flex items-center gap-1.5">
              <Command className="w-3.5 h-3.5" />
              <span>Venta Rápida de Platillos (+1)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {products.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/[0.06]"
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                    <div className="text-[10px] text-neutral-400 truncate">({p.variantLabel})</div>
                  </div>
                  <kbd className="px-2 py-1 text-xs font-mono font-black text-black bg-[#e59b38] rounded-lg shrink-0 shadow-sm">
                    {idx + 1}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: General Navigation & Modals */}
          <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
            <div className="text-[11px] uppercase font-bold text-neutral-300 tracking-wider">
              Navegación y Operaciones de Caja
            </div>
            <div className="space-y-1.5">
              {generalShortcuts.map((sc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                >
                  <span className="text-xs text-neutral-300">{sc.action}</span>
                  <kbd className="px-2.5 py-1 text-xs font-mono font-bold text-[#f5f0eb] bg-white/[0.08] border border-white/[0.15] rounded-md shadow-sm">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#19191d] flex items-center justify-between">
          <span className="text-[11px] text-neutral-400">
            Tip: Presiona <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white/10 rounded">?</kbd> en cualquier momento para abrir esta guía.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#e59b38] text-black font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
