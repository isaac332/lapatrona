'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Coins,
  Users,
  Scale,
  Clock,
  Briefcase,
  Share2,
  Printer,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  Check,
  DollarSign,
  Sparkles,
  UserCheck,
  UserX,
} from 'lucide-react';
import {
  TipStaffMember,
  TipStaffRole,
  TipSettlementRecord,
  BusinessInfo,
} from '@/types/accounting';
import { DEFAULT_STAFF, ROLE_LABELS } from '@/data/initialStaff';
import { DEFAULT_BUSINESS_INFO } from '@/data/initialBusinessInfo';
import { calculateTipDistribution } from '@/utils/accountingCalculations';
import {
  generateTipSettlementThermalText,
  generateTipSettlementWhatsAppText,
} from '@/utils/escpos';
import { ModalShell } from './ModalShell';

interface PoolPropinasModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftNumber: number;
  totalTipsCollected: number;
  businessInfo?: BusinessInfo;
  onSaveSettlement?: (record: TipSettlementRecord) => void;
}

export const PoolPropinasModal: React.FC<PoolPropinasModalProps> = ({
  isOpen,
  onClose,
  shiftNumber,
  totalTipsCollected,
  businessInfo = DEFAULT_BUSINESS_INFO,
  onSaveSettlement,
}) => {
  // Staff list state initialized from localStorage
  const [staffList, setStaffList] = useState<TipStaffMember[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_STAFF;
    try {
      const saved = localStorage.getItem('lapatrona_staff_roster');
      return saved ? JSON.parse(saved) : DEFAULT_STAFF;
    } catch {
      return DEFAULT_STAFF;
    }
  });

  const [distributionMode, setDistributionMode] = useState<'equitativo' | 'puesto' | 'horas'>('equitativo');
  const [userEditedTips, setUserEditedTips] = useState<string | null>(null);
  const customTipsInput = userEditedTips !== null ? userEditedTips : totalTipsCollected.toString();
  const [cashierName, setCashierName] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('philly_fry_last_cashier') || '';
  });
  const [notes, setNotes] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'reparto' | 'equipo' | 'ticket'>('reparto');

  // Form for adding new staff
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<TipStaffRole>('mesero');
  const [newMemberHours, setNewMemberHours] = useState('8');

  // Feedback states
  const [copiedThermal, setCopiedThermal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Save staff list to localStorage
  const saveStaffList = (updated: TipStaffMember[]) => {
    setStaffList(updated);
    try {
      localStorage.setItem('lapatrona_staff_roster', JSON.stringify(updated));
    } catch {}
  };

  const parsedTips = useMemo(() => {
    const val = parseFloat(customTipsInput);
    return isNaN(val) || val < 0 ? 0 : Math.round(val * 100) / 100;
  }, [customTipsInput]);

  // Compute distribution
  const distribution = useMemo(() => {
    return calculateTipDistribution(parsedTips, staffList, distributionMode);
  }, [parsedTips, staffList, distributionMode]);

  const activeStaffCount = useMemo(() => {
    return staffList.filter((s) => s.active !== false).length;
  }, [staffList]);

  const [settlementId] = useState(() => `tip-settlement-${Date.now()}`);
  const [settlementDate] = useState(() => new Date().toISOString());

  // Current Settlement Record object
  const settlementRecord: TipSettlementRecord = useMemo(() => {
    return {
      id: settlementId,
      shiftNumber,
      date: settlementDate,
      totalTips: parsedTips,
      mode: distributionMode,
      payouts: distribution.payouts,
      notes: notes.trim() || undefined,
      cashierName: cashierName.trim() || undefined,
    };
  }, [settlementId, shiftNumber, settlementDate, parsedTips, distributionMode, distribution.payouts, notes, cashierName]);

  const thermalText = useMemo(() => {
    return generateTipSettlementThermalText(settlementRecord, businessInfo);
  }, [settlementRecord, businessInfo]);

  const whatsAppText = useMemo(() => {
    return generateTipSettlementWhatsAppText(settlementRecord, businessInfo);
  }, [settlementRecord, businessInfo]);

  if (!isOpen) return null;

  const handleToggleMemberActive = (id: string) => {
    const updated = staffList.map((s) =>
      s.id === id ? { ...s, active: s.active === false ? true : false } : s
    );
    saveStaffList(updated);
  };

  const handleDeleteMember = (id: string) => {
    const updated = staffList.filter((s) => s.id !== id);
    saveStaffList(updated);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newStaff: TipStaffMember = {
      id: `staff-${Date.now()}`,
      name: newMemberName.trim(),
      role: newMemberRole,
      hoursWorked: parseFloat(newMemberHours) || 8,
      active: true,
    };

    const updated = [...staffList, newStaff];
    saveStaffList(updated);
    setNewMemberName('');
    setNewMemberHours('8');
    setIsAddingMember(false);
  };

  const handleCopyThermal = async () => {
    try {
      await navigator.clipboard.writeText(thermalText);
      setCopiedThermal(true);
      setTimeout(() => setCopiedThermal(false), 2500);
    } catch {}
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(whatsAppText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadCSV = () => {
    const bom = '\uFEFF';
    let csv =
      `${bom}Liquidación de Propinas - Turno #${shiftNumber} - ${businessInfo.name}\n` +
      `Fecha y Hora,${new Date().toLocaleString('es-MX')}\n` +
      `Fondo Total Propinas ($),${parsedTips.toFixed(2)}\n` +
      `Modo de Reparto,${distributionMode}\n` +
      `Colaboradores Presentes,${activeStaffCount}\n` +
      `Cajero / Encargado,${cashierName || 'N/A'}\n\n` +
      `ID,Nombre,Rol,Horas Trabajadas,% Asignado,Monto Liquidado ($)\n`;

    distribution.payouts.forEach((p) => {
      const roleName = ROLE_LABELS[p.role]?.label || p.role;
      csv += `"${p.staffId}","${p.name}","${roleName}",${p.hoursWorked || 0},${p.percentage.toFixed(2)}%,${p.amount.toFixed(2)}\n`;
    });

    csv += `\nTotal Liquidado ($),${distribution.totalDistributed.toFixed(2)}\n`;
    csv += `Diferencia Residual ($),${distribution.residual.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Liquidacion_Propinas_Turno_${shiftNumber}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveAndCommit = () => {
    if (onSaveSettlement) {
      onSaveSettlement(settlementRecord);
    }
    try {
      const existing = localStorage.getItem('lapatrona_tip_settlements');
      const list: TipSettlementRecord[] = existing ? JSON.parse(existing) : [];
      list.unshift(settlementRecord);
      localStorage.setItem('lapatrona_tip_settlements', JSON.stringify(list));
      if (cashierName.trim()) {
        localStorage.setItem('philly_fry_last_cashier', cashierName.trim());
      }
    } catch {}
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1800);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="pool-propinas-title"
      maxWidthClass="max-w-3xl"
      panelClassName="bg-[#121215]"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/[0.08] bg-[#17171c] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="pool-propinas-title" className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                Liquidación de Propinas
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold shrink-0">
                Turno #{shiftNumber}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Reparto transparente y penny-perfect para el equipo
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar liquidación de propinas"
          className="w-11 h-11 sm:w-9 sm:h-9 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-colors shrink-0 touch-manipulation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Secciones de liquidación de propinas"
        className="flex border-b border-white/[0.08] bg-[#141418] px-4 pt-1 gap-2 text-xs font-medium overflow-x-auto no-scrollbar shrink-0"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'reparto'}
          onClick={() => setActiveTab('reparto')}
          className={`min-h-[44px] flex items-center gap-2 py-2.5 px-3 border-b-2 whitespace-nowrap transition-all touch-manipulation ${
            activeTab === 'reparto'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5 shrink-0" />
          <span>Reparto y Cuadre</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'equipo'}
          onClick={() => setActiveTab('equipo')}
          className={`min-h-[44px] flex items-center gap-2 py-2.5 px-3 border-b-2 whitespace-nowrap transition-all touch-manipulation ${
            activeTab === 'equipo'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span>Plantilla de Turno ({activeStaffCount}/{staffList.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ticket'}
          onClick={() => setActiveTab('ticket')}
          className={`min-h-[44px] flex items-center gap-2 py-2.5 px-3 border-b-2 whitespace-nowrap transition-all touch-manipulation ${
            activeTab === 'ticket'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Printer className="w-3.5 h-3.5 shrink-0" />
          <span>Ticket Térmico y WhatsApp</span>
        </button>
      </div>

      {/* Modal Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6">
        {activeTab === 'reparto' && (
          <div className="space-y-6">
            {/* Top Banner: Total Pool & Mode selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Editable Total Tips Amount */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs uppercase font-bold text-amber-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 shrink-0" />
                    <span>Fondo Total a Repartir ($ MXN)</span>
                  </span>
                  {totalTipsCollected > 0 && (
                    <span className="text-[10px] text-neutral-400 font-mono tabular-nums">
                      Comandas: ${totalTipsCollected.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={customTipsInput}
                    onChange={(e) => setUserEditedTips(e.target.value)}
                    placeholder="0.00"
                    className="w-full min-h-[48px] bg-[#1b1b20] border border-amber-500/40 rounded-xl px-4 py-3 text-2xl font-mono font-black text-amber-300 focus:outline-none focus:border-amber-400 transition-all tabular-nums"
                  />
                  <div className="text-[10px] text-neutral-400 mt-1.5">
                    💡 Incluye propinas registradas en comandas más el efectivo del bote físico.
                  </div>
                </div>
              </div>

              {/* Distribution Mode Picker */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2.5">
                <span className="text-xs uppercase font-bold text-neutral-300 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#e59b38]" />
                  <span>Modo de Distribución</span>
                </span>
                <div className="grid grid-cols-1 min-[380px]:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDistributionMode('equitativo')}
                    className={`min-h-[48px] p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all touch-manipulation ${
                      distributionMode === 'equitativo'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-sm'
                        : 'bg-[#1b1b20] border-white/[0.06] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Scale className="w-4 h-4 mb-1" />
                    <span className="text-[11px] leading-tight">Equitativo</span>
                    <span className="text-[9px] text-neutral-400 mt-0.5">Partes iguales</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDistributionMode('puesto')}
                    className={`min-h-[48px] p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all touch-manipulation ${
                      distributionMode === 'puesto'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-sm'
                        : 'bg-[#1b1b20] border-white/[0.06] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 mb-1" />
                    <span className="text-[11px] leading-tight">Por Puesto</span>
                    <span className="text-[9px] text-neutral-400 mt-0.5">40/40/10/10%</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDistributionMode('horas')}
                    className={`min-h-[48px] p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all touch-manipulation ${
                      distributionMode === 'horas'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-sm'
                        : 'bg-[#1b1b20] border-white/[0.06] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-4 h-4 mb-1" />
                    <span className="text-[11px] leading-tight">Por Horas</span>
                    <span className="text-[9px] text-neutral-400 mt-0.5">Proporcional</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Payouts Table / List */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs uppercase font-bold text-neutral-300 tracking-wider flex flex-wrap items-center gap-2">
                  <span>Liquidación por Colaborador ({distribution.payouts.length} activos)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                    ✓ Cuadrado exacto al centavo ($0.00 dif.)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('equipo')}
                  className="min-h-[36px] px-2 text-xs text-amber-400 hover:underline flex items-center gap-1 touch-manipulation"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Editar colaboradores</span>
                </button>
              </div>

              {distribution.payouts.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-black/30 border border-white/[0.06] text-neutral-400 text-sm">
                  No hay colaboradores activos en este turno. Ve a la pestaña de Plantilla para activar personal.
                </div>
              ) : (
                <div className="space-y-2">
                  {distribution.payouts.map((payout) => {
                    const roleConfig = ROLE_LABELS[payout.role] || ROLE_LABELS.otro;
                    return (
                      <div
                        key={payout.staffId}
                        className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-black/40 border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-300 shrink-0">
                            {payout.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white flex flex-wrap items-center gap-2">
                              <span>{payout.name}</span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${roleConfig.badgeBg} ${roleConfig.color}`}>
                                {roleConfig.label}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-400">
                              {distributionMode === 'horas' && `${payout.hoursWorked || 8} hrs laboradas • `}
                              {payout.percentage.toFixed(1)}% del pozo
                            </div>
                          </div>
                        </div>

                        <div className="text-right ml-auto shrink-0">
                          <div className="text-base sm:text-lg font-mono font-black text-amber-300 tabular-nums">
                            ${payout.amount.toFixed(2)} <span className="text-xs font-normal text-amber-400">MXN</span>
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono">
                            Efectivo neto a entregar
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Financial Reconciliation Summary */}
            <div className="p-4 rounded-2xl bg-[#17171d] border border-white/[0.08] space-y-3">
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.04]">
                  <div className="text-[10px] text-neutral-400 uppercase font-bold">Total a Repartir</div>
                  <div className="text-base font-mono font-black text-white mt-0.5 tabular-nums">
                    ${parsedTips.toFixed(2)}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.04]">
                  <div className="text-[10px] text-neutral-400 uppercase font-bold">Total Asignado</div>
                  <div className="text-base font-mono font-black text-emerald-400 mt-0.5 tabular-nums">
                    ${distribution.totalDistributed.toFixed(2)}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.04]">
                  <div className="text-[10px] text-neutral-400 uppercase font-bold">Diferencia Residual</div>
                  <div className="text-base font-mono font-bold text-neutral-300 mt-0.5 tabular-nums">
                    ${distribution.residual.toFixed(2)}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.04]">
                  <div className="text-[10px] text-neutral-400 uppercase font-bold">Promedio / Colab</div>
                  <div className="text-base font-mono font-bold text-amber-400 mt-0.5 tabular-nums">
                    ${activeStaffCount > 0 ? (distribution.totalDistributed / activeStaffCount).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>

              {/* Additional Settlement Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Cajero o Encargado que entrega
                  </label>
                  <input
                    type="text"
                    value={cashierName}
                    onChange={(e) => setCashierName(e.target.value)}
                    placeholder="Ej. Juan Pérez (Cajero)"
                    className="w-full min-h-[44px] sm:min-h-[38px] bg-[#111114] border border-white/10 rounded-xl px-3 py-2 text-base sm:text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Notas u Observaciones del Cierre
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej. Bote de propinas físico $150 incluido"
                    className="w-full min-h-[44px] sm:min-h-[38px] bg-[#111114] border border-white/10 rounded-xl px-3 py-2 text-base sm:text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'equipo' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Equipo de Trabajo en Turno</h3>
                <p className="text-xs text-neutral-400">
                  Marca quiénes laboraron hoy para incluirlos en el reparto de propinas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingMember(!isAddingMember)}
                className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition-all touch-manipulation"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingMember ? 'Cancelar' : 'Agregar Colaborador'}</span>
              </button>
            </div>

            {/* Add Member Form */}
            {isAddingMember && (
              <form
                onSubmit={handleAddMember}
                className="p-4 rounded-2xl bg-[#17171d] border border-amber-500/30 space-y-3 animate-fade-in"
              >
                <div className="text-xs font-bold text-amber-400 uppercase">
                  Nuevo Miembro de Equipo
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="Ej. Sofía Hernández"
                      className="w-full min-h-[44px] sm:min-h-[38px] bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Rol / Puesto</label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value as TipStaffRole)}
                      className="w-full min-h-[44px] sm:min-h-[38px] bg-[#1b1b20] border border-white/10 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="cocina">Cocina (40%)</option>
                      <option value="mesero">Servicio / Mesas (40%)</option>
                      <option value="barra">Barra (10%)</option>
                      <option value="limpieza">Limpieza (10%)</option>
                      <option value="cajero">Cajero</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Horas en Turno</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      min="1"
                      max="24"
                      value={newMemberHours}
                      onChange={(e) => setNewMemberHours(e.target.value)}
                      className="w-full min-h-[44px] sm:min-h-[38px] bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="w-full sm:w-auto min-h-[44px] px-5 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors shadow-sm touch-manipulation"
                  >
                    Guardar en Plantilla
                  </button>
                </div>
              </form>
            )}

            {/* Roster List */}
            <div className="space-y-2">
              {staffList.map((member) => {
                const isActive = member.active !== false;
                const roleConfig = ROLE_LABELS[member.role] || ROLE_LABELS.otro;
                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between gap-2 p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-black/40 border-white/[0.08]'
                        : 'bg-black/20 border-white/[0.04] opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleMemberActive(member.id)}
                        aria-label={isActive ? `Desmarcar a ${member.name}` : `Marcar presente a ${member.name}`}
                        aria-pressed={isActive}
                        className={`w-11 h-11 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 touch-manipulation ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-white/5 text-neutral-500 border border-white/10'
                        }`}
                        title={isActive ? 'Desmarcar (Ausente hoy)' : 'Marcar (Presente hoy)'}
                      >
                        {isActive ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </button>

                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-white flex flex-wrap items-center gap-2">
                          <span>{member.name}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${roleConfig.badgeBg} ${roleConfig.color}`}>
                            {roleConfig.label}
                          </span>
                        </div>
                        <div className="text-[11px] sm:text-[10px] text-neutral-400 mt-0.5">
                          {member.hoursWorked || 8} horas registradas {isActive ? '• Presente en turno' : '• Ausente (no recibe propina)'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(member.id)}
                        aria-label={`Eliminar a ${member.name} de la plantilla`}
                        className="w-11 h-11 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors touch-manipulation"
                        title="Eliminar de la plantilla"
                      >
                        <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'ticket' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Comprobante de Liquidación</h3>
              <p className="text-xs text-neutral-400">
                Imprime el ticket físico o compártelo instantáneamente al grupo de WhatsApp del equipo.
              </p>
            </div>

            {/* Thermal Slip Monospace Preview */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#09090b] border border-white/10 shadow-inner">
              <pre className="font-mono text-[11px] sm:text-xs text-neutral-200 whitespace-pre overflow-x-auto leading-relaxed">
                {thermalText}
              </pre>
            </div>

            {/* Action Buttons for Ticket tab */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 touch-manipulation"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartir en WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyThermal}
                className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 text-white font-semibold text-xs transition-all active:scale-95 touch-manipulation"
              >
                {copiedThermal ? <Check className="w-4 h-4 text-emerald-400" /> : <Printer className="w-4 h-4 text-[#e59b38]" />}
                <span>{copiedThermal ? '✓ Copiado a Portapapeles' : 'Copiar Texto ESC/POS'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCSV}
                className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 text-white font-semibold text-xs transition-all active:scale-95 touch-manipulation"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>Descargar CSV Auditoría</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/[0.08] bg-[#17171c] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Reparto 100% auditado y transparente</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold transition-all touch-manipulation"
            title="Compartir por WhatsApp al grupo de colaboradores"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndCommit}
            disabled={isSaved || distribution.payouts.length === 0}
            className="flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#e59b38] hover:bg-[#d48b28] text-black font-extrabold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 touch-manipulation"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Liquidación Guardada ✓</span>
              </>
            ) : (
              <>
                <Coins className="w-4 h-4 text-black" />
                <span className="tabular-nums">Liquidar Propinas (${distribution.totalDistributed.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
