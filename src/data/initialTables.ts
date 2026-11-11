import { RestaurantTableConfig } from '@/types/accounting';

export const INITIAL_TABLES: RestaurantTableConfig[] = [
  { id: 'mesa-1', name: 'Mesa 1', zone: 'interior', capacity: 4 },
  { id: 'mesa-2', name: 'Mesa 2', zone: 'interior', capacity: 4 },
  { id: 'mesa-3', name: 'Mesa 3', zone: 'interior', capacity: 2 },
  { id: 'mesa-4', name: 'Mesa 4', zone: 'interior', capacity: 6 },
  { id: 'mesa-5', name: 'Mesa 5', zone: 'interior', capacity: 4 },
  { id: 'barra-1', name: 'Barra 1', zone: 'barra', capacity: 1 },
  { id: 'barra-2', name: 'Barra 2', zone: 'barra', capacity: 1 },
  { id: 'barra-3', name: 'Barra 3', zone: 'barra', capacity: 1 },
  { id: 'terraza-1', name: 'Terraza 1', zone: 'terraza', capacity: 4 },
  { id: 'terraza-2', name: 'Terraza 2', zone: 'terraza', capacity: 4 },
];
