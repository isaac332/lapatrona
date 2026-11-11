import { SaleRecord, ProductItem, ExpenseRecord, TimeframeFilter } from '@/types/accounting';
import { getPaymentBreakdown } from './accountingCalculations';

export interface CSVExportOptions {
  timeframe: TimeframeFilter;
  sales: SaleRecord[];
  products: ProductItem[];
  expenses: ExpenseRecord[];
  startingCash?: number;
  businessName?: string;
}

export function exportAccountingReportCSV({
  timeframe,
  sales,
  products,
  expenses,
  startingCash = 0,
  businessName = 'LA PATRONA',
}: CSVExportOptions): void {
  const timeframeLabels: Record<TimeframeFilter, string> = {
    today: 'Hoy',
    week: 'Esta Semana',
    month: 'Este Mes',
    all: 'Historico Completo',
  };

  const productMap = new Map(products.map((p) => [p.id, p]));
  const totalUnits = sales.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalRevenue = sales.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
  const totalCost = sales.reduce((acc, curr) => acc + curr.quantity * curr.unitCost, 0);
  const grossProfit = totalRevenue - totalCost;
  const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0.0';
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  const paymentBreakdown = getPaymentBreakdown(sales);
  const cashNetFromSales = paymentBreakdown.efectivo.total - totalExpenses;
  const expectedCashInDrawer = startingCash + cashNetFromSales;
  const bankDeposits = paymentBreakdown.tarjeta.total + paymentBreakdown.transferencia.total;

  const lines: string[] = [];

  // Metadata Header
  lines.push(`REPORTE CONTABLE Y DE VENTAS - ${businessName.toUpperCase()}`);
  lines.push(`Periodo Analizado,${timeframeLabels[timeframe]}`);
  lines.push(`Fecha de Exportacion,${new Date().toLocaleString('es-MX')}`);
  lines.push('');

  // Executive Summary Section
  lines.push('--- RESUMEN EJECUTIVO FINANCIERO ---');
  lines.push(`Unidades Totales Vendidas,${totalUnits}`);
  lines.push(`Venta Bruta Total ($),${totalRevenue.toFixed(2)}`);
  lines.push(`Costo de Materia Prima / Insumos ($),${totalCost.toFixed(2)}`);
  lines.push(`Utilidad Bruta ($),${grossProfit.toFixed(2)}`);
  lines.push(`Margen Bruto (%),${grossMargin}%`);
  lines.push(`Gastos / Salidas de Caja ($),${totalExpenses.toFixed(2)}`);
  lines.push(`Utilidad Neta del Periodo ($),${netProfit.toFixed(2)}`);
  lines.push('');

  // Payment Breakdown Section
  lines.push('--- DESGLOSE DE INGRESOS POR FORMA DE PAGO ---');
  lines.push('Metodo de Pago,Transacciones,Total Cobrado ($),% del Total');
  lines.push(`Efectivo,${paymentBreakdown.efectivo.count},${paymentBreakdown.efectivo.total.toFixed(2)},${paymentBreakdown.efectivo.percentage}%`);
  lines.push(`Tarjeta / Clip,${paymentBreakdown.tarjeta.count},${paymentBreakdown.tarjeta.total.toFixed(2)},${paymentBreakdown.tarjeta.percentage}%`);
  lines.push(`Transferencia SPEI,${paymentBreakdown.transferencia.count},${paymentBreakdown.transferencia.total.toFixed(2)},${paymentBreakdown.transferencia.percentage}%`);
  lines.push(`TOTAL INGRESOS,${sales.length},${totalRevenue.toFixed(2)},100%`);
  lines.push('');

  // Cash Drawer Flow
  lines.push('--- FLUJO DE EFECTIVO EN CAJON ---');
  lines.push(`Fondo de Apertura ($),${startingCash.toFixed(2)}`);
  lines.push(`(+) Cobros en Efectivo ($),${paymentBreakdown.efectivo.total.toFixed(2)}`);
  lines.push(`(-) Gastos / Salidas en Efectivo ($),-${totalExpenses.toFixed(2)}`);
  lines.push(`(=) Efectivo Neto Esperado en Cajon ($),${expectedCashInDrawer.toFixed(2)}`);
  lines.push(`Dinero Bancario (Tarjetas + Transferencias) ($),${bankDeposits.toFixed(2)}`);
  lines.push('');

  // Detailed Sales Ledger
  lines.push('--- DETALLE DE VENTAS REGISTRADAS ---');
  lines.push('Folio Comanda,ID Venta,Fecha y Hora,Producto,Variante,Cantidad,Precio Unitario ($),Subtotal ($),Costo Unitario ($),Costo Total ($),Utilidad Linea ($),Forma de Pago');

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

    lines.push(
      [
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
      ].join(',')
    );
  });

  if (sales.length === 0) {
    lines.push('Sin ventas registradas en este periodo.');
  }

  lines.push('');

  // Detailed Expenses Ledger
  if (expenses.length > 0) {
    lines.push('--- DETALLE DE GASTOS / SALIDAS DE CAJA ---');
    lines.push('ID Gasto,Fecha y Hora,Concepto / Descripcion,Categoria,Monto ($)');
    expenses.forEach((e) => {
      lines.push(
        [
          e.id,
          new Date(e.timestamp).toLocaleString('es-MX'),
          `"${e.description.replace(/"/g, '""')}"`,
          `"${e.category}"`,
          e.amount.toFixed(2),
        ].join(',')
      );
    });
  }

  const csvContent = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateSlug = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `Reporte_Contable_${businessName.replace(/\s+/g, '_')}_${timeframe}_${dateSlug}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
