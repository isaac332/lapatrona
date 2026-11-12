import { ProductItem, ProductStockConfig } from '@/types/accounting';

export const INITIAL_STOCK: Record<string, ProductStockConfig> = {
  'sandwich-fries': {
    productId: 'sandwich-fries',
    currentStock: 30,
    initialStock: 30,
    lowStockThreshold: 5,
    trackStock: false,
  },
  'sandwich-alone': {
    productId: 'sandwich-alone',
    currentStock: 30,
    initialStock: 30,
    lowStockThreshold: 5,
    trackStock: false,
  },
  'quesadilla-fries': {
    productId: 'quesadilla-fries',
    currentStock: 30,
    initialStock: 30,
    lowStockThreshold: 5,
    trackStock: false,
  },
  'quesadilla-alone': {
    productId: 'quesadilla-alone',
    currentStock: 25,
    initialStock: 25,
    lowStockThreshold: 4,
    trackStock: false,
  },
  'steak-frites': {
    productId: 'steak-frites',
    currentStock: 25,
    initialStock: 25,
    lowStockThreshold: 4,
    trackStock: false,
  },
  'fries-cheese': {
    productId: 'fries-cheese',
    currentStock: 30,
    initialStock: 30,
    lowStockThreshold: 6,
    trackStock: false,
  },
  'champurro': {
    productId: 'champurro',
    currentStock: 30,
    initialStock: 30,
    lowStockThreshold: 5,
    trackStock: false,
  },
};

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'sandwich-fries',
    name: 'Sándwich c/ papas',
    variantLabel: 'Con Papas',
    category: 'sandwiches',
    description: 'Sándwich Philly con carne Sirloin, queso fundido y cebollita asada acompañado de papas.',
    imageUrl: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=800&q=80',
    defaultPrice: 160.00,
    cost: 51.06,
  },
  {
    id: 'sandwich-alone',
    name: 'Sándwich solo',
    variantLabel: 'Sin Papas (Solo)',
    category: 'sandwiches',
    description: 'Sándwich Philly con carne Sirloin, queso derretido y cebollita asada en pan artesanal (sin papas).',
    imageUrl: 'https://images.unsplash.com/photo-1549611016-3a70d82b5040?auto=format&fit=crop&w=800&q=80',
    defaultPrice: 130.00,
    cost: 45.36,
  },
  {
    id: 'quesadilla-fries',
    name: 'Quesadilla c/ papas',
    variantLabel: 'Con Papas',
    category: 'quesadillas',
    description: 'Quesadilla con carne Sirloin estilo Philly y queso fundido, acompañada con papas.',
    imageUrl: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=800&q=80',
    defaultPrice: 70.00,
    cost: 41.67,
  },
  {
    id: 'quesadilla-alone',
    name: 'Quesadilla sin papas',
    variantLabel: 'Sin Papas (Sola)',
    category: 'quesadillas',
    description: 'Quesadilla en tortilla de harina dorada a la plancha con carne Sirloin y queso fundido (sin papas).',
    imageUrl: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=800&q=80',
    defaultPrice: 50.00,
    cost: 35.97,
  },
  {
    id: 'steak-frites',
    name: 'Papas Lokas',
    variantLabel: 'Preparadas con Carne y Queso',
    category: 'steak-frites',
    description: 'Orden de papas preparadas estilo Papas Lokas con Doritos Nacho, carne Sirloin y queso.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    defaultPrice: 70.00,
    cost: 46.82,
  },
  {
    id: 'fries-cheese',
    name: 'Papas con queso amarillo',
    variantLabel: 'Con Queso Amarillo',
    category: 'fries',
    description: 'Papas a la francesa doradas y crujientes bañadas en queso amarillo caliente.',
    imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80',
    defaultPrice: 50.00,
    cost: 13.93,
  },
  {
    id: 'champurro',
    name: 'Champurro',
    variantLabel: 'Vaso Caliente',
    category: 'bebidas',
    description: 'Champurro tradicional caliente con leche sin lactosa recién preparado.',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    defaultPrice: 40.00,
    cost: 22.30,
  },
];

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
  cost: number;
  category?: 'sandwiches' | 'quesadillas' | 'fries' | 'all';
}

export const STANDARD_MODIFIERS: ModifierOption[] = [
  { id: 'mod-extra-cheese', name: 'Extra Queso Fundido', price: 20.0, cost: 8.50, category: 'sandwiches' },
  { id: 'mod-extra-meat', name: 'Extra Carne Sirloin', price: 40.0, cost: 15.60, category: 'all' },
  { id: 'mod-cheese-sauce', name: 'Extra Queso Amarillo', price: 15.0, cost: 4.50, category: 'fries' },
  { id: 'mod-no-onion', name: 'Sin Cebolla', price: 0.0, cost: 0.0, category: 'all' },
  { id: 'mod-chile-toreado', name: 'Chile Toreado Extra', price: 10.0, cost: 2.50, category: 'all' },
];

export const QUICK_INSTRUCTIONS: string[] = [
  'Sin cebolla',
  'Cebolla bien dorada',
  'Pan bien tostado',
  'Salsa aparte',
  'Poco queso',
  'Papas bien doradas',
];