import { SaleRecord, TimeframeFilter, ProductItem } from '@/types/accounting';

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isSameWeek(targetDate: Date, referenceDate: Date): boolean {
  const diffTime = Math.abs(referenceDate.getTime() - targetDate.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= 7 && targetDate <= referenceDate;
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

export function generateSampleSales(products: ProductItem[], referenceDate?: Date): SaleRecord[] {
  const now = referenceDate || new Date();
  const sampleSales: SaleRecord[] = [];

  const sampleDistribution: { productId: string; countToday: number; countEarlierWeek: number; countEarlierMonth: number }[] = [
    { productId: 'sandwich-fries', countToday: 18, countEarlierWeek: 42, countEarlierMonth: 95 },
    { productId: 'sandwich-alone', countToday: 12, countEarlierWeek: 26, countEarlierMonth: 64 },
    { productId: 'fries-cheese', countToday: 15, countEarlierWeek: 34, countEarlierMonth: 80 },
    { productId: 'steak-frites', countToday: 9, countEarlierWeek: 21, countEarlierMonth: 52 },
    { productId: 'quesadilla-fries', countToday: 11, countEarlierWeek: 28, countEarlierMonth: 68 },
    { productId: 'quesadilla-alone', countToday: 7, countEarlierWeek: 16, countEarlierMonth: 44 },
    { productId: 'fries-alone', countToday: 14, countEarlierWeek: 31, countEarlierMonth: 73 },
  ];

  let idCounter = 1;

  for (const item of sampleDistribution) {
    const prod = products.find((p) => p.id === item.productId);
    if (!prod) continue;

    // Today sales
    for (let i = 0; i < item.countToday; i++) {
      const saleDate = new Date(now.getTime() - Math.floor(Math.random() * 8 * 60 * 60 * 1000));
      sampleSales.push({
        id: `sample-today-${idCounter++}`,
        productId: prod.id,
        timestamp: saleDate.toISOString(),
        quantity: 1,
        unitPrice: prod.defaultPrice,
        unitCost: prod.cost,
      });
    }

    // Earlier this week sales
    for (let i = 0; i < item.countEarlierWeek; i++) {
      const daysAgo = 1 + Math.floor(Math.random() * 5);
      const saleDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      sampleSales.push({
        id: `sample-week-${idCounter++}`,
        productId: prod.id,
        timestamp: saleDate.toISOString(),
        quantity: 1,
        unitPrice: prod.defaultPrice,
        unitCost: prod.cost,
      });
    }

    // Earlier this month sales
    for (let i = 0; i < item.countEarlierMonth; i++) {
      const daysAgo = 8 + Math.floor(Math.random() * 20);
      const saleDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      sampleSales.push({
        id: `sample-month-${idCounter++}`,
        productId: prod.id,
        timestamp: saleDate.toISOString(),
        quantity: 1,
        unitPrice: prod.defaultPrice,
        unitCost: prod.cost,
      });
    }
  }

  return sampleSales.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
