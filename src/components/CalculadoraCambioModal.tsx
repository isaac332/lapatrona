'use client';

import React, { useState } from 'react';
import { X, Calculator, RotateCcw } from 'lucide-react';
import { ModalShell } from '@/components/ModalShell';

interface CalculadoraCambioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculadoraCambioModal: React.FC<CalculadoraCambioModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [totalCuenta, setTotalCuenta] = useState('');
  const [pagaCon, setPagaCon] = useState('');

  if (!isOpen) return null;

  const total = parseFloat(totalCuenta) || 0;
  const recibido = parseFloat(pagaCon) || 0;
  const cambio = recibido - total;

  const billetes = [50, 100, 200, 500, 1000];

  const handleBillClick = (valor: number) => {
    setPagaCon(valor.toString());
  };

  const handleReset = () => {
    setTotalCuenta('');
    setPagaCon('');
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="calc-modal-title"
      maxWidthClass="max-w-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-4 sm:p-5 border-b border-white/[0.08] bg-[#19191d] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0" aria-hidden="true">
            <Calculator className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h2 id="calc-modal-title" className="font-serif text-lg font-bold text-white leading-tight">
              Calculadora de Cambio
            </h2>
            <p className="text-[11px] text-neutral-400">
              Cobro rápido en efectivo en mostrador
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar calculadora de cambio"
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors shrink-0 active:scale-95"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
        
        {/* Input 1: Total de la Cuenta */}
        <div>
          <label htmlFor="calc-total-input" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
            Total de la Orden ($ MXN)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-bold">$</span>
            <input
              id="calc-total-input"
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={totalCuenta}
              onChange={(e) => setTotalCuenta(e.target.value)}
              placeholder="0.00"
              className="w-full min-h-[48px] bg-[#1b1b20] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-lg font-mono font-bold text-white placeholder-neutral-600 focus:outline-none focus:border-[#e59b38]"
            />
          </div>
        </div>

        {/* Input 2: Paga con */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label htmlFor="calc-paid-input" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              El Cliente Paga Con ($)
            </label>
            <span className="text-[11px] text-neutral-400 shrink-0">Toca un billete:</span>
          </div>

          {/* Quick Bill Buttons */}
          <div className="grid grid-cols-3 min-[360px]:grid-cols-5 gap-1.5 mb-2">
            {billetes.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => handleBillClick(b)}
                className="min-h-[44px] py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs active:scale-95 transition-all touch-manipulation"
              >
                ${b}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-bold">$</span>
            <input
              id="calc-paid-input"
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={pagaCon}
              onChange={(e) => setPagaCon(e.target.value)}
              placeholder="0.00"
              className="w-full min-h-[48px] bg-[#1b1b20] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-lg font-mono font-bold text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        {/* Change Display Card */}
        <div className="p-4 rounded-2xl bg-[#0d0d0f] border border-white/10 text-center space-y-1">
          <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-semibold">
            Cambio a Entregar
          </span>
          {recibido > 0 && total > 0 ? (
            cambio >= 0 ? (
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-emerald-400 animate-fade-in tabular-nums">
                ${cambio.toFixed(2)} MXN
              </div>
            ) : (
              <div className="font-mono text-xl sm:text-2xl font-bold text-rose-400 animate-fade-in tabular-nums">
                Faltan: ${Math.abs(cambio).toFixed(2)}
              </div>
            )
          ) : (
            <div className="font-mono text-3xl font-extrabold text-neutral-600 tabular-nums">
              $0.00
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.08] bg-[#19191d] flex items-center justify-between gap-2 shrink-0">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Limpiar</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="px-6 min-h-[44px] rounded-full bg-[#e59b38] hover:bg-[#d48b28] text-black font-bold text-xs uppercase tracking-wider transition-colors touch-manipulation active:scale-95"
        >
          Cerrar
        </button>
      </div>
    </ModalShell>
  );
};
