'use client';

import React, { useState } from 'react';
import { ProductItem, CategoryType } from '@/types/accounting';
import { X, DollarSign, Save, Info, Sparkles, ChevronDown, ChevronUp, Calculator, Plus, Trash2 } from 'lucide-react';

export interface RawIngredientCosts {
  ribeyeKg: number;
  hoagiePiece: number;
  tortillaPiece: number;
  cheeseKg: number;
  friesKg: number;
  cheddarCheeseKg: number;
  packagingPiece: number;
}

export const DEFAULT_RAW_COSTS: RawIngredientCosts = {
  ribeyeKg: 300,
  hoagiePiece: 12,
  tortillaPiece: 4.5,
  cheeseKg: 190,
  friesKg: 45,
  cheddarCheeseKg: 120,
  packagingPiece: 4,
};

export function computeEscandalloFromRaw(raw: RawIngredientCosts): Record<string, { cost: number; ingredients: string[] }> {
  const ribeyePerGram = raw.ribeyeKg / 1000;
  const cheesePerGram = raw.cheeseKg / 1000;
  const friesPerGram = raw.friesKg / 1000;
  const cheddarPerGram = raw.cheddarCheeseKg / 1000;

  const swAloneCost = Math.round((150 * ribeyePerGram + 50 * cheesePerGram + raw.hoagiePiece + raw.packagingPiece + 1.0) * 100) / 100;
  const swFriesCost = Math.round((150 * ribeyePerGram + 50 * cheesePerGram + raw.hoagiePiece + 200 * friesPerGram + raw.packagingPiece + 1.0) * 100) / 100;
  const qAloneCost = Math.round((120 * ribeyePerGram + 60 * cheesePerGram + raw.tortillaPiece + raw.packagingPiece) * 100) / 100;
  const qFriesCost = Math.round((120 * ribeyePerGram + 60 * cheesePerGram + raw.tortillaPiece + 200 * friesPerGram + raw.packagingPiece) * 100) / 100;
  const sfCost = Math.round((180 * ribeyePerGram + 250 * friesPerGram + 2.10 + raw.packagingPiece + 1.0) * 100) / 100;
  const fAloneCost = Math.round((220 * friesPerGram + 3.00 + Math.max(1, raw.packagingPiece - 1.0)) * 100) / 100;
  const fCheeseCost = Math.round((220 * friesPerGram + 70 * cheddarPerGram + 3.00 + Math.max(1, raw.packagingPiece - 1.0)) * 100) / 100;

  return {
    'sandwich-alone': {
      cost: swAloneCost,
      ingredients: [
        `Pan Hoagie artesanal ($${raw.hoagiePiece.toFixed(2)})`,
        `Ribeye 150g ($${(150 * ribeyePerGram).toFixed(2)})`,
        `Queso Provolone 50g ($${(50 * cheesePerGram).toFixed(2)})`,
        'Cebollitas asadas ($1.00)',
        `Papel y empaque ($${raw.packagingPiece.toFixed(2)})`,
      ],
    },
    'sandwich-fries': {
      cost: swFriesCost,
      ingredients: [
        `Pan Hoagie artesanal ($${raw.hoagiePiece.toFixed(2)})`,
        `Ribeye 150g ($${(150 * ribeyePerGram).toFixed(2)})`,
        `Queso Provolone 50g ($${(50 * cheesePerGram).toFixed(2)})`,
        `Papas 200g ($${(200 * friesPerGram).toFixed(2)})`,
        `Empaque combo ($${(raw.packagingPiece + 1.0).toFixed(2)})`,
      ],
    },
    'quesadilla-alone': {
      cost: qAloneCost,
      ingredients: [
        `Tortilla de harina gigante ($${raw.tortillaPiece.toFixed(2)})`,
        `Ribeye 120g ($${(120 * ribeyePerGram).toFixed(2)})`,
        `Mezcla quesos 60g ($${(60 * cheesePerGram).toFixed(2)})`,
        `Empaque ($${raw.packagingPiece.toFixed(2)})`,
      ],
    },
    'quesadilla-fries': {
      cost: qFriesCost,
      ingredients: [
        `Tortilla de harina gigante ($${raw.tortillaPiece.toFixed(2)})`,
        `Ribeye 120g ($${(120 * ribeyePerGram).toFixed(2)})`,
        `Mezcla quesos 60g ($${(60 * cheesePerGram).toFixed(2)})`,
        `Papas 200g ($${(200 * friesPerGram).toFixed(2)})`,
        `Empaque combo ($${raw.packagingPiece.toFixed(2)})`,
      ],
    },
    'steak-frites': {
      cost: sfCost,
      ingredients: [
        `Ribeye sellado 180g ($${(180 * ribeyePerGram).toFixed(2)})`,
        `Papas 250g ($${(250 * friesPerGram).toFixed(2)})`,
        'Pimientos y cebolla ($2.10)',
        `Charola artesanal ($${(raw.packagingPiece + 1.0).toFixed(2)})`,
      ],
    },
    'fries-alone': {
      cost: fAloneCost,
      ingredients: [
        `Papas corte casero 220g ($${(220 * friesPerGram).toFixed(2)})`,
        'Aceite y sal ($3.00)',
        `Cono / caja ($${Math.max(1, raw.packagingPiece - 1.0).toFixed(2)})`,
      ],
    },
    'fries-cheese': {
      cost: fCheeseCost,
      ingredients: [
        `Papas corte casero 220g ($${(220 * friesPerGram).toFixed(2)})`,
        `Salsa queso cheddar 70g ($${(70 * cheddarPerGram).toFixed(2)})`,
        'Aceite y sal ($3.00)',
        `Charola ($${Math.max(1, raw.packagingPiece - 1.0).toFixed(2)})`,
      ],
    },
  };
}

export const RECIPE_ESCANDALLOS = computeEscandalloFromRaw(DEFAULT_RAW_COSTS);

interface PriceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  onSaveProducts: (updatedProducts: ProductItem[]) => void;
}

export const PriceManagerModal: React.FC<PriceManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  onSaveProducts,
}) => {
  if (!isOpen) return null;

  return (
    <PriceManagerModalDialog
      onClose={onClose}
      products={products}
      onSaveProducts={onSaveProducts}
    />
  );
};

interface PriceManagerModalDialogProps {
  onClose: () => void;
  products: ProductItem[];
  onSaveProducts: (updatedProducts: ProductItem[]) => void;
}

function PriceManagerModalDialog({
  onClose,
  products,
  onSaveProducts,
}: PriceManagerModalDialogProps) {
  const [formData, setFormData] = useState<ProductItem[]>(products);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [showRawCosts, setShowRawCosts] = useState(false);
  const [showNewProductForm, setShowNewProductForm] = useState(false);

  // New product form fields
  const [newProdName, setNewProdName] = useState('');
  const [newProdVariant, setNewProdVariant] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<CategoryType>('bebidas');
  const [newProdPrice, setNewProdPrice] = useState<number>(35);
  const [newProdCost, setNewProdCost] = useState<number>(15);
  const [newProdDescription, setNewProdDescription] = useState('');

  const [rawCosts, setRawCosts] = useState<RawIngredientCosts>(() => {
    if (typeof window === 'undefined') return DEFAULT_RAW_COSTS;
    try {
      const saved = localStorage.getItem('philly_fry_raw_costs');
      return saved !== null ? JSON.parse(saved) : DEFAULT_RAW_COSTS;
    } catch {
      return DEFAULT_RAW_COSTS;
    }
  });

  const handleUpdateRawCost = (key: keyof RawIngredientCosts, val: number) => {
    const updated = { ...rawCosts, [key]: val };
    setRawCosts(updated);
    try {
      localStorage.setItem('philly_fry_raw_costs', JSON.stringify(updated));
    } catch {}
  };

  const handlePriceChange = (id: string, price: number) => {
    setFormData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, defaultPrice: price } : item))
    );
  };

  const handleCostChange = (id: string, cost: number) => {
    setFormData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cost: cost } : item))
    );
  };

  const handleApplyEscandallos = () => {
    const computed = computeEscandalloFromRaw(rawCosts);
    setFormData((prev) =>
      prev.map((item) => {
        const recipe = computed[item.id];
        return recipe ? { ...item, cost: recipe.cost } : item;
      })
    );
  };

  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const defaultImages: Record<CategoryType, string> = {
      sandwiches: 'https://images.unsplash.com/photo-1549611016-3a70d82b5040?auto=format&fit=crop&w=800&q=80',
      quesadillas: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=800&q=80',
      'steak-frites': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      fries: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
      bebidas: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      extras: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
      postres: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
      otro: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    };

    const newProduct: ProductItem = {
      id: newId,
      name: newProdName.trim(),
      variantLabel: newProdVariant.trim() || 'Estándar',
      category: newProdCategory,
      description: newProdDescription.trim() || `${newProdName.trim()} preparado al momento.`,
      imageUrl: defaultImages[newProdCategory] || defaultImages.otro,
      defaultPrice: Number(newProdPrice) || 0,
      cost: Number(newProdCost) || 0,
    };

    setFormData((prev) => [...prev, newProduct]);
    setNewProdName('');
    setNewProdVariant('');
    setNewProdDescription('');
    setShowNewProductForm(false);
  };

  const handleDeleteProduct = (id: string) => {
    setFormData((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProducts(formData);
    onClose();
  };

  const dynamicRecipes = computeEscandalloFromRaw(rawCosts);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden pb-safe sm:pb-0">
        
        {/* Mobile handle indicator */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.08] bg-[#19191d] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#e59b38]/15 border border-[#e59b38]/30 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#e59b38]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                Precios y Costeo de Alimentos
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400">
                Ajusta precios de venta y costos de insumo por receta.
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

        {/* Informative notice with Autocomplete Escandallos Button */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#e59b38]/10 border-b border-[#e59b38]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] sm:text-xs text-[#f5f0eb] shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#e59b38] shrink-0" />
            <span>Ingresa precios y costos unitarios para calcular tu margen bruto.</span>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowNewProductForm((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px] transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showNewProductForm ? 'Ocultar Creador' : '+ Nuevo Platillo / Bebida'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowRawCosts((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] transition-all shadow-sm active:scale-95"
            >
              <Calculator className="w-3.5 h-3.5 text-[#e59b38]" />
              <span>{showRawCosts ? 'Ocultar Insumos' : 'Precios Proveedor'}</span>
            </button>
            <button
              type="button"
              onClick={handleApplyEscandallos}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e59b38] hover:bg-[#d48b28] text-black font-extrabold text-[11px] transition-all shadow-sm active:scale-95"
              title="Cargar costos sugeridos basados en insumos (Ribeye, pan, queso, papas)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autocompletar Escandallos</span>
            </button>
          </div>
        </div>

        {/* Dynamic New Product Creator Form */}
        {showNewProductForm && (
          <div className="p-4 bg-[#16161c] border-b border-white/[0.08] text-xs space-y-3 shrink-0 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Agregar Nuevo Platillo o Bebida al Menú</span>
              </span>
              <span className="text-[10px] text-neutral-400">Se agregará al punto de venta y comanda</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div className="sm:col-span-2">
                <label className="text-[10px] text-neutral-400 block mb-0.5">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Ej. Refresco Lata 355ml"
                  className="w-full bg-[#1c1c22] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-[#e59b38]"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-0.5">Variante / Tamaño</label>
                <input
                  type="text"
                  value={newProdVariant}
                  onChange={(e) => setNewProdVariant(e.target.value)}
                  placeholder="Ej. 355ml / Frío"
                  className="w-full bg-[#1c1c22] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-[#e59b38]"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-0.5">Categoría</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value as CategoryType)}
                  className="w-full bg-[#1c1c22] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#e59b38]"
                >
                  <option value="sandwiches">Sándwiches</option>
                  <option value="quesadillas">Quesadillas</option>
                  <option value="steak-frites">Steak Frites</option>
                  <option value="fries">Papas y Acompañamientos</option>
                  <option value="bebidas">Bebidas y Refrescos</option>
                  <option value="extras">Extras e Ingredientes</option>
                  <option value="postres">Postres</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-0.5">Precio de Venta ($ MXN)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1c1c22] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-[#e59b38]"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-0.5">Costo Unitario ($ MXN)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={newProdCost}
                  onChange={(e) => setNewProdCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1c1c22] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-[#e59b38]"
                />
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="button"
                  onClick={handleAddNewProduct}
                  className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-colors shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar al Catálogo</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Raw Ingredients Costing Accordion */}
        {showRawCosts && (
          <div className="p-4 bg-[#121215] border-b border-white/[0.08] text-xs space-y-3 shrink-0 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-[#e59b38]" />
                <span>Precios Base de Insumos (Costo de Materia Prima)</span>
              </span>
              <button
                type="button"
                onClick={handleApplyEscandallos}
                className="text-[11px] text-[#e59b38] hover:underline font-bold"
              >
                Aplicar a Todas las Recetas
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] text-neutral-400 block mb-0.5">Ribeye Res ($/kg)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={rawCosts.ribeyeKg}
                  onChange={(e) => handleUpdateRawCost('ribeyeKg', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1c1c22] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-[#e59b38]"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-0.5">Pan Hoagie ($/pz)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={rawCosts.hoagiePiece}
                  onChange={(e) => handleUpdateRawCost('hoagiePiece', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1c1c22] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-[#e59b38]"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-0.5">Tortilla Harina ($/pz)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={rawCosts.tortillaPiece}
                  onChange={(e) => handleUpdateRawCost('tortillaPiece', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1c1c22] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-[#e59b38]"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-0.5">Quesos fundir ($/kg)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={rawCosts.cheeseKg}
                  onChange={(e) => handleUpdateRawCost('cheeseKg', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1c1c22] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-[#e59b38]"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-0.5">Papas ($/kg)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={rawCosts.friesKg}
                  onChange={(e) => handleUpdateRawCost('friesKg', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1c1c22] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-[#e59b38]"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-0.5">Queso Cheddar ($/kg)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={rawCosts.cheddarCheeseKg}
                  onChange={(e) => handleUpdateRawCost('cheddarCheeseKg', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1c1c22] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-[#e59b38]"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-0.5">Empaque / caja ($/pz)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={rawCosts.packagingPiece}
                  onChange={(e) => handleUpdateRawCost('packagingPiece', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1c1c22] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-[#e59b38]"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleApplyEscandallos}
                  className="w-full py-1.5 rounded-lg bg-[#e59b38] hover:bg-[#d48b28] text-black font-extrabold text-xs transition-colors shadow-sm"
                >
                  Recalcular Costos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-12 gap-2 sm:gap-3 pb-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400 border-b border-white/[0.06]">
            <div className="col-span-6 sm:col-span-6">Producto y Variante</div>
            <div className="col-span-3 sm:col-span-3 text-right">Precio ($)</div>
            <div className="col-span-3 sm:col-span-3 text-right">Costo ($)</div>
          </div>

          {formData.map((item) => {
            const isBaseProduct = [
              'sandwich-alone',
              'sandwich-fries',
              'quesadilla-alone',
              'quesadilla-fries',
              'steak-frites',
              'fries-alone',
              'fries-cheese',
            ].includes(item.id);
            const margin =
              item.defaultPrice > 0 && item.cost > 0
                ? Math.round(((item.defaultPrice - item.cost) / item.defaultPrice) * 100)
                : null;
            const recipe = dynamicRecipes[item.id];
            const isExpanded = expandedRecipeId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors overflow-hidden"
              >
                <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center p-2.5 sm:p-3">
                  {/* Product Name & Variant */}
                  <div className="col-span-6 sm:col-span-6">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-xs sm:text-sm text-[#f5f0eb] leading-tight truncate">
                        {item.name}
                      </div>
                      {!isBaseProduct && (
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(item.id)}
                          className="text-neutral-500 hover:text-red-400 p-0.5 rounded transition-colors shrink-0"
                          title="Eliminar producto del catálogo"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] sm:text-[11px] text-[#e59b38] font-mono truncate">
                        {item.variantLabel}
                      </span>
                      {margin !== null && (
                        <span className="text-[9px] sm:text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded shrink-0">
                          {margin}%
                        </span>
                      )}
                      {recipe && (
                        <button
                          type="button"
                          onClick={() => setExpandedRecipeId(isExpanded ? null : item.id)}
                          className="text-[9px] text-neutral-400 hover:text-white flex items-center gap-0.5 underline decoration-white/20"
                        >
                          <span>Receta</span>
                          {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Selling Price Input */}
                  <div className="col-span-3 sm:col-span-3">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-mono">
                        $
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="0"
                        value={item.defaultPrice || ''}
                        onChange={(e) =>
                          handlePriceChange(item.id, parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                        className="w-full bg-[#1e1e23] border border-white/10 rounded-lg pl-5 pr-2 py-2 text-xs sm:text-sm text-right font-mono text-white focus:outline-none focus:border-[#e59b38]"
                      />
                    </div>
                  </div>

                  {/* Unit Cost Input */}
                  <div className="col-span-3 sm:col-span-3">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-mono">
                        $
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="0"
                        value={item.cost || ''}
                        onChange={(e) =>
                          handleCostChange(item.id, parseFloat(e.target.value) || 0)
                        }
                        placeholder="Pendiente"
                        className="w-full bg-[#1e1e23] border border-white/10 rounded-lg pl-5 pr-2 py-2 text-xs sm:text-sm text-right font-mono text-neutral-200 focus:outline-none focus:border-[#e59b38]"
                      />
                    </div>
                  </div>
                </div>

                {/* Expandable Recipe Insumos Breakdown */}
                {isExpanded && recipe && (
                  <div className="px-3 pb-3 pt-1 border-t border-white/[0.04] bg-black/20 text-[10px] text-neutral-400 space-y-1 animate-fade-in">
                    <div className="font-semibold text-neutral-300 uppercase tracking-wider">
                      Desglose de Escandallo (Insumos Base):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                      {recipe.ingredients.map((ing, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[#e59b38]" />
                          <span>{ing}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </form>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-5 border-t border-white/[0.08] bg-[#19191d] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors touch-manipulation active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-[#e59b38] hover:bg-[#d48b28] text-black font-bold text-xs uppercase tracking-wider px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-full transition-all shadow-md active:scale-95 touch-manipulation"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Precios</span>
          </button>
        </div>

      </div>
    </div>
  );
}
