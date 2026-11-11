import { CustomerOrder, ClosedShiftRecord, BusinessInfo } from '@/types/accounting';
import { DEFAULT_BUSINESS_INFO } from '@/data/initialBusinessInfo';

const LINE_WIDTH = 32;

function pad(left: string, right: string, width = LINE_WIDTH): string {
  const space = Math.max(1, width - left.length - right.length);
  return left + ' '.repeat(space) + right;
}

function center(text: string, width = LINE_WIDTH): string {
  const space = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(space) + text;
}

export function generateOrderThermalText(order: CustomerOrder, businessInfo?: BusinessInfo): string {
  const info = businessInfo || DEFAULT_BUSINESS_INFO;
  const line = '--------------------------------';
  const lines: string[] = [
    center(info.name.toUpperCase()),
    center(info.tagline),
  ];

  if (info.address) {
    lines.push(center(info.address));
  }
  if (info.phone) {
    lines.push(center(`Tel: ${info.phone}`));
  }
  if (info.rfc) {
    lines.push(center(`RFC: ${info.rfc.toUpperCase()}`));
  }

  lines.push(center('Comanda de Cocina / Mostrador'));
  lines.push(line);
  lines.push(pad(`FOLIO: #${String(order.orderNumber).padStart(3, '0')}`, order.orderType === 'llevar' ? '[LLEVAR]' : '[AQUÍ]'));
  lines.push(`Fecha: ${new Date(order.timestamp).toLocaleString('es-MX')}`);

  if (order.customerName) {
    lines.push(`Cliente/Mesa: ${order.customerName}`);
  }
  if (order.notes) {
    lines.push(`Nota: ${order.notes}`);
  }

  lines.push(line);
  lines.push(pad('CANT  PRODUCTO', 'IMPORTE'));
  lines.push(line);

  order.items.forEach((item) => {
    lines.push(pad(`${item.quantity}x ${item.productName}`, `$${item.subtotal.toFixed(2)}`));
    lines.push(`   (${item.variantLabel})`);
  });

  lines.push(line);
  if (order.tip && order.tip > 0) {
    lines.push(pad('Subtotal Alimentos:', `$${(order.total - order.tip).toFixed(2)}`));
    lines.push(pad('(+) Propina:', `$${order.tip.toFixed(2)}`));
  }
  lines.push(pad('TOTAL A PAGAR:', `$${order.total.toFixed(2)} MXN`));
  lines.push(pad('Forma de Pago:', order.paymentMethod.toUpperCase()));

  if (order.paymentMethod === 'efectivo' && typeof order.amountReceived === 'number' && order.amountReceived > 0) {
    lines.push(pad('Recibido:', `$${order.amountReceived.toFixed(2)}`));
    lines.push(pad('CAMBIO:', `$${(order.change || 0).toFixed(2)} MXN`));
  }

  lines.push(line);
  lines.push(center(info.footerNote.toUpperCase()));
  lines.push(center(`${info.name} • Sistema POS`));
  lines.push('');

  return lines.join('\n');
}

export function formatCurrencyMXN(val: number): string {
  return `$${val.toFixed(2)} MXN`;
}

export const generateEscPosComandaTicket = generateOrderThermalText;

export function generateShiftThermalText(shift: ClosedShiftRecord, businessInfo?: BusinessInfo): string {
  const info = businessInfo || DEFAULT_BUSINESS_INFO;
  const line = '--------------------------------';
  const lines: string[] = [
    center(info.name.toUpperCase()),
    center(`${info.tagline} - POS`),
    center(`Ticket de Corte #${shift.shiftNumber}`),
    line,
    `Cierre: ${new Date(shift.closedAt).toLocaleString('es-MX')}`,
    line,
    pad('VENTA BRUTA TOTAL:', `$${shift.totalGrossRevenue.toFixed(2)}`),
    pad('(+) Fondo Apertura:', `$${shift.startingCash.toFixed(2)}`),
    pad('(+) Ventas Efectivo:', `$${shift.cashSalesTotal.toFixed(2)}`),
  ];

  if (shift.totalExpenses > 0) {
    lines.push(pad('(-) Gastos de Caja:', `-$${shift.totalExpenses.toFixed(2)}`));
  }

  lines.push(line);
  lines.push(pad('ESPERADO EN CAJÓN:', `$${shift.expectedCashInDrawer.toFixed(2)}`));

  if (shift.countedCash !== undefined) {
    lines.push(pad('CONTADO FÍSICO:', `$${shift.countedCash.toFixed(2)}`));
    const statusText =
      shift.differenceStatus === 'cuadrada'
        ? '✓ CUADRADA ($0.00)'
        : shift.differenceStatus === 'sobrante'
        ? `▲ SOBRANTE: +$${shift.difference?.toFixed(2)}`
        : `▼ FALTANTE: -$${Math.abs(shift.difference || 0).toFixed(2)}`;
    lines.push(pad('RESULTADO ARQUEO:', statusText));
  }

  lines.push(line);
  lines.push(pad('Ventas Tarjeta:', `$${shift.cardSalesTotal.toFixed(2)}`));
  lines.push(pad('Ventas SPEI:', `$${shift.transferSalesTotal.toFixed(2)}`));
  if (shift.totalTipsCollected && shift.totalTipsCollected > 0) {
    lines.push(pad('Propinas Personal:', `$${shift.totalTipsCollected.toFixed(2)}`));
  }
  lines.push(pad('Piezas Vendidas:', `${shift.totalUnits} uds`));

  if (shift.cashierName) {
    lines.push(pad('Cajero / Turno:', shift.cashierName));
  }
  if (shift.notes) {
    lines.push(`Notas: ${shift.notes}`);
  }

  lines.push(line);
  lines.push(center('FIN DE TURNO CONCILIADO'));
  lines.push(center(`${info.name} • Auditoría`));
  lines.push('');

  return lines.join('\n');
}
