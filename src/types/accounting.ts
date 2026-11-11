export type CategoryType = 'sandwiches' | 'quesadillas' | 'steak-frites' | 'fries' | 'bebidas' | 'extras' | 'postres' | 'otro';

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

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto';

export interface SaleRecord {
  id: string;
  productId: string;
  timestamp: string; // ISO string
  quantity: number;
  unitPrice: number;
  unitCost: number;
  paymentMethod?: PaymentMethod;
  cashAmount?: number;
  cardAmount?: number;
  orderId?: string;
  orderNumber?: number;
}

export interface CustomerOrderItem {
  productId: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  subtotal: number;
}

export interface SplitPaymentDetail {
  cash: number;
  card: number;
}

export interface OrderDiscount {
  type: 'percent' | 'fixed';
  value: number;
  amount: number;
  label?: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: number;
  timestamp: string;
  orderType: 'aqui' | 'llevar';
  customerName?: string;
  notes?: string;
  items: CustomerOrderItem[];
  total: number;
  tip?: number;
  discount?: OrderDiscount;
  paymentMethod: PaymentMethod;
  splitPayment?: SplitPaymentDetail;
  amountReceived?: number;
  change?: number;
  status?: 'pendiente' | 'preparando' | 'listo' | 'entregado';
}

export interface ExpenseRecord {
  id: string;
  description: string;
  category: string; // 'insumos' | 'servicios' | 'mercado' | 'otro'
  amount: number;
  timestamp: string; // ISO string
}

export interface PaymentBreakdown {
  efectivo: { count: number; total: number; percentage: number };
  tarjeta: { count: number; total: number; percentage: number };
  transferencia: { count: number; total: number; percentage: number };
  totalRevenue: number;
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

export interface CashDenominationCount {
  b1000: number;
  b500: number;
  b200: number;
  b100: number;
  b50: number;
  b20: number;
  coins: number;
}

export interface CashShiftState {
  startingCash: number; // Fondo inicial para cambio (e.g. $1,000 MXN)
  openedAt: string;
  cashierName: string;
  countedCash?: number; // Arqueo físico ingresado
  denominations?: CashDenominationCount;
}

export interface ClosedShiftRecord {
  id: string;
  shiftNumber: number;
  openedAt: string;
  closedAt: string;
  cashierName?: string;
  startingCash: number;
  totalGrossRevenue: number;
  cashSalesTotal: number;
  cardSalesTotal: number;
  transferSalesTotal: number;
  totalExpenses: number;
  totalTipsCollected?: number;
  expectedCashInDrawer: number;
  countedCash?: number;
  difference?: number;
  differenceStatus?: 'cuadrada' | 'sobrante' | 'faltante';
  totalUnits: number;
  notes?: string;
}

export interface ProductPerformance {
  product: ProductItem;
  units: number;
  revenue: number;
  percentageOfRevenue: number;
  margin: number | null;
}

export interface ProductStockConfig {
  productId: string;
  currentStock: number;
  initialStock: number;
  lowStockThreshold: number;
  trackStock: boolean;
}

export interface BusinessInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  rfc?: string;
  footerNote: string;
}
