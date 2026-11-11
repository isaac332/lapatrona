export type CategoryType = 'sandwiches' | 'quesadillas' | 'steak-frites' | 'fries';

export interface ProductItem {
  id: string;
  name: string;
  variantLabel: string;
  category: CategoryType;
  description: string;
  imageUrl: string;
  defaultPrice: number;
  cost: number; // cost of goods sold per unit (to be provided later)
}

export interface SaleRecord {
  id: string;
  productId: string;
  timestamp: string; // ISO string
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export type TimeframeFilter = 'today' | 'week' | 'month' | 'all';
