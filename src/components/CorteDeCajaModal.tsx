'use client';

import React, { useRef, useState } from 'react';
import {
  SaleRecord,
  ProductItem,
  TimeframeFilter,
  ExpenseRecord,
  CashDenominationCount,
  ClosedShiftRecord,
  CustomerOrder,
} from '@/types/accounting';
import {
  getPaymentBreakdown,
  calculateDenominationTotal,
  calculateExpectedDrawerCash,
  calculateArqueoDifference,
} from '@/utils/accountingCalculations';
import {
  X,
  Printer,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Coins,
  Banknote,
  Share2,
  Save,
} from 'lucide-react';

interface CorteDeCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales?: SaleRecord[];
  products?: ProductItem[];
  expenses?: ExpenseRecord[];
  timeframe: TimeframeFilter;
  startingCash: number;
  onUpdateStartingCash: (amount: number) => void;
  onArchiveShift?: (record: ClosedShiftRecord) => void;
  shiftCounter?: number;
  orders?: CustomerOrder[];
  totalWasteCost?: number;
}

export const CorteDeCajaModal: React.FC<CorteDeCajaModalProps> = ({
  isOpen,
  onClose,
  sales = [],
  products = [],
  expenses = [],
  timeframe,
  startingCash,
  onUpdateStartingCash,
  onArchiveShift,
  shiftCounter = 1,
  orders = [],
  totalWasteCost = 0,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isEditingStartingCash, setIsEditingStartingCash] = useState(false);
  const [startingCashInput, setStartingCashInput] = useState(startingCash.toString());
  const [arqueoMode, setArqueoMode] = useState<'directo' | 'desglose'>('directo');
  const [directCountInput, setDirectCountInput] = useState<string>('');
  const [denominations, setDenominations] = useState<CashDenominationCount>({
    b1000: 0,
    b500: 0,
    b200: 0,
    b100: 0,
    b50: 0,
    b20: 0,
    coins: 0,
  });

  const safeSales = Array.isArray(sales) ? sales : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeOrders = Array.isArray(orders) ? orders : [];

  if (!isOpen) return null;

  const totalUnits = safeSales.reduce((sum, s) => sum + (s?.quantity || 0), 0);
  const totalRevenue = safeSales.reduce((sum, s) => sum + (s?.quantity || 0) * (s?.unitPrice || 0), 0);
  const totalExpenses = safeExpenses.reduce((sum, e) => sum + (e?.amount || 0), 0);
  const paymentBreakdown = getPaymentBreakdown(safeSales);

  const expectedCashInDrawer = calculateExpectedDrawerCash(
    startingCash,
    paymentBreakdown.efectivo.total,
    totalExpenses
  );
  const dineroEnBanco = paymentBreakdown.tarjeta.total + paymentBreakdown.transferencia.total;

  const denominationTotal = calculateDenominationTotal(denominations);
  const hasDenominations = denominationTotal > 0;
  const countedCash =
    arqueoMode === 'directo'
      ? directCountInput.trim() !== ''
        ? parseFloat(directCountInput) || 0
        : null
      : hasDenominations
      ? denominationTotal
      : null;

  const arqueoResult =
    countedCash !== null ? calculateArqueoDifference(countedCash, expectedCashInDrawer) : null;

  const handleSaveStartingCash = () => {
    const parsed = parseFloat(startingCashInput);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateStartingCash(parsed);
      setIsEditingStartingCash(false);
    }
  };

  const handleUpdateDenomination = (key: keyof CashDenominationCount, delta: number) => {
    setDenominations((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta),
    }));
  };

  const productStats = safeProducts
    .map((prod) => {
      const prodSales = safeSales.filter((s) => s.productId === prod.id);
      const units = prodSales.reduce((sum, s) => sum + s.quantity, 0);
      const revenue = prodSales.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
      return {
        id: prod.id,
        name: prod.name,
        variant: prod.variantLabel,
        units,
        unitPrice: prod.defaultPrice,
        revenue,
      };
    })
    .filter((item) => item.units > 0);

  const totalDiscounts = safeOrders.reduce((sum, o) => sum + (o?.discount?.amount || 0), 0);
  const orderNumbers = safeOrders.map((o) => o?.orderNumber).filter((n): n is number => typeof n === 'number');
  const orderRangeText =
    orderNumbers.length > 0
      ? `#${String(Math.min(...orderNumbers)).padStart(3, '0')} a #${String(Math.max(...orderNumbers)).padStart(3, '0')} (${orderNumbers.length} órdenes)`
      : undefined;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const statusStr = arqueoResult
      ? arqueoResult.status === 'cuadrada'
        ? '✓ CAJA CUADRADA ($0.00)'
        : arqueoResult.status === 'sobrante'
        ? `▲ SOBRANTE: +$${arqueoResult.difference.toFixed(2)}`
        : `▼ FALTANTE: -$${Math.abs(arqueoResult.difference).toFixed(2)}`
      : 'Sin arqueo físico';

    let text =
      `🍔 *CIERRE DE CAJA • LOS PHILLYS DE LA PATRONA*\n` +
      `📅 Fecha: ${new Date().toLocaleString('es-MX')}\n`;

    if (orderRangeText) {
      text += `🔢 *Órdenes:* ${orderRangeText}\n`;
    }

    text +=
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Venta Bruta Total:* $${totalRevenue.toFixed(2)} MXN\n` +
      `(+) *Fondo Inicial:* $${startingCash.toFixed(2)} MXN\n` +
      `(+) *Ventas Efectivo:* $${paymentBreakdown.efectivo.total.toFixed(2)} MXN\n` +
      (totalExpenses > 0 ? `(-) *Salidas / Gastos:* -$${totalExpenses.toFixed(2)} MXN\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💵 *Efectivo Esperado:* $${expectedCashInDrawer.toFixed(2)} MXN\n` +
      (countedCash !== null ? `🔎 *Efectivo Contado:* $${countedCash.toFixed(2)} MXN\n` : '') +
      `⚖️ *Resultado Arqueo:* ${statusStr}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💳 *Tarjetas:* $${paymentBreakdown.tarjeta.total.toFixed(2)} MXN\n` +
      `📲 *Transferencias:* $${paymentBreakdown.transferencia.total.toFixed(2)} MXN\n` +
      `📦 *Unidades Vendidas:* ${totalUnits} piezas\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `*Los Phillys de La Patrona • Aguilas #1*`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const timeframeLabels: Record<TimeframeFilter, string> = {
    today: 'Corte del Día (Hoy)',
    week: 'Corte Semanal',
    month: 'Corte Mensual',
    all: 'Corte Total Acumulado',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90dvh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden pb-safe sm:pb-0">
        
        {/* Header */}
        <div className="print:hidden flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#19191d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e59b38]/15 border border-[#e59b38]/30 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-[#e59b38]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                Apertura y Cierre de Caja
              </h2>
              <p className="text-[11px] text-neutral-400">
                Fondo inicial, arqueo de efectivo y corte de caja
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">

          {/* Interactive Fondo Inicial & Arqueo Físico Controller */}
          <div className="print:hidden rounded-2xl bg-[#18181c] border border-white/[0.08] p-4 sm:p-5 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#e59b38] tracking-widest">
                  Apertura y Cierre
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>Fondo de Caja & Arqueo</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Fondo Inicial:</span>
                {isEditingStartingCash ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="50"
                      min="0"
                      value={startingCashInput}
                      onChange={(e) => setStartingCashInput(e.target.value)}
                      className="w-24 px-2 py-1 bg-black/50 border border-[#e59b38] rounded-lg text-xs font-mono text-white text-right focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveStartingCash}
                      className="px-2.5 py-1 bg-[#e59b38] text-black font-bold text-xs rounded-lg active:scale-95"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setStartingCashInput(startingCash.toString());
                      setIsEditingStartingCash(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-mono text-[#e59b38] font-bold"
                  >
                    <span>${startingCash.toFixed(2)} MXN</span>
                    <span className="text-[10px] text-neutral-400 underline ml-1">Editar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Float Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-neutral-400">Presets fondo:</span>
              {[0, 50, 100, 200, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onUpdateStartingCash(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                    startingCash === preset
                      ? 'bg-[#e59b38] text-black font-bold shadow'
                      : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>

            {/* Arqueo Mode Selector & Inputs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">
                  Conteo de Efectivo en Mano:
                </span>
                <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setArqueoMode('directo')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                      arqueoMode === 'directo'
                        ? 'bg-[#e59b38] text-black font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Monto Directo
                  </button>
                  <button
                    type="button"
                    onClick={() => setArqueoMode('desglose')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                      arqueoMode === 'desglose'
                        ? 'bg-[#e59b38] text-black font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Por Billetes
                  </button>
                </div>
              </div>

              {arqueoMode === 'directo' ? (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder={`Ej: ${expectedCashInDrawer.toFixed(2)}`}
                      value={directCountInput}
                      onChange={(e) => setDirectCountInput(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-black/60 border border-white/[0.12] focus:border-[#e59b38] rounded-xl text-sm font-mono text-white placeholder-neutral-600 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setDirectCountInput(expectedCashInDrawer.toFixed(2))}
                    className="px-3 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl text-xs text-neutral-300 whitespace-nowrap"
                  >
                    Copiar Esperado
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { key: 'b1000' as const, label: '$1,000' },
                    { key: 'b500' as const, label: '$500' },
                    { key: 'b200' as const, label: '$200' },
                    { key: 'b100' as const, label: '$100' },
                    { key: 'b50' as const, label: '$50' },
                    { key: 'b20' as const, label: '$20' },
                  ].map((denom) => (
                    <div
                      key={denom.key}
                      className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/[0.06]"
                    >
                      <span className="text-xs font-mono text-neutral-300 font-bold">{denom.label}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateDenomination(denom.key, -1)}
                          className="w-6 h-6 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-white flex items-center justify-center font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-mono font-bold text-[#e59b38]">
                          {denominations[denom.key] || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateDenomination(denom.key, 1)}
                          className="w-6 h-6 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-white flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="col-span-2 flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/[0.06]">
                    <div className="flex items-center gap-1 text-xs text-neutral-300">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Monedas ($):</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0.00"
                      value={denominations.coins || ''}
                      onChange={(e) =>
                        setDenominations((prev) => ({
                          ...prev,
                          coins: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-24 px-2 py-1 bg-black/70 border border-white/[0.1] rounded-lg text-xs font-mono text-right text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Live Arqueo Comparison Indicator */}
              <div className="pt-2">
                {arqueoResult ? (
                  arqueoResult.status === 'cuadrada' ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="text-xs">
                        <div className="font-bold">✓ Caja Cuadrada ($0.00)</div>
                      </div>
                    </div>
                  ) : arqueoResult.status === 'sobrante' ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      <div className="text-xs">
                        <div className="font-bold">
                          ⚠️ Sobrante en Caja: +${arqueoResult.difference.toFixed(2)} MXN
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300">
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      <div className="text-xs">
                        <div className="font-bold">
                          ❌ Faltante en Caja: -${Math.abs(arqueoResult.difference).toFixed(2)} MXN
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-dashed border-white/[0.08] text-neutral-400 text-center text-xs">
                    Ingresa arriba el dinero contado para calcular el arqueo.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Physical Ticket Preview Card */}
          <div
            ref={printAreaRef}
            className="bg-[#0d0d0f] p-6 rounded-2xl border border-white/[0.08] shadow-inner font-mono text-xs text-neutral-300 space-y-4 print:bg-white print:text-black print:border-none print:p-0"
          >
            <div className="text-center space-y-1 border-b border-dashed border-white/20 pb-4 print:border-black/30">
              <div className="font-black tracking-[0.15em] text-base text-white print:text-black uppercase">
                LOS PHILLYS DE LA PATRONA
              </div>
              <div className="text-[11px] text-[#e59b38] print:text-black uppercase tracking-wider font-semibold">
                Aguilas #1 - Nogales
              </div>
              <div className="text-[10px] text-neutral-400 print:text-neutral-600 mt-1">
                {timeframeLabels[timeframe]}
              </div>
              <div className="text-[10px] text-neutral-400 print:text-neutral-600">
                Fecha: {new Date().toLocaleDateString('es-MX', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Breakdown by Payment Method */}
            <div className="py-2 border-b border-dashed border-white/20 print:border-black/30 space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-neutral-400 print:text-black">
                Desglose por Forma de Pago:
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-300 print:text-black">💵 Efectivo ({paymentBreakdown.efectivo.count}):</span>
                <span className="font-mono font-bold text-white print:text-black">
                  ${paymentBreakdown.efectivo.total.toFixed(2)} ({paymentBreakdown.efectivo.percentage}%)
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-300 print:text-black">💳 Tarjeta ({paymentBreakdown.tarjeta.count}):</span>
                <span className="font-mono font-bold text-white print:text-black">
                  ${paymentBreakdown.tarjeta.total.toFixed(2)} ({paymentBreakdown.tarjeta.percentage}%)
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-300 print:text-black">📱 Transferencia ({paymentBreakdown.transferencia.count}):</span>
                <span className="font-mono font-bold text-white print:text-black">
                  ${paymentBreakdown.transferencia.total.toFixed(2)} ({paymentBreakdown.transferencia.percentage}%)
                </span>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-1.5 py-2 border-b border-dashed border-white/20 print:border-black/30">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 print:text-black">VENTA BRUTA TOTAL:</span>
                <span className="font-bold text-white print:text-black">${totalRevenue.toFixed(2)} MXN</span>
              </div>

              <div className="flex justify-between items-center text-xs text-[#e59b38] print:text-black">
                <span>(+) FONDO INICIAL:</span>
                <span className="font-bold font-mono">${startingCash.toFixed(2)} MXN</span>
              </div>

              <div className="flex justify-between items-center text-xs text-neutral-300 print:text-black">
                <span>(+) VENTAS EN EFECTIVO:</span>
                <span className="font-bold font-mono">${paymentBreakdown.efectivo.total.toFixed(2)} MXN</span>
              </div>

              {totalExpenses > 0 && (
                <div className="flex justify-between items-center text-xs text-rose-400 print:text-black">
                  <span>(-) GASTOS / SALIDAS:</span>
                  <span className="font-bold font-mono">-${totalExpenses.toFixed(2)} MXN</span>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 print:border-black/40 print:bg-transparent mt-1 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-emerald-300 print:text-black">
                    EFECTIVO ESPERADO EN CAJÓN:
                  </span>
                  <span className="text-base sm:text-lg font-black font-mono text-emerald-400 print:text-black">
                    ${expectedCashInDrawer.toFixed(2)} MXN
                  </span>
                </div>
              </div>

              {countedCash !== null && arqueoResult && (
                <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] print:border-black/30 space-y-1 mt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-300 print:text-black font-semibold">
                      EFECTIVO CONTADO FÍSICO:
                    </span>
                    <span className="font-mono font-bold text-white print:text-black">
                      ${countedCash.toFixed(2)} MXN
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-0.5 border-t border-dashed border-white/10 print:border-black/20">
                    <span className="text-neutral-400 print:text-black">RESULTADO:</span>
                    <span className="font-mono font-black text-white print:text-black">
                      {arqueoResult.status === 'cuadrada'
                        ? '✓ CAJA CUADRADA ($0.00)'
                        : arqueoResult.status === 'sobrante'
                        ? `▲ SOBRANTE: +$${arqueoResult.difference.toFixed(2)}`
                        : `▼ FALTANTE: -$${Math.abs(arqueoResult.difference).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              )}

              {dineroEnBanco > 0 && (
                <div className="flex justify-between items-center text-xs pt-1 text-cyan-300 print:text-black">
                  <span>DINERO EN BANCO / TARJETA:</span>
                  <span className="font-bold font-mono text-cyan-400 print:text-black">
                    ${dineroEnBanco.toFixed(2)} MXN
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center py-1 text-xs">
              <span>Total de piezas vendidas:</span>
              <span className="font-bold text-white print:text-black">{totalUnits} uds</span>
            </div>

            {/* Products Breakdown Table */}
            <div className="pt-2 border-t border-dashed border-white/20 print:border-black/30 space-y-2">
              <div className="text-[10px] uppercase font-bold text-neutral-400 print:text-black flex justify-between">
                <span>Producto / Variante</span>
                <span>Cant • Importe</span>
              </div>
              {productStats.length === 0 ? (
                <div className="text-center py-4 text-neutral-500">
                  Sin ventas registradas en este periodo.
                </div>
              ) : (
                productStats.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-1 border-b border-white/[0.04] print:border-black/10">
                    <div>
                      <div className="font-semibold text-white print:text-black">{item.name}</div>
                      <div className="text-[10px] text-[#e59b38] print:text-neutral-700">{item.variant}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white print:text-black">{item.units} pzs</div>
                      <div className="text-[10px] text-neutral-400 print:text-black">${item.revenue.toFixed(2)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="text-center text-[10px] text-neutral-500 print:text-neutral-700 pt-3 border-t border-dashed border-white/20 print:border-black/30">
              *** FIN DEL CORTE DE CAJA ***
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="print:hidden p-4 sm:p-5 border-t border-white/[0.08] bg-[#19191d] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-all active:scale-95 touch-manipulation"
            >
              <Printer className="w-4 h-4 text-[#e59b38]" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-all shadow-md active:scale-95 touch-manipulation"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onArchiveShift) {
                const shiftRecord: ClosedShiftRecord = {
                  id: `shift-${shiftCounter}-${Date.now()}`,
                  shiftNumber: shiftCounter,
                  reportType: 'corte_z',
                  openedAt: sales.length > 0 ? sales[sales.length - 1].timestamp : new Date().toISOString(),
                  closedAt: new Date().toISOString(),
                  startingCash,
                  totalGrossRevenue: totalRevenue,
                  totalDiscounts: totalDiscounts > 0 ? totalDiscounts : undefined,
                  totalWasteCost: totalWasteCost > 0 ? totalWasteCost : undefined,
                  orderRange: orderRangeText,
                  cashSalesTotal: paymentBreakdown.efectivo.total,
                  cardSalesTotal: paymentBreakdown.tarjeta.total,
                  transferSalesTotal: paymentBreakdown.transferencia.total,
                  totalExpenses,
                  expectedCashInDrawer,
                  countedCash: countedCash !== null ? countedCash : undefined,
                  difference: arqueoResult ? arqueoResult.difference : undefined,
                  differenceStatus: arqueoResult ? arqueoResult.status : undefined,
                  totalUnits,
                };
                onArchiveShift(shiftRecord);
              }
              onClose();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#e59b38] hover:bg-[#d48b28] text-black font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 touch-manipulation"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cierre de Caja</span>
          </button>
        </div>

      </div>
    </div>
  );
};