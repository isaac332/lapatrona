'use client';

import React, { useState, useMemo } from 'react';
import { SaleRecord, ProductItem, ExpenseRecord } from '@/types/accounting';
import { calculateProfitInsightsAndForecasts } from '@/utils/accountingCalculations';
import {
  TrendingUp,
  Lightbulb,
  Target,
  DollarSign,
  Sparkles,
  ArrowUpRight,
  Layers,
  Users,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Sliders,
} from 'lucide-react';

interface ProfitInsightsAndForecastsProps {
  sales?: SaleRecord[];
  products?: ProductItem[];
  expenses?: ExpenseRecord[];
  onOpenPriceManager?: () => void;
  onOpenGastos?: () => void;
}

export const ProfitInsightsAndForecasts: React.FC<ProfitInsightsAndForecastsProps> = ({
  sales = [],
  products = [],
  expenses = [],
  onOpenPriceManager,
  onOpenGastos,
}) => {
  const [activeTab, setActiveTab] = useState<'anatomia' | 'insights' | 'pronosticos'>('anatomia');
  const [splitMode, setSplitMode] = useState<'capital' | 'equal'>('capital');
  const [targetMonthlyProfit, setTargetMonthlyProfit] = useState<number>(5000);

  const data = useMemo(
    () => calculateProfitInsightsAndForecasts(sales, products, expenses),
    [sales, products, expenses]
  );

  // Cálculos del Simulador Interactivo de Meta Mensual
  const simulator = useMemo(() => {
    const netPerUnitAfterReserve = Math.max(45, data.avgProfitPerUnit - 4.5);
    const requiredUnitsPerMonth = Math.ceil(targetMonthlyProfit / netPerUnitAfterReserve);
    const requiredUnitsPerWeek = Math.round((requiredUnitsPerMonth / 4) * 10) / 10;
    const requiredUnitsPerNight = Math.round((requiredUnitsPerMonth / 16) * 10) / 10; // 16 noches (Jue-Dom x 4 sem)

    // Equivalente si fueran puros Sándwiches c/ papas ($55.50 libres por combo con papas)
    const sandwichFriesEquivalentPerNight = Math.round((targetMonthlyProfit / 55.50 / 16) * 10) / 10;

    const projectedGrossRevenue = Math.round(requiredUnitsPerMonth * data.avgRevenuePerUnit);
    const projectedIngredientsBudget = Math.round(requiredUnitsPerMonth * data.avgCostPerUnit);
    // Estimación de paquetes de Sirloin SuKarne (cada paq de ~4.08kg rinde ~27 órdenes promedio ponderadas)
    const estimatedSukarnePackages = Math.max(1, Math.round((requiredUnitsPerMonth / 27) * 10) / 10);

    const monicaShare =
      splitMode === 'capital' ? Math.round(targetMonthlyProfit * 0.5227) : Math.round(targetMonthlyProfit * 0.5);
    const isaacShare =
      splitMode === 'capital' ? Math.round(targetMonthlyProfit * 0.4773) : Math.round(targetMonthlyProfit * 0.5);

    return {
      requiredUnitsPerMonth,
      requiredUnitsPerWeek,
      requiredUnitsPerNight,
      sandwichFriesEquivalentPerNight,
      projectedGrossRevenue,
      projectedIngredientsBudget,
      estimatedSukarnePackages,
      monicaShare,
      isaacShare,
    };
  }, [targetMonthlyProfit, data, splitMode]);

  const monicaPct = splitMode === 'capital' ? 52.27 : 50;
  const isaacPct = splitMode === 'capital' ? 47.73 : 50;

  const maxWeeklyRev = Math.max(...data.weeklyTrend.map((w) => w.revenue), 1800);

  return (
    <section className="rounded-2xl bg-[#141417] border border-emerald-500/25 p-3.5 sm:p-6 space-y-4 sm:space-y-6 shadow-xl">
      {/* Top Header & Navigation Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-amber-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                Inteligencia Financiera
              </span>
              <span className="text-[11px] text-neutral-400">
                Margen de Receta: <strong className="text-emerald-400">{data.recipeMarginPct}%</strong> • Ganancia Promedio:{' '}
                <strong className="text-[#e59b38]">+${data.avgProfitPerUnit.toFixed(2)}/pza</strong>
              </span>
            </div>
            <h2 className="font-serif text-lg sm:text-2xl font-bold text-white mt-0.5">
              Centro de Utilidad, Insights y Pronósticos
            </h2>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div
          role="tablist"
          aria-label="Vistas de rentabilidad"
          className="flex items-center gap-1.5 bg-[#1b1b20] p-1.5 rounded-xl border border-white/[0.08] overflow-x-auto no-scrollbar w-full lg:w-auto max-w-full"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'anatomia'}
            onClick={() => setActiveTab('anatomia')}
            className={`flex-none flex items-center gap-1.5 px-3.5 min-h-[44px] sm:min-h-[36px] rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'anatomia'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-neutral-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Anatomía de Utilidad</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'insights'}
            onClick={() => setActiveTab('insights')}
            className={`flex-none flex items-center gap-1.5 px-3.5 min-h-[44px] sm:min-h-[36px] rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'insights'
                ? 'bg-[#e59b38] text-black shadow-sm'
                : 'text-neutral-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Insights 80/20 ({data.strategicInsights.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pronosticos'}
            onClick={() => setActiveTab('pronosticos')}
            className={`flex-none flex items-center gap-1.5 px-3.5 min-h-[44px] sm:min-h-[36px] rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'pronosticos'
                ? 'bg-sky-400 text-black shadow-sm'
                : 'text-neutral-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Target className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Pronósticos y Simulador</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: ANATOMÍA DE LA UTILIDAD (RECETA VS FLUJO DE CAJA + PRODUCTOS)
         ===================================================================== */}
      {activeTab === 'anatomia' && (
        <div className="space-y-5 animate-fade-in">
          {/* 3-Card Dual Profitability Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Card 1: Utilidad Bruta por Receta */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 via-[#18181c] to-[#18181c] border border-emerald-500/35 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    1. Utilidad Devengada por Receta
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                    {data.recipeMarginPct}% Margen
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-400">
                    +${data.recipeGrossProfit.toFixed(2)}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">ganados en cocina</span>
                </div>
                <p className="text-[11px] text-neutral-300 mt-2 leading-relaxed">
                  De los <strong className="text-white">${data.grossRevenue.toFixed(2)}</strong> vendidos ({data.totalUnitsSold}{' '}
                  piezas), el costo exacto de la carne, queso, pan, papa y empaque que llevaron dentro fue de{' '}
                  <strong className="text-rose-300">${data.recipeCogs.toFixed(2)}</strong>.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Ganancia pura por pieza vendida:</span>
                <span className="font-mono font-bold text-emerald-300">+${data.avgProfitPerUnit.toFixed(2)} MXN</span>
              </div>
            </div>

            {/* Card 2: Utilidad Libre en Flujo de Caja */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#18181c] to-[#18181c] border border-amber-500/35 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    2. Utilidad Libre en Flujo de Caja
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                    Inversión Pagada
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#e59b38]">
                    +${data.cashFlowNetProfit.toFixed(2)}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">efectivo libre</span>
                </div>
                <p className="text-[11px] text-neutral-300 mt-2 leading-relaxed">
                  Descontando el 100% de la <strong className="text-white">Inversión Inicial ($2,856.50)</strong> más todos los
                  tickets de reabasto (<strong className="text-white">${(data.cashFlowExpenses - 2856.5).toFixed(2)}</strong>),
                  el negocio ya recuperó todo su capital y tiene saldo a favor.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Retorno sobre Inversión Inicial:</span>
                <span className="font-mono font-bold text-amber-300">100% Cubierta + 37.3% ROI</span>
              </div>
            </div>

            {/* Card 3: Capital Vivo en Inventario y Equipo */}
            <div className="rounded-2xl bg-gradient-to-br from-sky-500/15 via-[#18181c] to-[#18181c] border border-sky-500/35 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                    3. Capital Activo en Stock y Equipo
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold border border-sky-500/30">
                    Patrimonio en Cocina
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-serif text-2xl sm:text-3xl font-extrabold text-sky-400">
                    ${data.estimatedActiveInventoryAndEquipmentValue.toFixed(2)}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">en stock / equipo</span>
                </div>
                <p className="text-[11px] text-neutral-300 mt-2 leading-relaxed">
                  ¿Por qué la utilidad por receta es <strong className="text-white">${data.recipeGrossProfit.toFixed(0)}</strong> y
                  la de caja es <strong className="text-white">${data.cashFlowNetProfit.toFixed(0)}</strong>? Porque{' '}
                  <strong className="text-sky-300">${data.estimatedActiveInventoryAndEquipmentValue.toFixed(0)}</strong> siguen
                  vivos en utensilios ($589), charolas Economax, bolsas Dulcería, gas y carne en congelador.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Potencial de venta de ese stock:</span>
                <span className="font-mono font-bold text-sky-300">
                  ~${Math.round(data.estimatedActiveInventoryAndEquipmentValue * 2.2)} MXN
                </span>
              </div>
            </div>
          </div>

          {/* Product-by-Product Profitability Table */}
          <div className="rounded-2xl bg-[#18181c] border border-white/[0.08] overflow-hidden">
            <div className="p-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Rentabilidad y Aporte de Utilidad por Platillo</span>
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Ordenado por el dinero libre real que cada producto ha metido a la bolsa del negocio
                </p>
              </div>
              {onOpenPriceManager && (
                <button
                  type="button"
                  onClick={onOpenPriceManager}
                  className="text-xs font-semibold text-[#e59b38] hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Ver / Editar Recetas y Costos</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Card List (sm:hidden) */}
            <div className="sm:hidden divide-y divide-white/[0.06] p-3 space-y-3">
              {data.productProfitBreakdown.map((item) => {
                const isHighMargin = item.unitMarginPct >= 65;
                const isLowMargin = item.unitMarginPct < 36;
                return (
                  <div key={item.id} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="font-bold text-white text-xs truncate">{item.name}</span>
                        <span
                          className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full border ${
                            item.tier === 'Motor Principal'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : item.tier === 'Mina de Oro (%)'
                              ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                              : item.tier === 'Optimizar Margen'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {item.tier}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] shrink-0 font-mono ${
                          isHighMargin
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : isLowMargin
                            ? 'bg-rose-500/15 text-rose-300'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {item.unitMarginPct}% margen
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[10px]">
                      <div>
                        <span className="text-neutral-500 block">Precio</span>
                        <span className="font-mono text-white font-semibold">${item.avgSellingPrice.toFixed(0)}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Costo</span>
                        <span className="font-mono text-rose-300">-${item.unitCost.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Ganancia/Pza</span>
                        <span className="font-mono text-emerald-400 font-bold">+${item.unitProfit.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-neutral-400">
                        Vendidos: <strong className="text-white font-mono">{item.unitsSold} pzs</strong>
                      </span>
                      <div className="text-right">
                        <span className="text-neutral-400 mr-1.5">Utilidad Total:</span>
                        <span className="font-mono font-extrabold text-emerald-400">
                          +${item.totalProfitGenerated.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${Math.min(100, item.profitSharePct)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[9px] text-neutral-400 shrink-0">
                        {item.profitSharePct}% del total
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (hidden sm:block) */}
            <div
              tabIndex={0}
              role="region"
              aria-label="Desglose de rentabilidad por producto"
              className="hidden sm:block table-scroll-region"
            >
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[10px] uppercase tracking-wider text-neutral-400 bg-white/[0.02]">
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-3 text-right">Precio Prom.</th>
                    <th className="py-3 px-3 text-right">Costo Receta</th>
                    <th className="py-3 px-3 text-right">Utilidad / Pza</th>
                    <th className="py-3 px-3 text-right">Margen %</th>
                    <th className="py-3 px-3 text-right">Vendidos</th>
                    <th className="py-3 px-4 text-right">Utilidad Total Generada</th>
                    <th className="py-3 px-4 text-right">% del Total (Pareto)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {data.productProfitBreakdown.map((item) => {
                    const isHighMargin = item.unitMarginPct >= 65;
                    const isLowMargin = item.unitMarginPct < 36;
                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{item.name}</span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                item.tier === 'Motor Principal'
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : item.tier === 'Mina de Oro (%)'
                                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                  : item.tier === 'Optimizar Margen'
                                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              }`}
                            >
                              {item.tier}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-neutral-200">
                          ${item.avgSellingPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-rose-300">
                          -${item.unitCost.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                          +${item.unitProfit.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                              isHighMargin
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : isLowMargin
                                ? 'bg-rose-500/15 text-rose-300'
                                : 'bg-amber-500/15 text-amber-300'
                            }`}
                          >
                            {item.unitMarginPct}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-white">
                          {item.unitsSold}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-400">
                          +${item.totalProfitGenerated.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden hidden sm:block">
                              <div
                                className="h-full bg-emerald-400 rounded-full"
                                style={{ width: `${Math.min(100, item.profitSharePct)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] font-bold text-neutral-300 w-10 text-right">
                              {item.profitSharePct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Partner Profit Distribution Calculator (Mónica vs Isaac) */}
          <div className="rounded-2xl bg-[#18181c] border border-white/[0.08] p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#e59b38]" />
                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Simulador de Reparto de Utilidades (Mónica & Isaac)
                </h4>
              </div>
              <p className="text-[11px] text-neutral-400">
                Calcula cuánto corresponde a cada socio según el esquema de participación elegido:
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 bg-[#121215] p-1 rounded-xl border border-white/[0.08] text-xs w-full lg:w-auto">
              <button
                type="button"
                onClick={() => setSplitMode('capital')}
                className={`px-3 min-h-[44px] sm:min-h-[36px] rounded-lg font-semibold transition-all text-center ${
                  splitMode === 'capital' ? 'bg-[#e59b38] text-black font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Por Capital Aportado (52.3% / 47.7%)
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('equal')}
                className={`px-3 min-h-[44px] sm:min-h-[36px] rounded-lg font-semibold transition-all text-center ${
                  splitMode === 'equal' ? 'bg-[#e59b38] text-black font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Mitad y Mitad (50% / 50%)
              </button>
            </div>

            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 w-full lg:w-auto">
              <div className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25">
                <span className="text-[10px] uppercase font-bold text-rose-300 block">
                  Mónica ({monicaPct}%)
                </span>
                <span className="font-mono text-sm sm:text-base font-extrabold text-white block">
                  Efectivo: +${((data.cashFlowNetProfit * monicaPct) / 100).toFixed(2)}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Por Receta: +${((data.recipeGrossProfit * monicaPct) / 100).toFixed(2)}
                </span>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25">
                <span className="text-[10px] uppercase font-bold text-sky-300 block">
                  Isaac ({isaacPct}%)
                </span>
                <span className="font-mono text-sm sm:text-base font-extrabold text-white block">
                  Efectivo: +${((data.cashFlowNetProfit * isaacPct) / 100).toFixed(2)}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Por Receta: +${((data.recipeGrossProfit * isaacPct) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: INSIGHTS ESTRATÉGICOS (HALLAZGOS 80/20 Y INGENIERÍA DE MENÚ)
         ===================================================================== */}
      {activeTab === 'insights' && (
        <div className="space-y-4 animate-fade-in">
          {/* Rough Estimates Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="text-amber-200">
                <strong>Estimaciones Preliminares:</strong> Sándwich (~$95 c/ empaque y extras) • Papas (&lt;$10 c/ empaque y extras) • Champurro (~$10) • Quesadilla (&lt;$30 producida).
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 shrink-0 font-mono hidden sm:inline">
              Costos aproximados base
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.strategicInsights.map((insight) => {
              const toneStyles = {
                emerald: {
                  border: 'border-emerald-500/30',
                  bg: 'from-emerald-500/10 to-[#18181c]',
                  badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                  metric: 'text-emerald-400',
                  icon: CheckCircle2,
                },
                amber: {
                  border: 'border-amber-500/30',
                  bg: 'from-amber-500/10 to-[#18181c]',
                  badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                  metric: 'text-[#e59b38]',
                  icon: Flame,
                },
                sky: {
                  border: 'border-sky-500/30',
                  bg: 'from-sky-500/10 to-[#18181c]',
                  badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
                  metric: 'text-sky-400',
                  icon: Sparkles,
                },
                rose: {
                  border: 'border-rose-500/30',
                  bg: 'from-rose-500/10 to-[#18181c]',
                  badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                  metric: 'text-rose-400',
                  icon: AlertTriangle,
                },
              }[insight.tone];

              const IconComponent = toneStyles.icon;

              return (
                <div
                  key={insight.id}
                  className={`rounded-2xl bg-gradient-to-br ${toneStyles.bg} border ${toneStyles.border} p-4 sm:p-5 flex flex-col justify-between space-y-3`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${toneStyles.badge}`}>
                        {insight.badge}
                      </span>
                      <span className={`font-mono text-xs sm:text-sm font-extrabold ${toneStyles.metric}`}>
                        {insight.metricValue}
                      </span>
                    </div>

                    <h3 className="font-serif text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <IconComponent className={`w-4 h-4 shrink-0 ${toneStyles.metric}`} />
                      <span>{insight.title}</span>
                    </h3>

                    <p className="text-xs text-neutral-300 leading-relaxed">{insight.description}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/35 border border-white/[0.06] text-[11px] text-neutral-200">
                    <span className="font-bold text-[#e59b38] uppercase tracking-wider text-[10px] block mb-0.5">
                      Recomendación Accionable:
                    </span>
                    {insight.recommendation}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparativa Visual del "Efecto Combo con Papas" */}
          <div className="rounded-2xl bg-[#18181c] border border-white/[0.08] p-4 sm:p-5">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#e59b38]" />
              <span>Radiografía del Upsell: ¿Por qué siempre conviene vender con papas?</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Costo de agregar papas</span>
                <span className="font-mono text-lg font-bold text-rose-300 mt-0.5 block">&lt; $10.00 MXN</span>
                <span className="text-[11px] text-neutral-400">
                  Aproximadamente ~$9.50 contando papa Russet, aceite, extras y empaque.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <span className="text-[10px] text-emerald-300 uppercase font-bold block">
                  En Sándwich ($130 ➔ $160)
                </span>
                <span className="font-mono text-lg font-extrabold text-emerald-400 mt-0.5 block">
                  +$20.50 ganancia extra
                </span>
                <span className="text-[11px] text-neutral-300">
                  La utilidad sube de <strong>$35.00</strong> a <strong>$55.50</strong> por orden (+58.6% más dinero libre por cliente).
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <span className="text-[10px] text-amber-300 uppercase font-bold block">
                  En Quesadilla ($50 ➔ $70)
                </span>
                <span className="font-mono text-lg font-extrabold text-[#e59b38] mt-0.5 block">
                  +$10.50 ganancia extra
                </span>
                <span className="text-[11px] text-neutral-300">
                  La utilidad sube de <strong>$22.00</strong> a <strong>$32.50</strong> por orden (+47.7% más ganancia por cliente).
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: PRONÓSTICOS Y SIMULADOR INTERACTIVO DE METAS (FORECASTS)
         ===================================================================== */}
      {activeTab === 'pronosticos' && (
        <div className="space-y-5 animate-fade-in">
          {/* 1. Weekly Historical + Forecast Trend Bar Chart */}
          <div className="rounded-2xl bg-[#18181c] border border-white/[0.08] p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  <span>Trayectoria Semanal Real (Sem 1–5) + Proyección (Sem 6–8)</span>
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Comparativa de Venta Bruta vs. Utilidad Neta de Receta por fin de semana operado
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" /> Utilidad Receta Real
                </span>
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 inline-block" /> Proyección Futura
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2">
              {data.weeklyTrend.map((w) => {
                const heightPct = Math.max(18, Math.round((w.revenue / maxWeeklyRev) * 100));
                const profitPct = w.revenue > 0 ? Math.round((w.recipeProfit / w.revenue) * 100) : 64;
                return (
                  <div
                    key={w.weekLabel}
                    className={`p-3 rounded-xl border flex flex-col justify-between ${
                      w.isProjected
                        ? 'bg-sky-500/[0.06] border-sky-500/30 border-dashed'
                        : 'bg-white/[0.02] border-white/[0.06]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            w.isProjected ? 'text-sky-300' : 'text-neutral-300'
                          }`}
                        >
                          {w.weekLabel}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-400">{w.units} pzas</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 block">{w.dateRange}</span>
                    </div>

                    {/* Visual Bar */}
                    <div className="my-3 h-24 bg-black/40 rounded-lg p-1.5 flex items-end">
                      <div
                        className={`w-full rounded-md transition-all flex flex-col justify-end overflow-hidden ${
                          w.isProjected ? 'bg-sky-500/30 border border-sky-400/50' : 'bg-white/15'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      >
                        <div
                          className={`w-full ${w.isProjected ? 'bg-sky-400' : 'bg-emerald-400'}`}
                          style={{ height: `${profitPct}%` }}
                          title={`Utilidad: $${w.recipeProfit.toFixed(0)}`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-neutral-400 flex justify-between">
                        <span>Venta:</span>
                        <span className="font-mono text-white font-semibold">${w.revenue.toFixed(0)}</span>
                      </div>
                      <div className="text-[11px] flex justify-between font-bold mt-0.5">
                        <span className={w.isProjected ? 'text-sky-300' : 'text-emerald-300'}>Utilidad:</span>
                        <span className={`font-mono ${w.isProjected ? 'text-sky-400' : 'text-emerald-400'}`}>
                          +${w.recipeProfit.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Three Monthly Forecast Scenarios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.forecastScenarios.map((sc) => {
              const isHighlight = sc.id === 'moderado';
              return (
                <div
                  key={sc.id}
                  className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between border transition-all ${
                    isHighlight
                      ? 'bg-gradient-to-br from-sky-500/15 via-[#18181c] to-[#18181c] border-sky-500/40 shadow-lg'
                      : 'bg-[#18181c] border-white/[0.08]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                          isHighlight
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/35'
                            : 'bg-white/[0.05] text-neutral-300 border-white/10'
                        }`}
                      >
                        {sc.badge}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        ~{sc.unitsPerWeekendNight} pzas / noche (Jue-Dom)
                      </span>
                    </div>

                    <h4 className="font-serif text-base sm:text-lg font-bold text-white">{sc.name}</h4>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">{sc.subtitle}</p>

                    <div className="pt-2">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">
                        Utilidad Neta Libre Proyectada (1 Mes / 4 Semanas):
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-400">
                          +${sc.monthlyNetProfit.toLocaleString('es-MX')}
                        </span>
                        <span className="text-xs text-neutral-400 font-mono">/ mes</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-1.5 text-xs">
                    <div className="flex justify-between text-neutral-300">
                      <span>Volumen mensual estimado:</span>
                      <span className="font-mono font-bold text-white">{sc.monthlyUnits} piezas</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Venta bruta mensual:</span>
                      <span className="font-mono font-semibold text-white">
                        ${sc.monthlyRevenue.toLocaleString('es-MX')}
                      </span>
                    </div>
                    <div className="flex justify-between text-rose-300/90">
                      <span>Costo receta + reserva gas:</span>
                      <span className="font-mono">
                        -${(sc.monthlyRecipeCost + sc.monthlyRestockReserve).toLocaleString('es-MX')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sky-300 pt-1 border-t border-white/[0.04]">
                      <span>Proyección Trimestral (3 meses):</span>
                      <span className="font-mono font-bold">
                        +${sc.quarterlyNetProfit.toLocaleString('es-MX')}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-neutral-400 pt-1">
                      <span>Mónica: +${sc.monicaMonthlyShare.toLocaleString('es-MX')}/mes</span>
                      <span>Isaac: +${sc.isaacMonthlyShare.toLocaleString('es-MX')}/mes</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Interactive Monthly Profit Goal Simulator */}
          <div className="rounded-2xl bg-gradient-to-r from-[#1a1c23] via-[#18181c] to-[#1a201d] border border-[#e59b38]/35 p-4 sm:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#e59b38]" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#e59b38] font-bold">
                    Simulador Interactivo de Metas
                  </span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5">
                  ¿Cuánto dinero libre quieren ganar al mes?
                </h3>
                <p className="text-xs text-neutral-400">
                  Elige una meta de utilidad neta mensual y descubre cuántas órdenes por noche (Jueves a Domingo) necesitas vender:
                </p>
              </div>

              {/* Quick Goal Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[3000, 5000, 7500, 10000, 15000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTargetMonthlyProfit(preset)}
                    className={`px-3 min-h-[44px] sm:min-h-[36px] rounded-lg font-mono text-xs font-bold transition-all border ${
                      targetMonthlyProfit === preset
                        ? 'bg-[#e59b38] text-black border-[#e59b38] shadow-md'
                        : 'bg-white/[0.04] text-neutral-300 border-white/10 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    ${preset.toLocaleString('es-MX')}
                  </button>
                ))}
              </div>
            </div>

            {/* Range Slider */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs font-mono">
                <span className="text-neutral-400 order-2 sm:order-1">Meta mínima: $2,000/mes</span>
                <span className="text-[#e59b38] font-extrabold text-sm order-1 sm:order-2">
                  Meta seleccionada: ${targetMonthlyProfit.toLocaleString('es-MX')} MXN libres / mes
                </span>
                <span className="text-neutral-400 order-3">Meta alta: $20,000/mes</span>
              </div>
              <input
                type="range"
                min={2000}
                max={20000}
                step={500}
                value={targetMonthlyProfit}
                onChange={(e) => setTargetMonthlyProfit(Number(e.target.value))}
                aria-label="Meta de ganancia mensual deseada en pesos"
                className="w-full accent-[#e59b38] cursor-pointer min-h-[44px] sm:min-h-[28px] rounded-lg"
              />
            </div>

            {/* Calculated Target Requirements Grid */}
            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-black/35 border border-white/[0.08]">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Meta por Noche (Jue–Dom)
                </span>
                <span className="font-serif text-xl sm:text-2xl font-extrabold text-[#e59b38] mt-1 block">
                  {simulator.requiredUnitsPerNight} piezas / noche
                </span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  Ó solo <strong className="text-white">{simulator.sandwichFriesEquivalentPerNight} Sándwiches c/ papas</strong> por noche
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/35 border border-white/[0.08]">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Volumen Total Requerido
                </span>
                <span className="font-serif text-xl sm:text-2xl font-extrabold text-white mt-1 block">
                  {simulator.requiredUnitsPerMonth} pzas / mes
                </span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  ~{simulator.requiredUnitsPerWeek} piezas por fin de semana
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/35 border border-white/[0.08]">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Insumos y Carne Requerida
                </span>
                <span className="font-serif text-xl sm:text-2xl font-extrabold text-rose-300 mt-1 block">
                  ${simulator.projectedIngredientsBudget.toLocaleString('es-MX')} / mes
                </span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  ~{simulator.estimatedSukarnePackages} paq. de Sirloin SuKarne (4kg)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                  Utilidad Libre por Socio / Mes
                </span>
                <div className="mt-1 space-y-0.5 font-mono text-xs">
                  <div className="flex justify-between text-rose-200 font-bold">
                    <span>Mónica ({monicaPct}%):</span>
                    <span>+${simulator.monicaShare.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between text-sky-200 font-bold">
                    <span>Isaac ({isaacPct}%):</span>
                    <span>+${simulator.isaacShare.toLocaleString('es-MX')}</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-300/80 block mt-1">
                  Venta bruta: ${simulator.projectedGrossRevenue.toLocaleString('es-MX')}/mes
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
