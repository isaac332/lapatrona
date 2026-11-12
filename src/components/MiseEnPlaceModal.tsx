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
import { ModalShell } from './ModalShell';

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
  const friesCheese = stockMap['fries-cheese']?.currentStock || 0;
  const champurroStock = stockMap['champurro']?.currentStock || 0;

  // Calculations
  const totalSandwiches = swAlone + swFries;
  const totalQuesadillas = qAlone + qFries;
  const papasLokas = steakFrites;
  const papasQueso = friesCheese;

  // Steak de Sirloin SK (SuKarne): 150g p/sw, 120g p/quesadilla, 80g p/papas lokas
  const sirloinGrams = totalSandwiches * 150 + totalQuesadillas * 120 + papasLokas * 80;
  const sirloinKg = Math.round((sirloinGrams / 1000) * 10) / 10;

  // Pan Hoagie para Philly
  const hoagiePieces = totalSandwiches;

  // Tortillas de harina sonorenses grandes
  const tortillaPieces = totalQuesadillas;

  // Papa Russet (Casa Ley): 200g p/combos papas, 250g p/papas lokas y queso amarillo
  const friesGrams =
    swFries * 200 +
    qFries * 200 +
    papasLokas * 250 +
    papasQueso * 250;
  const friesKg = Math.round((friesGrams / 1000) * 10) / 10;

  // Queso Los Ojos / Mozzarella (Abastos Esperanza / Aurrera): 50g p/sw, 60g p/quesadilla, 40g p/papas lokas
  const cheeseGrams = totalSandwiches * 50 + totalQuesadillas * 60 + papasLokas * 40;
  const cheeseKg = Math.round((cheeseGrams / 1000) * 10) / 10;

  // Salsa de Queso amarillo caliente: 70g p/orden
  const cheddarCheeseKg = Math.round(((papasQueso * 70) / 1000) * 10) / 10;

  // Doritos Nacho (Casa Ley): aprox 1/3 bolsa por cada orden de Papas Lokas
  const doritosBags = Math.ceil(papasLokas / 3);

  // Champurro caliente en litros (aprox 350ml por vaso de 12oz)
  const champurroLitros = Math.round(champurroStock * 0.35 * 10) / 10;

  // Cebolla blanca y chile caribe toreado a la plancha: approx 40g por sándwich/papas lokas
  const veggiesKg = Math.round((((totalSandwiches + papasLokas) * 40) / 1000) * 10) / 10;

  // Food containers and wraps ("Todo Para Llevar")
  const totalBoxes =
    totalSandwiches + totalQuesadillas + papasLokas + papasQueso + champurroStock;

  const prepItems: PrepItem[] = [
    {
      id: 'sirloin',
      name: 'Steak de Sirloin SK Rebanado (SuKarne)',
      quantityStr: `${sirloinKg.toFixed(1)} kg`,
      numericVal: sirloinKg,
      unit: 'kg',
      category: 'carniceria',
      notes: `${sirloinGrams}g totales (150g p/sw, 120g p/quesadilla, 80g p/papas lokas)`,
    },
    {
      id: 'hoagie',
      name: 'Pan Hoagie para Philly Cheesesteak',
      quantityStr: `${hoagiePieces} pzs`,
      numericVal: hoagiePieces,
      unit: 'piezas',
      category: 'panaderia',
      notes: 'Pan blanco alargado cortado al centro para plancha',
    },
    {
      id: 'tortillas',
      name: 'Tortillas de Harina Sonorenses',
      quantityStr: `${tortillaPieces} pzs`,
      numericVal: tortillaPieces,
      unit: 'piezas',
      category: 'panaderia',
      notes: 'Tortilla grande a temperatura ambiente lista para dorar',
    },
    {
      id: 'papas',
      name: 'Papa Russet en Bastones (Casa Ley)',
      quantityStr: `${friesKg.toFixed(1)} kg`,
      numericVal: friesKg,
      unit: 'kg',
      category: 'verduras',
      notes: `${friesGrams}g blanqueados para freidora doble cocción`,
    },
    {
      id: 'queso-ojos',
      name: 'Queso Los Ojos / Mozzarella Rallado (Abastos Esperanza)',
      quantityStr: `${cheeseKg.toFixed(1)} kg`,
      numericVal: cheeseKg,
      unit: 'kg',
      category: 'cremeria',
      notes: `${cheeseGrams}g de mezcla fundente para sándwiches y quesadillas`,
    },
    {
      id: 'cheddar',
      name: 'Queso Amarillo Líquido Caliente',
      quantityStr: `${cheddarCheeseKg.toFixed(1)} kg`,
      numericVal: cheddarCheeseKg,
      unit: 'kg',
      category: 'cremeria',
      notes: 'Baño maría a 65°C listo para bañar papas',
    },
    {
      id: 'verduras',
      name: 'Cebolla Blanca y Chile Caribe Toreados',
      quantityStr: `${veggiesKg.toFixed(1)} kg`,
      numericVal: veggiesKg,
      unit: 'kg',
      category: 'verduras',
      notes: 'Fileteados y toreados a la plancha con sazón Patrona',
    },
    {
      id: 'doritos',
      name: 'Doritos Nacho S Troceados (Casa Ley)',
      quantityStr: `${doritosBags} pzs`,
      numericVal: doritosBags,
      unit: 'piezas',
      category: 'empaques',
      notes: 'Bolsas listas para montar base crujiente de Papas Lokas',
    },
    {
      id: 'champurro',
      name: 'Champurro Tradicional Caliente (Leche Sin Lacto)',
      quantityStr: `${champurroLitros.toFixed(1)} L`,
      numericVal: champurroLitros,
      unit: 'litros',
      category: 'cremeria',
      notes: `${champurroStock} vasos de 12oz listos en termo/olla`,
    },
    {
      id: 'empaques',
      name: 'Charolas Térmicas, Papel Aluminio y Bolsas',
      quantityStr: `${totalBoxes} pzs`,
      numericVal: totalBoxes,
      unit: 'piezas',
      category: 'empaques',
      notes: 'Armadas en estación para Todo Para Llevar',
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
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="mise-en-place-title"
      maxWidthClass="max-w-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/[0.08] bg-[#19191d] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#e59b38]/15 border border-[#e59b38]/30 flex items-center justify-center text-[#e59b38] shrink-0">
            <ChefHat className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="mise-en-place-title" className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                Mise en Place y Prep de Cocina
              </h2>
              <span className="text-[10px] bg-[#e59b38]/20 text-[#e59b38] border border-[#e59b38]/30 px-2 py-0.5 rounded-full font-mono font-bold shrink-0">
                TURNO
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Insumos crudos calculados para surtir las porciones asignadas al turno
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar mise en place"
          className="w-11 h-11 sm:w-9 sm:h-9 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors shrink-0 touch-manipulation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar & Actions Bar */}
      <div className="px-4 sm:px-6 py-3 bg-[#111115] border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex-1 sm:max-w-xs min-w-0">
          <div className="flex justify-between gap-2 text-xs mb-1 font-semibold">
            <span className="text-neutral-300">Preparación de Cocina:</span>
            <span className="text-[#e59b38] font-mono tabular-nums">{progressPercent}% ({completedCount}/{prepItems.length})</span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#e59b38] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetChecklist}
            className="min-h-[44px] sm:min-h-[34px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs sm:text-[11px] text-neutral-300 hover:text-white transition-colors touch-manipulation"
            title="Desmarcar todos los insumos"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
          <button
            type="button"
            onClick={handleCopyShoppingList}
            className="min-h-[44px] sm:min-h-[34px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-[11px] font-semibold transition-all active:scale-95 touch-manipulation"
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
            type="button"
            onClick={handleShareWhatsApp}
            className="min-h-[44px] sm:min-h-[34px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-black text-xs sm:text-[11px] font-bold transition-all active:scale-95 shadow-sm touch-manipulation"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Scrollable Checklist */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-2.5">
        {prepItems.map((item) => {
          const isDone = Boolean(checkedItems[item.id]);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleCheck(item.id)}
              aria-pressed={isDone}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 touch-manipulation ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-neutral-400 opacity-80'
                  : 'bg-[#18181e] border-white/[0.06] hover:border-white/[0.15] text-white'
              }`}
            >
              <span className="mt-0.5 text-neutral-400 shrink-0" aria-hidden="true">
                {isDone ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-neutral-500" />
                )}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span
                    className={`text-sm font-semibold leading-snug ${
                      isDone ? 'line-through text-neutral-400' : 'text-white'
                    }`}
                  >
                    {item.name}
                  </span>
                  <span
                    className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-lg shrink-0 tabular-nums ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-[#e59b38]/15 text-[#e59b38] border border-[#e59b38]/30'
                    }`}
                  >
                    {item.quantityStr}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                  {item.notes}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer info note */}
      <div className="p-3.5 sm:p-4 border-t border-white/[0.08] bg-[#19191d] flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Scale className="w-3.5 h-3.5 text-[#e59b38] shrink-0" />
          <span>Basado en las porciones activas de stock de mostrador.</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-full bg-[#e59b38] hover:bg-[#d48b28] text-black font-extrabold text-xs uppercase tracking-wider transition-colors active:scale-95 touch-manipulation"
        >
          Listo / Cerrar
        </button>
      </div>
    </ModalShell>
  );
};
