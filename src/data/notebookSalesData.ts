import { SaleRecord, ClosedShiftRecord, PaymentMethod } from '@/types/accounting';

export const NOTEBOOK_INITIAL_SALES: SaleRecord[] = [
  // =========================================================================
  // SEMANA 1: JUEVES 8 AL DOMINGO 11 DE OCTUBRE 2026 (Total: $1,000.00)
  // =========================================================================
  // Jueves 8 de Octubre 2026: 3 Sándwich c/ papas ($180 c/u), 2 Quesadilla c/ papas ($70 c/u), 1 Quesadilla sin papas ($50) = $730
  ...Array.from({ length: 3 }, (_, i): SaleRecord => ({
    id: `nb-2026-10-08-sw-fries-${i + 1}`,
    productId: 'sandwich-fries',
    timestamp: `2026-10-08T19:${10 + i * 5}:00.000Z`,
    quantity: 1,
    unitPrice: 180,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  })),
  ...Array.from({ length: 2 }, (_, i): SaleRecord => ({
    id: `nb-2026-10-08-q-fries-${i + 1}`,
    productId: 'quesadilla-fries',
    timestamp: `2026-10-08T20:${10 + i * 5}:00.000Z`,
    quantity: 1,
    unitPrice: 70,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  })),
  {
    id: `nb-2026-10-08-q-alone-1`,
    productId: 'quesadilla-alone',
    timestamp: '2026-10-08T20:30:00.000Z',
    quantity: 1,
    unitPrice: 50,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  },

  // Viernes 9 de Octubre 2026: 1 Sándwich solo ($130), 2 Quesadilla c/ papas ($70 c/u) = $270
  {
    id: `nb-2026-10-09-sw-alone-1`,
    productId: 'sandwich-alone',
    timestamp: '2026-10-09T19:30:00.000Z',
    quantity: 1,
    unitPrice: 130,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  },
  ...Array.from({ length: 2 }, (_, i): SaleRecord => ({
    id: `nb-2026-10-09-q-fries-${i + 1}`,
    productId: 'quesadilla-fries',
    timestamp: `2026-10-09T20:${15 + i * 5}:00.000Z`,
    quantity: 1,
    unitPrice: 70,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  })),

  // =========================================================================
  // SEMANA 2: JUEVES 15 AL DOMINGO 18 DE OCTUBRE 2026 (Total: $1,310.00)
  // =========================================================================
  // Jueves 15 de Octubre 2026: 1 Champurro ($40) = $40
  {
    id: `nb-2026-10-15-champurro-1`,
    productId: 'champurro',
    timestamp: '2026-10-15T20:00:00.000Z',
    quantity: 1,
    unitPrice: 40,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  },

  // Sábado 17 de Octubre 2026: 4 Champurros ($40 c/u), 4 Sándwich c/ papas ($160 c/u), 3 Sándwich solo ($130 c/u) = $1,190
  ...Array.from({ length: 4 }, (_, i): SaleRecord => ({
    id: `nb-2026-10-17-champurro-${i + 1}`,
    productId: 'champurro',
    timestamp: `2026-10-17T19:${10 + i * 5}:00.000Z`,
    quantity: 1,
    unitPrice: 40,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  })),
  ...Array.from({ length: 4 }, (_, i): SaleRecord => ({
    id: `nb-2026-10-17-sw-fries-${i + 1}`,
    productId: 'sandwich-fries',
    timestamp: `2026-10-17T20:${10 + i * 5}:00.000Z`,
    quantity: 1,
    unitPrice: 160,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  })),
  ...Array.from({ length: 3 }, (_, i): SaleRecord => ({
    id: `nb-2026-10-17-sw-alone-${i + 1}`,
    productId: 'sandwich-alone',
    timestamp: `2026-10-17T21:${10 + i * 5}:00.000Z`,
    quantity: 1,
    unitPrice: 130,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  })),

  // Domingo 18 de Octubre 2026: 2 Champurros ($40 c/u) = $80
  ...Array.from({ length: 2 }, (_, i): SaleRecord => ({
    id: `nb-2026-10-18-champurro-${i + 1}`,
    productId: 'champurro',
    timestamp: `2026-10-18T19:${20 + i * 5}:00.000Z`,
    quantity: 1,
    unitPrice: 40,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  })),

  // =========================================================================
  // SEMANA 3: JUEVES 22 AL DOMINGO 25 DE OCTUBRE 2026 (Total: $380.00)
  // =========================================================================
  // Viernes 23 de Octubre 2026: 1 Papas Lokas ($70) + $30 registrado en libreta = $100
  {
    id: `nb-2026-10-23-papas-lokas-1`,
    productId: 'steak-frites',
    timestamp: '2026-10-23T20:00:00.000Z',
    quantity: 1,
    unitPrice: 70,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  },
  {
    id: `nb-2026-10-23-extra-1`,
    productId: 'fries-cheese',
    timestamp: '2026-10-23T20:05:00.000Z',
    quantity: 1,
    unitPrice: 30,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
    modifiersText: 'Registro libreta ($30)',
  },

  // Sábado 24 de Octubre 2026: 1 Papas Lokas ($70) = $70
  {
    id: `nb-2026-10-24-papas-lokas-1`,
    productId: 'steak-frites',
    timestamp: '2026-10-24T20:15:00.000Z',
    quantity: 1,
    unitPrice: 70,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  },

  // Domingo 25 de Octubre 2026: 3 Quesadilla c/ papas ($70 |||) = $210
  ...Array.from({ length: 3 }, (_, i): SaleRecord => ({
    id: `nb-2026-10-25-q-fries-${i + 1}`,
    productId: 'quesadilla-fries',
    timestamp: `2026-10-25T20:${10 + i * 10}:00.000Z`,
    quantity: 1,
    unitPrice: 70,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  })),

  // =========================================================================
  // SEMANA 4: JUEVES 29 DE OCT AL DOMINGO 1 DE NOV 2026 (Total: $70.00)
  // =========================================================================
  // Viernes 30 de Octubre 2026: 1 Quesadilla c/ papas ($70) = $70
  {
    id: `nb-2026-10-30-q-fries-1`,
    productId: 'quesadilla-fries',
    timestamp: '2026-10-30T20:30:00.000Z',
    quantity: 1,
    unitPrice: 70,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  },

  // =========================================================================
  // SEMANA 5: JUEVES 5 AL DOMINGO 8 DE NOVIEMBRE 2026
  // =========================================================================
  // Jueves 5 de Noviembre 2026: 1 Sándwich ($160), 2 Quesadillas c/ papas ($70 = $140), 2 Papas con queso amarillo ($40 = $80) = $380 (+50 Fondo)
  {
    id: `nb-2026-11-05-sw-fries-1`,
    productId: 'sandwich-fries',
    timestamp: '2026-11-05T19:45:00.000Z',
    quantity: 1,
    unitPrice: 160,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  },
  ...Array.from({ length: 2 }, (_, i): SaleRecord => ({
    id: `nb-2026-11-05-q-fries-${i + 1}`,
    productId: 'quesadilla-fries',
    timestamp: `2026-11-05T20:${10 + i * 5}:00.000Z`,
    quantity: 1,
    unitPrice: 70,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  })),
  ...Array.from({ length: 2 }, (_, i): SaleRecord => ({
    id: `nb-2026-11-05-fries-cheese-${i + 1}`,
    productId: 'fries-cheese',
    timestamp: `2026-11-05T20:${30 + i * 5}:00.000Z`,
    quantity: 1,
    unitPrice: 40,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  })),

  // Sábado 7 de Noviembre 2026: 2 Quesadilla c/ papas ($70 ||) = $140
  ...Array.from({ length: 2 }, (_, i): SaleRecord => ({
    id: `nb-2026-11-07-q-fries-${i + 1}`,
    productId: 'quesadilla-fries',
    timestamp: `2026-11-07T20:${15 + i * 10}:00.000Z`,
    quantity: 1,
    unitPrice: 70,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  })),

  // Domingo 8 de Noviembre 2026: 10 Sándwich c/ papas ($160 ||||||||||) = $1,600
  ...Array.from({ length: 10 }, (_, i): SaleRecord => ({
    id: `nb-2026-11-08-sw-fries-${i + 1}`,
    productId: 'sandwich-fries',
    timestamp: `2026-11-08T19:${10 + i * 4}:00.000Z`,
    quantity: 1,
    unitPrice: 160,
    unitCost: 0,
    paymentMethod: 'efectivo' as PaymentMethod,
  })),

  // =========================================================================
  // SEMANA 6: JUEVES 12 AL VIERNES 13 DE NOVIEMBRE 2026 (Parcial: $930.00)
  // =========================================================================
  // Jueves 12 de Noviembre 2026: 3 Quesadillas c/ papas ($70 c/u = $210), 3 Sándwich c/ papas ($160 c/u = $480) = $690
  ...Array.from({ length: 3 }, (_, i): SaleRecord => ({
    id: `nb-2026-11-12-q-fries-${i + 1}`,
    productId: 'quesadilla-fries',
    timestamp: `2026-11-12T19:${10 + i * 5}:00.000Z`,
    quantity: 1,
    unitPrice: 70,
    unitCost: 37.5,
    paymentMethod: 'efectivo' as PaymentMethod,
  })),
  ...Array.from({ length: 3 }, (_, i): SaleRecord => ({
    id: `nb-2026-11-12-sw-fries-${i + 1}`,
    productId: 'sandwich-fries',
    timestamp: `2026-11-12T20:${10 + i * 5}:00.000Z`,
    quantity: 1,
    unitPrice: 160,
    unitCost: 104.5,
    paymentMethod: 'efectivo' as PaymentMethod,
  })),

  // Viernes 13 de Noviembre 2026: 1 Sándwich c/ papas ($160), 2 Champurros ($40 c/u = $80) = $240
  {
    id: 'nb-2026-11-13-sw-fries-1',
    productId: 'sandwich-fries',
    timestamp: '2026-11-13T19:30:00.000Z',
    quantity: 1,
    unitPrice: 160,
    unitCost: 104.5,
    paymentMethod: 'efectivo' as PaymentMethod,
  },
  ...Array.from({ length: 2 }, (_, i): SaleRecord => ({
    id: `nb-2026-11-13-champurro-${i + 1}`,
    productId: 'champurro',
    timestamp: `2026-11-13T20:${10 + i * 5}:00.000Z`,
    quantity: 1,
    unitPrice: 40,
    unitCost: 10,
    paymentMethod: 'efectivo' as PaymentMethod,
  })),
].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

export const NOTEBOOK_CLOSED_SHIFTS: ClosedShiftRecord[] = [
  {
    id: 'shift-nb-5',
    shiftNumber: 5,
    reportType: 'corte_z',
    openedAt: '2026-11-05T18:00:00.000Z',
    closedAt: '2026-11-08T23:30:00.000Z',
    startingCash: 50,
    totalGrossRevenue: 2120,
    subtotalSinIVA: 1827.59,
    iva16: 292.41,
    cashSalesTotal: 2120,
    cardSalesTotal: 0,
    transferSalesTotal: 0,
    totalExpenses: 0,
    expectedCashInDrawer: 2170,
    countedCash: 1970,
    difference: -200,
    differenceStatus: 'faltante',
    totalUnits: 17,
    notes: 'Cierre 5–8 Nov 2026: Jue 5 ($380 + $50 Fondo), Vie 6 ($0), Sáb 7 ($140), Dom 8 (10x Sándwich $160 = $1,600). Total libreta: $1,920.00',
  },
  {
    id: 'shift-nb-4',
    shiftNumber: 4,
    reportType: 'corte_z',
    openedAt: '2026-10-29T18:00:00.000Z',
    closedAt: '2026-11-01T23:00:00.000Z',
    startingCash: 0,
    totalGrossRevenue: 70,
    subtotalSinIVA: 60.34,
    iva16: 9.66,
    cashSalesTotal: 70,
    cardSalesTotal: 0,
    transferSalesTotal: 0,
    totalExpenses: 0,
    expectedCashInDrawer: 70,
    countedCash: 70,
    difference: 0,
    differenceStatus: 'cuadrada',
    totalUnits: 1,
    notes: 'Cierre 29 Oct – 1 Nov 2026: Viernes 30 Oct (1 Quesadilla c/ papas $70).',
  },
  {
    id: 'shift-nb-3',
    shiftNumber: 3,
    reportType: 'corte_z',
    openedAt: '2026-10-22T18:00:00.000Z',
    closedAt: '2026-10-25T23:00:00.000Z',
    startingCash: 0,
    totalGrossRevenue: 380,
    subtotalSinIVA: 327.59,
    iva16: 52.41,
    cashSalesTotal: 380,
    cardSalesTotal: 0,
    transferSalesTotal: 0,
    totalExpenses: 0,
    expectedCashInDrawer: 380,
    countedCash: 380,
    difference: 0,
    differenceStatus: 'cuadrada',
    totalUnits: 6,
    notes: 'Cierre 22–25 Oct 2026: Vie 23 ($100), Sáb 24 (1 Papas Lokas $70), Dom 25 (3 Quesadilla c/ papas $70 = $210).',
  },
  {
    id: 'shift-nb-2',
    shiftNumber: 2,
    reportType: 'corte_z',
    openedAt: '2026-10-15T18:00:00.000Z',
    closedAt: '2026-10-18T23:00:00.000Z',
    startingCash: 0,
    totalGrossRevenue: 1310,
    subtotalSinIVA: 1129.31,
    iva16: 180.69,
    cashSalesTotal: 1310,
    cardSalesTotal: 0,
    transferSalesTotal: 0,
    totalExpenses: 0,
    expectedCashInDrawer: 1310,
    countedCash: 1310,
    difference: 0,
    differenceStatus: 'cuadrada',
    totalUnits: 14,
    notes: 'Cierre 15–18 Oct 2026: Jue 15 (1 Champurro $40), Sáb 17 (4 Champurros $160, 4 Sándwich c/p $640, 3 Sándwich solo $390 = $1,190), Dom 18 (2 Champurros $80).',
  },
  {
    id: 'shift-nb-1',
    shiftNumber: 1,
    reportType: 'corte_z',
    openedAt: '2026-10-08T18:00:00.000Z',
    closedAt: '2026-10-11T23:00:00.000Z',
    startingCash: 0,
    totalGrossRevenue: 1000,
    subtotalSinIVA: 862.07,
    iva16: 137.93,
    cashSalesTotal: 1000,
    cardSalesTotal: 0,
    transferSalesTotal: 0,
    totalExpenses: 0,
    expectedCashInDrawer: 1000,
    countedCash: 1000,
    difference: 0,
    differenceStatus: 'cuadrada',
    totalUnits: 9,
    notes: 'Cierre 8–11 Oct 2026: Jue 8 ($730), Vie 9 ($270).',
  },
];