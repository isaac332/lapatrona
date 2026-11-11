'use client';

import React, { useState } from 'react';
import { ExpenseRecord, TimeframeFilter } from '@/types/accounting';
import { X, Plus, Trash2, Wallet, ArrowDownRight } from 'lucide-react';

interface GastosModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: ExpenseRecord[];
  timeframe: TimeframeFilter;
  onAddExpense: (description: string, amount: number, category: string) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const GastosModal: React.FC<GastosModalProps> = ({
  isOpen,
  onClose,
  expenses,
  timeframe,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('insumos');

  if (!isOpen) return null;

  const totalGastos = expenses.reduce((sum, e) => sum + e.amount, 0);

  const presets = [
    { label: 'Hielo', cat: 'insumos' },
    { label: 'Verdura / Mercado', cat: 'mercado' },
    { label: 'Refrescos / Bebidas', cat: 'insumos' },
    { label: 'Desechables / Servilletas', cat: 'insumos' },
    { label: 'Gas / Combustible', cat: 'servicios' },
    { label: 'Otro gasto', cat: 'otro' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddExpense(description.trim(), parsedAmount, category);
    setDescription('');
    setAmount('');
  };

  const timeframeLabels: Record<TimeframeFilter, string> = {
    today: 'Gastos de Hoy',
    week: 'Gastos de la Semana',
    month: 'Gastos del Mes',
    all: 'Total de Gastos Históricos',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#19191d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                Gastos Menores y Salidas de Caja
              </h2>
              <p className="text-[11px] text-neutral-400">
                Registra compras de emergencia e insumos que descuentan efectivo del cajón
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

        {/* Quick Add Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 border-b border-white/[0.06] bg-[#17171a] space-y-3">
          <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            + Registrar Salida de Efectivo
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setDescription(preset.label);
                  setCategory(preset.cat);
                }}
                className="px-2.5 py-1 text-[11px] rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 hover:text-white transition-colors touch-manipulation"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-7">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Concepto (ej. 2 bolsas de hielo)"
                className="w-full bg-[#101013] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-400"
              />
            </div>
            <div className="sm:col-span-3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">$</span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Monto"
                className="w-full bg-[#101013] border border-white/10 rounded-xl pl-7 pr-3 py-2.5 text-xs text-right font-mono font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-rose-400"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={!description.trim() || !amount}
                className="w-full h-full min-h-[40px] flex items-center justify-center gap-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-40 transition-all active:scale-95 touch-manipulation"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Salida</span>
              </button>
            </div>
          </div>
        </form>

        {/* Total Expense Banner */}
        <div className="px-6 py-3 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-rose-300 font-semibold">
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
            <span>{timeframeLabels[timeframe]} ({expenses.length} registros)</span>
          </div>
          <div className="text-base font-mono font-extrabold text-rose-400">
            -${totalGastos.toFixed(2)} MXN
          </div>
        </div>

        {/* Expenses List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {expenses.length === 0 ? (
            <div className="text-center py-10 text-neutral-500">
              <p className="text-xs font-medium">Sin salidas de dinero registradas en este periodo.</p>
              <p className="text-[11px] mt-1">Usa el formulario arriba cuando se compre algo con dinero de la caja.</p>
            </div>
          ) : (
            expenses.map((expense) => {
              const formattedTime = new Date(expense.timestamp).toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const formattedDate = new Date(expense.timestamp).toLocaleDateString('es-MX', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center text-xs font-mono font-bold">
                      -$
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{expense.description}</div>
                      <div className="text-[10px] text-neutral-500">
                        {formattedDate} a las {formattedTime} • Categoría: {expense.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-rose-400">
                      -${expense.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      title="Eliminar este gasto"
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#19191d] flex items-center justify-between">
          <div className="text-[11px] text-neutral-400">
            Este monto se descuenta automáticamente en el <strong>Ticket de Corte de Caja</strong>.
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#e59b38] hover:bg-[#d48b28] text-black font-bold text-xs uppercase tracking-wider transition-colors touch-manipulation"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
};
