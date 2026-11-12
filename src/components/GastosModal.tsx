'use client';

import React, { useState, useMemo } from 'react';
import { ExpenseRecord, TimeframeFilter, PaymentMethod } from '@/types/accounting';
import { calculateExpensesAnalytics, getCalculatedExpenseAmount } from '@/utils/accountingCalculations';
import { calculateTicketItemSubtotal, calculateTicketItemSavings } from '@/data/purchaseTicketsData';
import { VERIFIED_PROVIDERS } from '@/data/initialProviders';
import {
  X,
  Plus,
  Trash2,
  Wallet,
  Receipt,
  Store,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Banknote,
  Scale,
  Tag,
} from 'lucide-react';

interface GastosModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses?: ExpenseRecord[];
  timeframe: TimeframeFilter;
  onAddExpense: (description: string, amount: number, category: string, paymentMethod?: PaymentMethod, storeName?: string) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const GastosModal: React.FC<GastosModalProps> = ({
  isOpen,
  onClose,
  expenses = [],
  timeframe,
  onAddExpense,
  onDeleteExpense,
}) => {
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const [activeTab, setActiveTab] = useState<'tickets' | 'insumos' | 'nuevo'>('tickets');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(safeExpenses[0]?.id || null);

  // Form states for adding a new ticket/expense
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('verduras_abarrotes');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');

  const analytics = useMemo(() => calculateExpensesAnalytics(safeExpenses), [safeExpenses]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddExpense(
      storeName.trim() ? `${storeName.trim()}: ${description.trim()}` : description.trim(),
      parsedAmount,
      category,
      paymentMethod,
      storeName.trim() || undefined
    );
    setStoreName('');
    setDescription('');
    setAmount('');
    setActiveTab('tickets');
  };

  const timeframeLabels: Record<TimeframeFilter, string> = {
    today: 'Tickets y Gastos de Hoy',
    week: 'Tickets y Gastos de la Semana',
    month: 'Tickets y Gastos del Mes',
    all: 'Total de Tickets y Compras (Histórico)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden pb-safe sm:pb-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#19191d] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                Tickets de Compra e Insumos ({safeExpenses.length})
              </h2>
              <p className="text-[11px] text-neutral-400">
                {timeframeLabels[timeframe]} • Calculado artículo por artículo
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

        {/* Calculated Financial Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 sm:px-6 py-3 bg-[#111114] border-b border-white/[0.06] shrink-0">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-[10px] uppercase font-bold text-rose-300 block">Total Tickets</span>
            <span className="font-mono text-base sm:text-lg font-extrabold text-rose-400">
              -${analytics.totalExpenses.toFixed(2)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Pagado en Efectivo</span>
            <span className="font-mono text-base sm:text-lg font-bold text-emerald-400">
              ${analytics.cashExpenses.toFixed(2)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <span className="text-[10px] uppercase font-bold text-sky-300 block">Pagado con Tarjeta</span>
            <span className="font-mono text-base sm:text-lg font-bold text-sky-400">
              ${analytics.cardExpenses.toFixed(2)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-[10px] uppercase font-bold text-amber-300 block">Ahorro en Ofertas</span>
            <span className="font-mono text-base sm:text-lg font-bold text-[#e59b38]">
              +${analytics.totalSavingsFromOffers.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-[#16161a] border-b border-white/[0.06] text-xs shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === 'tickets'
                ? 'bg-[#e59b38] text-black shadow-sm'
                : 'text-neutral-400 hover:text-white bg-white/[0.03]'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Tickets Desglosados ({safeExpenses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('insumos')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === 'insumos'
                ? 'bg-[#e59b38] text-black shadow-sm'
                : 'text-neutral-400 hover:text-white bg-white/[0.03]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Cálculo por Insumo (Kilos / Costo Promedio)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nuevo')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === 'nuevo'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-rose-300 hover:text-white bg-rose-500/10 border border-rose-500/20'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Registrar Nuevo Ticket / Gasto</span>
          </button>
        </div>

        {/* Tab 1: Tickets Desglosados */}
        {activeTab === 'tickets' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {safeExpenses.length === 0 ? (
              <div className="text-center py-10 text-neutral-500">
                <p className="text-xs font-medium">Sin tickets registrados en este periodo.</p>
              </div>
            ) : (
              safeExpenses.map((expense) => {
                const isExpanded = expandedTicketId === expense.id;
                const calculatedTotal = getCalculatedExpenseAmount(expense);
                const dateObj = new Date(expense.timestamp);
                const formattedDate = dateObj.toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  timeZone: 'UTC',
                });
                const isCard = expense.paymentMethod === 'tarjeta';

                return (
                  <div
                    key={expense.id}
                    className="rounded-2xl bg-[#18181c] border border-white/[0.08] overflow-hidden transition-all"
                  >
                    {/* Ticket Header Row */}
                    <div
                      onClick={() => setExpandedTicketId(isExpanded ? null : expense.id)}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02]"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Store className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-white truncate">
                              {expense.storeName || expense.description}
                            </span>
                            {expense.folio && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300 border border-white/[0.08]">
                                {expense.folio}
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                isCard
                                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {isCard ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                              <span>{isCard ? 'Tarjeta Débito' : 'Efectivo'}</span>
                            </span>
                          </div>

                          <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>📅 {formattedDate}</span>
                            {expense.branchAddress && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-xs">{expense.branchAddress}</span>
                              </>
                            )}
                            {expense.items && expense.items.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-[#e59b38] font-semibold">
                                  {expense.items.length} {expense.items.length === 1 ? 'artículo' : 'artículos'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="font-mono font-extrabold text-sm sm:text-base text-rose-400 block">
                            -${calculatedTotal.toFixed(2)}
                          </span>
                          {expense.savedDiscount && expense.savedDiscount > 0 ? (
                            <span className="text-[10px] font-mono text-emerald-400 block">
                              Ahorro: ${expense.savedDiscount.toFixed(2)}
                            </span>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteExpense(expense.id);
                          }}
                          title="Eliminar ticket"
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {expense.items && expense.items.length > 0 && (
                          <div className="text-neutral-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expandable Raw Ticket Line Items Table */}
                    {isExpanded && expense.items && expense.items.length > 0 && (
                      <div className="px-4 pb-4 pt-2 bg-black/40 border-t border-white/[0.06] space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                          <span>Desglose de Artículos del Ticket</span>
                          {expense.rfc && <span className="font-mono">RFC Proveedor: {expense.rfc}</span>}
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#121215]">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-white/[0.08] text-[10px] uppercase text-neutral-400 bg-white/[0.02]">
                                <th className="py-2 px-3">Cant. / Unidad</th>
                                <th className="py-2 px-3">Descripción en Ticket</th>
                                <th className="py-2 px-3 text-right">P. Regular</th>
                                <th className="py-2 px-3 text-right">P. Aplicado</th>
                                <th className="py-2 px-3 text-right">Importe</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04] font-mono">
                              {expense.items.map((item) => {
                                const sub = calculateTicketItemSubtotal(item);
                                const sav = calculateTicketItemSavings(item);
                                const hasPromo = item.effectiveUnitPrice < item.regularUnitPrice;
                                return (
                                  <tr key={item.id} className="hover:bg-white/[0.02]">
                                    <td className="py-2 px-3 text-[#e59b38] font-bold">
                                      {item.quantity} {item.unit}
                                    </td>
                                    <td className="py-2 px-3 font-sans font-semibold text-white">
                                      {item.description}
                                      {sav > 0 && (
                                        <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                          <Tag className="w-2.5 h-2.5" /> -${sav.toFixed(2)}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2 px-3 text-right text-neutral-400">
                                      {hasPromo ? (
                                        <span className="line-through">${item.regularUnitPrice.toFixed(2)}</span>
                                      ) : (
                                        `$${item.regularUnitPrice.toFixed(2)}`
                                      )}
                                    </td>
                                    <td className="py-2 px-3 text-right text-neutral-200 font-bold">
                                      ${item.effectiveUnitPrice.toFixed(2)}/{item.unit}
                                    </td>
                                    <td className="py-2 px-3 text-right font-bold text-white">
                                      ${sub.toFixed(2)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-white/[0.1] bg-white/[0.03] font-mono font-bold">
                                <td colSpan={4} className="py-2 px-3 text-right text-neutral-300 uppercase text-[11px]">
                                  Total Calculado del Ticket:
                                </td>
                                <td className="py-2 px-3 text-right text-rose-400 text-sm">
                                  ${calculatedTotal.toFixed(2)} MXN
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Cálculo por Insumo */}
        {activeTab === 'insumos' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="text-xs text-neutral-300">
              Cálculo automático de volumen comprado y costo unitario promedio ponderado extraído directamente de todos los tickets registrados:
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#18181c]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[10px] uppercase tracking-wider text-neutral-400 bg-white/[0.02]">
                    <th className="py-3 px-4">Insumo / Materia Prima</th>
                    <th className="py-3 px-4 text-right">Cantidad Total Comprada</th>
                    <th className="py-3 px-4 text-right">Costo Promedio Calculado</th>
                    <th className="py-3 px-4 text-right">Gasto Acumulado</th>
                    <th className="py-3 px-4 text-right">% del Gasto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {analytics.ingredientMetrics.map((metric) => {
                    const pct =
                      analytics.totalExpenses > 0
                        ? Math.round((metric.totalSpent / analytics.totalExpenses) * 100)
                        : 0;
                    return (
                      <tr key={metric.key} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-bold text-white">{metric.label}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#e59b38]">
                          {metric.totalQuantity} {metric.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-neutral-300">
                          ${metric.avgUnitCost.toFixed(2)} / {metric.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                          ${metric.totalSpent.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-neutral-400">
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Registrar Nuevo Ticket / Gasto */}
        {activeTab === 'nuevo' && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Registrar Nuevo Ticket de Compra
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Tienda / Proveedor
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Ej. SuKarne, Super Ley, Rivera Gas"
                  className="w-full bg-[#101013] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-400"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {VERIFIED_PROVIDERS.map((prov) => (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => {
                        setStoreName(prov.businessName);
                        if (prov.category !== 'panaderia') {
                          setCategory(prov.category);
                        } else {
                          setCategory('insumos');
                        }
                        setPaymentMethod(prov.paymentMethodDefault);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 hover:bg-[#e59b38]/20 border border-white/10 hover:border-[#e59b38]/40 text-neutral-300 hover:text-[#e59b38] transition-colors"
                      title={prov.branchAddress}
                    >
                      {prov.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Artículos / Descripción del Ticket
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej. 4 kg Sirloin, 3 kg Papa Russet..."
                  className="w-full bg-[#101013] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Total del Ticket ($ MXN)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#101013] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Forma de Pago del Ticket
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'efectivo'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-[#101013] border-white/10 text-neutral-400'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Efectivo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('tarjeta')}
                    className={`py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'tarjeta'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                        : 'bg-[#101013] border-white/10 text-neutral-400'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Tarjeta Débito</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#101013] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-400"
                >
                  <option value="carne">Carne (SuKarne)</option>
                  <option value="quesos">Quesos</option>
                  <option value="verduras_abarrotes">Verduras y Abarrotes</option>
                  <option value="gas">Gas LP</option>
                  <option value="insumos">Aceite / Insumos</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Guardar Ticket en Contabilidad</span>
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#19191d] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-neutral-400">
            Total calculado de {safeExpenses.length} tickets: <strong className="text-rose-400 font-mono">-${analytics.totalExpenses.toFixed(2)} MXN</strong>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#e59b38] hover:bg-[#d48b28] text-black font-bold text-xs uppercase tracking-wider transition-colors touch-manipulation"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};