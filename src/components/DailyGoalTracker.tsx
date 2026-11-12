'use client';

import React, { useState } from 'react';
import { Target, Trophy, Sparkles, Pencil, Check, X } from 'lucide-react';

interface DailyGoalTrackerProps {
  currentRevenue: number;
  goalAmount: number;
  onUpdateGoal: (newGoal: number) => void;
}

export const DailyGoalTracker: React.FC<DailyGoalTrackerProps> = ({
  currentRevenue,
  goalAmount,
  onUpdateGoal,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(goalAmount.toString());

  const progressPercent = goalAmount > 0 ? Math.min(100, Math.round((currentRevenue / goalAmount) * 100)) : 0;
  const isGoalReached = goalAmount > 0 && currentRevenue >= goalAmount;
  const difference = currentRevenue - goalAmount;

  const quickGoals = [1000, 1500, 2000, 3000, 5000];

  const handleSave = () => {
    const parsed = parseFloat(tempGoal);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateGoal(parsed);
    } else {
      setTempGoal(goalAmount.toString());
    }
    setIsEditing(false);
  };

  return (
    <div className="rounded-2xl bg-[#141417] border border-white/[0.08] p-3.5 sm:p-5 relative overflow-hidden shadow-lg transition-all">
      {isGoalReached && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#e59b38]/10 via-amber-500/10 to-transparent pointer-events-none" />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
              isGoalReached
                ? 'bg-[#e59b38] border-[#e59b38] text-black shadow-md shadow-[#e59b38]/30 animate-bounce'
                : 'bg-white/[0.04] border-white/[0.08] text-[#e59b38]'
            }`}
          >
            {isGoalReached ? <Trophy className="w-4 h-4 stroke-[2.5]" /> : <Target className="w-4 h-4" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                Meta de Venta del Día
              </span>

              {isGoalReached ? (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-[#e59b38]/20 text-[#e59b38] px-2 py-0.5 rounded-full border border-[#e59b38]/40 animate-pulse">
                  <Sparkles className="w-3 h-3" /> ¡Meta Cumplida!
                </span>
              ) : (
                <span className="text-[10px] font-mono font-semibold text-neutral-400">
                  {progressPercent}%
                </span>
              )}
            </div>

            <p className="text-[11px] text-neutral-400">
              {isGoalReached ? (
                <span className="text-[#e59b38] font-semibold">
                  Has superado el objetivo del día por +${difference.toFixed(2)} MXN
                </span>
              ) : (
                <span>
                  Faltan <strong className="text-white">${Math.abs(difference).toFixed(2)} MXN</strong> para el objetivo
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-center justify-end">
          {isEditing ? (
            <div className="flex items-center gap-1.5 bg-[#1c1c22] border border-[#e59b38] rounded-xl pl-3 pr-1.5 py-1 shadow-md w-full sm:w-auto justify-between">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="text-sm text-[#e59b38] font-mono font-bold">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="100"
                  step="100"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                  aria-label="Nueva meta de venta diaria en pesos"
                  className="w-full sm:w-24 bg-transparent text-base sm:text-xs font-mono font-bold text-white focus:outline-none min-h-[36px]"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleSave}
                  aria-label="Guardar meta diaria"
                  className="min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px] rounded-lg bg-[#e59b38] text-black flex items-center justify-center hover:bg-[#d48b28] active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  aria-label="Cancelar edición de meta"
                  className="min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px] rounded-lg bg-white/10 text-neutral-300 flex items-center justify-center hover:bg-white/20 active:scale-95"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTempGoal(goalAmount.toString());
                setIsEditing(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3.5 min-h-[44px] rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono font-bold text-neutral-300 hover:text-white transition-all active:scale-95 w-full sm:w-auto"
              title="Ajustar meta de venta del día"
            >
              <span>Meta: ${goalAmount.toLocaleString('es-MX')} MXN</span>
              <Pencil className="w-3.5 h-3.5 text-[#e59b38] shrink-0" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 relative w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isGoalReached
              ? 'bg-gradient-to-r from-amber-500 via-[#e59b38] to-yellow-300 shadow-sm'
              : 'bg-gradient-to-r from-[#e59b38]/70 to-[#e59b38]'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {isEditing && (
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono mr-1">
            Metas rápidas:
          </span>
          {quickGoals.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                onUpdateGoal(q);
                setIsEditing(false);
              }}
              className="px-3 min-h-[44px] sm:min-h-[34px] rounded-lg bg-white/[0.04] hover:bg-[#e59b38]/20 hover:text-[#e59b38] border border-white/[0.08] text-xs font-mono text-neutral-300 transition-colors active:scale-95"
            >
              ${q.toLocaleString('es-MX')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};