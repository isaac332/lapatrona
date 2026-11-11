import { TipStaffMember } from '@/types/accounting';

export const DEFAULT_STAFF: TipStaffMember[] = [
  { id: 'staff-1', name: 'Carlos Ramos', role: 'cocina', hoursWorked: 8, active: true },
  { id: 'staff-2', name: 'Lucía Méndez', role: 'mesero', hoursWorked: 8, active: true },
  { id: 'staff-3', name: 'Rodrigo Nava', role: 'barra', hoursWorked: 6, active: true },
  { id: 'staff-4', name: 'Martha Gómez', role: 'limpieza', hoursWorked: 6, active: true },
];

export const DEFAULT_ROLE_WEIGHTS = {
  cocina: 40,
  mesero: 40,
  barra: 10,
  limpieza: 10,
  cajero: 0,
  otro: 0,
};

export const ROLE_LABELS: Record<string, { label: string; color: string; badgeBg: string }> = {
  cocina: { label: 'Cocina', color: 'text-orange-400', badgeBg: 'bg-orange-500/15 border-orange-500/30' },
  mesero: { label: 'Servicio / Mesas', color: 'text-amber-400', badgeBg: 'bg-amber-500/15 border-amber-500/30' },
  barra: { label: 'Barra y Bebidas', color: 'text-sky-400', badgeBg: 'bg-sky-500/15 border-sky-500/30' },
  limpieza: { label: 'Limpieza y Apoyo', color: 'text-emerald-400', badgeBg: 'bg-emerald-500/15 border-emerald-500/30' },
  cajero: { label: 'Caja y Cobro', color: 'text-purple-400', badgeBg: 'bg-purple-500/15 border-purple-500/30' },
  otro: { label: 'Otro Personal', color: 'text-neutral-400', badgeBg: 'bg-neutral-500/15 border-neutral-500/30' },
};
