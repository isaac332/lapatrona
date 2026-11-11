import { CustomerOrder, ClosedShiftRecord, BusinessInfo, TipSettlementRecord } from '@/types/accounting';
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
  const doubleLine = '================================';
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

  if (order.isCancelled) {
    lines.push(doubleLine);
    lines.push(center('*** COMANDA ANULADA / CANCELADA ***'));
    if (order.cancellationReason) {
      lines.push(center(`Motivo: ${order.cancellationReason.toUpperCase()}`));
    }
    if (order.cancelledAt) {
      lines.push(center(`Anulación: ${new Date(order.cancelledAt).toLocaleTimeString('es-MX')}`));
    }
    lines.push(doubleLine);
  }

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
    if (item.modifiers && item.modifiers.length > 0) {
      item.modifiers.forEach((mod) => {
        lines.push(`   + ${mod.name}${mod.price > 0 ? ` (+$${mod.price.toFixed(2)})` : ''}`);
      });
    }
    if (item.instructions) {
      lines.push(`   * Nota: ${item.instructions}`);
    }
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
    if (item.modifiers && item.modifiers.length > 0) {
      for (const mod of item.modifiers) {
        lines.push(`   + ${mod.name}${mod.price > 0 ? ` (+$${mod.price.toFixed(2)})` : ''}`);
      }
    }
    if (item.instructions) {
      lines.push(`   * Nota: ${item.instructions}`);
    }
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

export function generateTipSettlementThermalText(
  record: TipSettlementRecord,
  businessInfo?: BusinessInfo
): string {
  const info = businessInfo || DEFAULT_BUSINESS_INFO;
  const line = '--------------------------------';
  const doubleLine = '================================';

  const modeLabels: Record<string, string> = {
    equitativo: 'EQUITATIVO (PARTES IGUALES)',
    puesto: 'POR PUESTO / ROL',
    horas: 'POR HORAS TRABAJADAS',
  };

  const lines: string[] = [
    center(info.name.toUpperCase()),
    center(info.tagline),
    doubleLine,
    center('*** REPARTO DE PROPINAS ***'),
    center(`TURNO #${record.shiftNumber}`),
    doubleLine,
    `Fecha: ${new Date(record.date).toLocaleString('es-MX')}`,
    pad('MODO DE REPARTO:', modeLabels[record.mode] || (record.mode || 'equitativo').toUpperCase()),
    line,
    pad('TOTAL A REPARTIR:', `$${record.totalTips.toFixed(2)} MXN`),
    pad('COLABORADORES:', `${record.payouts.length} personas`),
    line,
    pad('COLABORADOR (ROL)', 'MONTO'),
    line,
  ];

  record.payouts.forEach((p) => {
    const roleTag = p.role.substring(0, 4).toUpperCase();
    const displayName = p.name.length > 17 ? p.name.substring(0, 16) + '.' : p.name;
    lines.push(pad(`${displayName} [${roleTag}]`, `$${p.amount.toFixed(2)}`));
    if (p.percentage !== undefined) {
      lines.push(`   (${p.percentage.toFixed(1)}% del total)`);
    }
  });

  lines.push(line);
  const totalPaid = record.payouts.reduce((acc, p) => acc + p.amount, 0);
  lines.push(pad('TOTAL DISTRIBUIDO:', `$${totalPaid.toFixed(2)} MXN`));
  const residual = Math.round((record.totalTips - totalPaid) * 100) / 100;
  lines.push(pad('DIFERENCIA RESIDUAL:', `$${residual.toFixed(2)}`));

  if (record.cashierName) {
    lines.push(pad('Encargado / Cajero:', record.cashierName));
  }
  if (record.notes) {
    lines.push(`Notas: ${record.notes}`);
  }

  lines.push(line);
  lines.push(center('Firma de Conformidad de Equipo:'));
  lines.push('');
  lines.push('________________________________');
  lines.push(center('Distribución 100% Transparente'));
  lines.push(center(`${info.name} • Equipo`));
  lines.push('');

  return lines.join('\n');
}

export function generateTipSettlementWhatsAppText(
  record: TipSettlementRecord,
  businessInfo?: BusinessInfo
): string {
  const info = businessInfo || DEFAULT_BUSINESS_INFO;
  const modeLabels: Record<string, string> = {
    equitativo: '⚖️ Equitativo (Partes iguales)',
    puesto: '👨‍🍳 Por Puesto / Rol',
    horas: '⏱️ Por Horas trabajadas',
  };

  const roleNameMap: Record<string, string> = {
    cocina: 'Cocina',
    mesero: 'Servicio / Mesas',
    barra: 'Barra',
    limpieza: 'Limpieza',
    cajero: 'Cajero',
    otro: 'Personal',
  };

  let text =
    `💰 *REPARTO DE PROPINAS • ${info.name.toUpperCase()}*\n` +
    `🔢 *Turno:* #${record.shiftNumber}\n` +
    `📅 *Fecha:* ${new Date(record.date).toLocaleString('es-MX')}\n` +
    `💵 *Fondo Total Propinas:* $${record.totalTips.toFixed(2)} MXN\n` +
    `⚙️ *Modo:* ${modeLabels[record.mode] || record.mode}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *Desglose por Colaborador:*\n`;

  record.payouts.forEach((p) => {
    const roleFriendly = roleNameMap[p.role] || p.role;
    text += `• *${p.name}* (${roleFriendly}): *$${p.amount.toFixed(2)} MXN* (${p.percentage.toFixed(1)}%)\n`;
  });

  const totalPaid = record.payouts.reduce((acc, p) => acc + p.amount, 0);
  text +=
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `✅ *Total Liquidado:* $${totalPaid.toFixed(2)} MXN\n` +
    `✨ *Diferencia / Faltante:* $0.00 MXN\n`;

  if (record.cashierName) {
    text += `👤 *Entregó:* ${record.cashierName}\n`;
  }
  if (record.notes) {
    text += `📝 *Notas:* ${record.notes}\n`;
  }

  text += `\n_¡Excelente turno equipo! Gracias por el servicio de hoy._ 🔥`;

  return text;
}
