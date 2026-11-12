'use client';

import React, { useState, useMemo } from 'react';
import {
  SaleRecord,
  ProductItem,
  ExpenseRecord,
  WasteRecord,
  ClosedShiftRecord,
  CustomerOrder,
  TimeframeFilter,
  BusinessInfo,
} from '@/types/accounting';
import {
  exportMasterAccountingReportCSV,
  exportDetailedSalesCSV,
  exportFiscalSATReportCSV,
  exportExpensesReportCSV,
  exportWasteReportCSV,
  exportCortesZReportCSV,
  TIMEFRAME_LABELS,
} from '@/utils/csvExport';
import { filterSalesByTimeframe, filterExpensesByTimeframe, filterWasteByTimeframe } from '@/utils/accountingCalculations';
import {
  X,
  FileSpreadsheet,
  Download,
  Receipt,
  Wallet,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Landmark,
  ArrowDownToLine,
} from 'lucide-react';

interface ExportesContablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: SaleRecord[];
  products: ProductItem[];
  expenses: ExpenseRecord[];
  wasteRecords: WasteRecord[];
  closedShifts: ClosedShiftRecord[];
  orders: CustomerOrder[];
  startingCash: number;
  businessInfo: BusinessInfo;
  currentDate?: Date;
}

export const ExportesContablesModal: React.FC<ExportesContablesModalProps> = ({
  isOpen,
  onClose,
  sales,
  products,
  expenses,
  wasteRecords,
  closedShifts,
  orders,
  startingCash,
  businessInfo,
  currentDate = new Date(),
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeFilter>('today');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setDownloadSuccessMessage(msg);
    setTimeout(() => {
      setDownloadSuccessMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  // Filter datasets for the selected timeframe
  const filteredSales = useMemo(() => {
    return filterSalesByTimeframe(sales, selectedTimeframe, currentDate);
  }, [sales, selectedTimeframe, currentDate]);

  const filteredExpenses = useMemo(() => {
    return filterExpensesByTimeframe(expenses, selectedTimeframe, currentDate);
  }, [expenses, selectedTimeframe, currentDate]);

  const filteredWaste = useMemo(() => {
    return filterWasteByTimeframe(wasteRecords, selectedTimeframe, currentDate);
  }, [wasteRecords, selectedTimeframe, currentDate]);

  // Aggregate metrics
  const totalRevenue = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
  }, [filteredSales]);

  const totalCost = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.quantity * s.unitCost, 0);
  }, [filteredSales]);

  const grossProfit = totalRevenue - totalCost;
  const subtotalSinIVA = totalRevenue / 1.16;
  const iva16 = totalRevenue - subtotalSinIVA;

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const totalWaste = useMemo(() => {
    return filteredWaste.reduce((sum, w) => sum + w.totalCost, 0);
  }, [filteredWaste]);

  const netOperatingProfit = grossProfit - totalExpenses - totalWaste;

  // Handlers
  const handleExportMaster = () => {
    exportMasterAccountingReportCSV({
      timeframe: selectedTimeframe,
      sales: filteredSales,
      products,
      expenses: filteredExpenses,
      wasteRecords: filteredWaste,
      closedShifts,
      orders,
      startingCash,
      businessInfo,
    });
    showSuccess('✓ Reporte Integral del Contador exportado exitosamente.');
  };

  const handleExportSales = () => {
    exportDetailedSalesCSV(filteredSales, products, selectedTimeframe, businessInfo.name);
    showSuccess('✓ Libro Diario de Ventas exportado exitosamente.');
  };

  const handleExportFiscalSAT = () => {
    exportFiscalSATReportCSV(filteredSales, selectedTimeframe, businessInfo);
    showSuccess('✓ Reporte Fiscal SAT (IVA 16%) exportado exitosamente.');
  };

  const handleExportExpenses = () => {
    exportExpensesReportCSV(filteredExpenses, selectedTimeframe, businessInfo.name);
    showSuccess('✓ Libro de Gastos de Caja Chica exportado exitosamente.');
  };

  const handleExportWaste = () => {
    exportWasteReportCSV(filteredWaste, selectedTimeframe, businessInfo.name);
    showSuccess('✓ Bitácora de Mermas de Cocina exportada exitosamente.');
  };

  const handleExportCortesZ = () => {
    exportCortesZReportCSV(closedShifts, businessInfo.name);
    showSuccess('✓ Historial de Cortes Z exportado exitosamente.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-[#0d0d0f] border border-white/[0.1] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] pb-safe sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide">
                  Centro de Exportaciones Contables e Informes SAT
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  Excel / CSV
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Genera libros contables con formato UTF-8 oficial y desglose fiscal del 16% IVA para tu contador
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Feedback Alert */}
        {downloadSuccessMessage && (
          <div className="px-6 py-2.5 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{downloadSuccessMessage}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Period Selector Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Calendar className="w-4 h-4 text-[#e59b38]" />
              <span className="font-bold uppercase tracking-wider">Periodo Contable:</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {(['today', 'week', 'month', 'all'] as TimeframeFilter[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedTimeframe === tf
                      ? 'bg-[#e59b38] text-black font-bold shadow-md shadow-[#e59b38]/20'
                      : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {TIMEFRAME_LABELS[tf]}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Fiscal & Financial Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#141417] border border-white/[0.08]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block truncate">
                Venta Bruta
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-white mt-1 block">
                ${totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-neutral-500 mt-0.5 block truncate">
                {filteredSales.length} unidades
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141417] border border-white/[0.08]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block truncate">
                Base sin IVA
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-[#e59b38] mt-1 block">
                ${subtotalSinIVA.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-neutral-500 mt-0.5 block truncate">
                Subtotal neto SAT
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141417] border border-white/[0.08]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block truncate">
                IVA 16% SAT
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-sky-300 mt-1 block">
                ${iva16.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-neutral-500 mt-0.5 block truncate">
                Impuesto trasladado
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141417] border border-white/[0.08]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block truncate">
                Gastos Caja
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-rose-300 mt-1 block">
                -${totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-neutral-500 mt-0.5 block truncate">
                {filteredExpenses.length} comprobantes
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141417] border border-white/[0.08]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block truncate">
                Mermas Cocina
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-amber-300 mt-1 block">
                -${totalWaste.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-neutral-500 mt-0.5 block truncate">
                {filteredWaste.length} incidentes
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block truncate">
                Utilidad Neta
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-emerald-300 mt-1 block">
                ${netOperatingProfit.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-neutral-500 mt-0.5 block truncate">
                Margen operativo
              </span>
            </div>
          </div>

          {/* Primary Master Export Banner */}
          <div className="p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-sky-950/40 via-[#141417] to-amber-950/30 border border-sky-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-white text-base sm:text-lg">
                  Reporte Integral Maestro para el Contador
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#e59b38] text-black">
                  Recomendado
                </span>
              </div>
              <p className="text-xs text-neutral-300 max-w-xl">
                Consolida en un solo archivo CSV todos los bloques de auditoría: resumen fiscal SAT, ventas detalladas, concilación de caja, gastos de caja chica, mermas de cocina e historial de cortes Z.
              </p>
            </div>

            <button
              onClick={handleExportMaster}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-[#e59b38] hover:bg-[#f0aa49] text-black font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-lg shadow-[#e59b38]/20 active:scale-95"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Descargar Reporte Maestro (.csv)</span>
            </button>
          </div>

          {/* Specific Individual Books Grid */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#e59b38]" />
              <span>Libros y Reportes Específicos por Módulo</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Libro de Ventas */}
              <div className="p-4 rounded-2xl bg-[#121215] border border-white/[0.08] flex items-center justify-between gap-3 hover:border-white/[0.15] transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e59b38]/10 border border-[#e59b38]/25 flex items-center justify-center text-[#e59b38] shrink-0 mt-0.5">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                      Libro Diario de Ventas
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Registro de todas las comandas, platillos, cantidades, costos y métodos de pago.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleExportSales}
                  className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
                  title="Descargar libro de ventas en CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#e59b38]" />
                  <span>CSV</span>
                </button>
              </div>

              {/* Reporte Fiscal SAT */}
              <div className="p-4 rounded-2xl bg-[#121215] border border-white/[0.08] flex items-center justify-between gap-3 hover:border-white/[0.15] transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                      Reporte Fiscal SAT (IVA 16%)
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Base gravable neta, IVA trasladado y clasificación de pagos bancarios vs efectivo.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleExportFiscalSAT}
                  className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
                  title="Descargar reporte de impuestos SAT en CSV"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>CSV</span>
                </button>
              </div>

              {/* Libro de Gastos */}
              <div className="p-4 rounded-2xl bg-[#121215] border border-white/[0.08] flex items-center justify-between gap-3 hover:border-white/[0.15] transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                      Salidas y Gastos de Caja Menor
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Detalle de compras de insumos, mercado, hielo, propinas y retiros del cajón.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleExportExpenses}
                  className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
                  title="Descargar libro de gastos en CSV"
                >
                  <Download className="w-3.5 h-3.5 text-rose-400" />
                  <span>CSV</span>
                </button>
              </div>

              {/* Bitácora de Mermas */}
              <div className="p-4 rounded-2xl bg-[#121215] border border-white/[0.08] flex items-center justify-between gap-3 hover:border-white/[0.15] transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                      Bitácora de Mermas de Cocina
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Costos y causas de pérdidas por quemado, caída, caducidad o error de comanda.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleExportWaste}
                  className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
                  title="Descargar bitácora de mermas en CSV"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>CSV</span>
                </button>
              </div>

              {/* Historial de Cortes Z */}
              <div className="p-4 rounded-2xl bg-[#121215] border border-white/[0.08] flex items-center justify-between gap-3 hover:border-white/[0.15] transition-all md:col-span-2">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                      Historial de Cierres Diarios y Cortes Z ({closedShifts.length} turnos archivados)
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Arqueos de efectivo, fondos de apertura, diferencias (sobrante/faltante) y rangos de comandas.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleExportCortesZ}
                  className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
                  title="Descargar historial de cortes Z en CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.02]">
          <div className="text-[11px] text-neutral-500 text-center sm:text-left">
            Exportaciones optimizadas para Excel, Google Sheets, Contpaqi y Aspel en codificación UTF-8 con BOM.
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition-all active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
