import { CustomerOrder, ClosedShiftRecord } from '@/types/accounting';

const LINE_WIDTH = 32;

function pad(left: string, right: string, width = LINE_WIDTH): string {
  const space = Math.max(1, width - left.length - right.length);
  return left + ' '.repeat(space) + right;
}

function center(text: string, width = LINE_WIDTH): string {
  const space = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(space) + text;
}

export function generateOrderThermalText(order: CustomerOrder): string {
  const line = '--------------------------------';
  const lines: string[] = [
    center('PHILLY & FRY'),
    center('• LA PATRONA •'),
    center('Comanda de Cocina / Mostrador'),
    line,
    pad(`FOLIO: #${String(order.orderNumber).padStart(3, '0')}`, order.orderType === 'llevar' ? '[LLEVAR]' : '[AQUÍ]'),
    `Fecha: ${new Date(order.timestamp).toLocaleString('es-MX')}`,
  ];

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
  lines.push(pad('TOTAL A PAGAR:', `$${order.total.toFixed(2)} MXN`));
  lines.push(pad('Forma de Pago:', order.paymentMethod.toUpperCase()));

  if (order.paymentMethod === 'efectivo' && typeof order.amountReceived === 'number' && order.amountReceived > 0) {
    lines.push(pad('Recibido:', `$${order.amountReceived.toFixed(2)}`));
    lines.push(pad('CAMBIO:', `$${(order.change || 0).toFixed(2)} MXN`));
  }

  lines.push(line);
  lines.push(center('¡GRACIAS POR SU PREFERENCIA!'));
  lines.push(center('La Patrona • Philly & Fry'));
  lines.push('');

  return lines.join('\n');
}

export function generateShiftThermalText(shift: ClosedShiftRecord): string {
  const line = '--------------------------------';
  const lines: string[] = [
    center('LA PATRONA'),
    center('Philly & Fry POS'),
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
  lines.push(pad('Tarjetas / Clip:', `$${shift.cardSalesTotal.toFixed(2)}`));
  lines.push(pad('Transferencias SPEI:', `$${shift.transferSalesTotal.toFixed(2)}`));
  lines.push(pad('Piezas Vendidas:', `${shift.totalUnits} uds`));
  lines.push(line);
  lines.push(center('*** FIN AUDITORÍA DE TURNO ***'));
  lines.push('');

  return lines.join('\n');
}
