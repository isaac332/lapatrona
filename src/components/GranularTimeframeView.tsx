'use client';

import React from 'react';
import {
  TimeframeFilter,
  SaleRecord,
  HourlyBlock,
  DailyStat,
  MonthlyWeekStat,
  ProductPerformance,
} from '@/types/accounting';
import {
  Clock,
  Calendar,
  TrendingUp,
  Award,
  BarChart3,
  Flame,
  Zap,
  DollarSign,
} from 'lucide-react';

interface GranularTimeframeViewProps {
  timeframe: TimeframeFilter;
  onTimeframeChange: (tf: TimeframeFilter) => void;
  sales: SaleRecord[];
  hourlyBlocks: HourlyBlock[];
  dailyStats: DailyStat[];
  monthlyWeekStats: MonthlyWeekStat[];
  productRanking: ProductPerformance[];
}

export const GranularTimeframeView: React.FC<GranularTimeframeViewProps> = ({
  timeframe,
  onTimeframeChange,
  sales,
  hourlyBlocks,
  dailyStats,
  monthlyWeekStats,
  productRanking,
}) => {
  const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);

  const tabs: { id: TimeframeFilter; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'today', label: 'Día (Hoy)', icon: Clock },
    { id: 'week', label: 'Esta Semana', icon: Calendar },
    { id: 'month', label: 'Este Mes', icon: TrendingUp },
    { id: 'all', label: 'Histórico Total', icon: BarChart3 },
  ];

  return (
    <div className="rounded-2xl bg-[#141417] border border-white/[0.08] p-6 space-y-6 animate-fade-in shadow-xl">
      {/* Top Header with Distinct Granular View Selector Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e59b38]/10 border border-[#e59b38]/20 flex items-center justify-center shrink-0">
            {timeframe === 'today' && <Clock className="w-5 h-5 text-[#e59b38]" />}
            {timeframe === 'week' && <Calendar className="w-5 h-5 text-[#e59b38]" />}
            {timeframe === 'month' && <TrendingUp className="w-5 h-5 text-[#e59b38]" />}
            {timeframe === 'all' && <BarChart3 className="w-5 h-5 text-[#e59b38]" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#e59b38]">
                {timeframe === 'today' && 'Vista Granular Diaria'}
                {timeframe === 'week' && 'Vista Granular Semanal'}
                {timeframe === 'month' && 'Vista Granular Mensual'}
                {timeframe === 'all' && 'Vista Granular Histórica'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white mt-0.5">
              {timeframe === 'today' && 'Ritmo de Servicio y Turnos de Hoy'}
              {timeframe === 'week' && 'Rendimiento Diario de la Semana (7 Días)'}
              {timeframe === 'month' && 'Evolución y Ranking de Productos del Mes'}
              {timeframe === 'all' && 'Historial y Registro General Acumulado'}
            </h3>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#19191d] p-1.5 rounded-xl border border-white/[0.06] overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = timeframe === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTimeframeChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-[#e59b38] text-black shadow-md font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-[#e59b38]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. VISTA DIARIA (HOY) */}
      {timeframe === 'today' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-black/30 p-3 rounded-xl border border-white/[0.04]">
            <div className="flex items-center gap-2 text-neutral-300">
              <span className="text-neutral-400">Total Hoy:</span>
              <strong className="text-white font-mono text-sm">{totalUnits} piezas</strong>
              <span className="text-neutral-500">•</span>
              <strong className="text-[#e59b38] font-mono text-sm">${totalRevenue.toFixed(2)}</strong>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-black/50 border border-white/[0.06] px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#e59b38]" />
                <span className="text-neutral-400">Velocidad:</span>
                <strong className="text-white font-mono">
                  {hourlyBlocks.filter((b) => b.count > 0).length > 0
                    ? (totalUnits / (hourlyBlocks.filter((b) => b.count > 0).length * 3)).toFixed(1)
                    : '0'}{' '}
                  u/hora
                </strong>
              </div>
              <div className="bg-black/50 border border-white/[0.06] px-3 py-1.5 rounded-lg flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-neutral-400">Ticket Promedio:</span>
                <strong className="text-emerald-400 font-mono">
                  ${sales.length > 0 ? (totalRevenue / sales.length).toFixed(2) : '0.00'}
                </strong>
              </div>
            </div>
          </div>

          {/* 4 Shift Blocks */}
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold flex items-center justify-between">
              <span>Distribución por Franja Horaria del Turno</span>
              <span className="text-[11px] text-neutral-500 font-normal">
                Servicio continuo de 11:00 a 23:59 hrs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {hourlyBlocks.map((block) => (
                <div
                  key={block.id}
                  className="p-4 rounded-xl bg-black/40 border border-white/[0.05] hover:border-white/[0.1] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#f5f0eb]">{block.label}</span>
                      <span className="text-[10px] font-mono text-[#e59b38] bg-[#e59b38]/10 px-2 py-0.5 rounded-full border border-[#e59b38]/20 font-bold">
                        {block.percentage}%
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-neutral-400 mt-1">
                      {block.timeRange}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.04]">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-serif text-2xl font-extrabold text-white">
                          {block.count}
                        </span>
                        <span className="text-[11px] text-neutral-500 font-mono">piezas</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-neutral-300">
                        ${block.revenue.toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-2 w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#e59b38] to-amber-300 rounded-full transition-all duration-500"
                        style={{ width: `${block.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. VISTA SEMANAL (ESTA SEMANA) */}
      {timeframe === 'week' && (
        <div className="space-y-6">
          {(() => {
            const peakDay = dailyStats.find((d) => d.isPeak);
            const avgDailyUnits = dailyStats.length > 0 ? (totalUnits / 7).toFixed(1) : '0';
            const avgDailyRevenue = dailyStats.length > 0 ? (totalRevenue / 7).toFixed(2) : '0.00';
            const maxDayCount = Math.max(...dailyStats.map((d) => d.count), 1);

            return (
              <>
                {/* Quick Metrics Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-black/30 p-3 rounded-xl border border-white/[0.04]">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <span className="text-neutral-400">Total Semana:</span>
                    <strong className="text-white font-mono text-sm">{totalUnits} piezas</strong>
                    <span className="text-neutral-500">•</span>
                    <strong className="text-[#e59b38] font-mono text-sm">${totalRevenue.toFixed(2)}</strong>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {peakDay && peakDay.count > 0 && (
                      <div className="bg-[#e59b38]/15 border border-[#e59b38]/30 px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-[#e59b38]">
                        <Flame className="w-3.5 h-3.5" />
                        <span className="font-semibold">Día Más Fuerte:</span>
                        <span className="font-bold text-white">{peakDay.dayName} ({peakDay.count} u)</span>
                      </div>
                    )}
                    <div className="bg-black/50 border border-white/[0.06] px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-neutral-300">
                      <span className="text-neutral-400">Promedio Diario:</span>
                      <strong className="text-white font-mono">{avgDailyUnits} u/día</strong>
                      <span className="text-neutral-500">(${avgDailyRevenue})</span>
                    </div>
                  </div>
                </div>

                {/* 7-Day Visualizer Grid */}
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold flex items-center justify-between">
                    <span>Volumen de Ventas por Día (Últimos 7 Días)</span>
                    <span className="text-[11px] text-neutral-500">Orden cronológico</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {dailyStats.map((day) => {
                      const heightPct = Math.round((day.count / maxDayCount) * 100);
                      return (
                        <div
                          key={day.dateStr}
                          className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                            day.isPeak && day.count > 0
                              ? 'bg-[#e59b38]/10 border-[#e59b38]/40 ring-1 ring-[#e59b38]/30 shadow-md'
                              : 'bg-black/40 border-white/[0.05] hover:border-white/[0.1]'
                          }`}
                        >
                          <div className="text-center pb-2 border-b border-white/[0.04]">
                            <div className="text-xs font-semibold text-white truncate">
                              {day.dayName}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                              {day.formattedDate}
                            </div>
                          </div>

                          {/* Volume Visual Bar */}
                          <div className="my-3 h-24 flex items-end justify-center">
                            <div className="w-7 bg-neutral-800 rounded-t-md overflow-hidden flex items-end h-full">
                              <div
                                className={`w-full rounded-t-md transition-all duration-700 ${
                                  day.isPeak && day.count > 0
                                    ? 'bg-gradient-to-t from-[#e59b38] to-amber-300'
                                    : 'bg-neutral-600'
                                }`}
                                style={{ height: `${Math.max(heightPct, 6)}%` }}
                              />
                            </div>
                          </div>

                          <div className="text-center pt-2 border-t border-white/[0.04]">
                            <div className="font-serif text-lg font-bold text-white">
                              {day.count}
                            </div>
                            <div className="text-[11px] font-mono text-[#e59b38] font-semibold mt-0.5">
                              ${day.revenue.toFixed(0)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* 3. VISTA MENSUAL (ESTE MES) */}
      {timeframe === 'month' && (
        <div className="space-y-6">
          {(() => {
            const topRevenueProduct = [...productRanking].sort((a, b) => b.revenue - a.revenue)[0];
            const topUnitsProduct = productRanking[0];

            return (
              <>
                {/* Quick Metrics Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-black/30 p-3 rounded-xl border border-white/[0.04]">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <span className="text-neutral-400">Total Mes:</span>
                    <strong className="text-white font-mono text-sm">{totalUnits} piezas</strong>
                    <span className="text-neutral-500">•</span>
                    <strong className="text-[#e59b38] font-mono text-sm">${totalRevenue.toFixed(2)}</strong>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {topUnitsProduct && topUnitsProduct.units > 0 && (
                      <div className="bg-black/50 border border-white/[0.06] px-3.5 py-1.5 rounded-lg flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-[#e59b38]" />
                        <span className="text-neutral-400">Líder en Unidades:</span>
                        <strong className="text-white">
                          {topUnitsProduct.product.name} ({topUnitsProduct.units} u)
                        </strong>
                      </div>
                    )}
                    {topRevenueProduct && topRevenueProduct.revenue > 0 && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-emerald-300">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Mayor Ingreso:</span>
                        <strong className="text-white font-mono">
                          ${topRevenueProduct.revenue.toFixed(2)} ({topRevenueProduct.product.name})
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Monthly Weeks Breakdown */}
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold flex items-center justify-between">
                    <span>Evolución por Semanas del Mes en Curso</span>
                    <span className="text-[11px] text-neutral-500">Distribución de 4 semanas</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {monthlyWeekStats.map((week) => (
                      <div
                        key={week.id}
                        className="p-4 rounded-xl bg-black/40 border border-white/[0.05] hover:border-white/[0.1] transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">{week.label}</span>
                            <span className="text-[11px] font-mono text-[#e59b38] bg-[#e59b38]/10 px-2 py-0.5 rounded-full border border-[#e59b38]/20 font-bold">
                              {week.percentage}%
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400 mt-1">{week.dateRange}</div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/[0.04]">
                          <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-serif text-2xl font-bold text-white">
                                {week.count}
                              </span>
                              <span className="text-[11px] text-neutral-500 font-mono">unidades</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              ${week.revenue.toFixed(2)}
                            </span>
                          </div>

                          <div className="mt-2 w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#e59b38] to-emerald-400 rounded-full transition-all duration-500"
                              style={{ width: `${week.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product Ranking Table */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold flex items-center justify-between">
                    <span>Ranking y Desempeño por Producto en el Mes</span>
                    <span className="text-[11px] text-neutral-500 font-normal">
                      Ordenado de mayor a menor volumen de venta
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-black/30">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-neutral-400 uppercase tracking-wider text-[10px] bg-white/[0.02]">
                          <th className="py-3 px-3.5">#</th>
                          <th className="py-3 px-3.5">Producto / Variante</th>
                          <th className="py-3 px-3.5 text-right">Precio Unitario</th>
                          <th className="py-3 px-3.5 text-right">Unidades Vendidas</th>
                          <th className="py-3 px-3.5 text-right">Venta Bruta</th>
                          <th className="py-3 px-3.5 text-right">% de Venta Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {productRanking.map((item, index) => (
                          <tr
                            key={item.product.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-3 px-3.5 font-mono font-bold text-neutral-400">
                              {item.units > 0 && index === 0 ? '👑 #1' : `#${index + 1}`}
                            </td>
                            <td className="py-3 px-3.5">
                              <div className="font-semibold text-white">{item.product.name}</div>
                              <div className="text-[11px] text-[#e59b38]">{item.product.variantLabel}</div>
                            </td>
                            <td className="py-3 px-3.5 text-right font-mono text-neutral-300">
                              ${item.product.defaultPrice.toFixed(2)}
                            </td>
                            <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                              {item.units}
                            </td>
                            <td className="py-3 px-3.5 text-right font-mono font-bold text-[#e59b38]">
                              ${item.revenue.toFixed(2)}
                            </td>
                            <td className="py-3 px-3.5 text-right font-mono text-neutral-300">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                <span>{item.percentageOfRevenue}%</span>
                                <div className="w-12 h-1.5 bg-neutral-800 rounded-full overflow-hidden inline-block">
                                  <div
                                    className="h-full bg-[#e59b38] rounded-full"
                                    style={{ width: `${item.percentageOfRevenue}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* 4. VISTA HISTÓRICO TOTAL (ALL) */}
      {timeframe === 'all' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05] grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                Transacciones Auditadas
              </div>
              <div className="font-serif text-3xl font-bold text-white mt-1">
                {sales.length}
              </div>
            </div>
            <div className="border-y sm:border-y-0 sm:border-x border-white/[0.06] py-2 sm:py-0">
              <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                Unidades Totales Acumuladas
              </div>
              <div className="font-serif text-3xl font-bold text-[#e59b38] mt-1">
                {totalUnits}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                Venta Bruta Histórica
              </div>
              <div className="font-serif text-3xl font-bold text-emerald-400 mt-1">
                ${totalRevenue.toFixed(2)}
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/[0.04]">
            Esta vista histórica consolida todas las ventas registradas en el sistema local desde el último corte. Puedes consultar el libro de registro detallado, exportar a CSV o reiniciar los contadores a cero en cualquier momento con el botón <strong className="text-red-400 font-medium">Poner en Ceros</strong>.
          </p>
        </div>
      )}
    </div>
  );
};
