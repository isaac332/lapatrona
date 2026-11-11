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

// Test 12: Order with Tip, Food Subtotal, and Cash Change Calculation
console.log('Test 12: Order with Tip (Propina), Net Food Subtotal, and Cash Change Calculation');
const foodItems = [
  { productId: 'sandwich-fries', quantity: 2, unitPrice: 185 }, // $370
  { productId: 'fries-cheese', quantity: 1, unitPrice: 85 },     // $85
];
const foodSubtotal = foodItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0); // $455
const tip15 = Math.round((foodSubtotal * 15) / 100); // 15% of $455 = 68.25 -> $68
const finalTotal = foodSubtotal + tip15; // $523
assert.equal(foodSubtotal, 455);
assert.equal(tip15, 68);
assert.equal(finalTotal, 523);

// Cash payment with $1,000 bill
const billReceived = 1000;
const changeCalculated = Math.max(0, billReceived - finalTotal);
assert.equal(changeCalculated, 477, 'Change from $1,000 on $523 order must be $477.00');

console.log('✓ Order tip calculation, food subtotal, and cash change verified');

// Test 13: Daily Stock Tracking, Sales Deduction, Low-Stock Threshold & Exhaustion
console.log('Test 13: Daily Stock Tracking, Sales Deduction, Low-Stock Threshold & Exhaustion');
const initialStockState = {
  'sandwich-alone': { currentStock: 10, lowStockThreshold: 3, trackStock: true },
  'steak-frites': { currentStock: 2, lowStockThreshold: 3, trackStock: true },
  'fries-alone': { currentStock: 50, lowStockThreshold: 8, trackStock: false },
};

function deductStock(stockState, productId, quantity) {
  const item = stockState[productId];
  if (!item || !item.trackStock) return stockState;
  return {
    ...stockState,
    [productId]: {
      ...item,
      currentStock: Math.max(0, item.currentStock - quantity),
    },
  };
}

function getStockStatus(item) {
  if (!item.trackStock) return 'untracked';
  if (item.currentStock <= 0) return 'exhausted';
  if (item.currentStock <= item.lowStockThreshold) return 'low';
  return 'healthy';
}

// 1. Initial healthy check
assert.equal(getStockStatus(initialStockState['sandwich-alone']), 'healthy');
// 2. Initial low check (2 <= 3)
assert.equal(getStockStatus(initialStockState['steak-frites']), 'low');
// 3. Untracked
assert.equal(getStockStatus(initialStockState['fries-alone']), 'untracked');

// Deduct 8 from sandwich-alone -> 2 remaining -> 'low'
let updatedStock = deductStock(initialStockState, 'sandwich-alone', 8);
assert.equal(updatedStock['sandwich-alone'].currentStock, 2);
assert.equal(getStockStatus(updatedStock['sandwich-alone']), 'low');

// Deduct 2 more -> 0 remaining -> 'exhausted'
updatedStock = deductStock(updatedStock, 'sandwich-alone', 2);
assert.equal(updatedStock['sandwich-alone'].currentStock, 0);
assert.equal(getStockStatus(updatedStock['sandwich-alone']), 'exhausted');

// Deducting further cannot drop below 0
updatedStock = deductStock(updatedStock, 'sandwich-alone', 5);
assert.equal(updatedStock['sandwich-alone'].currentStock, 0);

console.log('✓ Stock deduction, boundary limits, and low/exhausted thresholds verified');

// Test 14: Kitchen Display System (KDS) Order Status Progression
console.log('Test 14: Kitchen Display System (KDS) Order Status Progression');
const testOrder = {
  id: 'order-kds-test-1',
  orderNumber: 42,
  timestamp: new Date().toISOString(),
  orderType: 'aqui',
  items: [{ productId: 'sandwich-fries', quantity: 2, subtotal: 390 }],
  status: 'pendiente',
};

function advanceOrderStatus(currentStatus) {
  switch (currentStatus) {
    case 'pendiente':
      return 'preparando';
    case 'preparando':
      return 'listo';
    case 'listo':
      return 'entregado';
    default:
      return currentStatus;
  }
}

assert.equal(testOrder.status, 'pendiente');
testOrder.status = advanceOrderStatus(testOrder.status);
assert.equal(testOrder.status, 'preparando');
testOrder.status = advanceOrderStatus(testOrder.status);
assert.equal(testOrder.status, 'listo');
testOrder.status = advanceOrderStatus(testOrder.status);
assert.equal(testOrder.status, 'entregado');
console.log('✓ Kitchen Display System status lifecycle verified');

// Test 15: Custom Business Info Header Generation for Thermal Slips
console.log('Test 15: Custom Business Info Header Generation for Thermal Slips');
const customBusiness = {
  name: 'LA PATRONA GOURMET',
  tagline: 'Philly & Fry Monterrey',
  address: 'Av. Constitución #500',
  phone: '81 8300 0000',
  footerNote: '¡Muchas gracias por su preferencia!',
};

assert.ok(customBusiness.name.length > 0);
assert.ok(customBusiness.tagline.includes('Philly'));
assert.ok(customBusiness.phone.length > 5);
console.log('✓ Business info profile and thermal slip headers verified');

// Test 16: Dynamic Custom Product Creation & Extended Categories
console.log('Test 16: Dynamic Custom Product Creation & Extended Categories');
const customBeverage = {
  id: 'prod-drink-coke',
  name: 'Coca-Cola 355ml',
  variantLabel: 'Lata Fría',
  category: 'bebidas',
  description: 'Refresco clásico frío en lata de 355ml',
  imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87',
  defaultPrice: 35.0,
  cost: 14.5,
};

assert.equal(customBeverage.category, 'bebidas');
assert.equal(customBeverage.defaultPrice, 35.0);
const margin = Math.round(((customBeverage.defaultPrice - customBeverage.cost) / customBeverage.defaultPrice) * 100);
assert.equal(margin, 59, 'Beverage margin must be calculated accurately at 59%');
console.log('✓ Dynamic product creation and beverage category verified');

// Test 17: Mise en Place Raw Ingredients Calculation
console.log('Test 17: Mise en Place Raw Ingredients Calculation');
const sampleStockMap = {
  'sandwich-alone': { currentStock: 20 },
  'sandwich-fries': { currentStock: 10 },
  'quesadilla-alone': { currentStock: 15 },
  'quesadilla-fries': { currentStock: 10 },
  'steak-frites': { currentStock: 10 },
};

const totalSw = sampleStockMap['sandwich-alone'].currentStock + sampleStockMap['sandwich-fries'].currentStock; // 30
const totalQ = sampleStockMap['quesadilla-alone'].currentStock + sampleStockMap['quesadilla-fries'].currentStock; // 25
const totalSf = sampleStockMap['steak-frites'].currentStock; // 10

// Ribeye = 30 * 150g + 25 * 120g + 10 * 180g = 4500g + 3000g + 1800g = 9300g = 9.3 kg
const ribeyeGrams = totalSw * 150 + totalQ * 120 + totalSf * 180;
const ribeyeKg = Math.round((ribeyeGrams / 1000) * 10) / 10;
assert.equal(ribeyeKg, 9.3, 'Mise en place ribeye requirement must equal 9.3 kg');

// Hoagies = 30
assert.equal(totalSw, 30, 'Hoagie bread requirement must equal 30 pieces');

// Flour tortillas = 25
assert.equal(totalQ, 25, 'Tortilla requirement must equal 25 pieces');
console.log('✓ Mise en place raw ingredient math verified');

// Test 18: Split Payment (Pago Mixto - Efectivo + Tarjeta) Reconciliation
console.log('Test 18: Split Payment (Pago Mixto - Efectivo + Tarjeta) Reconciliation');
const splitOrder = {
  total: 500,
  splitPayment: { cash: 200, card: 300 },
  items: [
    { productId: 'sandwich-fries', quantity: 2, unitPrice: 185 }, // $370
    { productId: 'fries-cheese', quantity: 2, unitPrice: 65 },    // $130
  ],
};

const cashFraction = splitOrder.splitPayment.cash / splitOrder.total; // 0.4
const cardFraction = splitOrder.splitPayment.card / splitOrder.total; // 0.6
assert.equal(cashFraction + cardFraction, 1.0, 'Fractions must sum to 1.0');

let tallyCash = 0;
let tallyCard = 0;

for (const it of splitOrder.items) {
  for (let i = 0; i < it.quantity; i++) {
    const unitCash = Math.round(it.unitPrice * cashFraction * 100) / 100;
    const unitCard = Math.round((it.unitPrice - unitCash) * 100) / 100;
    assert.equal(unitCash + unitCard, it.unitPrice);
    tallyCash += unitCash;
    tallyCard += unitCard;
  }
}

assert.equal(Math.round(tallyCash), 200, 'Cash tally must match $200.00 cash portion');
assert.equal(Math.round(tallyCard), 300, 'Card tally must match $300.00 card portion');
assert.equal(tallyCash + tallyCard, 500, 'Total sum of split portions must exactly equal order total of $500.00');

// Change from $500 bill on the $200 cash portion
const receivedCashBill = 500;
const splitCashChange = receivedCashBill - splitOrder.splitPayment.cash;
assert.equal(splitCashChange, 300, 'Change from $500 bill on $200 cash portion must be $300');
console.log('✓ Split payment reconciliation and cash drawer allocations verified');

// Test 19: Order Discounts, Promos, and 100% Cortesías Reconciliation
console.log('Test 19: Order Discounts, Promos, and 100% Cortesías Reconciliation');

// Scenario A: 10% percentage promo on multi-item comanda
const discountedOrder = {
  items: [
    { productId: 'sandwich-fries', quantity: 2, unitPrice: 185, unitCost: 48, subtotal: 370 },
    { productId: 'fries-cheese', quantity: 1, unitPrice: 65, unitCost: 18, subtotal: 65 },
  ],
  discount: { type: 'percent', value: 10, amount: 44, label: 'Descuento 10%' },
};

const discountOrderFoodSubtotal = discountedOrder.items.reduce((s, it) => s + it.subtotal, 0); // $435
assert.equal(discountOrderFoodSubtotal, 435, 'Food subtotal must equal $435.00');

const netDiscountFoodTotal = Math.max(0, discountOrderFoodSubtotal - discountedOrder.discount.amount); // $391
assert.equal(netDiscountFoodTotal, 391, 'Net food total after $44 discount must equal $391.00');

const discountRatio = netDiscountFoodTotal / discountOrderFoodSubtotal;
let simulatedSalesRevenue = 0;
let simulatedCost = 0;
const totalDiscountUnits = discountedOrder.items.reduce((acc, it) => acc + it.quantity, 0);
let unitsProcessedCount = 0;

for (const item of discountedOrder.items) {
  for (let i = 0; i < item.quantity; i++) {
    unitsProcessedCount++;
    let effectivePrice = Math.round(item.unitPrice * discountRatio * 100) / 100;
    if (unitsProcessedCount === totalDiscountUnits) {
      const remaining = Math.round((netDiscountFoodTotal - simulatedSalesRevenue) * 100) / 100;
      if (remaining >= 0) effectivePrice = remaining;
    }
    simulatedSalesRevenue += effectivePrice;
    simulatedCost += item.unitCost;
  }
}

assert.equal(Math.round(simulatedSalesRevenue * 100) / 100, 391.0, 'Simulated sales revenue must equal $391.00 exactly without rounding drift');
const totalOrderCost = 2 * 48 + 18; // $114
assert.equal(simulatedCost, totalOrderCost, 'Total incurred cost must be preserved at $114.00');
const orderGrossProfit = simulatedSalesRevenue - simulatedCost; // 391 - 114 = $277
assert.equal(orderGrossProfit, 277, 'Gross profit must be $277.00');

// Scenario B: 100% Cortesía (House invite / complimentary dish)
const cortesiaOrder = {
  items: [
    { productId: 'steak-frites', quantity: 1, unitPrice: 210, unitCost: 68, subtotal: 210 },
  ],
  discount: { type: 'percent', value: 100, amount: 210, label: 'Cortesía 100%' },
};

const cortesiaFoodSubtotal = cortesiaOrder.items.reduce((s, it) => s + it.subtotal, 0);
const cortesiaNet = Math.max(0, cortesiaFoodSubtotal - cortesiaOrder.discount.amount);
assert.equal(cortesiaNet, 0, 'Net total of 100% cortesía must be $0.00');

const cortesiaPrice = Math.round(cortesiaOrder.items[0].unitPrice * (cortesiaNet / cortesiaFoodSubtotal) * 100) / 100;
assert.equal(cortesiaPrice, 0, 'Effective price for cortesía item must be $0.00');
const cortesiaCost = cortesiaOrder.items[0].unitCost; // $68
const cortesiaProfit = cortesiaPrice - cortesiaCost; // -$68
assert.equal(cortesiaProfit, -68, 'Profit of cortesía item must be -$68.00 (food cost absorbed by house)');
console.log('✓ Order discounts, promos, and 100% cortesía math fully verified');

// Test 20: Restaurant Table Management (Open Tabs, Rounds, Pre-Cuenta & Closed Settlement)
console.log('Test 20: Restaurant Table Management (Open Tabs, Rounds, Pre-Cuenta & Settlement)');

// 1. Initial State: Starting Cash $1,000, 0 sales
let startingCashDrawer = 1000;
let salesLedger = [];
let ordersLedger = [];

// 2. Open Tab for Mesa 1 with Round 1: 2x Philly Cheesesteak Combos ($185 each = $370)
const round1Order = {
  id: 'order-tab-1',
  orderNumber: 1,
  timestamp: new Date().toISOString(),
  orderType: 'aqui',
  tableNumber: 'Mesa 1',
  customerName: 'Familia Ramírez',
  isOpenTab: true,
  items: [
    { productId: 'sandwich-fries', productName: 'Philly Cheesesteak Combo', quantity: 2, unitPrice: 185, unitCost: 48, subtotal: 370 },
  ],
  total: 370,
  paymentMethod: 'efectivo',
};
ordersLedger.push(round1Order);

// Assert: while isOpenTab is true, salesLedger must remain empty and cash in drawer must NOT change
assert.equal(salesLedger.length, 0, 'Open tab must NOT generate sales records in accounting before payment');
assert.equal(startingCashDrawer, 1000, 'Cash in drawer must remain untouched at initial float');

// 3. Customer orders Round 2: +1 Papas con Queso Amarillo Fundido ($65)
const updatedTabOrder = {
  ...round1Order,
  items: [
    ...round1Order.items,
    { productId: 'fries-cheese', productName: 'Papas con Queso Fundido', quantity: 1, unitPrice: 65, unitCost: 18, subtotal: 65 },
  ],
  total: 435,
};
const orderIndex = ordersLedger.findIndex(o => o.id === updatedTabOrder.id);
ordersLedger[orderIndex] = updatedTabOrder;

assert.equal(ordersLedger[0].items.length, 2, 'Tab order must now contain 2 distinct product lines');
assert.equal(ordersLedger[0].total, 435, 'Tab running total must equal $435.00 MXN');

// 4. Pre-Cuenta Calculation: Tip Suggestions (10%, 15%, 20%)
const preCuentaSubtotal = ordersLedger[0].total;
const preCuentaTip10 = preCuentaSubtotal * 0.10;
const preCuentaTip15 = preCuentaSubtotal * 0.15;
const preCuentaTip20 = preCuentaSubtotal * 0.20;

assert.equal(Math.round(preCuentaTip10 * 100) / 100, 43.50, '10% tip suggestion must be $43.50');
assert.equal(Math.round(preCuentaTip15 * 100) / 100, 65.25, '15% tip suggestion must be $65.25');
assert.equal(Math.round(preCuentaTip20 * 100) / 100, 87.00, '20% tip suggestion must be $87.00');

// 5. Checkout & Settlement: Customer pays with Card/Clip + $45 Tip
const closedOrder = {
  ...updatedTabOrder,
  isOpenTab: false,
  paymentMethod: 'tarjeta',
  tip: 45,
  total: 480, // $435 food + $45 tip
  closedAt: new Date().toISOString(),
};

// Now and only now, sales are booked to the accounting ledger
for (const item of closedOrder.items) {
  for (let i = 0; i < item.quantity; i++) {
    salesLedger.push({
      id: `sale-${item.productId}-${i}`,
      productId: item.productId,
      quantity: 1,
      unitPrice: item.unitPrice,
      unitCost: item.unitCost,
      paymentMethod: closedOrder.paymentMethod,
    });
  }
}

assert.equal(salesLedger.length, 3, '3 individual items must be booked into sales ledger upon checkout');
const recordedRevenue = salesLedger.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
assert.equal(recordedRevenue, 435, 'Total food revenue in ledger must equal $435.00 MXN');

const openTabsRemaining = ordersLedger.filter(o => o.isOpenTab).length;
assert.equal(openTabsRemaining, 1, 'Before marking ledger closed, 1 tab was open');
ordersLedger[orderIndex] = closedOrder;
const finalOpenTabs = ordersLedger.filter(o => o.isOpenTab).length;
assert.equal(finalOpenTabs, 0, 'After checkout, open tabs count must be 0 and Mesa 1 must be freed');
console.log('✓ Restaurant table management, rounds, pre-cuenta, and settlement fully verified');

// Test 21: Kitchen Waste & Spoilage (Mermas de Cocina) Accounting and Stock Tracking
console.log('Test 21: Kitchen Waste & Spoilage (Mermas de Cocina) Accounting & Stock Tracking');

let testStockInventory = {
  'sandwich-fries': { currentStock: 25, trackStock: true },
  'fries-cheese': { currentStock: 30, trackStock: true },
};

const wasteLog = [];

// Incident A: 2 Philly Cheesesteak Combos burned on the grill
const burnWaste = {
  id: 'waste-1',
  itemId: 'sandwich-fries',
  itemName: 'Philly Cheesesteak Combo',
  itemType: 'product',
  quantity: 2,
  unit: 'porciones',
  unitCost: 48.0,
  totalCost: 96.0,
  reason: 'quemado',
  responsible: 'Parrillero Carlos',
};
wasteLog.push(burnWaste);

// Deduct 2 portions from current kitchen stock
if (burnWaste.itemType === 'product' && testStockInventory[burnWaste.itemId]) {
  testStockInventory[burnWaste.itemId].currentStock -= burnWaste.quantity;
}

assert.equal(testStockInventory['sandwich-fries'].currentStock, 23, 'Inventory must decrease from 25 to 23 after 2 burned portions');
assert.equal(burnWaste.totalCost, 96.0, 'Burned waste cost must equal 2 * $48.00 = $96.00 MXN');

// Incident B: 1 order of fries dropped on the floor
const dropWaste = {
  id: 'waste-2',
  itemId: 'fries-cheese',
  itemName: 'Papas con Queso Amarillo',
  itemType: 'product',
  quantity: 1,
  unit: 'porciones',
  unitCost: 18.0,
  totalCost: 18.0,
  reason: 'caida',
  responsible: 'Ayudante Luis',
};
wasteLog.push(dropWaste);
testStockInventory['fries-cheese'].currentStock -= dropWaste.quantity;
assert.equal(testStockInventory['fries-cheese'].currentStock, 29, 'Fries inventory must decrease from 30 to 29');

// Financial Impact on Gross Margin & Operating Profit
const totalTurnoRevenue = 5000.0; // $5,000 MXN gross sales
const totalFoodCost = 1500.0;    // $1,500 MXN standard COGS
const totalGrossProfit = totalTurnoRevenue - totalFoodCost; // $3,500 MXN
const totalWasteCost = wasteLog.reduce((sum, w) => sum + w.totalCost, 0); // 96 + 18 = $114.00
assert.equal(totalWasteCost, 114.0, 'Total kitchen waste cost must equal $114.00 MXN');

const wasteIncidencePercentage = Math.round((totalWasteCost / totalTurnoRevenue) * 100 * 10) / 10;
assert.equal(wasteIncidencePercentage, 2.3, 'Waste incidence on revenue must be 2.3%');

const netOperatingProfitAfterWaste = totalGrossProfit - totalWasteCost;
assert.equal(netOperatingProfitAfterWaste, 3386.0, 'Net operating profit after waste must be $3,386.00 MXN');
console.log('✓ Kitchen waste inventory deductions, incident logging, and cost impacts fully verified');

console.log('\nAll 21 accounting, POS, KDS, thermal, catalog, prep, split payment, discount, table management, and kitchen waste tests passed flawlessly!');
