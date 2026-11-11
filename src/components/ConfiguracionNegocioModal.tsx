'use client';

import React, { useState } from 'react';
import { BusinessInfo } from '@/types/accounting';
import { X, Store, Save, FileText, Phone, MapPin, Receipt, Sparkles } from 'lucide-react';
import { DEFAULT_BUSINESS_INFO } from '@/data/initialBusinessInfo';

interface ConfiguracionNegocioModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessInfo: BusinessInfo;
  onSaveBusinessInfo: (info: BusinessInfo) => void;
}

export const ConfiguracionNegocioModal: React.FC<ConfiguracionNegocioModalProps> = ({
  isOpen,
  onClose,
  businessInfo,
  onSaveBusinessInfo,
}) => {
  if (!isOpen) return null;

  return (
    <ConfiguracionNegocioDialog
      onClose={onClose}
      businessInfo={businessInfo}
      onSaveBusinessInfo={onSaveBusinessInfo}
    />
  );
};

function ConfiguracionNegocioDialog({
  onClose,
  businessInfo,
  onSaveBusinessInfo,
}: {
  onClose: () => void;
  businessInfo: BusinessInfo;
  onSaveBusinessInfo: (info: BusinessInfo) => void;
}) {
  const [formData, setFormData] = useState<BusinessInfo>(businessInfo);

  const handleChange = (field: keyof BusinessInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetDefaults = () => {
    setFormData(DEFAULT_BUSINESS_INFO);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBusinessInfo(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden pb-safe sm:pb-0">
        
        {/* Mobile handle indicator */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.08] bg-[#19191d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e59b38]/15 border border-[#e59b38]/30 flex items-center justify-center">
              <Store className="w-5 h-5 text-[#e59b38]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                Membrete y Datos del Negocio
              </h2>
              <p className="text-xs text-neutral-400">
                Personaliza tickets de comanda, reportes térmicos y WhatsApp.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Business Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#e59b38]" />
              <span>Nombre Comercial del Negocio</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ej. LA PATRONA"
              className="w-full bg-[#1b1b20] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#e59b38] transition-colors"
            />
          </div>

          {/* Tagline / Slogan */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#e59b38]" />
              <span>Subtítulo / Especialidad</span>
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              placeholder="Ej. Philly & Fry • Ribeye & Quesadillas"
              className="w-full bg-[#1b1b20] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#e59b38] transition-colors"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#e59b38]" />
              <span>Dirección o Sucursal</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Ej. Av. Principal #123, Col. Centro"
              className="w-full bg-[#1b1b20] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#e59b38] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#e59b38]" />
                <span>Teléfono / WhatsApp</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Ej. 55 1234 5678"
                className="w-full bg-[#1b1b20] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#e59b38] transition-colors"
              />
            </div>

            {/* RFC / Fiscal ID (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#e59b38]" />
                <span>RFC o Registro (Opcional)</span>
              </label>
              <input
                type="text"
                value={formData.rfc || ''}
                onChange={(e) => handleChange('rfc', e.target.value)}
                placeholder="Ej. XAXX010101000"
                className="w-full bg-[#1b1b20] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm uppercase text-white placeholder-neutral-500 focus:outline-none focus:border-[#e59b38] transition-colors"
              />
            </div>
          </div>

          {/* Footer Note */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-[#e59b38]" />
              <span>Mensaje al Pie del Ticket</span>
            </label>
            <input
              type="text"
              value={formData.footerNote}
              onChange={(e) => handleChange('footerNote', e.target.value)}
              placeholder="Ej. ¡GRACIAS POR SU PREFERENCIA!"
              className="w-full bg-[#1b1b20] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#e59b38] transition-colors"
            />
          </div>

          {/* Ticket Live Preview Box */}
          <div className="p-3 bg-black/40 rounded-xl border border-white/[0.08] text-[11px] font-mono text-neutral-400 space-y-0.5 text-center">
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
              Vista previa del encabezado:
            </div>
            <div className="text-white font-bold">{formData.name || 'NOMBRE DEL NEGOCIO'}</div>
            <div className="text-neutral-300">{formData.tagline}</div>
            {formData.address && <div>{formData.address}</div>}
            {formData.phone && <div>Tel: {formData.phone}</div>}
            {formData.rfc && <div>RFC: {formData.rfc.toUpperCase()}</div>}
            <div className="text-neutral-500 text-[10px] pt-1 border-t border-white/10 mt-1">
              {formData.footerNote}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-neutral-500 hover:text-neutral-300 underline touch-manipulation"
            >
              Restablecer Valores
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#e59b38] hover:bg-[#d48b28] text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-md active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
