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

  const quickGoals = [5000, 8000, 10000, 15000, 20000];

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
      {/* Background glow if goal reached */}
      {isGoalReached && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#e59b38]/10 via-amber-500/10 to-transparent pointer-events-none" />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Title & Goal Status */}
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
                Meta de Venta del Turno
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

        {/* Goal Edit Button / Amount */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {isEditing ? (
            <div className="flex items-center gap-1 bg-[#1c1c22] border border-[#e59b38] rounded-xl px-2 py-1 shadow-md">
              <span className="text-xs text-[#e59b38] font-mono font-bold">$</span>
              <input
                type="number"
                min="100"
                step="500"
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                className="w-20 bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSave}
                className="w-5 h-5 rounded bg-[#e59b38] text-black flex items-center justify-center hover:bg-[#d48b28]"
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-5 h-5 rounded bg-white/10 text-neutral-400 flex items-center justify-center hover:bg-white/20"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempGoal(goalAmount.toString());
                setIsEditing(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono font-bold text-neutral-300 hover:text-white transition-all active:scale-95"
              title="Ajustar meta de venta del día"
            >
              <span>Meta: ${goalAmount.toLocaleString('es-MX')} MXN</span>
              <Pencil className="w-3 h-3 text-[#e59b38]" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
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

      {/* Quick Goal Preset Buttons when editing */}
      {isEditing && (
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono mr-1">
            Metas rápidas:
          </span>
          {quickGoals.map((q) => (
            <button
              key={q}
              onClick={() => {
                onUpdateGoal(q);
                setIsEditing(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-[#e59b38]/20 hover:text-[#e59b38] border border-white/[0.08] text-[11px] font-mono text-neutral-300 transition-colors"
            >
              ${q.toLocaleString('es-MX')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
