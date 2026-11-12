export type CategoryType = 'sandwiches' | 'quesadillas' | 'steak-frites' | 'fries' | 'bebidas' | 'extras' | 'postres' | 'otro';

export interface ProductItem {
  id: string;
  name: string;
  variantLabel: string;
  category: CategoryType;
  description: string;
  imageUrl: string;
  defaultPrice: number;
  cost: number;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto';

export interface SaleRecord {
  id: string;
  productId: string;
  timestamp: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  paymentMethod?: PaymentMethod;
  cashAmount?: number;
  cardAmount?: number;
  orderId?: string;
  orderNumber?: number;
  isCancelled?: boolean;
  modifiersText?: string;
}

export interface OrderItemModifier {
  id: string;
  name: string;
  price: number;
  cost?: number;
}

export interface CustomerOrderItem {
  productId: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  subtotal: number;
  modifiers?: OrderItemModifier[];
  instructions?: string;
}

export type TipStaffRole = 'cocina' | 'mesero' | 'barra' | 'limpieza' | 'cajero' | 'otro';

export interface TipStaffMember {
  id: string;
  name: string;
  role: TipStaffRole;
  hoursWorked?: number;
  percentage?: number;
  customAmount?: number;
  active?: boolean;
}

export interface TipSettlementPayout {
  staffId: string;
  name: string;
  role: TipStaffRole;
  amount: number;
  percentage: number;
  hoursWorked?: number;
}

export interface TipSettlementRecord {
  id: string;
  shiftNumber: number;
  date: string;
  totalTips: number;
  mode: 'equitativo' | 'puesto' | 'horas';
  payouts: TipSettlementPayout[];
  notes?: string;
  cashierName?: string;
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

export interface RestaurantTableConfig {
  id: string;
  name: string;
  zone: 'interior' | 'terraza' | 'barra';
  capacity?: number;
}

export interface CustomerOrder {
  id: string;
  orderNumber: number;
  timestamp: string;
  orderType: 'aqui' | 'llevar';
  customerName?: string;
  tableNumber?: string;
  isOpenTab?: boolean;
  closedAt?: string;
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
  isCancelled?: boolean;
  cancellationReason?: string;
  cancelledAt?: string;
}

export interface PurchaseTicketItem {
  id: string;
  description: string;
  quantity: number;
  unit: 'kg' | 'L' | 'pza';
  regularUnitPrice: number;
  effectiveUnitPrice: number;
  lineTotal?: number;
  ingredientKey?: 'sirloin' | 'queso' | 'papa' | 'chile_caribe' | 'cebolla' | 'aceite' | 'gas_lp' | 'leche' | 'doritos' | 'mayonesa' | 'limpieza' | 'otro';
}

export interface PurchaseTicketRecord {
  id: string;
  storeName: string;
  branchAddress: string;
  rfc?: string;
  folio?: string;
  timestamp: string;
  paymentMethod: PaymentMethod;
  category: 'carne' | 'quesos' | 'verduras_abarrotes' | 'gas' | 'insumos';
  amountPaid?: number;
  changeGiven?: number;
  iva?: number;
  items: PurchaseTicketItem[];
}

export interface ExpenseRecord {
  id: string;
  description: string;
  category: string;
  amount: number;
  timestamp: string;
  storeName?: string;
  branchAddress?: string;
  rfc?: string;
  folio?: string;
  paymentMethod?: PaymentMethod;
  items?: PurchaseTicketItem[];
  savedDiscount?: number;
}

export type WasteReason = 'quemado' | 'caida' | 'caducidad' | 'error_comanda' | 'merma_corte' | 'otro';

export interface WasteRecord {
  id: string;
  itemId: string;
  itemName: string;
  itemType: 'product' | 'ingredient';
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  reason: WasteReason;
  notes?: string;
  responsible?: string;
  timestamp: string;
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
  startingCash: number;
  openedAt: string;
  cashierName: string;
  countedCash?: number;
  denominations?: CashDenominationCount;
}

export interface ClosedShiftRecord {
  id: string;
  shiftNumber: number;
  reportType?: 'corte_x' | 'corte_z';
  openedAt: string;
  closedAt: string;
  cashierName?: string;
  startingCash: number;
  totalGrossRevenue: number;
  subtotalSinIVA?: number;
  iva16?: number;
  totalDiscounts?: number;
  totalWasteCost?: number;
  orderRange?: string;
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