'use client';

import React, { useState } from 'react';
import { ProductStockConfig } from '@/types/accounting';
import {
  X,
  CheckSquare,
  Square,
  Copy,
  Check,
  RotateCcw,
  Share2,
  Scale,
  ChefHat,
} from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

interface PrepItem {
  id: string;
  name: string;
  quantityStr: string;
  numericVal: number;
  unit: string;
  category: 'carniceria' | 'panaderia' | 'cremeria' | 'verduras' | 'empaques';
  notes: string;
}

interface MiseEnPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockMap: Record<string, ProductStockConfig>;
}

export const MiseEnPlaceModal: React.FC<MiseEnPlaceModalProps> = ({
  isOpen,
  onClose,
  stockMap,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Extract current stock quotas
  const swAlone = stockMap['sandwich-alone']?.currentStock || 0;
  const swFries = stockMap['sandwich-fries']?.currentStock || 0;
  const qAlone = stockMap['quesadilla-alone']?.currentStock || 0;
  const qFries = stockMap['quesadilla-fries']?.currentStock || 0;
  const steakFrites = stockMap['steak-frites']?.currentStock || 0;
  const friesAlone = stockMap['fries-alone']?.currentStock || 0;
  const friesCheese = stockMap['fries-cheese']?.currentStock || 0;

  // Calculations
  const totalSandwiches = swAlone + swFries;
  const totalQuesadillas = qAlone + qFries;

  // Ribeye total in kg: (sw * 150g + q * 120g + sf * 180g) / 1000
  const ribeyeGrams = totalSandwiches * 150 + totalQuesadillas * 120 + steakFrites * 180;
  const ribeyeKg = Math.round((ribeyeGrams / 1000) * 10) / 10;

  // Hoagie pieces
  const hoagiePieces = totalSandwiches;

  // Giant flour tortillas
  const tortillaPieces = totalQuesadillas;

  // Potatoes in kg: (swFries * 200g + qFries * 200g + sf * 250g + fAlone * 220g + fCheese * 220g) / 1000
  const friesGrams =
    swFries * 200 +
    qFries * 200 +
    steakFrites * 250 +
    friesAlone * 220 +
    friesCheese * 220;
  const friesKg = Math.round((friesGrams / 1000) * 10) / 10;

  // Provolone cheese in kg: (totalSandwiches * 50g) / 1000
  const provoloneKg = Math.round(((totalSandwiches * 50) / 1000) * 10) / 10;

  // Queso fundir mezcla (quesadillas): (totalQuesadillas * 60g) / 1000
  const meltingCheeseKg = Math.round(((totalQuesadillas * 60) / 1000) * 10) / 10;

  // Cheddar cheese sauce: (friesCheese * 70g) / 1000
  const cheddarCheeseKg = Math.round(((friesCheese * 70) / 1000) * 10) / 10;

  // Sautéed vegetables (onions and peppers): approx 40g per sandwich/sf
  const veggiesKg = Math.round((((totalSandwiches + steakFrites) * 40) / 1000) * 10) / 10;

  // Food containers and wraps
  const totalBoxes =
    totalSandwiches + totalQuesadillas + steakFrites + friesAlone + friesCheese;

  const prepItems: PrepItem[] = [
    {
      id: 'ribeye',
      name: 'Ribeye de Res Rebanado',
      quantityStr: `${ribeyeKg.toFixed(1)} kg`,
      numericVal: ribeyeKg,
      unit: 'kg',
      category: 'carniceria',
      notes: `${ribeyeGrams}g totales (150g p/sw, 120g p/quesadilla, 180g p/steak frites)`,
    },
    {
      id: 'hoagie',
      name: 'Pan Hoagie Artesanal',
      quantityStr: `${hoagiePieces} pzs`,
      numericVal: hoagiePieces,
      unit: 'piezas',
      category: 'panaderia',
      notes: 'Cortado al centro y untado con mantequilla',
    },
    {
      id: 'tortillas',
      name: 'Tortillas de Harina Gigantes',
      quantityStr: `${tortillaPieces} pzs`,
      numericVal: tortillaPieces,
      unit: 'piezas',
      category: 'panaderia',
      notes: 'Temperatura ambiente listas para plancha',
    },
    {
      id: 'papas',
      name: 'Papas Corte Casero (Pre-cocidas / Blanqueadas)',
      quantityStr: `${friesKg.toFixed(1)} kg`,
      numericVal: friesKg,
      unit: 'kg',
      category: 'verduras',
      notes: `${friesGrams}g listos para freidora doble cocción`,
    },
    {
      id: 'provolone',
      name: 'Queso Provolone Rebanado',
      quantityStr: `${provoloneKg.toFixed(1)} kg`,
      numericVal: provoloneKg,
      unit: 'kg',
      category: 'cremeria',
      notes: 'Porciones de 50g por cheesesteak',
    },
    {
      id: 'queso-fundir',
      name: 'Mezcla Quesos Monterrey Jack & Oaxaca',
      quantityStr: `${meltingCheeseKg.toFixed(1)} kg`,
      numericVal: meltingCheeseKg,
      unit: 'kg',
      category: 'cremeria',
      notes: 'Rallado fresco para quesadillas',
    },
    {
      id: 'cheddar',
      name: 'Salsa de Queso Cheddar Caliente',
      quantityStr: `${cheddarCheeseKg.toFixed(1)} kg`,
      numericVal: cheddarCheeseKg,
      unit: 'kg',
      category: 'cremeria',
      notes: 'Baño maría a 65°C listo para bañar papas',
    },
    {
      id: 'verduras',
      name: 'Cebollitas Caramelizadas y Pimientos',
      quantityStr: `${veggiesKg.toFixed(1)} kg`,
      numericVal: veggiesKg,
      unit: 'kg',
      category: 'verduras',
      notes: 'Pochadas en plancha con sal y pimienta',
    },
    {
      id: 'empaques',
      name: 'Charolas, Papel Antigrasa y Conos',
      quantityStr: `${totalBoxes} pzs`,
      numericVal: totalBoxes,
      unit: 'piezas',
      category: 'empaques',
      notes: 'Armadas en repisa para entrega rápida',
    },
  ];

  const toggleCheck = (id: string) => {
    triggerHaptic('light');
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = prepItems.filter((item) => checkedItems[item.id]).length;
  const progressPercent = Math.round((completedCount / prepItems.length) * 100);

  const handleResetChecklist = () => {
    triggerHaptic('medium');
    setCheckedItems({});
  };

  const handleCopyShoppingList = () => {
    triggerHaptic('success');
    const lines = [
      '📋 *LISTA DE PRODUCCIÓN Y MISE EN PLACE*',
      '• LA PATRONA - PHILLY & FRY •',
      `Fecha: ${new Date().toLocaleDateString('es-MX')}`,
      '--------------------------------',
      ...prepItems.map((item) => `• ${item.name}: ${item.quantityStr} (${item.notes})`),
      '--------------------------------',
      `Meta de Porciones: ${totalBoxes} órdenes totales en turno.`,
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShareWhatsApp = () => {
    triggerHaptic('medium');
    const lines = [
      '📋 *LISTA DE MISE EN PLACE Y COMPRAS*',
      '• LA PATRONA - PHILLY & FRY •',
      `Fecha: ${new Date().toLocaleDateString('es-MX')}`,
      '',
      ...prepItems.map((item) => `✅ *${item.name}:* ${item.quantityStr}\n   _${item.notes}_`),
      '',
      `🎯 Capacidad estimada del turno: ${totalBoxes} órdenes.`,
    ];
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden pb-safe sm:pb-0">
        
        {/* Mobile Handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#19191d] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e59b38]/15 border border-[#e59b38]/30 flex items-center justify-center text-[#e59b38]">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Mise en Place y Prep de Cocina
                </h2>
                <span className="text-[10px] bg-[#e59b38]/20 text-[#e59b38] border border-[#e59b38]/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  TURNO
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Insumos crudos calculados para surtir las porciones asignadas al turno
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors touch-manipulation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar & Actions Bar */}
        <div className="px-4 sm:px-6 py-3 bg-[#111115] border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex-1 max-w-xs">
            <div className="flex justify-between text-xs mb-1 font-semibold">
              <span className="text-neutral-300">Preparación de Cocina:</span>
              <span className="text-[#e59b38] font-mono">{progressPercent}% ({completedCount}/{prepItems.length})</span>
            </div>
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#e59b38] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleResetChecklist}
              className="px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[11px] text-neutral-400 hover:text-white transition-colors"
              title="Desmarcar todos los insumos"
            >
              <RotateCcw className="w-3 h-3 inline mr-1" />
              <span>Limpiar</span>
            </button>
            <button
              onClick={handleCopyShoppingList}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-300" />
                  <span>Copiar Lista</span>
                </>
              )}
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-black text-[11px] font-bold transition-all active:scale-95 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Scrollable Checklist */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {prepItems.map((item) => {
            const isDone = Boolean(checkedItems[item.id]);

            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 touch-manipulation ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-neutral-400 opacity-80'
                    : 'bg-[#18181e] border-white/[0.06] hover:border-white/[0.15] text-white'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-neutral-400 hover:text-white transition-colors shrink-0"
                >
                  {isDone ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5 text-neutral-500" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-semibold truncate ${
                        isDone ? 'line-through text-neutral-400' : 'text-white'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span
                      className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-lg shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-[#e59b38]/15 text-[#e59b38] border border-[#e59b38]/30'
                      }`}
                    >
                      {item.quantityStr}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {item.notes}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className="p-3.5 sm:p-4 border-t border-white/[0.08] bg-[#19191d] flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[#e59b38]" />
            <span>Basado en las porciones activas de stock de mostrador.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#e59b38] hover:bg-[#d48b28] text-black font-extrabold text-xs uppercase tracking-wider transition-colors active:scale-95"
          >
            Listo / Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
