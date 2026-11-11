import {
  SaleRecord,
  ExpenseRecord,
  TimeframeFilter,
  ProductItem,
  HourlyBlock,
  DailyStat,
  MonthlyWeekStat,
  ProductPerformance,
  PaymentMethod,
  PaymentBreakdown,
} from '@/types/accounting';

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isSameWeek(targetDate: Date, referenceDate: Date): boolean {
  const start = new Date(referenceDate);
  start.setDate(referenceDate.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const end = new Date(referenceDate);
  end.setHours(23, 59, 59, 999);

  return targetDate >= start && targetDate <= end;
}

export function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

export function filterSalesByTimeframe(
  sales: SaleRecord[],
  timeframe: TimeframeFilter,
  referenceDate?: Date
): SaleRecord[] {
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

export function filterExpensesByTimeframe(
  expenses: ExpenseRecord[],
  timeframe: TimeframeFilter,
  referenceDate?: Date
): ExpenseRecord[] {
  if (!referenceDate) return expenses;

  return expenses.filter((exp) => {
    const expDate = new Date(exp.timestamp);
    if (isNaN(expDate.getTime())) return false;

    switch (timeframe) {
      case 'today':
        return isSameDay(expDate, referenceDate);
      case 'week':
        return isSameWeek(expDate, referenceDate);
      case 'month':
        return isSameMonth(expDate, referenceDate);
      case 'all':
      default:
        return true;
    }
  });
}

export function generateSampleExpenses(referenceDate?: Date): ExpenseRecord[] {
  const now = referenceDate || new Date();
  return [
    {
      id: 'exp-1',
      description: '2 Bolsas de Hielo para Bebidas',
      category: 'insumos',
      amount: 70,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'exp-2',
      description: 'Cebollas y Pimientos en el Mercado',
      category: 'mercado',
      amount: 145,
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'exp-3',
      description: 'Papel manteca y servilletas',
      category: 'insumos',
      amount: 95,
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export function getProductCountsByTimeframe(
  productId: string,
  sales: SaleRecord[],
  referenceDate?: Date
): { today: number; week: number; month: number; all: number } {
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

export function getPaymentBreakdown(sales: SaleRecord[]): PaymentBreakdown {
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

// Granular Daily: Hourly Shift Breakdown
export function getDailyHourlyBreakdown(todaySales: SaleRecord[]): HourlyBlock[] {
  const blocks: { id: string; label: string; timeRange: string; minHour: number; maxHour: number }[] = [
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

// Granular Weekly: 7-Day Day-by-Day Breakdown
export function getWeeklyDailyBreakdown(weekSales: SaleRecord[], referenceDate?: Date): DailyStat[] {
  if (!referenceDate) return [];
  const ref = referenceDate;
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const days: DailyStat[] = [];
  let maxCount = -1;

  // Build last 7 days in chronological order
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

  // Flag peak day if there are sales
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

// Granular Monthly: Week by Week Breakdown
export function getMonthlyWeeklyBreakdown(monthSales: SaleRecord[], referenceDate?: Date): MonthlyWeekStat[] {
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

// Product Performance Ranking
export function getProductPerformanceRanking(
  sales: SaleRecord[],
  products: ProductItem[]
): ProductPerformance[] {
  const totalRevenue = sales.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
  const map: Record<string, { units: number; revenue: number }> = {};

  sales.forEach((s) => {
    if (!map[s.productId]) {
      map[s.productId] = { units: 0, revenue: 0 };
    }
    map[s.productId].units += s.quantity;
    map[s.productId].revenue += s.quantity * s.unitPrice;
  });

  const list: ProductPerformance[] = products.map((prod) => {
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

export function generateSampleSales(products: ProductItem[], referenceDate?: Date): SaleRecord[] {
  const now = referenceDate || new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const sampleSales: SaleRecord[] = [];

  const sampleDistribution: { productId: string; countToday: number; countEarlierWeek: number; countEarlierMonth: number }[] = [
    { productId: 'sandwich-fries', countToday: 22, countEarlierWeek: 48, countEarlierMonth: 110 },
    { productId: 'sandwich-alone', countToday: 14, countEarlierWeek: 30, countEarlierMonth: 75 },
    { productId: 'fries-cheese', countToday: 18, countEarlierWeek: 38, countEarlierMonth: 90 },
    { productId: 'steak-frites', countToday: 12, countEarlierWeek: 25, countEarlierMonth: 60 },
    { productId: 'quesadilla-fries', countToday: 15, countEarlierWeek: 32, countEarlierMonth: 78 },
    { productId: 'quesadilla-alone', countToday: 8, countEarlierWeek: 18, countEarlierMonth: 48 },
    { productId: 'fries-alone', countToday: 16, countEarlierWeek: 35, countEarlierMonth: 82 },
  ];

  let idCounter = 1;

  for (const item of sampleDistribution) {
    const prod = products.find((p) => p.id === item.productId);
    if (!prod) continue;

    // 1. Today sales across restaurant shift hours (11:00 to 22:00)
    for (let i = 0; i < item.countToday; i++) {
      const hourOffset = 11 + Math.floor(Math.random() * 11); // between 11:00 and 22:00
      const minuteOffset = Math.floor(Math.random() * 60);
      const saleDate = new Date(now);
      saleDate.setHours(hourOffset, minuteOffset, 0, 0);

      // If simulated time is in future relative to now, adjust to earlier today
      if (saleDate.getTime() > now.getTime()) {
        saleDate.setTime(now.getTime() - Math.floor(Math.random() * 4 * 60 * 60 * 1000));
      }

      const methodRoll = Math.random();
      const paymentMethod: PaymentMethod =
        methodRoll < 0.65 ? 'efectivo' : methodRoll < 0.9 ? 'tarjeta' : 'transferencia';

      sampleSales.push({
        id: `sample-today-${idCounter++}`,
        productId: prod.id,
        timestamp: saleDate.toISOString(),
        quantity: 1,
        unitPrice: prod.defaultPrice,
        unitCost: prod.cost,
        paymentMethod,
      });
    }

    // 2. Earlier this week sales (distributed over the last 6 days)
    for (let i = 0; i < item.countEarlierWeek; i++) {
      const daysAgo = 1 + (i % 6);
      const hourOffset = 12 + Math.floor(Math.random() * 9);
      const saleDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      saleDate.setHours(hourOffset, Math.floor(Math.random() * 60), 0, 0);

      const methodRoll = Math.random();
      const paymentMethod: PaymentMethod =
        methodRoll < 0.65 ? 'efectivo' : methodRoll < 0.9 ? 'tarjeta' : 'transferencia';

      sampleSales.push({
        id: `sample-week-${idCounter++}`,
        productId: prod.id,
        timestamp: saleDate.toISOString(),
        quantity: 1,
        unitPrice: prod.defaultPrice,
        unitCost: prod.cost,
        paymentMethod,
      });
    }

    // 3. Earlier this month sales (distributed across the current month so all 4 weeks are populated)
    for (let i = 0; i < item.countEarlierMonth; i++) {
      const dayOfMonth = 1 + (i % lastDayOfMonth);
      const hourOffset = 12 + Math.floor(Math.random() * 9);
      const saleDate = new Date(year, month, dayOfMonth, hourOffset, Math.floor(Math.random() * 60), 0);

      const methodRoll = Math.random();
      const paymentMethod: PaymentMethod =
        methodRoll < 0.65 ? 'efectivo' : methodRoll < 0.9 ? 'tarjeta' : 'transferencia';

      sampleSales.push({
        id: `sample-month-${idCounter++}`,
        productId: prod.id,
        timestamp: saleDate.toISOString(),
        quantity: 1,
        unitPrice: prod.defaultPrice,
        unitCost: prod.cost,
        paymentMethod,
      });
    }
  }

  return sampleSales.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Cash Drawer Shift & Arqueo Calculations
export function calculateDenominationTotal(counts: {
  b1000?: number;
  b500?: number;
  b200?: number;
  b100?: number;
  b50?: number;
  b20?: number;
  coins?: number;
}): number {
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

export function calculateExpectedDrawerCash(
  startingCash: number,
  cashSalesTotal: number,
  totalExpenses: number
): number {
  return Math.max(0, startingCash + cashSalesTotal - totalExpenses);
}

export function calculateArqueoDifference(
  countedCash: number,
  expectedCash: number
): { difference: number; status: 'cuadrada' | 'sobrante' | 'faltante' } {
  const diff = Math.round((countedCash - expectedCash) * 100) / 100;
  if (Math.abs(diff) < 0.01) {
    return { difference: 0, status: 'cuadrada' };
  }
  if (diff > 0) {
    return { difference: diff, status: 'sobrante' };
  }
  return { difference: diff, status: 'faltante' };
}
