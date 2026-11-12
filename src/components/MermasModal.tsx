'use client';

import React, { useState } from 'react';
import { WasteRecord, WasteReason, ProductItem, ProductStockConfig, BusinessInfo } from '@/types/accounting';
import { triggerHaptic } from '@/utils/haptics';
import {
  X,
  Trash2,
  Plus,
  CheckCircle2,
  Send,
  Check,
} from 'lucide-react';

interface MermasModalProps {
  isOpen: boolean;
  onClose: () => void;
  wasteRecords: WasteRecord[];
  products: ProductItem[];
  stockMap?: Record<string, ProductStockConfig>;
  businessInfo?: BusinessInfo;
  onAddWasteRecord: (record: WasteRecord, deductStock: boolean) => void;
  onDeleteWasteRecord: (id: string) => void;
  totalRevenue?: number;
}

const RAW_INGREDIENTS = [
  { id: 'ing-sirloin', name: 'Steak de Sirloin SK (SuKarne)', unit: 'kg', unitCost: 156.40 },
  { id: 'ing-queso-ojos', name: 'Queso Los Ojos Fundición (Abastos Esperanza)', unit: 'kg', unitCost: 210.00 },
  { id: 'ing-queso-mozzarella', name: 'Queso Mozzarella La Villita (Bodega Aurrera)', unit: 'pza', unitCost: 131.00 },
  { id: 'ing-papa-russet', name: 'Papa Russet Fresca (Casa Ley)', unit: 'kg', unitCost: 13.50 },
  { id: 'ing-pan-philly', name: 'Pan Hoagie para Philly', unit: 'piezas', unitCost: 7.50 },
  { id: 'ing-tortilla', name: 'Tortilla de Harina Sonorense', unit: 'piezas', unitCost: 3.50 },
  { id: 'ing-chile-caribe', name: 'Chile Caribe Toreado (Super Villa / Ley)', unit: 'kg', unitCost: 57.90 },
  { id: 'ing-cebolla', name: 'Cebolla Blanca (Casa Ley)', unit: 'kg', unitCost: 65.90 },
  { id: 'ing-aceite', name: 'Aceite Vegetal (Aurrera / Ley)', unit: 'pza', unitCost: 24.00 },
  { id: 'ing-doritos', name: 'Doritos Nacho S - Papas Lokas (Casa Ley)', unit: 'pza', unitCost: 52.90 },
  { id: 'ing-leche', name: 'Leche sin Lactosa - Champurro (Casa Ley)', unit: 'pza', unitCost: 48.90 },
  { id: 'ing-queso-amarillo', name: 'Queso Amarillo para Papas', unit: 'kg', unitCost: 65.00 },
  { id: 'ing-gas', name: 'Gas LP Comercial (Rivera Gas)', unit: 'L', unitCost: 11.13 },
];

const REASON_LABELS: Record<WasteReason, { label: string; color: string }> = {
  quemado: { label: 'Quemado en Parrilla/Freidora', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  caida: { label: 'Caída al Piso / Accidente', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  caducidad: { label: 'Vencido / Descompuesto', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  error_comanda: { label: 'Error de Comanda / Cancelación', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  merma_corte: { label: 'Merma de Limpieza / Grasa', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  otro: { label: 'Otro Motivo', color: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/30' },
};

export const MermasModal: React.FC<MermasModalProps> = ({
  isOpen,
  onClose,
  wasteRecords,
  products,
  businessInfo,
  onAddWasteRecord,
  onDeleteWasteRecord,
  totalRevenue = 0,
}) => {
  const [itemType, setItemType] = useState<'product' | 'ingredient'>('product');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>(RAW_INGREDIENTS[0].id);
  const [quantity, setQuantity] = useState<string>('1');
  const [reason, setReason] = useState<WasteReason>('quemado');
  const [responsible, setResponsible] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [deductStock, setDeductStock] = useState<boolean>(true);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate costs
  let currentUnitCost = 0;
  let currentItemName = '';
  let currentUnit = 'porciones';
  let targetItemId = '';

  if (itemType === 'product') {
    const prod = products.find((p) => p.id === selectedProductId);
    if (prod) {
      currentUnitCost = prod.cost;
      currentItemName = `${prod.name} (${prod.variantLabel})`;
      targetItemId = prod.id;
    }
  } else {
    const ing = RAW_INGREDIENTS.find((i) => i.id === selectedIngredientId);
    if (ing) {
      currentUnitCost = ing.unitCost;
      currentItemName = ing.name;
      currentUnit = ing.unit;
      targetItemId = ing.id;
    }
  }

  const numQty = Math.max(0.01, parseFloat(quantity) || 1);
  const calculatedTotalCost = Math.round(numQty * currentUnitCost * 100) / 100;

  const totalWasteCost = wasteRecords.reduce((sum, w) => sum + w.totalCost, 0);
  const wastePercentage = totalRevenue > 0 ? ((totalWasteCost / totalRevenue) * 100).toFixed(1) : '0.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');

    const newRecord: WasteRecord = {
      id: `waste-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemId: targetItemId,
      itemName: currentItemName,
      itemType,
      quantity: numQty,
      unit: currentUnit,
      unitCost: currentUnitCost,
      totalCost: calculatedTotalCost,
      reason,
      notes: notes.trim() || undefined,
      responsible: responsible.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    onAddWasteRecord(newRecord, deductStock);
    setNotes('');
    setQuantity('1');
  };

  const handleShareWhatsApp = () => {
    triggerHaptic('light');
    const bName = businessInfo?.name || 'LA PATRONA';
    const lines: string[] = [
      `📉 *REPORTE DE MERMAS Y DESPERDICIOS - ${bName.toUpperCase()}*`,
      `📅 Fecha: ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`,
      `💸 *Costo Total de Merma:* $${totalWasteCost.toFixed(2)} MXN`,
      `📊 Incidencia sobre Ventas: ${wastePercentage}%`,
      `🔢 Incidentes Registrados: ${wasteRecords.length}`,
      '--------------------------------',
    ];

    if (wasteRecords.length === 0) {
      lines.push('Sin mermas registradas en este turno.');
    } else {
      wasteRecords.forEach((w) => {
        const reasonText = REASON_LABELS[w.reason]?.label || w.reason;
        lines.push(`• *${w.quantity} ${w.unit}* de ${w.itemName}`);
        lines.push(`  Costo: $${w.totalCost.toFixed(2)} | Motivo: ${reasonText}`);
        if (w.responsible) lines.push(`  Responsable: ${w.responsible}`);
      });
    }

    lines.push('--------------------------------');
    lines.push('Generado desde el Sistema POS La Patrona');

    const fullText = lines.join('\n');
    navigator.clipboard.writeText(fullText);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);

    const waUrl = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90dvh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden pb-safe sm:pb-0">
        
        {/* Mobile handle indicator */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#19191d] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Mermas y Desperdicios de Cocina
                </h2>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {wasteRecords.length} registros
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Control de costo de insumos perdidos por quemado, caída o caducidad
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Executive Summary Bar */}
        <div className="grid grid-cols-3 gap-2 px-4 sm:px-6 py-3 border-b border-white/[0.06] bg-[#121215] shrink-0 text-center">
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
            <span className="block text-[10px] text-neutral-400 uppercase font-semibold">Costo Total de Merma</span>
            <span className="font-serif text-lg sm:text-xl font-bold text-rose-400">
              ${totalWasteCost.toFixed(2)} <span className="text-[10px] font-sans text-neutral-500">MXN</span>
            </span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
            <span className="block text-[10px] text-neutral-400 uppercase font-semibold">Impacto s/ Venta</span>
            <span className="font-mono text-lg sm:text-xl font-bold text-[#e59b38]">
              {wastePercentage}%
            </span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
            <span className="block text-[10px] text-neutral-400 uppercase font-semibold">Incidentes</span>
            <span className="font-mono text-lg sm:text-xl font-bold text-white">
              {wasteRecords.length}
            </span>
          </div>
        </div>

        {/* Modal Body: Split 2 Columns */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
          
          {/* Left Column: Form to Record New Waste (5 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-5 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-[#16161a]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-rose-400" />
              <span>Registrar Nueva Merma</span>
            </h3>

            {/* Item Type: Dish vs Raw Ingredient */}
            <div className="grid grid-cols-2 gap-1.5 bg-[#121215] p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setItemType('product')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  itemType === 'product'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Platillo del Menú
              </button>
              <button
                type="button"
                onClick={() => setItemType('ingredient')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  itemType === 'ingredient'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Insumo / Materia Prima
              </button>
            </div>

            {/* Select Item */}
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                {itemType === 'product' ? 'Seleccionar Platillo Afectado' : 'Seleccionar Insumo'}
              </label>
              {itemType === 'product' ? (
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-[#1b1b20] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400 font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.variantLabel}) - Costo: ${p.cost.toFixed(2)}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedIngredientId}
                  onChange={(e) => setSelectedIngredientId(e.target.value)}
                  className="w-full bg-[#1b1b20] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400 font-medium"
                >
                  {RAW_INGREDIENTS.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (${i.unitCost.toFixed(2)}/{i.unit})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Cantidad ({currentUnit})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#1b1b20] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Costo Calculado
                </label>
                <div className="w-full bg-[#121215] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-rose-400">
                  ${calculatedTotalCost.toFixed(2)} MXN
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Motivo del Desperdicio
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(REASON_LABELS) as WasteReason[]).map((r) => {
                  const isActive = reason === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setReason(r);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-left transition-all border ${
                        isActive
                          ? 'bg-rose-500 text-black border-rose-500 font-black shadow-sm'
                          : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {REASON_LABELS[r].label.split('/')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Responsible and Notes */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Cocinero / Responsable
                </label>
                <input
                  type="text"
                  placeholder="Ej. Parrillero Juan"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  className="w-full bg-[#1b1b20] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Nota / Observación
                </label>
                <input
                  type="text"
                  placeholder="Ej. Se cayó al voltear"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#1b1b20] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            {/* Deduct from portion stock checkbox */}
            {itemType === 'product' && (
              <label className="flex items-center gap-2 text-xs text-neutral-300 bg-[#121215] p-2.5 rounded-xl border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deductStock}
                  onChange={(e) => setDeductStock(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 focus:ring-offset-0 bg-[#1b1b20] border-white/20"
                />
                <span className="text-[11px]">
                  Descontar <b className="text-white">{numQty} porciones</b> del stock disponible de cocina
                </span>
              </label>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-98 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Registro de Merma</span>
            </button>
          </form>

          {/* Right Column: Historical Waste Log (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col overflow-hidden bg-[#111114]">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Historial de Mermas del Turno ({wasteRecords.length})
              </span>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all active:scale-95"
                title="Compartir reporte de mermas por WhatsApp"
              >
                {copiedWhatsApp ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>¡Enviando!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Reporte WhatsApp</span>
                  </>
                )}
              </button>
            </div>

            {/* Waste List */}
            <div className="flex-1 overflow-y-auto pt-3 space-y-2 pr-1">
              {wasteRecords.length === 0 ? (
                <div className="text-center py-12 px-4 text-neutral-500 space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400/50" />
                  <p className="text-sm font-semibold text-neutral-300">¡Cero mermas registradas!</p>
                  <p className="text-xs">
                    Excelente control en parrilla. No hay pérdidas de insumos reportadas en este turno.
                  </p>
                </div>
              ) : (
                wasteRecords.map((w) => {
                  const reasonInfo = REASON_LABELS[w.reason] || { label: w.reason, color: 'bg-white/10 text-white' };
                  const timeStr = new Date(w.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={w.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-rose-400">
                            {w.quantity} {w.unit}
                          </span>
                          <span className="text-xs font-semibold text-white truncate">
                            {w.itemName}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase border ${reasonInfo.color}`}>
                            {reasonInfo.label}
                          </span>
                          {w.responsible && (
                            <span className="text-neutral-400">
                              Resp: <b className="text-neutral-300">{w.responsible}</b>
                            </span>
                          )}
                          <span className="text-neutral-500 font-mono">
                            {timeStr}
                          </span>
                        </div>

                        {w.notes && (
                          <p className="text-[11px] text-neutral-400 italic">
                            &ldquo;{w.notes}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="font-mono font-bold text-sm text-rose-400">
                          -${w.totalCost.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('medium');
                            onDeleteWasteRecord(w.id);
                          }}
                          className="text-[10px] text-neutral-500 hover:text-red-400 transition-colors"
                          title="Eliminar registro"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
