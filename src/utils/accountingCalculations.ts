import {
  SaleRecord,
  ExpenseRecord,
  WasteRecord,
  TimeframeFilter,
  ProductItem,
  HourlyBlock,
  DailyStat,
  MonthlyWeekStat,
  ProductPerformance,
  PaymentBreakdown,
  TipStaffMember,
  TipStaffRole,
  TipSettlementPayout,
  InitialInvestmentSummary,
  ProductProfitabilityItem,
  ProfitStrategicInsight,
  WeeklyTrendPoint,
  ForecastScenario,
  ProfitInsightsAndForecastsSummary,
} from '@/types/accounting';
import { calculateTicketItemSubtotal } from '@/data/purchaseTicketsData';

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
  sales: SaleRecord[] = [],
  timeframe: TimeframeFilter,
  referenceDate?: Date
): SaleRecord[] {
  const safeSales = Array.isArray(sales) ? sales : [];
  if (!referenceDate) return safeSales;

  return safeSales.filter((sale) => {
    if (!sale || !sale.timestamp) return false;
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
  expenses: ExpenseRecord[] = [],
  timeframe: TimeframeFilter,
  referenceDate?: Date
): ExpenseRecord[] {
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  if (!referenceDate) return safeExpenses;

  return safeExpenses.filter((exp) => {
    if (!exp || !exp.timestamp) return false;
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

export function filterWasteByTimeframe(
  waste: WasteRecord[] = [],
  timeframe: TimeframeFilter,
  referenceDate?: Date
): WasteRecord[] {
  const safeWaste = Array.isArray(waste) ? waste : [];
  if (!referenceDate) return safeWaste;

  return safeWaste.filter((w) => {
    if (!w || !w.timestamp) return false;
    const wDate = new Date(w.timestamp);
    if (isNaN(wDate.getTime())) return false;

    switch (timeframe) {
      case 'today':
        return isSameDay(wDate, referenceDate);
      case 'week':
        return isSameWeek(wDate, referenceDate);
      case 'month':
        return isSameMonth(wDate, referenceDate);
      case 'all':
      default:
        return true;
    }
  });
}

/**
 * Calcula dinámicamente el monto real de un gasto a partir de sus artículos (si proviene de un ticket desglosado)
 */
export function getCalculatedExpenseAmount(expense?: ExpenseRecord | null): number {
  if (!expense) return 0;
  if (expense.items && Array.isArray(expense.items) && expense.items.length > 0) {
    const sum = expense.items.reduce((acc, item) => acc + (item ? calculateTicketItemSubtotal(item) : 0), 0);
    return Math.round(sum * 100) / 100;
  }
  return typeof expense.amount === 'number' ? expense.amount : 0;
}

export interface ExpenseAnalyticsSummary {
  totalExpenses: number;
  cashExpenses: number;
  cardExpenses: number;
  totalSavingsFromOffers: number;
  initialInvestmentTotal: number;
  monicaInvestmentTotal: number;
  isaacInvestmentTotal: number;
  operationalExpensesTotal: number;
  byCategory: Record<string, number>;
  ingredientMetrics: {
    key: string;
    label: string;
    totalQuantity: number;
    unit: string;
    totalSpent: number;
    avgUnitCost: number;
  }[];
}

export function calculateExpensesAnalytics(expenses: ExpenseRecord[] = []): ExpenseAnalyticsSummary {
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  let totalExpenses = 0;
  let cashExpenses = 0;
  let cardExpenses = 0;
  let totalSavingsFromOffers = 0;
  let initialInvestmentTotal = 0;
  let monicaInvestmentTotal = 0;
  let isaacInvestmentTotal = 0;
  let operationalExpensesTotal = 0;
  const byCategory: Record<string, number> = {};

  const ingMap: Record<
    string,
    { label: string; totalQuantity: number; unit: string; totalSpent: number }
  > = {
    sirloin: { label: 'Carne Steak de Sirloin', totalQuantity: 0, unit: 'kg', totalSpent: 0 },
    queso: { label: 'Quesos (Los Ojos / Mozzarella)', totalQuantity: 0, unit: 'kg/pza', totalSpent: 0 },
    pan: { label: 'Pan Philly Artesanal', totalQuantity: 0, unit: 'pza', totalSpent: 0 },
    papa: { label: 'Papa Russet', totalQuantity: 0, unit: 'kg', totalSpent: 0 },
    aceite: { label: 'Aceite Vegetal', totalQuantity: 0, unit: 'pza', totalSpent: 0 },
    gas_lp: { label: 'Gas LP', totalQuantity: 0, unit: 'L', totalSpent: 0 },
    chile_caribe: { label: 'Chile Caribe', totalQuantity: 0, unit: 'kg', totalSpent: 0 },
    cebolla: { label: 'Cebolla Blanca', totalQuantity: 0, unit: 'kg', totalSpent: 0 },
    desechables: { label: 'Desechables, Charolas y Empaques', totalQuantity: 0, unit: 'paq', totalSpent: 0 },
    equipo: { label: 'Equipo y Utensilios de Cocina', totalQuantity: 0, unit: 'serv', totalSpent: 0 },
    doritos: { label: 'Doritos Nacho (Papas Lokas)', totalQuantity: 0, unit: 'pza', totalSpent: 0 },
    leche: { label: 'Leche (Champurro)', totalQuantity: 0, unit: 'pza', totalSpent: 0 },
    mayonesa: { label: 'Mayonesa', totalQuantity: 0, unit: 'pza', totalSpent: 0 },
    limpieza: { label: 'Insumos de Limpieza y Cocina', totalQuantity: 0, unit: 'pza', totalSpent: 0 },
  };

  for (const exp of safeExpenses) {
    if (!exp) continue;
    const amt = getCalculatedExpenseAmount(exp);
    totalExpenses += amt;

    if (exp.isInitialInvestment || exp.investor === 'Mónica' || exp.investor === 'Isaac') {
      initialInvestmentTotal += amt;
      if (exp.investor === 'Mónica') {
        monicaInvestmentTotal += amt;
      } else if (exp.investor === 'Isaac') {
        isaacInvestmentTotal += amt;
      }
    } else {
      operationalExpensesTotal += amt;
    }

    if (exp.paymentMethod === 'tarjeta' || exp.paymentMethod === 'transferencia') {
      cardExpenses += amt;
    } else {
      cashExpenses += amt;
    }

    const cat = exp.category || 'otro';
    byCategory[cat] = Math.round(((byCategory[cat] || 0) + amt) * 100) / 100;

    if (exp.savedDiscount) {
      totalSavingsFromOffers += exp.savedDiscount;
    }

    if (exp.items && Array.isArray(exp.items) && exp.items.length > 0) {
      for (const item of exp.items) {
        if (!item) continue;
        const sub = calculateTicketItemSubtotal(item);
        const key = item.ingredientKey || 'otro';
        if (ingMap[key]) {
          ingMap[key].totalQuantity = Math.round((ingMap[key].totalQuantity + item.quantity) * 10000) / 10000;
          ingMap[key].totalSpent = Math.round((ingMap[key].totalSpent + sub) * 100) / 100;
        }
      }
    }
  }

  const ingredientMetrics = Object.entries(ingMap)
    .filter(([, val]) => val.totalSpent > 0)
    .map(([key, val]) => ({
      key,
      label: val.label,
      totalQuantity: val.totalQuantity,
      unit: val.unit,
      totalSpent: val.totalSpent,
      avgUnitCost:
        val.totalQuantity > 0
          ? Math.round((val.totalSpent / val.totalQuantity) * 100) / 100
          : 0,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  return {
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    cashExpenses: Math.round(cashExpenses * 100) / 100,
    cardExpenses: Math.round(cardExpenses * 100) / 100,
    totalSavingsFromOffers: Math.round(totalSavingsFromOffers * 100) / 100,
    initialInvestmentTotal: Math.round(initialInvestmentTotal * 100) / 100,
    monicaInvestmentTotal: Math.round(monicaInvestmentTotal * 100) / 100,
    isaacInvestmentTotal: Math.round(isaacInvestmentTotal * 100) / 100,
    operationalExpensesTotal: Math.round(operationalExpensesTotal * 100) / 100,
    byCategory,
    ingredientMetrics,
  };
}

/**
 * Calcula el resumen y desglose de la Inversión Inicial por socio (Mónica y Isaac)
 * y el estado de retorno de inversión (ROI / Recuperación)
 */
export function calculateInitialInvestmentSummary(
  sales: SaleRecord[] = [],
  expenses: ExpenseRecord[] = []
): InitialInvestmentSummary {
  const safeSales = Array.isArray(sales) ? sales : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const totalRevenue = safeSales.reduce((acc, curr) => acc + (curr?.quantity || 0) * (curr?.unitPrice || 0), 0);

  const monicaItems: { description: string; amount: number; category?: string; detail?: string }[] = [];
  const isaacItems: { description: string; amount: number; category?: string; detail?: string }[] = [];
  let monicaTotal = 0;
  let isaacTotal = 0;
  let operationalTotal = 0;

  for (const exp of safeExpenses) {
    if (!exp) continue;
    const amt = getCalculatedExpenseAmount(exp);
    if (exp.investor === 'Mónica') {
      monicaTotal += amt;
      monicaItems.push({
        description: exp.description,
        amount: amt,
        category: exp.category,
        detail: exp.storeName,
      });
    } else if (exp.investor === 'Isaac') {
      isaacTotal += amt;
      isaacItems.push({
        description: exp.description,
        amount: amt,
        category: exp.category,
        detail: exp.storeName,
      });
    } else {
      operationalTotal += amt;
    }
  }

  const totalInitial = Math.round((monicaTotal + isaacTotal) * 100) / 100;
  const totalAllExp = Math.round((totalInitial + operationalTotal) * 100) / 100;
  const recoveredAmount = Math.min(totalRevenue, totalInitial);
  const recoveredPercentage = totalInitial > 0 ? Math.min(100, Math.round((totalRevenue / totalInitial) * 100)) : 100;
  const remainingToRecover = Math.max(0, Math.round((totalInitial - totalRevenue) * 100) / 100);
  const isFullyRecovered = totalRevenue >= totalInitial;
  const netProfitAfterInitialInvestment = Math.round((totalRevenue - totalAllExp) * 100) / 100;

  return {
    monica: {
      partnerName: 'Mónica',
      total: Math.round(monicaTotal * 100) / 100,
      percentage: totalInitial > 0 ? Math.round((monicaTotal / totalInitial) * 10000) / 100 : 50,
      itemsCount: monicaItems.length,
      items: monicaItems,
    },
    isaac: {
      partnerName: 'Isaac',
      total: Math.round(isaacTotal * 100) / 100,
      percentage: totalInitial > 0 ? Math.round((isaacTotal / totalInitial) * 10000) / 100 : 50,
      itemsCount: isaacItems.length,
      items: isaacItems,
    },
    totalInitialInvestment: totalInitial,
    totalOperationalExpenses: Math.round(operationalTotal * 100) / 100,
    totalAllExpenses: totalAllExp,
    recoveredAmount,
    recoveredPercentage,
    remainingToRecover,
    isFullyRecovered,
    netProfitAfterInitialInvestment,
  };
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
    if (method === 'mixto' && s.cashAmount !== undefined && s.cardAmount !== undefined) {
      efectivoTotal += s.cashAmount;
      tarjetaTotal += s.cardAmount;
      efectivoCount += 1;
      tarjetaCount += 1;
    } else if (method === 'tarjeta') {
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

export function getWeeklyDailyBreakdown(weekSales: SaleRecord[], referenceDate?: Date): DailyStat[] {
  if (!referenceDate) return [];
  const ref = referenceDate;
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const days: DailyStat[] = [];
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

export interface TipDistributionResult {
  payouts: TipSettlementPayout[];
  totalDistributed: number;
  residual: number;
}

export function calculateTipDistribution(
  totalTips: number,
  staff: TipStaffMember[],
  mode: 'equitativo' | 'puesto' | 'horas',
  customRoleWeights?: Partial<Record<TipStaffRole, number>>
): TipDistributionResult {
  const activeStaff = staff.filter((s) => s.active !== false);

  if (totalTips <= 0 || activeStaff.length === 0) {
    return {
      payouts: activeStaff.map((s) => ({
        staffId: s.id,
        name: s.name,
        role: s.role,
        amount: 0,
        percentage: 0,
        hoursWorked: s.hoursWorked,
      })),
      totalDistributed: 0,
      residual: 0,
    };
  }

  const totalCents = Math.round(totalTips * 100);
  const n = activeStaff.length;

  const defaultWeights: Record<TipStaffRole, number> = {
    cocina: 40,
    mesero: 40,
    barra: 10,
    limpieza: 10,
    cajero: 0,
    otro: 0,
    ...customRoleWeights,
  };

  if (mode === 'equitativo') {
    const baseCents = Math.floor(totalCents / n);
    const remainderCents = totalCents - baseCents * n;

    const payouts: TipSettlementPayout[] = activeStaff.map((member, index) => {
      const extraCent = index < remainderCents ? 1 : 0;
      const amount = (baseCents + extraCent) / 100;
      const percentage = Math.round((amount / totalTips) * 10000) / 100;
      return {
        staffId: member.id,
        name: member.name,
        role: member.role,
        amount,
        percentage,
        hoursWorked: member.hoursWorked,
      };
    });

    const totalDistributed = Math.round(payouts.reduce((sum, p) => sum + p.amount, 0) * 100) / 100;
    const residual = Math.round((totalTips - totalDistributed) * 100) / 100;

    return {
      payouts,
      totalDistributed,
      residual,
    };
  }

  let weights: number[] = [];
  if (mode === 'puesto') {
    weights = activeStaff.map((member) => {
      if (typeof member.percentage === 'number' && member.percentage > 0) {
        return member.percentage;
      }
      return defaultWeights[member.role] ?? 10;
    });
  } else if (mode === 'horas') {
    weights = activeStaff.map((member) => {
      return typeof member.hoursWorked === 'number' && member.hoursWorked > 0
        ? member.hoursWorked
        : 8;
    });
  }

  const sumWeights = weights.reduce((acc, curr) => acc + curr, 0);

  if (sumWeights <= 0) {
    return calculateTipDistribution(totalTips, activeStaff, 'equitativo');
  }

  const rawCents = weights.map((w) => (w / sumWeights) * totalCents);
  const floorCents = rawCents.map((rc) => Math.floor(rc));
  const allocatedCents = floorCents.reduce((acc, fc) => acc + fc, 0);
  const remainderCents = totalCents - allocatedCents;

  const fractionalIndices = rawCents
    .map((rc, idx) => ({ idx, frac: rc - floorCents[idx] }))
    .sort((a, b) => b.frac - a.frac);

  const bonusCentsSet = new Set(fractionalIndices.slice(0, remainderCents).map((item) => item.idx));

  const payouts: TipSettlementPayout[] = activeStaff.map((member, idx) => {
    const cents = floorCents[idx] + (bonusCentsSet.has(idx) ? 1 : 0);
    const amount = cents / 100;
    const percentage = Math.round((amount / totalTips) * 10000) / 100;
    return {
      staffId: member.id,
      name: member.name,
      role: member.role,
      amount,
      percentage,
      hoursWorked: member.hoursWorked,
    };
  });

  const totalDistributed = Math.round(payouts.reduce((sum, p) => sum + p.amount, 0) * 100) / 100;
  const residual = Math.round((totalTips - totalDistributed) * 100) / 100;

  return {
    payouts,
    totalDistributed,
    residual,
  };
}

/**
 * Motor de Inteligencia de Utilidad, Costeo Real por Receta, Insights Estratégicos y Pronósticos Financieros
 */
export function calculateProfitInsightsAndForecasts(
  sales: SaleRecord[] = [],
  products: ProductItem[] = [],
  expenses: ExpenseRecord[] = []
): ProfitInsightsAndForecastsSummary {
  const safeSales = Array.isArray(sales) ? sales : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const productMap = new Map<string, ProductItem>();
  for (const p of safeProducts) {
    if (p?.id) productMap.set(p.id, p);
  }

  let grossRevenue = 0;
  let totalUnitsSold = 0;
  let recipeCogs = 0;

  const activeDaysSet = new Set<string>();
  const prodStats = new Map<string, { units: number; revenue: number; cogs: number }>();

  for (const p of safeProducts) {
    if (p?.id) {
      prodStats.set(p.id, { units: 0, revenue: 0, cogs: 0 });
    }
  }

  for (const s of safeSales) {
    if (!s) continue;
    const qty = s.quantity || 0;
    const rev = qty * (s.unitPrice || 0);
    const prod = productMap.get(s.productId);
    const unitRecipeCost = prod ? prod.cost : s.unitCost || 0;
    const cogs = qty * unitRecipeCost;

    grossRevenue += rev;
    totalUnitsSold += qty;
    recipeCogs += cogs;

    if (s.timestamp) {
      activeDaysSet.add(s.timestamp.split('T')[0]);
    }

    const curr = prodStats.get(s.productId) || { units: 0, revenue: 0, cogs: 0 };
    curr.units += qty;
    curr.revenue += rev;
    curr.cogs += cogs;
    prodStats.set(s.productId, curr);
  }

  grossRevenue = Math.round(grossRevenue * 100) / 100;
  recipeCogs = Math.round(recipeCogs * 100) / 100;
  const recipeGrossProfit = Math.round((grossRevenue - recipeCogs) * 100) / 100;
  const recipeMarginPct = grossRevenue > 0 ? Math.round((recipeGrossProfit / grossRevenue) * 1000) / 10 : 64.6;

  let cashFlowExpenses = 0;
  for (const exp of safeExpenses) {
    if (!exp) continue;
    cashFlowExpenses += getCalculatedExpenseAmount(exp);
  }
  cashFlowExpenses = Math.round(cashFlowExpenses * 100) / 100;
  const cashFlowNetProfit = Math.round((grossRevenue - cashFlowExpenses) * 100) / 100;
  const cashFlowMarginPct = grossRevenue > 0 ? Math.round((cashFlowNetProfit / grossRevenue) * 1000) / 10 : 0;

  const estimatedActiveInventoryAndEquipmentValue = Math.max(
    0,
    Math.round((cashFlowExpenses - recipeCogs) * 100) / 100
  );

  // Desglose de rentabilidad por producto
  const rawBreakdown: ProductProfitabilityItem[] = safeProducts.map((p) => {
    const st = prodStats.get(p.id) || { units: 0, revenue: 0, cogs: 0 };
    const avgSellingPrice = st.units > 0 ? Math.round((st.revenue / st.units) * 100) / 100 : p.defaultPrice;
    const unitCost = p.cost;
    const unitProfit = Math.round((avgSellingPrice - unitCost) * 100) / 100;
    const unitMarginPct = avgSellingPrice > 0 ? Math.round((unitProfit / avgSellingPrice) * 1000) / 10 : 0;
    const totalProfitGenerated = Math.round((st.revenue - st.cogs) * 100) / 100;
    const profitSharePct =
      recipeGrossProfit > 0 ? Math.max(0, Math.round((totalProfitGenerated / recipeGrossProfit) * 1000) / 10) : 0;

    let tier: ProductProfitabilityItem['tier'] = 'Volumen Clave';
    if (profitSharePct >= 35 || (unitProfit >= 95 && st.units >= 5)) {
      tier = 'Motor Principal';
    } else if (unitMarginPct >= 70) {
      tier = 'Mina de Oro (%)';
    } else if (unitMarginPct < 36) {
      tier = 'Optimizar Margen';
    }

    return {
      id: p.id,
      name: p.name,
      category: p.category,
      avgSellingPrice,
      unitCost,
      unitProfit,
      unitMarginPct,
      unitsSold: st.units,
      totalRevenue: Math.round(st.revenue * 100) / 100,
      totalCogs: Math.round(st.cogs * 100) / 100,
      totalProfitGenerated,
      profitSharePct,
      tier,
    };
  });

  const productProfitBreakdown = rawBreakdown.sort(
    (a, b) => b.totalProfitGenerated - a.totalProfitGenerated || b.unitProfit - a.unitProfit
  );

  const swFries = rawBreakdown.find((x) => x.id === 'sandwich-fries');
  const swAlone = rawBreakdown.find((x) => x.id === 'sandwich-alone');
  const qFries = rawBreakdown.find((x) => x.id === 'quesadilla-fries');
  const qAlone = rawBreakdown.find((x) => x.id === 'quesadilla-alone');
  const champurro = rawBreakdown.find((x) => x.id === 'champurro');
  const friesCheese = rawBreakdown.find((x) => x.id === 'fries-cheese');

  const sandwichesTotalProfitShare = Math.min(
    100,
    Math.round(((swFries?.profitSharePct || 0) + (swAlone?.profitSharePct || 0)) * 10) / 10
  );

  const strategicInsights: ProfitStrategicInsight[] = [
    {
      id: 'pareto-sandwiches',
      title: 'Ley 80/20: El Motor Real de Ganancia',
      badge: `${sandwichesTotalProfitShare}% de tu Utilidad`,
      tone: 'emerald',
      metricValue: `+$${(swFries?.unitProfit || 108.94).toFixed(2)} libres / combo`,
      description: `La línea de Sándwiches Philly genera el ${sandwichesTotalProfitShare}% de toda la ganancia del negocio. Cada Sándwich c/ papas ($160) cuesta $51.06 en receta y deja $${(swFries?.unitProfit || 108.94).toFixed(2)} libres (${swFries?.unitMarginPct || 68.1}% margen).`,
      recommendation: 'Prioriza siempre la disponibilidad de pan artesanal y Sirloin: 1 solo sándwich con papas equivale a vender casi 8 quesadillas solas en utilidad.',
    },
    {
      id: 'efecto-papas-upsell',
      title: 'El "Efecto Papas": +$24.30 Extra por $5.70 de Costo',
      badge: '81% Margen en Upgrade',
      tone: 'amber',
      metricValue: '+102% utilidad en Quesadilla',
      description: `Agregar la porción de papas fritas cuesta solo $5.70 en insumo (papa Russet + aceite), pero sube el precio +$30 en Sándwich y +$20 en Quesadilla. En Quesadilla, la ganancia salta de $${(qAlone?.unitProfit || 14.03).toFixed(2)} a $${(qFries?.unitProfit || 28.33).toFixed(2)} por orden.`,
      recommendation: 'Ofrece siempre por defecto la versión "Con Papas" al tomar la orden ("¿Te lo pongo con papas por $20/$30 más?").',
    },
    {
      id: 'complementos-oro',
      title: 'Minas de Oro Porcentuales: Champurro y Papas c/ Queso',
      badge: `${champurro?.unitMarginPct || 76.1}% y ${friesCheese?.unitMarginPct || 72.1}% Margen`,
      tone: 'sky',
      metricValue: `+$${(champurro?.unitProfit || 30.44).toFixed(2)} por vaso`,
      description: `El Champurro cuesta $9.56 y se vende en $40 (deja $30.44 libres, 76.1% margen). Las Papas c/ Queso cuestan $13.93 y dejan $36.07 libres (72.1% margen).`,
      recommendation: 'En noches frescas de Nogales, sugerir 1 Champurro por cada sándwich incrementa la utilidad del ticket un +28% casi sin esfuerzo de plancha.',
    },
    {
      id: 'alerta-quesadilla-sola',
      title: 'Alerta de Margen Bajo: Quesadilla Sola y Papas Lokas',
      badge: `${qAlone?.unitMarginPct || 28.1}% Margen Mínimo`,
      tone: 'rose',
      metricValue: `$${(qAlone?.unitProfit || 14.03).toFixed(2)} ganancia / pza`,
      description: `La Quesadilla sin papas ($50) absorbe $35.97 de costo (carne Sirloin + queso + empaque), dejando solo $14.03 libres. Las Papas Lokas ($70) cuestan $46.82 por el paquete de Doritos Nacho + Sirloin.`,
      recommendation: 'Considera ajustar Quesadilla sola a $55-$60 y Papas Lokas a $80-$85, o comprar Doritos a granel/mayoreo en Dulcería para subir su margen al 50%.',
    },
  ];

  // Métricas unitarias y temporales base
  const activeDaysCount = Math.max(1, activeDaysSet.size || 10);
  const activeWeeksCount = 5; // 5 semanas históricas en libreta (Oct 8 a Nov 8)

  const avgRevenuePerUnit = totalUnitsSold > 0 ? Math.round((grossRevenue / totalUnitsSold) * 100) / 100 : 119.02;
  const avgCostPerUnit = totalUnitsSold > 0 ? Math.round((recipeCogs / totalUnitsSold) * 100) / 100 : 42.18;
  const avgProfitPerUnit = Math.round((avgRevenuePerUnit - avgCostPerUnit) * 100) / 100;

  const avgRevenuePerActiveDay = Math.round((grossRevenue / activeDaysCount) * 100) / 100;
  const avgProfitPerActiveDay = Math.round((recipeGrossProfit / activeDaysCount) * 100) / 100;
  const avgRevenuePerWeek = Math.round((grossRevenue / activeWeeksCount) * 100) / 100;
  const avgProfitPerWeek = Math.round((recipeGrossProfit / activeWeeksCount) * 100) / 100;

  // Serie semanal histórica (5 semanas reales de la libreta) + 3 semanas proyectadas
  const weeklyTrend: WeeklyTrendPoint[] = [
    {
      weekLabel: 'Sem 1',
      dateRange: '8–11 Oct',
      units: 9,
      revenue: 1000,
      recipeCost: 396.46,
      recipeProfit: 603.54,
      isProjected: false,
    },
    {
      weekLabel: 'Sem 2',
      dateRange: '15–18 Oct',
      units: 14,
      revenue: 1310,
      recipeCost: 407.24,
      recipeProfit: 902.76,
      isProjected: false,
    },
    {
      weekLabel: 'Sem 3',
      dateRange: '22–25 Oct',
      units: 7,
      revenue: 1020,
      recipeCost: 345.92,
      recipeProfit: 674.08,
      isProjected: false,
    },
    {
      weekLabel: 'Sem 4',
      dateRange: '29 Oct–1 Nov',
      units: 4,
      revenue: 520,
      recipeCost: 221.39,
      recipeProfit: 298.61,
      isProjected: false,
    },
    {
      weekLabel: 'Sem 5',
      dateRange: '5–8 Nov',
      units: 7,
      revenue: 1030,
      recipeCost: 358.39,
      recipeProfit: 671.61,
      isProjected: false,
    },
    {
      weekLabel: 'Sem 6 (Proy.)',
      dateRange: '12–15 Nov',
      units: 10,
      revenue: 1190,
      recipeCost: 422,
      recipeProfit: 768,
      isProjected: true,
    },
    {
      weekLabel: 'Sem 7 (Proy.)',
      dateRange: '19–22 Nov',
      units: 12,
      revenue: 1430,
      recipeCost: 506,
      recipeProfit: 924,
      isProjected: true,
    },
    {
      weekLabel: 'Sem 8 (Proy.)',
      dateRange: '26–29 Nov',
      units: 14,
      revenue: 1665,
      recipeCost: 590,
      recipeProfit: 1075,
      isProjected: true,
    },
  ];

  // 3 Escenarios de Pronóstico Mensual (Próximas 4 semanas / 16 noches Jue-Dom)
  const buildScenario = (
    id: ForecastScenario['id'],
    name: string,
    subtitle: string,
    badge: string,
    monthlyUnits: number
  ): ForecastScenario => {
    const unitsPerWeekendNight = Math.round((monthlyUnits / 16) * 10) / 10;
    const monthlyRevenue = Math.round(monthlyUnits * avgRevenuePerUnit);
    const monthlyRecipeCost = Math.round(monthlyUnits * avgCostPerUnit);
    const monthlyRestockReserve = Math.round(monthlyUnits * 4.5); // Reserva gas y consumibles (~$4.50/orden)
    const monthlyNetProfit = monthlyRevenue - monthlyRecipeCost - monthlyRestockReserve;
    const quarterlyNetProfit = monthlyNetProfit * 3;
    return {
      id,
      name,
      subtitle,
      badge,
      monthlyUnits,
      unitsPerWeekendNight,
      monthlyRevenue,
      monthlyRecipeCost,
      monthlyRestockReserve,
      monthlyNetProfit,
      quarterlyNetProfit,
      monicaMonthlyShare: Math.round(monthlyNetProfit * 0.5227),
      isaacMonthlyShare: Math.round(monthlyNetProfit * 0.4773),
    };
  };

  const baseMonthlyUnits = Math.max(33, Math.round((totalUnitsSold / activeWeeksCount) * 4));

  const forecastScenarios: ForecastScenario[] = [
    buildScenario(
      'conservador',
      'Escenario Conservador (Ritmo Actual)',
      'Manteniendo el promedio histórico de las primeras 5 semanas (~8.2 pzas/semana)',
      'Base Histórica',
      baseMonthlyUnits
    ),
    buildScenario(
      'moderado',
      'Escenario Tendencia (+35% Volumen)',
      'Agregando solo +1 combo adicional por noche de fin de semana (~11 pzas/semana)',
      'Más Probable',
      Math.round(baseMonthlyUnits * 1.35)
    ),
    buildScenario(
      'crecimiento',
      'Escenario Meta Activa (4 órdenes / noche)',
      'Operando los 4 días (Jue–Dom) con 4 piezas promedio por noche (16 pzas/semana)',
      'Meta Recomendada',
      64
    ),
  ];

  return {
    grossRevenue,
    totalUnitsSold,
    recipeCogs,
    recipeGrossProfit,
    recipeMarginPct,
    cashFlowExpenses,
    cashFlowNetProfit,
    cashFlowMarginPct,
    estimatedActiveInventoryAndEquipmentValue,
    avgRevenuePerUnit,
    avgCostPerUnit,
    avgProfitPerUnit,
    activeDaysCount,
    activeWeeksCount,
    avgRevenuePerActiveDay,
    avgProfitPerActiveDay,
    avgRevenuePerWeek,
    avgProfitPerWeek,
    productProfitBreakdown,
    strategicInsights,
    weeklyTrend,
    forecastScenarios,
  };
}