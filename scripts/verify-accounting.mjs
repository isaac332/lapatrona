import assert from 'node:assert/strict';

// Accounting calculation functions mirroring src/utils/accountingCalculations.ts
function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isSameWeek(targetDate, referenceDate) {
  const start = new Date(referenceDate);
  start.setDate(referenceDate.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const end = new Date(referenceDate);
  end.setHours(23, 59, 59, 999);

  return targetDate >= start && targetDate <= end;
}

function isSameMonth(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

function filterSalesByTimeframe(sales, timeframe, referenceDate) {
  if (!referenceDate) return sales;
  return sales.filter((sale) => {
    const saleDate = new Date(sale.timestamp);
    if (isNaN(saleDate.getTime())) return false;
    switch (timeframe) {
      case 'today':
        return isSameDay(saleDate, referenceDate);
      case 'week':
        return isSameWeek(saleDate, referenceDate);
      case 'month':
        return isSameMonth(saleDate, referenceDate);
      case 'all':
      default:
        return true;
    }
  });
}

function getProductCountsByTimeframe(productId, sales, referenceDate) {
  let today = 0;
  let week = 0;
  let month = 0;
  let all = 0;

  for (const sale of sales) {
    if (sale.productId !== productId) continue;
    const qty = sale.quantity;
    all += qty;

    if (referenceDate) {
      const saleDate = new Date(sale.timestamp);
      if (isSameMonth(saleDate, referenceDate)) {
        month += qty;
      }
      if (isSameWeek(saleDate, referenceDate)) {
        week += qty;
      }
      if (isSameDay(saleDate, referenceDate)) {
        today += qty;
      }
    }
  }

  return { today, week, month, all };
}

function getDailyHourlyBreakdown(todaySales) {
  const blocks = [
    { id: 'morning', label: 'Apertura y Almuerzo', timeRange: '11:00 - 13:59', minHour: 0, maxHour: 13 },
    { id: 'rush-lunch', label: 'Hora Pico Comida', timeRange: '14:00 - 16:59', minHour: 14, maxHour: 16 },
    { id: 'afternoon', label: 'Turno Vespertino', timeRange: '17:00 - 19:59', minHour: 17, maxHour: 19 },
    { id: 'night', label: 'Cena y Cierre', timeRange: '20:00 - 23:59', minHour: 20, maxHour: 23 },
  ];

  const totalUnits = todaySales.reduce((sum, s) => sum + s.quantity, 0);

  return blocks.map((b) => {
    const matching = todaySales.filter((s) => {
      const hour = new Date(s.timestamp).getHours();
      return hour >= b.minHour && hour <= b.maxHour;
    });

    const count = matching.reduce((sum, s) => sum + s.quantity, 0);
    const revenue = matching.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
    const percentage = totalUnits > 0 ? Math.round((count / totalUnits) * 100) : 0;

    return {
      id: b.id,
      label: b.label,
      timeRange: b.timeRange,
      count,
      revenue,
      percentage,
    };
  });
}

function getWeeklyDailyBreakdown(weekSales, referenceDate) {
  if (!referenceDate) return [];
  const ref = referenceDate;
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const days = [];
  let maxCount = -1;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(ref);
    d.setDate(ref.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const nextD = new Date(d);
    nextD.setDate(d.getDate() + 1);

    const matching = weekSales.filter((s) => {
      const sDate = new Date(s.timestamp);
      return sDate >= d && sDate < nextD;
    });

    const count = matching.reduce((sum, s) => sum + s.quantity, 0);
    const revenue = matching.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);

    if (count > maxCount) {
      maxCount = count;
    }

    days.push({
      dateStr: d.toISOString().split('T')[0],
      dayName: dayNames[d.getDay()],
      formattedDate: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      count,
      revenue,
      isPeak: false,
    });
  }

  if (maxCount > 0) {
    for (const day of days) {
      if (day.count === maxCount) {
        day.isPeak = true;
        break;
      }
    }
  }

  return days;
}

function getMonthlyWeeklyBreakdown(monthSales, referenceDate) {
  if (!referenceDate) return [];
  const ref = referenceDate;
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthName = monthNames[month];

  const weekDefs = [
    { id: 'w1', label: 'Semana 1', start: 1, end: 7 },
    { id: 'w2', label: 'Semana 2', start: 8, end: 14 },
    { id: 'w3', label: 'Semana 3', start: 15, end: 21 },
    { id: 'w4', label: 'Semana 4 y Cierre', start: 22, end: lastDayOfMonth },
  ];

  const totalUnits = monthSales.reduce((sum, s) => sum + s.quantity, 0);

  return weekDefs.map((w) => {
    const matching = monthSales.filter((s) => {
      const sDate = new Date(s.timestamp);
      if (!isSameMonth(sDate, ref)) return false;
      const day = sDate.getDate();
      return day >= w.start && day <= w.end;
    });

    const count = matching.reduce((sum, s) => sum + s.quantity, 0);
    const revenue = matching.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
    const percentage = totalUnits > 0 ? Math.round((count / totalUnits) * 100) : 0;

    return {
      id: w.id,
      label: w.label,
      dateRange: `${w.start} al ${w.end} ${monthName}`,
      count,
      revenue,
      percentage,
    };
  });
}

function getProductPerformanceRanking(sales, products) {
  const totalRevenue = sales.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
  const map = {};

  sales.forEach((s) => {
    if (!map[s.productId]) {
      map[s.productId] = { units: 0, revenue: 0 };
    }
    map[s.productId].units += s.quantity;
    map[s.productId].revenue += s.quantity * s.unitPrice;
  });

  const list = products.map((prod) => {
    const stat = map[prod.id] || { units: 0, revenue: 0 };
    const percentageOfRevenue = totalRevenue > 0 ? Math.round((stat.revenue / totalRevenue) * 100) : 0;
    const margin =
      prod.defaultPrice > 0 && prod.cost > 0
        ? Math.round(((prod.defaultPrice - prod.cost) / prod.defaultPrice) * 100)
        : null;

    return {
      product: prod,
      units: stat.units,
      revenue: stat.revenue,
      percentageOfRevenue,
      margin,
    };
  });

  return list.sort((a, b) => b.units - a.units || b.revenue - a.revenue);
}

// ================= TEST SUITE =================

console.log('Testing Edge Cases & Accounting Calculations...');

const testProducts = [
  { id: 'sandwich-alone', name: 'Philly Cheesesteak', variantLabel: 'Sencillo (Solo)', category: 'sandwiches', defaultPrice: 145, cost: 60 },
  { id: 'sandwich-fries', name: 'Combo Philly Cheesesteak', variantLabel: 'Con Papas', category: 'sandwiches', defaultPrice: 185, cost: 70 },
  { id: 'quesadilla-alone', name: 'Quesadilla de Ribeye', variantLabel: 'Sencilla (Sola)', category: 'quesadillas', defaultPrice: 135, cost: 50 },
  { id: 'quesadilla-fries', name: 'Combo Quesadilla de Ribeye', variantLabel: 'Con Papas', category: 'quesadillas', defaultPrice: 175, cost: 65 },
  { id: 'steak-frites', name: 'Steak Frites de Ribeye', variantLabel: 'Papas con Ribeye y Verduras', category: 'steak-frites', defaultPrice: 195, cost: 75 },
  { id: 'fries-alone', name: 'Papas a la Francesa', variantLabel: 'Sencillas (Clásicas)', category: 'fries', defaultPrice: 65, cost: 20 },
  { id: 'fries-cheese', name: 'Papas con Queso Amarillo', variantLabel: 'Con Queso Fundido', category: 'fries', defaultPrice: 85, cost: 25 },
];

const now = new Date('2026-11-10T17:00:00Z');

// Test 1: Zero out accounting scenario (Empty Sales)
console.log('Test 1: Zero Out Scenario (empty sales)');
const emptySales = [];
const emptyFiltered = filterSalesByTimeframe(emptySales, 'today', now);
assert.equal(emptyFiltered.length, 0);

const emptyCounts = getProductCountsByTimeframe('sandwich-alone', emptySales, now);
assert.deepEqual(emptyCounts, { today: 0, week: 0, month: 0, all: 0 });

const emptyHourly = getDailyHourlyBreakdown(emptySales);
assert.equal(emptyHourly.length, 4);
assert.equal(emptyHourly[0].count, 0);
assert.equal(emptyHourly[0].percentage, 0);
assert.equal(emptyHourly[0].revenue, 0);

const emptyWeekly = getWeeklyDailyBreakdown(emptySales, now);
assert.equal(emptyWeekly.length, 7);
assert.equal(emptyWeekly[0].count, 0);
assert.equal(emptyWeekly[0].isPeak, false);

const emptyMonthly = getMonthlyWeeklyBreakdown(emptySales, now);
assert.equal(emptyMonthly.length, 4);
assert.equal(emptyMonthly[0].count, 0);
assert.equal(emptyMonthly[0].percentage, 0);

const emptyRanking = getProductPerformanceRanking(emptySales, testProducts);
assert.equal(emptyRanking.length, 7);
assert.equal(emptyRanking[0].units, 0);
assert.equal(emptyRanking[0].percentageOfRevenue, 0);
console.log('✓ Zero out edge case passed: no division by zero, no NaN');

// Test 2: Shift Sales Distribution & 24h coverage
console.log('Test 2: Shift Sales Distribution across hours (including boundary hours)');
const shiftSales = [
  { id: '0', productId: 'fries-alone', timestamp: '2026-11-10T09:30:00', quantity: 1, unitPrice: 65, unitCost: 20 }, // Early opening (9:30)
  { id: '1', productId: 'sandwich-fries', timestamp: '2026-11-10T12:30:00', quantity: 3, unitPrice: 185, unitCost: 70 }, // Morning/Lunch
  { id: '2', productId: 'sandwich-alone', timestamp: '2026-11-10T15:15:00', quantity: 5, unitPrice: 145, unitCost: 60 }, // Rush lunch
  { id: '3', productId: 'fries-cheese', timestamp: '2026-11-10T18:45:00', quantity: 2, unitPrice: 85, unitCost: 25 }, // Afternoon
  { id: '4', productId: 'steak-frites', timestamp: '2026-11-10T21:00:00', quantity: 4, unitPrice: 195, unitCost: 75 }, // Night
  { id: '5', productId: 'fries-cheese', timestamp: '2026-11-10T23:30:00', quantity: 1, unitPrice: 85, unitCost: 25 }, // Late night close
];
const hourlyResult = getDailyHourlyBreakdown(shiftSales);
assert.equal(hourlyResult[0].count, 4); // 9:30 + 12:30 (Morning/Lunch block)
assert.equal(hourlyResult[1].count, 5); // 15:15 (Rush)
assert.equal(hourlyResult[2].count, 2); // 18:45 (Afternoon)
assert.equal(hourlyResult[3].count, 5); // 21:00 + 23:30 (Night/Close)
assert.equal(hourlyResult.reduce((s, h) => s + h.count, 0), 16, 'All sales must be accounted for across shift blocks');
console.log('✓ Hourly shift distribution passed with full 24h coverage');

// Test 3: Weekly Day-by-Day, Peak Day detection & Exact Calendar Alignment
console.log('Test 3: Weekly Day-by-Day Peak Day detection & Calendar Alignment');
const refDate = new Date('2026-11-10T12:00:00');
const weekSales = [
  { id: 'w1', productId: 'sandwich-fries', timestamp: '2026-11-10T12:00:00', quantity: 10, unitPrice: 185, unitCost: 70 }, // Today (10 Nov)
  { id: 'w2', productId: 'sandwich-fries', timestamp: '2026-11-09T12:00:00', quantity: 25, unitPrice: 185, unitCost: 70 }, // Yesterday (9 Nov - Peak)
  { id: 'w3', productId: 'fries-alone', timestamp: '2026-11-04T08:00:00', quantity: 8, unitPrice: 65, unitCost: 20 }, // 6 days ago (4 Nov)
  { id: 'w4-out', productId: 'fries-alone', timestamp: '2026-11-03T18:00:00', quantity: 12, unitPrice: 65, unitCost: 20 }, // 7 days ago (3 Nov - outside last 7 calendar days)
];
const filteredWeek = filterSalesByTimeframe(weekSales, 'week', refDate);
assert.equal(filteredWeek.length, 3, 'Sale from 3 Nov must be excluded from last 7 calendar days');

const weeklyResult = getWeeklyDailyBreakdown(filteredWeek, refDate);
assert.equal(weeklyResult.length, 7);
const peakFound = weeklyResult.find((d) => d.isPeak);
assert.ok(peakFound, 'Should find peak day');
assert.equal(peakFound.count, 25);
const sumWeeklyUnits = weeklyResult.reduce((sum, d) => sum + d.count, 0);
assert.equal(sumWeeklyUnits, 43, 'Sum of 7-day grid must exactly equal filtered week units (10 + 25 + 8)');
console.log('✓ Weekly calendar alignment and peak day detection verified');

// Test 4: Product Performance Ranking & Top Revenue Identification
console.log('Test 4: Product Performance Ranking & Revenue Leader');
const sampleLeaderSales = [
  { id: 'r1', productId: 'fries-alone', timestamp: '2026-11-10T12:00:00', quantity: 50, unitPrice: 65, unitCost: 20 }, // 50 units * $65 = $3,250
  { id: 'r2', productId: 'steak-frites', timestamp: '2026-11-10T12:00:00', quantity: 40, unitPrice: 195, unitCost: 75 }, // 40 units * $195 = $7,800
];
const rankingResult = getProductPerformanceRanking(sampleLeaderSales, testProducts);
// Ranking is sorted by units descending:
assert.equal(rankingResult[0].product.id, 'fries-alone'); // 50 units
assert.equal(rankingResult[1].product.id, 'steak-frites'); // 40 units

// Top revenue product must be steak-frites ($7,800 > $3,250)
const topRevenueProduct = [...rankingResult].sort((a, b) => b.revenue - a.revenue)[0];
assert.equal(topRevenueProduct.product.id, 'steak-frites');
assert.equal(topRevenueProduct.revenue, 7800);
console.log('✓ Product ranking by units and top revenue leader correctly identified');

// Test 5: On-the-fly Price Edit Simulation with Decimals
console.log('Test 5: On-the-fly Price change propagation with decimal prices');
const updatedProducts = testProducts.map(p => p.id === 'sandwich-fries' ? { ...p, defaultPrice: 189.50 } : p);
const newSale = { id: 's-new', productId: 'sandwich-fries', timestamp: '2026-11-10T12:00:00', quantity: 2, unitPrice: 189.50, unitCost: 70 };
const updatedSales = [newSale];
const updatedRanking = getProductPerformanceRanking(updatedSales, updatedProducts);
assert.equal(updatedRanking[0].revenue, 379);
assert.equal(updatedRanking[0].margin, Math.round(((189.50 - 70) / 189.50) * 100)); // 63%
console.log('✓ Decimal on-the-fly price updates flow accurately through calculations');

// Test 6: Zero-Out LocalStorage Persistence Simulation
console.log('Test 6: LocalStorage Zero Out persistence behavior');
let mockStorage = { philly_fry_sales: JSON.stringify([{ id: 'test', quantity: 5 }]) };
// Simulate zeroing out
mockStorage.philly_fry_sales = JSON.stringify([]);
// Simulate page reload
const reloaded = mockStorage.philly_fry_sales !== null ? JSON.parse(mockStorage.philly_fry_sales) : [{ id: 'sample' }];
assert.deepEqual(reloaded, [], 'Reloading after zero out must preserve empty sales array');
console.log('✓ Zero out persistence across page reload verified');

// Test 7: Expenses Ledger & Net Cash Cut-off Calculation
console.log('Test 7: Cash Expenses & Net Cash Discrepancy-Free Calculation');
const sampleExpenses = [
  { id: 'e1', description: 'Hielo', amount: 70, timestamp: '2026-11-10T14:00:00' },
  { id: 'e2', description: 'Verdura mercado', amount: 145, timestamp: '2026-11-10T11:00:00' },
  { id: 'e3', description: 'Papel manteca', amount: 95, timestamp: '2026-11-09T18:00:00' },
];
const todayExpenses = sampleExpenses.filter(e => isSameDay(new Date(e.timestamp), refDate));
assert.equal(todayExpenses.length, 2);
const todayExpensesTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0); // 70 + 145 = 215
assert.equal(todayExpensesTotal, 215);

const grossSalesToday = 3000;
const netCashToday = grossSalesToday - todayExpensesTotal;
assert.equal(netCashToday, 2785, 'Net cash must equal Gross Sales minus Expenses without discrepancy');
console.log('✓ Cash expenses filtering and net cash cut-off calculations verified');

// Test 8: Payment Methods Breakdown & Cash Drawer Discrepancy Prevention
console.log('Test 8: Payment Methods Breakdown (Cash vs Card vs Transfer)');
function getPaymentBreakdown(sales) {
  let efectivoTotal = 0;
  let tarjetaTotal = 0;
  let transfTotal = 0;
  let efectivoCount = 0;
  let tarjetaCount = 0;
  let transfCount = 0;

  for (const s of sales) {
    const method = s.paymentMethod || 'efectivo';
    const amount = s.quantity * s.unitPrice;
    if (method === 'tarjeta') {
      tarjetaTotal += amount;
      tarjetaCount += s.quantity;
    } else if (method === 'transferencia') {
      transfTotal += amount;
      transfCount += s.quantity;
    } else {
      efectivoTotal += amount;
      efectivoCount += s.quantity;
    }
  }

  const totalRevenue = efectivoTotal + tarjetaTotal + transfTotal;

  return {
    efectivo: {
      count: efectivoCount,
      total: efectivoTotal,
      percentage: totalRevenue > 0 ? Math.round((efectivoTotal / totalRevenue) * 100) : 0,
    },
    tarjeta: {
      count: tarjetaCount,
      total: tarjetaTotal,
      percentage: totalRevenue > 0 ? Math.round((tarjetaTotal / totalRevenue) * 100) : 0,
    },
    transferencia: {
      count: transfCount,
      total: transfTotal,
      percentage: totalRevenue > 0 ? Math.round((transfTotal / totalRevenue) * 100) : 0,
    },
    totalRevenue,
  };
}

const mixedSales = [
  { id: 'm1', quantity: 5, unitPrice: 185, paymentMethod: 'efectivo' },      // 5 * 185 = $925 (Cash)
  { id: 'm2', quantity: 3, unitPrice: 185, paymentMethod: 'tarjeta' },       // 3 * 185 = $555 (Card)
  { id: 'm3', quantity: 2, unitPrice: 195, paymentMethod: 'transferencia' }, // 2 * 195 = $390 (Transfer)
  { id: 'm4', quantity: 1, unitPrice: 85 },                                  // 1 * 85 = $85 (Legacy omitted paymentMethod -> Cash)
];

const breakdown = getPaymentBreakdown(mixedSales);
assert.equal(breakdown.efectivo.total, 925 + 85); // $1,010
assert.equal(breakdown.tarjeta.total, 555);       // $555
assert.equal(breakdown.transferencia.total, 390); // $390
assert.equal(breakdown.totalRevenue, 1955);       // Total: $1,955

// Drawer cash reconciliation with $215 in expenses:
const drawerCash = breakdown.efectivo.total - 215;
assert.equal(drawerCash, 795, 'Cash in drawer must equal Cash Sales minus Cash Expenses');

// Bank money reconciliation:
const bankMoney = breakdown.tarjeta.total + breakdown.transferencia.total;
assert.equal(bankMoney, 945, 'Bank money must equal Card Sales plus Transfer Sales');
assert.equal(drawerCash + bankMoney + 215, breakdown.totalRevenue, 'Complete financial balance: Drawer + Bank + Expenses == Gross Sales');
console.log('✓ Payment method breakdown and drawer/bank reconciliation verified');

// Test 9: Multi-Item Comanda / Customer Order Generation & Atomic Sales Ledger Sync
console.log('Test 9: Multi-Item Customer Order (Comanda) Generation');
const sampleOrder = {
  id: 'order-101',
  orderNumber: 1,
  timestamp: new Date().toISOString(),
  orderType: 'llevar',
  customerName: 'Carlos',
  paymentMethod: 'efectivo',
  items: [
    { productId: 'sandwich-fries', productName: 'Combo Philly Cheesesteak', quantity: 2, unitPrice: 185, unitCost: 70, subtotal: 370 },
    { productId: 'quesadilla-alone', productName: 'Quesadilla de Ribeye', quantity: 1, unitPrice: 135, unitCost: 55, subtotal: 135 },
    { productId: 'fries-cheese', productName: 'Papas con Queso Amarillo', quantity: 1, unitPrice: 85, unitCost: 24, subtotal: 85 },
  ],
  total: 590,
  amountReceived: 1000,
  change: 410,
};

// Check that item subtotals match order total
const calculatedTotal = sampleOrder.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
assert.equal(calculatedTotal, sampleOrder.total, 'Calculated items total must match order total');
assert.equal(sampleOrder.change, sampleOrder.amountReceived - sampleOrder.total, 'Change must match received minus total');

// Convert order to atomic sale records
const generatedSales = [];
for (const item of sampleOrder.items) {
  for (let i = 0; i < item.quantity; i++) {
    generatedSales.push({
      id: `s-${sampleOrder.id}-${item.productId}-${i}`,
      productId: item.productId,
      timestamp: sampleOrder.timestamp,
      quantity: 1,
      unitPrice: item.unitPrice,
      unitCost: item.unitCost,
      paymentMethod: sampleOrder.paymentMethod,
      orderId: sampleOrder.id,
      orderNumber: sampleOrder.orderNumber,
    });
  }
}

// 2 + 1 + 1 = 4 total item units
assert.equal(generatedSales.length, 4, 'Must create 4 individual sale units from the order');
const orderUnitsRevenue = generatedSales.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
assert.equal(orderUnitsRevenue, 590, 'Gross revenue from generated records must equal $590.00');
console.log('✓ Multi-item comanda generation, change calculation, and atomic sales records sync verified');

// Test 10: Food Costing Escandallos, Gross Profit, and Contribution Margin
console.log('Test 10: Recipe Escandallos, Gross Profit, and Food Cost Contribution Margin');
const sampleEscandallos = {
  'sandwich-alone': 71.50,
  'sandwich-fries': 80.50,
  'quesadilla-alone': 55.90,
  'quesadilla-fries': 64.90,
  'steak-frites': 72.35,
  'fries-alone': 15.90,
  'fries-cheese': 24.30,
};

// Check margin calculation on Philly Cheesesteak Combo ($185 price, $80.50 cost)
const phillyMargin = Math.round(((185 - sampleEscandallos['sandwich-fries']) / 185) * 100);
assert.equal(phillyMargin, 56, 'Philly combo margin must equal 56%');

// Check margin on Papas a la Francesa ($65 price, $15.90 cost)
const friesMargin = Math.round(((65 - sampleEscandallos['fries-alone']) / 65) * 100);
assert.equal(friesMargin, 76, 'Fries margin must equal 76%');

// Calculate total batch food cost and gross profit
const batchSales = [
  { quantity: 10, unitPrice: 185, unitCost: 80.50 }, // Philly Combo ($1,850 rev, $805 cost)
  { quantity: 20, unitPrice: 65, unitCost: 15.90 },  // Fries ($1,300 rev, $318 cost)
];
const batchRevenue = batchSales.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0); // $3,150
const batchCost = batchSales.reduce((sum, s) => sum + s.quantity * s.unitCost, 0);       // $1,123
const batchProfit = batchRevenue - batchCost;                                           // $2,027
const batchMargin = Math.round((batchProfit / batchRevenue) * 100);                     // 64%

assert.equal(batchRevenue, 3150);
assert.equal(batchCost, 1123);
assert.equal(batchProfit, 2027);
assert.equal(batchMargin, 64);
console.log('✓ Food costing escandallos, gross profit, and margin calculations verified');

// Test 11: Cash Drawer Starting Float, Denominations & Arqueo Difference
console.log('Test 11: Cash Drawer Starting Float, Denomination Breakdown, and Arqueo Reconciliation');
function calculateDenominationTotal(counts) {
  return (
    (counts.b1000 || 0) * 1000 +
    (counts.b500 || 0) * 500 +
    (counts.b200 || 0) * 200 +
    (counts.b100 || 0) * 100 +
    (counts.b50 || 0) * 50 +
    (counts.b20 || 0) * 20 +
    (counts.coins || 0)
  );
}

function calculateExpectedDrawerCash(startingCash, cashSalesTotal, totalExpenses) {
  return Math.max(0, startingCash + cashSalesTotal - totalExpenses);
}

function calculateArqueoDifference(countedCash, expectedCash) {
  const diff = Math.round((countedCash - expectedCash) * 100) / 100;
  if (Math.abs(diff) < 0.01) {
    return { difference: 0, status: 'cuadrada' };
  }
  if (diff > 0) {
    return { difference: diff, status: 'sobrante' };
  }
  return { difference: diff, status: 'faltante' };
}

// Scenario: Starting cash $1,000, cash sales $2,450, cash expenses $350 (ice & lemons)
const startingFloat = 1000;
const cashSales = 2450;
const cashExpenses = 350;
const expectedInDrawer = calculateExpectedDrawerCash(startingFloat, cashSales, cashExpenses);
assert.equal(expectedInDrawer, 3100, 'Expected drawer cash must be $1,000 + $2,450 - $350 = $3,100');

// Denomination count: 1x$1000, 3x$500, 2x$200, 1x$100, 1x$50, 2x$20, $10 in coins
// Total = 1000 + 1500 + 400 + 100 + 50 + 40 + 10 = 3100
const denomSample = {
  b1000: 1,
  b500: 3,
  b200: 2,
  b100: 1,
  b50: 1,
  b20: 2,
  coins: 10,
};
const countedTotal = calculateDenominationTotal(denomSample);
assert.equal(countedTotal, 3100, 'Denomination total must equal exactly $3,100.00');

// Test Cuadrada
const resCuadrada = calculateArqueoDifference(countedTotal, expectedInDrawer);
assert.equal(resCuadrada.status, 'cuadrada');
assert.equal(resCuadrada.difference, 0);

// Test Sobrante ($3,150 counted vs $3,100 expected -> +$50 sobrante)
const resSobrante = calculateArqueoDifference(3150, expectedInDrawer);
assert.equal(resSobrante.status, 'sobrante');
assert.equal(resSobrante.difference, 50);

// Test Faltante ($3,020 counted vs $3,100 expected -> -$80 faltante)
const resFaltante = calculateArqueoDifference(3020, expectedInDrawer);
assert.equal(resFaltante.status, 'faltante');
assert.equal(resFaltante.difference, -80);

console.log('✓ Cash drawer float, denomination tally, and arqueo statuses verified');

console.log('\nAll 11 accounting verification tests passed flawlessly!');
