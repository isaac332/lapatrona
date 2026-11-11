import {
  SaleRecord,
  ProductItem,
  ExpenseRecord,
  TimeframeFilter,
  WasteRecord,
  ClosedShiftRecord,
  CustomerOrder,
  BusinessInfo,
} from '@/types/accounting';
import { getPaymentBreakdown } from './accountingCalculations';

export const TIMEFRAME_LABELS: Record<TimeframeFilter, string> = {
  today: 'Hoy',
  week: 'Esta Semana',
  month: 'Este Mes',
  all: 'Histórico Completo',
};

function triggerDownload(filename: string, content: string): void {
  const csvContent = '\uFEFF' + content;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface MasterExportOptions {
  timeframe: TimeframeFilter;
  sales: SaleRecord[];
  products: ProductItem[];
  expenses: ExpenseRecord[];
  wasteRecords?: WasteRecord[];
  closedShifts?: ClosedShiftRecord[];
  orders?: CustomerOrder[];
  startingCash?: number;
  businessInfo?: BusinessInfo;
  businessName?: string;
}

// 1. Reporte Integral para el Contador (Master Accounting Sheet)
export function exportMasterAccountingReportCSV({
  timeframe,
  sales,
  products,
  expenses,
  wasteRecords = [],
  closedShifts = [],
  orders = [],
  startingCash = 0,
  businessInfo,
  businessName: directBusinessName,
}: MasterExportOptions): void {
  const businessName = directBusinessName || businessInfo?.name || 'LA PATRONA';
  const productMap = new Map(products.map((p) => [p.id, p]));

  const totalUnits = sales.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalRevenue = sales.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
  const totalCost = sales.reduce((acc, curr) => acc + curr.quantity * curr.unitCost, 0);
  const grossProfit = totalRevenue - totalCost;
  const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0.0';
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalWaste = wasteRecords.reduce((acc, curr) => acc + curr.totalCost, 0);
  const netProfit = grossProfit - totalExpenses - totalWaste;

  // SAT Fiscal Calculations
  const subtotalSinIVA = totalRevenue / 1.16;
  const iva16 = totalRevenue - subtotalSinIVA;

  const paymentBreakdown = getPaymentBreakdown(sales);
  const cashNetFromSales = paymentBreakdown.efectivo.total - totalExpenses;
  const expectedCashInDrawer = startingCash + cashNetFromSales;
  const bankDeposits = paymentBreakdown.tarjeta.total + paymentBreakdown.transferencia.total;

  const lines: string[] = [];

  // Metadata Header
  lines.push(`REPORTE CONTABLE INTEGRAL Y FISCAL SAT - ${businessName.toUpperCase()}`);
  lines.push(`RFC,${businessInfo?.rfc ? `"${businessInfo.rfc.toUpperCase()}"` : '"XAXX010101000"'}`);
  lines.push(`Dirección,${businessInfo?.address ? `"${businessInfo.address.replace(/"/g, '""')}"` : '"Monterrey, N.L."'}`);
  lines.push(`Periodo Analizado,${TIMEFRAME_LABELS[timeframe]}`);
  lines.push(`Fecha y Hora de Emisión,${new Date().toLocaleString('es-MX')}`);
  lines.push('');

  // SAT Fiscal Summary
  lines.push('--- BASE FISCAL SAT (IVA 16%) ---');
  lines.push(`Venta Bruta Total ($),${totalRevenue.toFixed(2)}`);
  lines.push(`Venta Neta (Base Gravable sin IVA) ($),${subtotalSinIVA.toFixed(2)}`);
  lines.push(`IVA Trasladado (16% SAT) ($),${iva16.toFixed(2)}`);
  lines.push(`Cobros en Efectivo (Caja) ($),${paymentBreakdown.efectivo.total.toFixed(2)}`);
  lines.push(`Cobros Bancarios (Tarjeta + SPEI) ($),${bankDeposits.toFixed(2)}`);
  lines.push('');

  // Executive Summary
  lines.push('--- ESTADO DE RESULTADOS OPERATIVO ---');
  if (orders && orders.length > 0) {
    lines.push(`Comandas Totales Atendidas,${orders.length}`);
  }
  lines.push(`Unidades Totales Vendidas,${totalUnits}`);
  lines.push(`Venta Bruta Total ($),${totalRevenue.toFixed(2)}`);
  lines.push(`Costo de Materia Prima / Insumos ($),${totalCost.toFixed(2)}`);
  lines.push(`Utilidad Bruta ($),${grossProfit.toFixed(2)}`);
  lines.push(`Margen Bruto (%),${grossMargin}%`);
  lines.push(`Gastos Menores / Salidas de Caja ($),${totalExpenses.toFixed(2)}`);
  lines.push(`Mermas y Desperdicios de Cocina ($),${totalWaste.toFixed(2)}`);
  lines.push(`Utilidad Operativa Real del Periodo ($),${netProfit.toFixed(2)}`);
  lines.push('');

  // Cash Drawer Flow
  lines.push('--- CONCILIACIÓN DE CAJA CHICA Y ARQUEO ---');
  lines.push(`Fondo de Apertura ($),${startingCash.toFixed(2)}`);
  lines.push(`(+) Cobros en Efectivo ($),${paymentBreakdown.efectivo.total.toFixed(2)}`);
  lines.push(`(-) Gastos / Salidas en Efectivo ($),-${totalExpenses.toFixed(2)}`);
  lines.push(`(=) Efectivo Neto Esperado en Cajón ($),${expectedCashInDrawer.toFixed(2)}`);
  lines.push(`Dinero Bancario (Tarjetas Clip + Transferencias) ($),${bankDeposits.toFixed(2)}`);
  lines.push('');

  // Detailed Sales
  lines.push('--- LIBRO DIARIO DE VENTAS ---');
  lines.push('Folio Comanda,ID Venta,Fecha y Hora,Producto,Variante,Cantidad,Precio Unitario ($),Subtotal ($),Costo Unitario ($),Costo Total ($),Utilidad Línea ($),Forma de Pago');
  sales.forEach((s) => {
    const prod = productMap.get(s.productId);
    const subtotal = s.quantity * s.unitPrice;
    const costTotal = s.quantity * s.unitCost;
    const profitLine = subtotal - costTotal;
    const paymentLabel =
      s.paymentMethod === 'tarjeta'
        ? 'Tarjeta / Clip'
        : s.paymentMethod === 'transferencia'
        ? 'Transferencia SPEI'
        : 'Efectivo';
    const folio = s.orderNumber ? `#${String(s.orderNumber).padStart(3, '0')}` : 'Venta Directa';

    lines.push([
      folio,
      s.id,
      new Date(s.timestamp).toLocaleString('es-MX'),
      `"${prod?.name || s.productId}"`,
      `"${prod?.variantLabel || ''}"`,
      s.quantity,
      s.unitPrice.toFixed(2),
      subtotal.toFixed(2),
      s.unitCost.toFixed(2),
      costTotal.toFixed(2),
      profitLine.toFixed(2),
      paymentLabel,
    ].join(','));
  });
  if (sales.length === 0) lines.push('Sin ventas registradas en este periodo.');
  lines.push('');

  // Detailed Expenses
  if (expenses.length > 0) {
    lines.push('--- LIBRO DE SALIDAS Y GASTOS DE CAJA ---');
    lines.push('ID Gasto,Fecha y Hora,Concepto / Descripción,Categoría,Monto ($)');
    expenses.forEach((e) => {
      lines.push([
        e.id,
        new Date(e.timestamp).toLocaleString('es-MX'),
        `"${e.description.replace(/"/g, '""')}"`,
        `"${e.category}"`,
        e.amount.toFixed(2),
      ].join(','));
    });
    lines.push('');
  }

  // Kitchen Waste
  if (wasteRecords.length > 0) {
    lines.push('--- BITÁCORA DE MERMAS Y DESPERDICIOS ---');
    lines.push('ID Merma,Fecha y Hora,Insumo / Platillo,Tipo,Cantidad,Unidad,Costo Unitario ($),Costo Total ($),Motivo,Responsable,Notas');
    wasteRecords.forEach((w) => {
      lines.push([
        w.id,
        new Date(w.timestamp).toLocaleString('es-MX'),
        `"${w.itemName.replace(/"/g, '""')}"`,
        w.itemType === 'product' ? 'Platillo' : 'Insumo',
        w.quantity,
        w.unit,
        w.unitCost.toFixed(2),
        w.totalCost.toFixed(2),
        w.reason,
        `"${w.responsible || ''}"`,
        `"${w.notes || ''}"`,
      ].join(','));
    });
    lines.push('');
  }

  // Closed Shifts (Cortes Z)
  if (closedShifts.length > 0) {
    lines.push('--- HISTORIAL DE CORTES Z Y CIERRES DIARIOS ---');
    lines.push('Turno #,Tipo,Fecha Cierre,Rango Comandas,Fondo Apertura ($),Venta Bruta ($),Venta Neta sin IVA ($),IVA 16% ($),Efectivo ($),Tarjeta ($),SPEI ($),Gastos ($),Esperado en Cajón ($),Contado Físico ($),Diferencia ($),Estatus Arqueo,Cajero');
    closedShifts.forEach((c) => {
      lines.push([
        `Turno #${c.shiftNumber}`,
        c.reportType === 'corte_z' ? 'Corte Z (Diario)' : 'Corte X (Parcial)',
        new Date(c.closedAt).toLocaleString('es-MX'),
        `"${c.orderRange || ''}"`,
        c.startingCash.toFixed(2),
        c.totalGrossRevenue.toFixed(2),
        (c.subtotalSinIVA || c.totalGrossRevenue / 1.16).toFixed(2),
        (c.iva16 || c.totalGrossRevenue - c.totalGrossRevenue / 1.16).toFixed(2),
        c.cashSalesTotal.toFixed(2),
        c.cardSalesTotal.toFixed(2),
        c.transferSalesTotal.toFixed(2),
        c.totalExpenses.toFixed(2),
        c.expectedCashInDrawer.toFixed(2),
        c.countedCash !== undefined ? c.countedCash.toFixed(2) : '',
        c.difference !== undefined ? c.difference.toFixed(2) : '',
        c.differenceStatus || 'sin_arqueo',
        `"${c.cashierName || ''}"`,
      ].join(','));
    });
  }

  const dateSlug = new Date().toISOString().split('T')[0];
  const filename = `Reporte_Contable_Integral_${businessName.replace(/\s+/g, '_')}_${timeframe}_${dateSlug}.csv`;
  triggerDownload(filename, lines.join('\n'));
}

// 2. Exportación Específica: Libro Diario de Ventas y Comandas
export function exportDetailedSalesCSV(sales: SaleRecord[], products: ProductItem[], timeframe: TimeframeFilter, businessName = 'LA PATRONA'): void {
  const productMap = new Map(products.map((p) => [p.id, p]));
  const lines: string[] = [];

  lines.push(`LIBRO DIARIO DE VENTAS - ${businessName.toUpperCase()}`);
  lines.push(`Periodo,${TIMEFRAME_LABELS[timeframe]}`);
  lines.push(`Fecha de Emisión,${new Date().toLocaleString('es-MX')}`);
  lines.push('');
  lines.push('Folio Comanda,ID Registro,Fecha,Hora,Platillo,Variante,Cantidad,Precio Unitario ($),Subtotal ($),Costo ($),Utilidad ($),Método de Pago');

  sales.forEach((s) => {
    const prod = productMap.get(s.productId);
    const date = new Date(s.timestamp);
    const dateStr = !isNaN(date.getTime()) ? date.toLocaleDateString('es-MX') : '';
    const timeStr = !isNaN(date.getTime()) ? date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '';
    const subtotal = s.quantity * s.unitPrice;
    const costTotal = s.quantity * s.unitCost;
    const profit = subtotal - costTotal;
    const paymentLabel =
      s.paymentMethod === 'tarjeta' ? 'Tarjeta / Clip' : s.paymentMethod === 'transferencia' ? 'SPEI' : 'Efectivo';
    const folio = s.orderNumber ? `#${String(s.orderNumber).padStart(3, '0')}` : 'Venta Directa';

    lines.push([
      folio,
      s.id,
      dateStr,
      timeStr,
      `"${prod?.name || s.productId}"`,
      `"${prod?.variantLabel || ''}"`,
      s.quantity,
      s.unitPrice.toFixed(2),
      subtotal.toFixed(2),
      costTotal.toFixed(2),
      profit.toFixed(2),
      paymentLabel,
    ].join(','));
  });

  const dateSlug = new Date().toISOString().split('T')[0];
  triggerDownload(`Ventas_Detalladas_${businessName.replace(/\s+/g, '_')}_${timeframe}_${dateSlug}.csv`, lines.join('\n'));
}

// 3. Exportación Específica: Reporte Fiscal SAT (Base Gravable e IVA 16%)
export function exportFiscalSATReportCSV(sales: SaleRecord[], timeframe: TimeframeFilter, businessInfo?: BusinessInfo): void {
  const businessName = businessInfo?.name || 'LA PATRONA';
  const lines: string[] = [];

  const totalGross = sales.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
  const totalSubtotal = totalGross / 1.16;
  const totalIVA = totalGross - totalSubtotal;

  lines.push(`REPORTE FISCAL DE INGRESOS SAT (IVA 16%) - ${businessName.toUpperCase()}`);
  lines.push(`RFC Contribuyente,${businessInfo?.rfc ? `"${businessInfo.rfc.toUpperCase()}"` : '"XAXX010101000"'}`);
  lines.push(`Periodo,${TIMEFRAME_LABELS[timeframe]}`);
  lines.push(`Fecha de Corte,${new Date().toLocaleString('es-MX')}`);
  lines.push('');
  lines.push(`Venta Bruta Total Cobrada ($),${totalGross.toFixed(2)}`);
  lines.push(`Venta Neta (Base Gravable sin IVA) ($),${totalSubtotal.toFixed(2)}`);
  lines.push(`IVA Trasladado (16% SAT por Declarar) ($),${totalIVA.toFixed(2)}`);
  lines.push('');
  lines.push('Folio Comanda,Fecha,Hora,Venta Bruta ($),Base Gravable sin IVA ($),IVA Trasladado 16% ($),Forma de Pago,Canal SAT');

  sales.forEach((s) => {
    const date = new Date(s.timestamp);
    const dateStr = !isNaN(date.getTime()) ? date.toLocaleDateString('es-MX') : '';
    const timeStr = !isNaN(date.getTime()) ? date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '';
    const gross = s.quantity * s.unitPrice;
    const base = gross / 1.16;
    const iva = gross - base;
    const isBank = s.paymentMethod === 'tarjeta' || s.paymentMethod === 'transferencia';
    const canalSAT = isBank ? '04/03 Bancario (Clip/SPEI)' : '01 Efectivo';
    const folio = s.orderNumber ? `#${String(s.orderNumber).padStart(3, '0')}` : 'Venta Directa';

    lines.push([
      folio,
      dateStr,
      timeStr,
      gross.toFixed(2),
      base.toFixed(2),
      iva.toFixed(2),
      s.paymentMethod || 'efectivo',
      `"${canalSAT}"`,
    ].join(','));
  });

  const dateSlug = new Date().toISOString().split('T')[0];
  triggerDownload(`Reporte_Fiscal_SAT_IVA16_${businessName.replace(/\s+/g, '_')}_${timeframe}_${dateSlug}.csv`, lines.join('\n'));
}

// 4. Exportación Específica: Libro de Gastos y Salidas de Caja
export function exportExpensesReportCSV(expenses: ExpenseRecord[], timeframe: TimeframeFilter, businessName = 'LA PATRONA'): void {
  const lines: string[] = [];
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  lines.push(`LIBRO DE GASTOS Y SALIDAS DE CAJA - ${businessName.toUpperCase()}`);
  lines.push(`Periodo,${TIMEFRAME_LABELS[timeframe]}`);
  lines.push(`Total Gastos ($),${total.toFixed(2)}`);
  lines.push(`Fecha,${new Date().toLocaleString('es-MX')}`);
  lines.push('');
  lines.push('ID Registro,Fecha,Hora,Concepto / Motivo,Categoría,Monto Retirado ($)');

  expenses.forEach((e) => {
    const date = new Date(e.timestamp);
    const dateStr = !isNaN(date.getTime()) ? date.toLocaleDateString('es-MX') : '';
    const timeStr = !isNaN(date.getTime()) ? date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '';
    lines.push([
      e.id,
      dateStr,
      timeStr,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      e.amount.toFixed(2),
    ].join(','));
  });

  const dateSlug = new Date().toISOString().split('T')[0];
  triggerDownload(`Gastos_Caja_${businessName.replace(/\s+/g, '_')}_${timeframe}_${dateSlug}.csv`, lines.join('\n'));
}

// 5. Exportación Específica: Bitácora de Mermas de Cocina
export function exportWasteReportCSV(waste: WasteRecord[], timeframe: TimeframeFilter, businessName = 'LA PATRONA'): void {
  const lines: string[] = [];
  const totalCost = waste.reduce((sum, w) => sum + w.totalCost, 0);

  lines.push(`BITÁCORA DE MERMAS Y DESPERDICIOS DE COCINA - ${businessName.toUpperCase()}`);
  lines.push(`Periodo,${TIMEFRAME_LABELS[timeframe]}`);
  lines.push(`Costo Total Mermas ($),${totalCost.toFixed(2)}`);
  lines.push(`Fecha,${new Date().toLocaleString('es-MX')}`);
  lines.push('');
  lines.push('ID Merma,Fecha,Hora,Platillo / Insumo,Tipo,Cantidad,Unidad,Costo Unitario ($),Costo Total ($),Motivo,Responsable,Notas');

  waste.forEach((w) => {
    const date = new Date(w.timestamp);
    const dateStr = !isNaN(date.getTime()) ? date.toLocaleDateString('es-MX') : '';
    const timeStr = !isNaN(date.getTime()) ? date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '';
    lines.push([
      w.id,
      dateStr,
      timeStr,
      `"${w.itemName.replace(/"/g, '""')}"`,
      w.itemType === 'product' ? 'Platillo' : 'Insumo',
      w.quantity,
      w.unit,
      w.unitCost.toFixed(2),
      w.totalCost.toFixed(2),
      w.reason,
      `"${w.responsible || ''}"`,
      `"${w.notes || ''}"`,
    ].join(','));
  });

  const dateSlug = new Date().toISOString().split('T')[0];
  triggerDownload(`Mermas_Cocina_${businessName.replace(/\s+/g, '_')}_${timeframe}_${dateSlug}.csv`, lines.join('\n'));
}

// 6. Exportación Específica: Historial de Cortes Z (Cierres Diarios)
export function exportCortesZReportCSV(shifts: ClosedShiftRecord[], businessName = 'LA PATRONA'): void {
  const lines: string[] = [];

  lines.push(`HISTORIAL DE CORTES Z Y CIERRES FISCALES - ${businessName.toUpperCase()}`);
  lines.push(`Fecha de Exportación,${new Date().toLocaleString('es-MX')}`);
  lines.push('');
  lines.push('Turno #,Tipo Reporte,Fecha Apertura,Fecha Cierre,Rango Comandas,Fondo Inicial ($),Venta Bruta ($),Venta Neta sin IVA ($),IVA 16% ($),Descuentos ($),Mermas ($),Efectivo ($),Tarjeta ($),SPEI ($),Gastos ($),Esperado en Cajón ($),Contado Físico ($),Diferencia ($),Estatus,Cajero');

  shifts.forEach((s) => {
    lines.push([
      `Turno #${s.shiftNumber}`,
      s.reportType === 'corte_z' ? 'Corte Z (Cierre Diario)' : 'Corte X (Parcial)',
      new Date(s.openedAt).toLocaleString('es-MX'),
      new Date(s.closedAt).toLocaleString('es-MX'),
      `"${s.orderRange || ''}"`,
      s.startingCash.toFixed(2),
      s.totalGrossRevenue.toFixed(2),
      (s.subtotalSinIVA || s.totalGrossRevenue / 1.16).toFixed(2),
      (s.iva16 || s.totalGrossRevenue - s.totalGrossRevenue / 1.16).toFixed(2),
      (s.totalDiscounts || 0).toFixed(2),
      (s.totalWasteCost || 0).toFixed(2),
      s.cashSalesTotal.toFixed(2),
      s.cardSalesTotal.toFixed(2),
      s.transferSalesTotal.toFixed(2),
      s.totalExpenses.toFixed(2),
      s.expectedCashInDrawer.toFixed(2),
      s.countedCash !== undefined ? s.countedCash.toFixed(2) : '',
      s.difference !== undefined ? s.difference.toFixed(2) : '',
      s.differenceStatus || 'sin_arqueo',
      `"${s.cashierName || ''}"`,
    ].join(','));
  });

  const dateSlug = new Date().toISOString().split('T')[0];
  triggerDownload(`Historial_Cortes_Z_${businessName.replace(/\s+/g, '_')}_${dateSlug}.csv`, lines.join('\n'));
}

// Backward compatibility alias
export const exportAccountingReportCSV = exportMasterAccountingReportCSV;
