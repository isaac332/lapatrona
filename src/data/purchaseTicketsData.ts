import { PurchaseTicketRecord, PurchaseTicketItem, ExpenseRecord } from '@/types/accounting';

/**
 * Datos crudos exactos de los tickets físicos de compra (Sonora)
 * El sistema calcula dinámicamente los importes por línea, ahorros, totales y costos promedio por insumo.
 */
export const RAW_PURCHASE_TICKETS: PurchaseTicketRecord[] = [
  // TICKET 1: SuKarne 08/10/2026 (Inversión Mónica)
  {
    id: 'ticket-sukarne-2026-10-08',
    storeName: 'SuKarne (TSK Nogales Sur)',
    branchAddress: 'Abraham Zaied #408, Col. Luis Donaldo Colosio Murrieta, C.P. 84066, Nogales, Son.',
    rfc: 'SUK931216N38',
    folio: '3851TK-90834',
    timestamp: '2026-10-08T12:03:28.000Z',
    paymentMethod: 'tarjeta',
    category: 'carne',
    investor: 'Mónica',
    isInitialInvestment: true,
    items: [
      {
        id: 'item-sk-1',
        description: 'STEAK DE SIRLOIN SK 14 PAQ',
        quantity: 4.04,
        unit: 'kg',
        regularUnitPrice: 166.40,
        effectiveUnitPrice: 166.40,
        lineTotal: 672.25,
        ingredientKey: 'sirloin',
      },
    ],
  },

  // TICKET 2: Rivera Gas 08/10/2026 (Inversión Mónica)
  {
    id: 'ticket-rivera-gas-2026-10-08',
    storeName: 'Rivera Gas S.A. de C.V.',
    branchAddress: 'Carburación Raquet, Nogales, Sonora',
    rfc: 'RGA-960729-EV3',
    folio: '335276',
    timestamp: '2026-10-08T12:05:00.000Z',
    paymentMethod: 'efectivo',
    category: 'gas',
    investor: 'Mónica',
    isInitialInvestment: true,
    items: [
      {
        id: 'item-gas-1',
        description: 'GAS LP',
        quantity: 17.97,
        unit: 'L',
        regularUnitPrice: 11.13,
        effectiveUnitPrice: 11.13,
        lineTotal: 199.99,
        ingredientKey: 'gas_lp',
      },
    ],
  },

  // TICKET 3: Abastos Esperanza 08/10/2026 (Inversión Mónica)
  {
    id: 'ticket-abastos-esperanza-2026-10-08',
    storeName: 'Abastos Esperanza de Nogales',
    branchAddress: 'Av. de los Nogales #435, Col. Colinas del Yaqui, C.P. 84093, Nogales, Son.',
    folio: '58781',
    timestamp: '2026-10-08T12:48:00.000Z',
    paymentMethod: 'efectivo',
    category: 'quesos',
    investor: 'Mónica',
    isInitialInvestment: true,
    amountPaid: 207.90,
    changeGiven: 0.00,
    iva: 0.00,
    items: [
      {
        id: 'item-queso-1',
        description: 'QUESO LOS OJOS',
        quantity: 0.99,
        unit: 'kg',
        regularUnitPrice: 210.00,
        effectiveUnitPrice: 210.00,
        lineTotal: 207.90,
        ingredientKey: 'queso',
      },
    ],
  },

  // TICKET 4: Super Ley Express 22/10/2026
  {
    id: 'ticket-ley-express-2026-10-22',
    storeName: 'Super Ley Express Nogales Sur #1407',
    branchAddress: 'Av. Prolongación Alvaro Obregón #4170, Col. Nuevo Nogales, C.P. 84094, Nogales, Son.',
    rfc: 'CLE810525EA1',
    folio: 'Ticket 186 (Caja 2)',
    timestamp: '2026-10-22T13:44:55.000Z',
    paymentMethod: 'efectivo',
    category: 'verduras_abarrotes',
    amountPaid: 100.00,
    changeGiven: 37.00,
    iva: 0.00,
    items: [
      {
        id: 'item-ley22-1',
        description: 'CHILE CARIBE',
        quantity: 0.235,
        unit: 'kg',
        regularUnitPrice: 89.90,
        effectiveUnitPrice: 59.90,
        lineTotal: 14.08,
        ingredientKey: 'chile_caribe',
      },
      {
        id: 'item-ley22-2',
        description: 'LECHE SIN LACTO',
        quantity: 1,
        unit: 'pza',
        regularUnitPrice: 51.50,
        effectiveUnitPrice: 48.90,
        lineTotal: 48.90,
        ingredientKey: 'leche',
      },
    ],
  },

  // TICKET 5: Super Ley Express 24/10/2026
  {
    id: 'ticket-ley-express-2026-10-24',
    storeName: 'Super Ley Express Nogales Sur #1407',
    branchAddress: 'Av. Prolongación Alvaro Obregón #4170, Col. Nuevo Nogales, C.P. 84094, Nogales, Son.',
    rfc: 'CLE810525EA1',
    folio: 'Ticket 96 (Caja 3)',
    timestamp: '2026-10-24T16:34:00.000Z',
    paymentMethod: 'efectivo',
    category: 'verduras_abarrotes',
    amountPaid: 100.00,
    changeGiven: 5.80,
    iva: 1.59,
    items: [
      {
        id: 'item-ley24-1',
        description: 'DORITOS NACHO S',
        quantity: 1,
        unit: 'pza',
        regularUnitPrice: 60.90,
        effectiveUnitPrice: 52.90,
        lineTotal: 52.90,
        ingredientKey: 'doritos',
      },
      {
        id: 'item-ley24-2',
        description: 'PAPA RUSSET',
        quantity: 1.425,
        unit: 'kg',
        regularUnitPrice: 45.90,
        effectiveUnitPrice: 13.90,
        lineTotal: 19.81,
        ingredientKey: 'papa',
      },
      {
        id: 'item-ley24-3',
        description: 'TOALLA COCINA B',
        quantity: 1,
        unit: 'pza',
        regularUnitPrice: 23.90,
        effectiveUnitPrice: 21.50,
        lineTotal: 21.50,
        ingredientKey: 'limpieza',
      },
    ],
  },

  // TICKET 6: SuKarne (Nota 3851TK-91859)
  {
    id: 'ticket-sukarne-91859',
    storeName: 'SuKarne (TSK Nogales Sur)',
    branchAddress: 'Abraham Zaied #408, Col. Luis Donaldo Colosio Murrieta, C.P. 84066, Nogales, Son.',
    rfc: 'SUK931216N38',
    folio: '3851TK-91859',
    timestamp: '2026-10-30T13:15:00.000Z',
    paymentMethod: 'tarjeta',
    category: 'carne',
    items: [
      {
        id: 'item-sk-2',
        description: 'STEAK DE SIRLOIN SK 14 PAQ',
        quantity: 4.1225,
        unit: 'kg',
        regularUnitPrice: 146.44,
        effectiveUnitPrice: 146.44,
        lineTotal: 603.69,
        ingredientKey: 'sirloin',
      },
    ],
  },

  // TICKET 7: Bodega Aurrera / Walmart (Inversión Mónica: Aceite y Mozzarella)
  {
    id: 'ticket-aurrera-insumos',
    storeName: 'Bodega Aurrera (Walmart México)',
    branchAddress: 'Nogales, Sonora',
    folio: 'Ticket Bodega Aurrera',
    timestamp: '2026-10-08T13:10:00.000Z',
    paymentMethod: 'efectivo',
    category: 'insumos',
    investor: 'Mónica',
    isInitialInvestment: true,
    amountPaid: 300.00,
    changeGiven: 51.00,
    items: [
      {
        id: 'item-aur-1',
        description: 'ACEITE AURRERA 800ML (AC AU 800)',
        quantity: 3,
        unit: 'pza',
        regularUnitPrice: 27.00,
        effectiveUnitPrice: 27.00,
        lineTotal: 81.00,
        ingredientKey: 'aceite',
      },
      {
        id: 'item-aur-2',
        description: 'MAYONESA AURRERA 385G (AU MAY 385)',
        quantity: 1,
        unit: 'pza',
        regularUnitPrice: 37.00,
        effectiveUnitPrice: 37.00,
        lineTotal: 37.00,
        ingredientKey: 'mayonesa',
      },
      {
        id: 'item-aur-3',
        description: 'QUESO MOZZARELLA LA VILLITA (LVI MOZZA)',
        quantity: 1,
        unit: 'pza',
        regularUnitPrice: 147.00,
        effectiveUnitPrice: 131.00,
        lineTotal: 131.00,
        ingredientKey: 'queso',
      },
    ],
  },

  // TICKET PAN: Panadería La Espiga 08/10/2026 (Inversión Mónica: 20 panes)
  {
    id: 'ticket-pan-2026-10-08',
    storeName: 'Panadería La Espiga (Pan Philly)',
    branchAddress: 'Nogales, Sonora',
    folio: 'Nota Pan-001',
    timestamp: '2026-10-08T13:30:00.000Z',
    paymentMethod: 'efectivo',
    category: 'pan',
    investor: 'Mónica',
    isInitialInvestment: true,
    items: [
      {
        id: 'item-pan-1',
        description: 'Pan Philly Artesanal Especial (20 pzas)',
        quantity: 20,
        unit: 'pza',
        regularUnitPrice: 10.00,
        effectiveUnitPrice: 10.00,
        lineTotal: 200.00,
        ingredientKey: 'pan',
      },
    ],
  },

  // INVERSIÓN ISAAC 1: Dulcería El Payaso 08/10/2026
  {
    id: 'ticket-dulceria-isaac',
    storeName: 'Dulcería El Payaso (Inversión Isaac)',
    branchAddress: 'Centro, Nogales, Sonora',
    folio: 'Nota Dulcería-153',
    timestamp: '2026-10-08T14:00:00.000Z',
    paymentMethod: 'efectivo',
    category: 'desechables',
    investor: 'Isaac',
    isInitialInvestment: true,
    items: [
      {
        id: 'item-dulceria-1',
        description: 'Bolsas, papel grado alimenticio y empaques',
        quantity: 1,
        unit: 'paq',
        regularUnitPrice: 153.50,
        effectiveUnitPrice: 153.50,
        lineTotal: 153.50,
        ingredientKey: 'desechables',
      },
    ],
  },

  // INVERSIÓN ISAAC 2: Economax Nogales 08/10/2026 ($406)
  {
    id: 'ticket-economax-1-isaac',
    storeName: 'Economax Nogales (Inversión Isaac)',
    branchAddress: 'Av. Alvaro Obregón, Nogales, Sonora',
    folio: 'Ticket Economax-406',
    timestamp: '2026-10-08T14:20:00.000Z',
    paymentMethod: 'efectivo',
    category: 'desechables',
    investor: 'Isaac',
    isInitialInvestment: true,
    items: [
      {
        id: 'item-economax-1',
        description: 'Charolas térmicas y contenedores para sándwich y papas',
        quantity: 1,
        unit: 'paq',
        regularUnitPrice: 406.00,
        effectiveUnitPrice: 406.00,
        lineTotal: 406.00,
        ingredientKey: 'desechables',
      },
    ],
  },

  // INVERSIÓN ISAAC 3: Economax Nogales 08/10/2026 ($215)
  {
    id: 'ticket-economax-2-isaac',
    storeName: 'Economax Nogales (Inversión Isaac)',
    branchAddress: 'Av. Alvaro Obregón, Nogales, Sonora',
    folio: 'Ticket Economax-215',
    timestamp: '2026-10-08T14:40:00.000Z',
    paymentMethod: 'efectivo',
    category: 'desechables',
    investor: 'Isaac',
    isInitialInvestment: true,
    items: [
      {
        id: 'item-economax-2',
        description: 'Bolsas para despacho, servilletas y guantes de preparación',
        quantity: 1,
        unit: 'paq',
        regularUnitPrice: 215.00,
        effectiveUnitPrice: 215.00,
        lineTotal: 215.00,
        ingredientKey: 'desechables',
      },
    ],
  },

  // INVERSIÓN ISAAC 4: Aporte de Capital y Equipo 08/10/2026 ($589)
  {
    id: 'ticket-inversion-isaac-efectivo',
    storeName: 'Aporte de Inversión Inicial (Isaac)',
    branchAddress: 'Los Phillys de La Patrona, Nogales, Sonora',
    folio: 'Aporte-Isaac-589',
    timestamp: '2026-10-08T15:00:00.000Z',
    paymentMethod: 'efectivo',
    category: 'equipo',
    investor: 'Isaac',
    isInitialInvestment: true,
    items: [
      {
        id: 'item-inversion-isaac-1',
        description: 'Aporte de capital / utensilios y equipo de plancha',
        quantity: 1,
        unit: 'serv',
        regularUnitPrice: 589.00,
        effectiveUnitPrice: 589.00,
        lineTotal: 589.00,
        ingredientKey: 'equipo',
      },
    ],
  },

  // TICKET 8: Super Villa 08/11/2026
  {
    id: 'ticket-super-villa-2026-11-08',
    storeName: 'Super Villa (José Ángel Gastélum Rojas)',
    branchAddress: 'Calle del Cóndor #13, Dep. Villa Sonora, C.P. 84093, Nogales, Son.',
    rfc: 'GARA800802897',
    folio: 'JMNVENNV00292508',
    timestamp: '2026-11-08T14:22:00.000Z',
    paymentMethod: 'efectivo',
    category: 'verduras_abarrotes',
    amountPaid: 50.00,
    changeGiven: 35.87,
    items: [
      {
        id: 'item-sv-1',
        description: 'CHILE CARIBE KG',
        quantity: 0.244,
        unit: 'kg',
        regularUnitPrice: 57.90,
        effectiveUnitPrice: 57.90,
        lineTotal: 14.13,
        ingredientKey: 'chile_caribe',
      },
    ],
  },

  // TICKET 9: Super Ley Express 08/11/2026
  {
    id: 'ticket-ley-express-2026-11-08',
    storeName: 'Super Ley Express Nogales Sur #1407',
    branchAddress: 'Av. Prolongación Alvaro Obregón #4170, Col. Nuevo Nogales, C.P. 84094, Nogales, Son.',
    rfc: 'CLE810525EA1',
    folio: 'Ticket 72 (Caja 1)',
    timestamp: '2026-11-08T16:22:27.000Z',
    paymentMethod: 'efectivo',
    category: 'verduras_abarrotes',
    amountPaid: 200.00,
    changeGiven: 53.05,
    iva: 0.00,
    items: [
      {
        id: 'item-ley08-1',
        description: 'ACEITE VEGETAL',
        quantity: 3,
        unit: 'pza',
        regularUnitPrice: 36.90,
        effectiveUnitPrice: 21.00,
        lineTotal: 63.00,
        ingredientKey: 'aceite',
      },
      {
        id: 'item-ley08-2',
        description: 'CEBOLLA BLANCA',
        quantity: 0.405,
        unit: 'kg',
        regularUnitPrice: 91.90,
        effectiveUnitPrice: 65.90,
        lineTotal: 26.69,
        ingredientKey: 'cebolla',
      },
      {
        id: 'item-ley08-3',
        description: 'CHILE CARIBE',
        quantity: 0.21,
        unit: 'kg',
        regularUnitPrice: 89.90,
        effectiveUnitPrice: 55.90,
        lineTotal: 11.74,
        ingredientKey: 'chile_caribe',
      },
      {
        id: 'item-ley08-4',
        description: 'PAPA RUSSET',
        quantity: 3.53,
        unit: 'kg',
        regularUnitPrice: 45.90,
        effectiveUnitPrice: 12.90,
        lineTotal: 45.54,
        ingredientKey: 'papa',
      },
    ],
  },

  // TICKET 10: Rivera Gas 12/11/2026 (Reabasto Gas LP)
  {
    id: 'ticket-rivera-gas-2026-11-12',
    storeName: 'Rivera Gas S.A. de C.V.',
    branchAddress: 'Dr. Norman E. Borlaug y 700 Esq., S/N Valle del Yaqui, Sonora, C.P. 8519 (Carburación Raquet • Equipo 4)',
    rfc: 'RGA-960729-EU3',
    folio: '339773',
    timestamp: '2026-11-12T22:31:00.000Z',
    paymentMethod: 'efectivo',
    category: 'gas',
    amountPaid: 200.00,
    changeGiven: 0.00,
    items: [
      {
        id: 'item-gas-2',
        description: 'GAS LP',
        quantity: 18.03,
        unit: 'L',
        regularUnitPrice: 11.09,
        effectiveUnitPrice: 11.09,
        lineTotal: 200.00,
        ingredientKey: 'gas_lp',
      },
    ],
  },
];

export function calculateTicketItemSubtotal(item: PurchaseTicketItem): number {
  if (typeof item.lineTotal === 'number') {
    return item.lineTotal;
  }
  return Math.round(item.quantity * item.effectiveUnitPrice * 100) / 100;
}

export function calculateTicketItemSavings(item: PurchaseTicketItem): number {
  const regularTotal = Math.round(item.quantity * item.regularUnitPrice * 100) / 100;
  const actualTotal = calculateTicketItemSubtotal(item);
  return Math.max(0, Math.round((regularTotal - actualTotal) * 100) / 100);
}

export function calculateTicketTotal(ticket: PurchaseTicketRecord): number {
  const sum = ticket.items.reduce((acc, item) => acc + calculateTicketItemSubtotal(item), 0);
  return Math.round(sum * 100) / 100;
}

export function calculateTicketSavings(ticket: PurchaseTicketRecord): number {
  const sum = ticket.items.reduce((acc, item) => acc + calculateTicketItemSavings(item), 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Datos exactos de la Inversión Inicial (Capital Semilla de Socios) extraídos directamente
 * de la libreta contable manuscrita ("Inversión"):
 * - Mónica: $1,493.00 (Gas $200, Queso chih. $208, Sirloin 4.04kg $673, Aceite $81, Pan 20 $200, Queso Mozzarella $131)
 * - Isaac: $1,363.50 (Dulcería $153.50, Economax $406, Economax $215, Aporte de Inversión $589)
 * Total Inversión Inicial: $2,856.50
 */
export const INITIAL_INVESTMENTS = {
  monica: {
    partnerName: 'Mónica' as const,
    total: 1493.00,
    percentage: 52.27,
    items: [
      { description: 'Gas LP', amount: 200.00, store: 'Rivera Gas', category: 'gas', detail: '18 L Gas LP para cocina' },
      { description: 'Queso Chihuahua', amount: 208.00, store: 'Abastos Esperanza', category: 'quesos', detail: '0.99 kg Queso Los Ojos' },
      { description: 'Carne Steak de Sirloin', amount: 673.00, store: 'SuKarne', category: 'carne', detail: '4.04 kg Sirloin SK en paquete' },
      { description: 'Aceite Vegetal', amount: 81.00, store: 'Bodega Aurrera', category: 'insumos', detail: '3 pzas Aceite 800ml ($27 c/u)' },
      { description: 'Pan Philly Artesanal', amount: 200.00, store: 'Panadería La Espiga', category: 'pan', detail: '20 piezas de pan ($10 c/u)' },
      { description: 'Queso Mozzarella', amount: 131.00, store: 'Bodega Aurrera', category: 'quesos', detail: '1 pza Queso La Villita' },
    ],
  },
  isaac: {
    partnerName: 'Isaac' as const,
    total: 1363.50,
    percentage: 47.73,
    items: [
      { description: 'Dulcería (Empaques y Desechables)', amount: 153.50, store: 'Dulcería El Payaso', category: 'desechables', detail: 'Bolsas, papel grado alimenticio y empaques' },
      { description: 'Economax (Charolas Térmicas)', amount: 406.00, store: 'Economax Nogales', category: 'desechables', detail: 'Charolas y contenedores sándwich/papas' },
      { description: 'Economax (Bolsas y Suministros)', amount: 215.00, store: 'Economax Nogales', category: 'desechables', detail: 'Bolsas de despacho, servilletas y guantes' },
      { description: 'Aporte de Capital / Equipo', amount: 589.00, store: 'Aporte Inicial Isaac', category: 'equipo', detail: 'Utensilios de cocina y aporte inicial' },
    ],
  },
  total: 2856.50,
};

/**
 * Convierte los tickets físicos crudos en registros ExpenseRecord calculados dinámicamente
 * para integrarse de forma nativa con toda la contabilidad del programa.
 */
export const INITIAL_TICKET_EXPENSES: ExpenseRecord[] = RAW_PURCHASE_TICKETS.map((ticket) => {
  const calculatedAmount = calculateTicketTotal(ticket);
  const calculatedSavings = calculateTicketSavings(ticket);
  const itemsSummaryText = ticket.items
    .map((it) => `${it.quantity} ${it.unit} ${it.description}`)
    .join(' + ');

  return {
    id: ticket.id,
    description: `${ticket.storeName}: ${itemsSummaryText}`,
    category: ticket.category,
    amount: calculatedAmount,
    timestamp: ticket.timestamp,
    storeName: ticket.storeName,
    branchAddress: ticket.branchAddress,
    rfc: ticket.rfc,
    folio: ticket.folio,
    paymentMethod: ticket.paymentMethod,
    items: ticket.items,
    savedDiscount: calculatedSavings,
    investor: ticket.investor || 'Caja',
    isInitialInvestment: ticket.isInitialInvestment || false,
  };
}).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());