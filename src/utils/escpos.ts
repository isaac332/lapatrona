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

  if (order.tableNumber) {
    lines.push(`Mesa / Barra: ${order.tableNumber}`);
  }
  if (order.customerName) {
    lines.push(`Cliente/Atendió: ${order.customerName}`);
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
  const foodSubtotal = order.items.reduce((acc, it) => acc + it.subtotal, 0);
  if (order.discount && order.discount.amount > 0) {
    lines.push(pad('Subtotal Alimentos:', `$${foodSubtotal.toFixed(2)}`));
    lines.push(pad(`(-) Descuento:`, `-$${order.discount.amount.toFixed(2)}`));
  }
  if (order.tip && order.tip > 0) {
    lines.push(pad('(+) Propina:', `$${order.tip.toFixed(2)}`));
  }
  lines.push(pad('TOTAL A PAGAR:', `$${order.total.toFixed(2)} MXN`));

  if (order.paymentMethod === 'mixto' && order.splitPayment) {
    lines.push(pad('Forma de Pago:', 'PAGO MIXTO'));
    lines.push(pad(' - Efectivo:', `$${order.splitPayment.cash.toFixed(2)}`));
    lines.push(pad(' - Tarjeta/Clip:', `$${order.splitPayment.card.toFixed(2)}`));
    if (typeof order.amountReceived === 'number' && order.amountReceived > 0) {
      lines.push(pad('Recibido Efectivo:', `$${order.amountReceived.toFixed(2)}`));
      lines.push(pad('CAMBIO EFECTIVO:', `$${(order.change || 0).toFixed(2)} MXN`));
    }
  } else {
    lines.push(pad('Forma de Pago:', order.paymentMethod.toUpperCase()));
    if (order.paymentMethod === 'efectivo' && typeof order.amountReceived === 'number' && order.amountReceived > 0) {
      lines.push(pad('Recibido:', `$${order.amountReceived.toFixed(2)}`));
      lines.push(pad('CAMBIO:', `$${(order.change || 0).toFixed(2)} MXN`));
    }
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

export function generatePreCuentaThermalText(order: CustomerOrder, businessInfo?: BusinessInfo): string {
  const info = businessInfo || DEFAULT_BUSINESS_INFO;
  const line = '--------------------------------';
  const doubleLine = '================================';
  const lines: string[] = [
    doubleLine,
    center(info.name.toUpperCase()),
    center(`${info.tagline || 'ESTADO DE CONSUMO'}`),
    doubleLine,
    center('*** PRE-CUENTA ***'),
    center('(NO ES COMPROBANTE FISCAL)'),
    line,
    pad('MESA / CUENTA:', order.tableNumber || (order.orderType === 'aqui' ? 'Consumo Aquí' : 'Para Llevar')),
    pad('FOLIO COMANDA:', `#${String(order.orderNumber).padStart(3, '0')}`),
  ];

  const date = new Date(order.timestamp);
  const dateStr = !isNaN(date.getTime())
    ? date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';
  const timeStr = !isNaN(date.getTime())
    ? date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    : '';
  lines.push(pad(`FECHA: ${dateStr}`, `HORA: ${timeStr}`));
  if (order.customerName) {
    lines.push(pad('CLIENTE / ATENDIÓ:', order.customerName));
  }
  lines.push(line);
  lines.push('CANT PRODUCTO              TOTAL');
  lines.push(line);

  for (const item of order.items) {
    const qtyStr = `${item.quantity}x `.padEnd(4);
    const subtotalStr = `$${item.subtotal.toFixed(2)}`;
    const maxNameLen = 32 - qtyStr.length - subtotalStr.length;
    let nameStr = item.productName;
    if (nameStr.length > maxNameLen) {
      nameStr = nameStr.substring(0, maxNameLen - 1) + '.';
    }
    lines.push(qtyStr + nameStr.padEnd(maxNameLen) + subtotalStr);
  }

  lines.push(line);
  const foodSubtotal = order.items.reduce((acc, it) => acc + it.subtotal, 0);
  if (order.discount && order.discount.amount > 0) {
    lines.push(pad('Subtotal Alimentos:', `$${foodSubtotal.toFixed(2)}`));
    lines.push(pad(`(-) Descuento:`, `-$${order.discount.amount.toFixed(2)}`));
  }
  const netTotal = Math.max(0, foodSubtotal - (order.discount?.amount || 0));
  lines.push(pad('TOTAL CONSUMO:', `$${netTotal.toFixed(2)} MXN`));
  lines.push(doubleLine);

  lines.push(center('SUGERENCIA DE PROPINA'));
  lines.push(pad('10% Sugerido:', `$${(netTotal * 0.1).toFixed(2)} (Total $${(netTotal * 1.1).toFixed(2)})`));
  lines.push(pad('15% Sugerido:', `$${(netTotal * 0.15).toFixed(2)} (Total $${(netTotal * 1.15).toFixed(2)})`));
  lines.push(pad('20% Sugerido:', `$${(netTotal * 0.2).toFixed(2)} (Total $${(netTotal * 1.2).toFixed(2)})`));
  lines.push(line);
  lines.push(center('La propina es 100% voluntaria.'));
  lines.push(center('¡Muchas gracias por su visita!'));
  lines.push('');

  return lines.join('\n');
}

export function generateShiftThermalText(shift: ClosedShiftRecord, businessInfo?: BusinessInfo): string {
  const info = businessInfo || DEFAULT_BUSINESS_INFO;
  const line = '--------------------------------';
  const doubleLine = '================================';
  const isCorteZ = shift.reportType === 'corte_z';

  const lines: string[] = [
    doubleLine,
    center(info.name.toUpperCase()),
    center(isCorteZ ? '*** CORTE Z (CIERRE DIARIO) ***' : `TICKET DE CORTE #${shift.shiftNumber}`),
    doubleLine,
    `Cierre: ${new Date(shift.closedAt).toLocaleString('es-MX')}`,
  ];

  if (shift.orderRange) {
    lines.push(pad('RANGO DE COMANDAS:', shift.orderRange));
  }
  lines.push(line);

  if (isCorteZ && shift.subtotalSinIVA !== undefined && shift.iva16 !== undefined) {
    lines.push(pad('VENTA NETA (SUBTOTAL):', `$${shift.subtotalSinIVA.toFixed(2)}`));
    lines.push(pad('IVA TRASLADADO (16%):', `$${shift.iva16.toFixed(2)}`));
    lines.push(line);
  }

  lines.push(pad('VENTA BRUTA TOTAL:', `$${shift.totalGrossRevenue.toFixed(2)}`));

  if (shift.totalDiscounts && shift.totalDiscounts > 0) {
    lines.push(pad('(-) Descuentos / Promos:', `-$${shift.totalDiscounts.toFixed(2)}`));
  }
  if (shift.totalWasteCost && shift.totalWasteCost > 0) {
    lines.push(pad('(-) Mermas de Cocina:', `-$${shift.totalWasteCost.toFixed(2)}`));
  }

  lines.push(line);
  lines.push(pad('(+) Fondo Apertura:', `$${shift.startingCash.toFixed(2)}`));
  lines.push(pad('(+) Ventas Efectivo:', `$${shift.cashSalesTotal.toFixed(2)}`));

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
  lines.push(center(isCorteZ ? 'CIERRE OFICIAL DEL DÍA' : 'CORTE PARCIAL DE TURNO'));
  lines.push(center(`${info.name} • Auditoría`));
  lines.push('');

  return lines.join('\n');
}
