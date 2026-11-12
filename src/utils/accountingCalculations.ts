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