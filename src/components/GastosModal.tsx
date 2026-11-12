'use client';

import React, { useState, useMemo } from 'react';
import { ExpenseRecord, TimeframeFilter, PaymentMethod, SaleRecord } from '@/types/accounting';
import { calculateExpensesAnalytics, getCalculatedExpenseAmount, calculateInitialInvestmentSummary } from '@/utils/accountingCalculations';
import { calculateTicketItemSubtotal, calculateTicketItemSavings, INITIAL_INVESTMENTS } from '@/data/purchaseTicketsData';
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
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { ModalShell } from '@/components/ModalShell';

interface GastosModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses?: ExpenseRecord[];
  sales?: SaleRecord[];
  timeframe: TimeframeFilter;
  onAddExpense: (description: string, amount: number, category: string, paymentMethod?: PaymentMethod, storeName?: string) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const GastosModal: React.FC<GastosModalProps> = ({
  isOpen,
  onClose,
  expenses = [],
  sales = [],
  timeframe,
  onAddExpense,
  onDeleteExpense,
}) => {
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeSales = Array.isArray(sales) ? sales : [];
  const [activeTab, setActiveTab] = useState<'tickets' | 'inversion' | 'insumos' | 'nuevo'>('tickets');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(safeExpenses[0]?.id || null);

  // Form states for adding a new ticket/expense
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('verduras_abarrotes');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');

  const analytics = useMemo(() => calculateExpensesAnalytics(safeExpenses), [safeExpenses]);
  const investmentSummary = useMemo(() => calculateInitialInvestmentSummary(safeSales, safeExpenses), [safeSales, safeExpenses]);

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
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="gastos-modal-title"
      maxWidthClass="max-w-4xl"
      maxHeightClass="max-h-[92dvh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-4 sm:p-5 border-b border-white/[0.08] bg-[#19191d] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0" aria-hidden="true">
            <Receipt className="w-5 h-5 text-rose-400" />
          </div>
          <div className="min-w-0">
            <h2 id="gastos-modal-title" className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
              Tickets de Compra e Insumos ({safeExpenses.length})
            </h2>
            <p className="text-[11px] text-neutral-400">
              {timeframeLabels[timeframe]} • Calculado artículo por artículo
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar tickets y gastos"
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors shrink-0 active:scale-95"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Calculated Financial Summary Strip (single scrollable row on mobile to preserve body space) */}
      <div className="flex sm:grid sm:grid-cols-4 gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#111114] border-b border-white/[0.06] shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex-none w-[165px] sm:w-auto p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
          <span className="text-[10px] uppercase font-bold text-amber-300 block">Inversión Inicial</span>
          <span className="font-mono text-sm sm:text-lg font-extrabold text-[#e59b38] tabular-nums">
            ${analytics.initialInvestmentTotal > 0 ? analytics.initialInvestmentTotal.toFixed(2) : '2,856.50'}
          </span>
          <span className="text-[10px] text-neutral-400 block truncate">
            Mónica $1,493 • Isaac $1,363.50
          </span>
        </div>

        <div className="flex-none w-[155px] sm:w-auto p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <span className="text-[10px] uppercase font-bold text-rose-300 block">Total Compras</span>
          <span className="font-mono text-sm sm:text-lg font-extrabold text-rose-400 tabular-nums">
            -${analytics.totalExpenses.toFixed(2)}
          </span>
          <span className="text-[10px] text-neutral-400 block truncate">
            Inversión + Reabasto
          </span>
        </div>

        <div className="flex-none w-[155px] sm:w-auto p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] uppercase font-bold text-emerald-300 block">Pagado en Efectivo</span>
          <span className="font-mono text-sm sm:text-lg font-bold text-emerald-400 tabular-nums">
            ${analytics.cashExpenses.toFixed(2)}
          </span>
          <span className="text-[10px] text-neutral-400 block truncate">
            Caja y efectivo socios
          </span>
        </div>

        <div className="flex-none w-[155px] sm:w-auto p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <span className="text-[10px] uppercase font-bold text-sky-300 block">Pagado con Tarjeta</span>
          <span className="font-mono text-sm sm:text-lg font-bold text-sky-400 tabular-nums">
            ${analytics.cardExpenses.toFixed(2)}
          </span>
          <span className="text-[10px] text-neutral-400 block truncate">
            SuKarne y compras
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Secciones de gastos e insumos"
        className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-[#16161a] border-b border-white/[0.06] text-xs shrink-0 overflow-x-auto no-scrollbar"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'tickets'}
          onClick={() => setActiveTab('tickets')}
          className={`flex-none flex items-center gap-1.5 px-3.5 min-h-[44px] sm:min-h-[34px] rounded-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'tickets'
              ? 'bg-[#e59b38] text-black shadow-sm'
              : 'text-neutral-400 hover:text-white bg-white/[0.03]'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Tickets ({safeExpenses.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'inversion'}
          onClick={() => setActiveTab('inversion')}
          className={`flex-none flex items-center gap-1.5 px-3.5 min-h-[44px] sm:min-h-[34px] rounded-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'inversion'
              ? 'bg-amber-500 text-black shadow-sm'
              : 'text-amber-400 hover:text-white bg-amber-500/10 border border-amber-500/25'
          }`}
        >
          <Coins className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Inversión Inicial ($2,856.50)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'insumos'}
          onClick={() => setActiveTab('insumos')}
          className={`flex-none flex items-center gap-1.5 px-3.5 min-h-[44px] sm:min-h-[34px] rounded-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'insumos'
              ? 'bg-[#e59b38] text-black shadow-sm'
              : 'text-neutral-400 hover:text-white bg-white/[0.03]'
          }`}
        >
          <Scale className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Cálculo Insumos</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'nuevo'}
          onClick={() => setActiveTab('nuevo')}
          className={`flex-none flex items-center gap-1.5 px-3.5 min-h-[44px] sm:min-h-[34px] rounded-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'nuevo'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-rose-300 hover:text-white bg-rose-500/10 border border-rose-500/20'
          }`}
        >
          <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>+ Registrar Gasto</span>
        </button>
      </div>

      {/* Tab 1: Tickets Desglosados */}
      {activeTab === 'tickets' && (
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3">
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
                  <div className="p-3 sm:p-4 flex items-start sm:items-center justify-between gap-2 hover:bg-white/[0.02]">
                    <button
                      type="button"
                      onClick={() => setExpandedTicketId(isExpanded ? null : expense.id)}
                      aria-expanded={isExpanded}
                      className="flex-1 min-w-0 flex items-start gap-3 text-left min-h-[44px]"
                    >
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                        <Store className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-white leading-snug">
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
                            {isCard ? <CreditCard className="w-3 h-3" aria-hidden="true" /> : <Banknote className="w-3 h-3" aria-hidden="true" />}
                            <span>{isCard ? 'Tarjeta Débito' : 'Efectivo'}</span>
                          </span>

                          {expense.investor && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                expense.investor === 'Mónica'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/35'
                                  : expense.investor === 'Isaac'
                                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/35'
                                  : 'bg-neutral-500/20 text-neutral-300 border-neutral-500/35'
                              }`}
                            >
                              {expense.investor}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-x-2 gap-y-0.5 flex-wrap">
                          <span>📅 {formattedDate}</span>
                          {expense.branchAddress && (
                            <>
                              <span aria-hidden="true">•</span>
                              <span className="leading-snug">{expense.branchAddress}</span>
                            </>
                          )}
                          {expense.items && expense.items.length > 0 && (
                            <>
                              <span aria-hidden="true">•</span>
                              <span className="text-[#e59b38] font-semibold">
                                {expense.items.length} {expense.items.length === 1 ? 'artículo' : 'artículos'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <div className="text-right">
                        <span className="font-mono font-extrabold text-sm sm:text-base text-rose-400 block tabular-nums">
                          -${calculatedTotal.toFixed(2)}
                        </span>
                        {expense.savedDiscount && expense.savedDiscount > 0 ? (
                          <span className="text-[10px] font-mono text-emerald-400 block tabular-nums">
                            Ahorro: ${expense.savedDiscount.toFixed(2)}
                          </span>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteExpense(expense.id)}
                        title="Eliminar ticket"
                        aria-label={`Eliminar ticket ${expense.storeName || expense.description}`}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>

                      {expense.items && expense.items.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedTicketId(isExpanded ? null : expense.id)}
                          aria-label={isExpanded ? 'Contraer artículos del ticket' : 'Ver artículos del ticket'}
                          aria-expanded={isExpanded}
                          className="w-9 h-11 min-h-[44px] flex items-center justify-center text-neutral-400 hover:text-white"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Raw Ticket Line Items Table */}
                  {isExpanded && expense.items && expense.items.length > 0 && (
                    <div className="px-3 sm:px-4 pb-4 pt-2 bg-black/40 border-t border-white/[0.06] space-y-2 animate-fade-in">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                        <span>Desglose de Artículos del Ticket</span>
                        {expense.rfc && <span className="font-mono">RFC Proveedor: {expense.rfc}</span>}
                      </div>

                      <div
                        tabIndex={0}
                        role="region"
                        aria-label={`Artículos del ticket ${expense.storeName || expense.description}`}
                        className="table-scroll-region rounded-xl border border-white/[0.06] bg-[#121215]"
                      >
                        <table className="w-full text-left text-xs border-collapse responsive-stacked">
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
                                  <td data-label="Cantidad" className="py-2 px-3 text-[#e59b38] font-bold">
                                    {item.quantity} {item.unit}
                                  </td>
                                  <td data-label="Artículo" className="py-2 px-3 font-sans font-semibold text-white">
                                    {item.description}
                                    {sav > 0 && (
                                      <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                        <Tag className="w-2.5 h-2.5" aria-hidden="true" /> -${sav.toFixed(2)}
                                      </span>
                                    )}
                                  </td>
                                  <td data-label="P. Regular" className="py-2 px-3 text-right text-neutral-400">
                                    {hasPromo ? (
                                      <span className="line-through">${item.regularUnitPrice.toFixed(2)}</span>
                                    ) : (
                                      `$${item.regularUnitPrice.toFixed(2)}`
                                    )}
                                  </td>
                                  <td data-label="P. Aplicado" className="py-2 px-3 text-right text-neutral-200 font-bold">
                                    ${item.effectiveUnitPrice.toFixed(2)}/{item.unit}
                                  </td>
                                  <td data-label="Importe" className="py-2 px-3 text-right font-bold text-white">
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
                              <td data-label="Total Calculado" className="py-2 px-3 text-right text-rose-400 text-sm">
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

        {/* Tab 2: Inversión Inicial por Socio (Libreta Contable) */}
        {activeTab === 'inversion' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Header Card with Notebook Citation */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#18181c] to-emerald-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                    Libreta Contable • Folio Inversión
                  </span>
                  <span className="text-[11px] text-neutral-400">Jueves 8 de Octubre 2026</span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white mt-1">
                  Capital Inicial de Socios: ${INITIAL_INVESTMENTS.total.toFixed(2)}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Gastos de arranque y provisiones pagadas por Mónica e Isaac antes de la apertura.
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  100% Recuperada
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {investmentSummary.isFullyRecovered
                    ? `Ganancia neta sobre capital: +$${investmentSummary.netProfitAfterInitialInvestment.toFixed(2)}`
                    : `Recuperado: ${investmentSummary.recoveredPercentage}%`}
                </span>
              </div>
            </div>

            {/* Side-by-side Partner Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Partner 1: Mónica */}
              <div className="rounded-2xl bg-[#19191d] border border-rose-500/25 overflow-hidden flex flex-col">
                <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-300 tracking-wider">Socia Fundadora</span>
                    <h4 className="font-serif text-lg font-bold text-white">Mónica</h4>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xl font-extrabold text-rose-400 tabular-nums">
                      ${INITIAL_INVESTMENTS.monica.total.toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-neutral-400 font-mono">
                      {INITIAL_INVESTMENTS.monica.percentage}% del capital
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2.5 flex-1">
                  {INITIAL_INVESTMENTS.monica.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-semibold text-neutral-200 leading-snug">{item.description}</span>
                        <span className="text-[10px] text-neutral-400 mt-0.5 leading-snug">{item.store} • {item.detail}</span>
                      </div>
                      <span className="font-mono font-bold text-xs text-rose-300 shrink-0 tabular-nums">
                        ${item.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-white/[0.02] border-t border-white/[0.06] text-center">
                  <span className="text-[11px] text-neutral-400">
                    Total comprobado en libreta: <strong className="text-white">${INITIAL_INVESTMENTS.monica.total.toFixed(2)}</strong>
                  </span>
                </div>
              </div>

              {/* Partner 2: Isaac */}
              <div className="rounded-2xl bg-[#19191d] border border-sky-500/25 overflow-hidden flex flex-col">
                <div className="p-4 bg-sky-500/10 border-b border-sky-500/20 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-sky-300 tracking-wider">Socio Fundador</span>
                    <h4 className="font-serif text-lg font-bold text-white">Isaac</h4>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xl font-extrabold text-sky-400 tabular-nums">
                      ${INITIAL_INVESTMENTS.isaac.total.toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-neutral-400 font-mono">
                      {INITIAL_INVESTMENTS.isaac.percentage}% del capital
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2.5 flex-1">
                  {INITIAL_INVESTMENTS.isaac.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-semibold text-neutral-200 leading-snug">{item.description}</span>
                        <span className="text-[10px] text-neutral-400 mt-0.5 leading-snug">{item.store} • {item.detail}</span>
                      </div>
                      <span className="font-mono font-bold text-xs text-sky-300 shrink-0 tabular-nums">
                        ${item.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-white/[0.02] border-t border-white/[0.06] text-center">
                  <span className="text-[11px] text-neutral-400">
                    Total comprobado en libreta: <strong className="text-white">${INITIAL_INVESTMENTS.isaac.total.toFixed(2)}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Cálculo por Insumo */}
        {activeTab === 'insumos' && (
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
            <div className="text-xs text-neutral-300">
              Cálculo automático de volumen comprado y costo unitario promedio ponderado extraído directamente de todos los tickets registrados:
            </div>

            <div
              className="table-scroll-region rounded-2xl border border-white/[0.08] bg-[#18181c]"
              tabIndex={0}
              role="region"
              aria-label="Cálculo por insumo y costo promedio ponderado"
            >
              <table className="w-full text-left text-xs border-collapse responsive-stacked">
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
                        <td data-label="Insumo" className="py-3 px-4 font-bold text-white">{metric.label}</td>
                        <td data-label="Cantidad Comprada" className="py-3 px-4 text-right font-mono font-bold text-[#e59b38]">
                          {metric.totalQuantity} {metric.unit}
                        </td>
                        <td data-label="Costo Promedio" className="py-3 px-4 text-right font-mono text-neutral-300">
                          ${metric.avgUnitCost.toFixed(2)} / {metric.unit}
                        </td>
                        <td data-label="Gasto Acumulado" className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                          ${metric.totalSpent.toFixed(2)}
                        </td>
                        <td data-label="% del Gasto" className="py-3 px-4 text-right font-mono text-neutral-400">
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

        {/* Tab 4: Registrar Nuevo Ticket / Gasto */}
        {activeTab === 'nuevo' && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
            <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Registrar Nuevo Ticket de Compra
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Tienda / Proveedor
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Ej. SuKarne, Super Ley, Rivera Gas"
                  className="w-full min-h-[44px] bg-[#101013] border border-white/10 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-400"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
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
                      className="min-h-[44px] sm:min-h-[28px] text-[11px] sm:text-[10px] px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-full bg-white/5 hover:bg-[#e59b38]/20 border border-white/10 hover:border-[#e59b38]/40 text-neutral-300 hover:text-[#e59b38] transition-colors touch-manipulation"
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
                  className="w-full min-h-[44px] bg-[#101013] border border-white/10 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-400"
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
                  className="w-full min-h-[44px] bg-[#101013] border border-white/10 rounded-xl px-3.5 py-2.5 text-base sm:text-xs font-mono font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-rose-400"
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
                    className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors touch-manipulation ${
                      paymentMethod === 'efectivo'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-[#101013] border-white/10 text-neutral-400'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5 shrink-0" />
                    <span>Efectivo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('tarjeta')}
                    className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors touch-manipulation ${
                      paymentMethod === 'tarjeta'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                        : 'bg-[#101013] border-white/10 text-neutral-400'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 shrink-0" />
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
                  className="w-full min-h-[44px] bg-[#101013] border border-white/10 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-rose-400"
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
              className="w-full min-h-[44px] py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 touch-manipulation"
            >
              <Wallet className="w-4 h-4" />
              <span>Guardar Ticket en Contabilidad</span>
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#19191d] flex flex-wrap items-center justify-between gap-3 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-5">
          <div className="text-[11px] text-neutral-400">
            Total calculado de {safeExpenses.length} tickets: <strong className="text-rose-400 font-mono tabular-nums">-${analytics.totalExpenses.toFixed(2)} MXN</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-full bg-[#e59b38] hover:bg-[#d48b28] text-black font-bold text-xs uppercase tracking-wider transition-colors touch-manipulation"
          >
            Cerrar
          </button>
        </div>

    </ModalShell>
  );
};