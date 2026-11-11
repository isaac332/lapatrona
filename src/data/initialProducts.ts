import { ProductItem, ProductStockConfig } from '@/types/accounting';

export const INITIAL_STOCK: Record<string, ProductStockConfig> = {
  'sandwich-alone': {
    productId: 'sandwich-alone',
    currentStock: 30,
    initialStock: 30,
    lowStockThreshold: 5,
    trackStock: true,
  },
  'sandwich-fries': {
    productId: 'sandwich-fries',
    currentStock: 30,
    initialStock: 30,
    lowStockThreshold: 5,
    trackStock: true,
  },
  'quesadilla-alone': {
    productId: 'quesadilla-alone',
    currentStock: 25,
    initialStock: 25,
    lowStockThreshold: 4,
    trackStock: true,
  },
  'quesadilla-fries': {
    productId: 'quesadilla-fries',
    currentStock: 25,
    initialStock: 25,
    lowStockThreshold: 4,
    trackStock: true,
  },
  'steak-frites': {
    productId: 'steak-frites',
    currentStock: 20,
    initialStock: 20,
    lowStockThreshold: 3,
    trackStock: true,
  },
  'fries-alone': {
    productId: 'fries-alone',
    currentStock: 45,
    initialStock: 45,
    lowStockThreshold: 8,
    trackStock: true,
  },
  'fries-cheese': {
    productId: 'fries-cheese',
    currentStock: 30,
    initialStock: 30,
    lowStockThreshold: 6,
    trackStock: true,
  },
};

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'sandwich-alone',
    name: 'Philly Cheesesteak',
    variantLabel: 'Sencillo (Solo)',
    category: 'sandwiches',
    description: 'Finas láminas de ribeye jugoso, queso provolone derretido y cebollitas asadas en pan hoagie artesanal.',
    imageUrl: 'https://images.unsplash.com/photo-1549611016-3a70d82b5040?auto=format&fit=crop&w=800&q=80',
    defaultPrice: 145.00,
    cost: 0,
  },
  {
    id: 'sandwich-fries',
    name: 'Combo Philly Cheesesteak',
    variantLabel: 'Con Papas',
    category: 'sandwiches',
    description: 'Nuestro legendario cheesesteak de ribeye acompañado con una orden de papas a la francesa doraditas.',
    imageUrl: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=800&q=80',
    defaultPrice: 185.00,
    cost: 0,
  },
  {
    id: 'quesadilla-alone',
    name: 'Quesadilla de Ribeye',
    variantLabel: 'Sencilla (Sola)',
    category: 'quesadillas',
    description: 'Tortilla de harina dorada a la plancha rellena de jugoso ribeye y mezcla de quesos Monterrey Jack y provolone.',
    imageUrl: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=800&q=80',
    defaultPrice: 135.00,
    cost: 0,
  },
  {
    id: 'quesadilla-fries',
    name: 'Combo Quesadilla de Ribeye',
    variantLabel: 'Con Papas',
    category: 'quesadillas',
    description: 'Quesadilla dorada con abundante ribeye y queso fundido, servida con canasta de papas a la francesa recién hechas.',
    imageUrl: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=800&q=80',
    defaultPrice: 175.00,
    cost: 0,
  },
  {
    id: 'steak-frites',
    name: 'Steak Frites de Ribeye',
    variantLabel: 'Papas con Ribeye y Verduras',
    category: 'steak-frites',
    description: 'Generosa charola de papas a la francesa crujientes coronadas con tiras de ribeye sellado, pimientos asados y cebollita salteada.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    defaultPrice: 195.00,
    cost: 0,
  },
  {
    id: 'fries-alone',
    name: 'Papas a la Francesa',
    variantLabel: 'Sencillas (Clásicas)',
    category: 'fries',
    description: 'Papas corte casero fritas a doble cocción, sazonadas con sal de grano y el toque especial de la casa.',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
    defaultPrice: 65.00,
    cost: 0,
  },
  {
    id: 'fries-cheese',
    name: 'Papas con Queso Amarillo',
    variantLabel: 'Con Queso Fundido',
    category: 'fries',
    description: 'Papas a la francesa doradas y crujientes bañadas en abundante salsa caliente de queso cheddar fundido.',
    imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80',
    defaultPrice: 85.00,
    cost: 0,
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
  { id: 'mod-extra-cheese', name: 'Extra Queso Provolone Fundido', price: 25.0, cost: 8.5, category: 'sandwiches' },
  { id: 'mod-extra-ribeye', name: 'Extra Ribeye Marinado (80g)', price: 45.0, cost: 22.0, category: 'all' },
  { id: 'mod-bacon', name: 'Tocineta Crujiente / Bacon', price: 20.0, cost: 7.0, category: 'all' },
  { id: 'mod-mushrooms', name: 'Champiñones Salteados al Ajo', price: 18.0, cost: 5.5, category: 'sandwiches' },
  { id: 'mod-cheese-sauce', name: 'Bañado de Queso Cheddar Fundido', price: 20.0, cost: 6.0, category: 'fries' },
  { id: 'mod-seasoning-lemon', name: 'Sazón Lemon Pepper', price: 0.0, cost: 0.5, category: 'fries' },
  { id: 'mod-seasoning-cajun', name: 'Sazón Cajún Picante', price: 0.0, cost: 0.5, category: 'fries' },
  { id: 'mod-no-onion', name: 'Sin Cebolla Salteada', price: 0.0, cost: 0.0, category: 'all' },
];

export const QUICK_INSTRUCTIONS: string[] = [
  'Sin cebolla salteada',
  'Cebolla extra dorada',
  'Pan bien tostado',
  'Salsa aparte',
  'Carne término 3/4',
  'Poco queso',
  'Papas extra crujientes',
];
