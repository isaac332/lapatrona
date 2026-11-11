export type CategoryType = 'sandwiches' | 'quesadillas' | 'steak-frites' | 'fries';

export interface ProductItem {
  id: string;
  name: string;
  variantLabel: string;
  category: CategoryType;
  description: string;
  imageUrl: string;
  defaultPrice: number;
  cost: number; // costo de insumos por unidad
}

export interface SaleRecord {
  id: string;
  productId: string;
  timestamp: string; // ISO string
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export interface ExpenseRecord {
  id: string;
  description: string;
  category: string; // 'insumos' | 'servicios' | 'mercado' | 'otro'
  amount: number;
  timestamp: string; // ISO string
}

export type TimeframeFilter = 'today' | 'week' | 'month' | 'all';

export interface HourlyBlock {
  id: string;
  label: string;
  timeRange: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface DailyStat {
  dateStr: string;
  dayName: string;
  formattedDate: string;
  count: number;
  revenue: number;
  isPeak: boolean;
}

export interface MonthlyWeekStat {
  id: string;
  label: string;
  dateRange: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface ProductPerformance {
  product: ProductItem;
  units: number;
  revenue: number;
  percentageOfRevenue: number;
  margin: number | null;
}
