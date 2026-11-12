'use client';

import React, { useState } from 'react';
import {
  ProductItem,
  PaymentMethod,
  CustomerOrder,
  CustomerOrderItem,
  OrderItemModifier,
  ProductStockConfig,
  SplitPaymentDetail,
  OrderDiscount,
} from '@/types/accounting';
import { STANDARD_MODIFIERS, QUICK_INSTRUCTIONS, ModifierOption } from '@/data/initialProducts';
import { triggerHaptic } from '@/utils/haptics';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Banknote,
  CreditCard,
  Smartphone,
  Split,
  Trash2,
  CheckCircle2,
  Tag,
  Gift,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ModalShell } from './ModalShell';

interface NuevaOrdenModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  nextOrderNumber: number;
  stockMap?: Record<string, ProductStockConfig>;
  existingOrder?: CustomerOrder | null;
  onCompleteOrder: (order: CustomerOrder) => void;
}

function createNewOrder(
  nextOrderNumber: number,
  customerName: string,
  notes: string,
  items: CustomerOrderItem[],
  total: number,
  paymentMethod: PaymentMethod,
  amountReceived?: number,
  change?: number,
  splitPayment?: SplitPaymentDetail,
  discount?: OrderDiscount
): CustomerOrder {
  return {
    id: `order-${nextOrderNumber}-${Date.now()}`,
    orderNumber: nextOrderNumber,
    timestamp: new Date().toISOString(),
    orderType: 'llevar',
    customerName: customerName.trim() || undefined,
    notes: notes.trim() || undefined,
    items,
    total,
    discount,
    paymentMethod,
    splitPayment,
    amountReceived,
    change,
  };
}

export const NuevaOrdenModal: React.FC<NuevaOrdenModalProps> = ({
  isOpen,
  onClose,
  products,
  nextOrderNumber,
  stockMap,
  existingOrder,
  onCompleteOrder,
}) => {
  const [customerName, setCustomerName] = useState(existingOrder?.customerName || '');
  const [notes, setNotes] = useState(existingOrder?.notes || '');
  const [cart, setCart] = useState<Record<string, number>>(() => {
    if (existingOrder) {
      const initial: Record<string, number> = {};
      for (const item of existingOrder.items) {
        initial[item.productId] = (initial[item.productId] || 0) + item.quantity;
      }
      return initial;
    }
    return {};
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(existingOrder?.paymentMethod || 'efectivo');
  const [splitCashInput, setSplitCashInput] = useState<string>('');
  const [discountType, setDiscountType] = useState<number | 'cortesia' | 'fixed'>(
    existingOrder?.discount?.type === 'percent'
      ? existingOrder.discount.value === 100
        ? 'cortesia'
        : existingOrder.discount.value
      : existingOrder?.discount?.type === 'fixed'
      ? 'fixed'
      : 0
  );
  const [customDiscount, setCustomDiscount] = useState<string>(
    existingOrder?.discount?.type === 'fixed' ? existingOrder.discount.amount.toString() : ''
  );
  const [amountReceived, setAmountReceived] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customizingProductId, setCustomizingProductId] = useState<string | null>(null);

  const [itemModifiers, setItemModifiers] = useState<Record<string, OrderItemModifier[]>>(() => {
    if (existingOrder) {
      const initial: Record<string, OrderItemModifier[]> = {};
      for (const item of existingOrder.items) {
        if (item.modifiers && item.modifiers.length > 0) {
          initial[item.productId] = item.modifiers;
        }
      }
      return initial;
    }
    return {};
  });

  const [itemInstructions, setItemInstructions] = useState<Record<string, string>>(() => {
    if (existingOrder) {
      const initial: Record<string, string> = {};
      for (const item of existingOrder.items) {
        if (item.instructions) {
          initial[item.productId] = item.instructions;
        }
      }
      return initial;
    }
    return {};
  });

  if (!isOpen) return null;

  const handleAddItem = (productId: string) => {
    const stock = stockMap?.[productId];
    if (stock?.trackStock) {
      const currentInCart = cart[productId] || 0;
      if (currentInCart >= stock.currentStock) {
        triggerHaptic('medium');
        return;
      }
    }
    triggerHaptic('light');
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const handleRemoveItem = (productId: string) => {
    triggerHaptic('medium');
    setCart((prev) => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: current - 1 };
    });
  };

  const handleClearCart = () => {
    setCart({});
    setItemModifiers({});
    setItemInstructions({});
    setCustomizingProductId(null);
  };

  const handleToggleModifier = (productId: string, mod: ModifierOption) => {
    triggerHaptic('light');
    setItemModifiers((prev) => {
      const current = prev[productId] || [];
      const exists = current.some((m) => m.id === mod.id);
      if (exists) {
        return {
          ...prev,
          [productId]: current.filter((m) => m.id !== mod.id),
        };
      }
      return {
        ...prev,
        [productId]: [
          ...current,
          { id: mod.id, name: mod.name, price: mod.price, cost: mod.cost },
        ],
      };
    });
  };

  const handleToggleInstruction = (productId: string, instruction: string) => {
    triggerHaptic('light');
    setItemInstructions((prev) => {
      const current = prev[productId] || '';
      if (current === instruction) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: instruction };
    });
  };

  const orderItems: CustomerOrderItem[] = Object.entries(cart)
    .map(([productId, quantity]): CustomerOrderItem | null => {
      const prod = products.find((p) => p.id === productId);
      if (!prod || quantity <= 0) return null;

      const mods = itemModifiers[productId] || [];
      const modsPrice = mods.reduce((sum, m) => sum + m.price, 0);
      const modsCost = mods.reduce((sum, m) => sum + (m.cost || 0), 0);
      const effectiveUnitPrice = prod.defaultPrice + modsPrice;
      const effectiveUnitCost = prod.cost + modsCost;
      const instructions = itemInstructions[productId];

      return {
        productId,
        productName: prod.name,
        variantLabel: prod.variantLabel,
        quantity,
        unitPrice: effectiveUnitPrice,
        unitCost: effectiveUnitCost,
        subtotal: quantity * effectiveUnitPrice,
        modifiers: mods.length > 0 ? mods : undefined,
        instructions: instructions ? instructions.trim() : undefined,
      };
    })
    .filter((item): item is CustomerOrderItem => item !== null);

  const totalItemsCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const foodSubtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  let discountAmount = 0;
  if (discountType === 'cortesia') {
    discountAmount = foodSubtotal;
  } else if (discountType === 'fixed') {
    discountAmount = Math.min(foodSubtotal, Math.max(0, parseFloat(customDiscount) || 0));
  } else if (typeof discountType === 'number' && discountType > 0) {
    discountAmount = Math.round((foodSubtotal * discountType) / 100);
  }

  const finalTotal = Math.max(0, foodSubtotal - discountAmount);

  const discountObj: OrderDiscount | undefined =
    discountAmount > 0
      ? {
          type: discountType === 'fixed' ? 'fixed' : 'percent',
          value:
            discountType === 'cortesia'
              ? 100
              : discountType === 'fixed'
              ? parseFloat(customDiscount) || 0
              : (discountType as number),
          amount: discountAmount,
          label:
            discountType === 'cortesia'
              ? 'Cortesía 100%'
              : discountType === 'fixed'
              ? `Descuento Fijo -$${discountAmount}`
              : `Descuento ${discountType}%`,
        }
      : undefined;

  const rawCashPortion = parseFloat(splitCashInput);
  const cashPortion =
    paymentMethod === 'mixto'
      ? isNaN(rawCashPortion)
        ? Math.round(finalTotal / 2)
        : Math.min(finalTotal, Math.max(0, rawCashPortion))
      : 0;
  const cardPortion = paymentMethod === 'mixto' ? Math.max(0, Math.round((finalTotal - cashPortion) * 100) / 100) : 0;

  const receivedNum = parseFloat(amountReceived) || 0;
  const change =
    paymentMethod === 'efectivo' && receivedNum > 0
      ? Math.max(0, receivedNum - finalTotal)
      : paymentMethod === 'mixto' && receivedNum > 0
      ? Math.max(0, receivedNum - cashPortion)
      : 0;

  const billetes = [50, 100, 200, 500, 1000];

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) return;

    triggerHaptic('success');

    const completedOrder: CustomerOrder = existingOrder
      ? {
          ...existingOrder,
          orderType: 'llevar',
          customerName: customerName.trim() || undefined,
          notes: notes.trim() || undefined,
          items: orderItems,
          total: finalTotal,
          paymentMethod,
          amountReceived: (paymentMethod === 'efectivo' || paymentMethod === 'mixto') && receivedNum > 0 ? receivedNum : undefined,
          change: (paymentMethod === 'efectivo' || paymentMethod === 'mixto') && receivedNum > 0 ? change : undefined,
          splitPayment: paymentMethod === 'mixto' ? { cash: cashPortion, card: cardPortion } : undefined,
          discount: discountObj,
          isOpenTab: false,
          closedAt: new Date().toISOString(),
        }
      : createNewOrder(
          nextOrderNumber,
          customerName,
          notes,
          orderItems,
          finalTotal,
          paymentMethod,
          (paymentMethod === 'efectivo' || paymentMethod === 'mixto') && receivedNum > 0 ? receivedNum : undefined,
          (paymentMethod === 'efectivo' || paymentMethod === 'mixto') && receivedNum > 0 ? change : undefined,
          paymentMethod === 'mixto' ? { cash: cashPortion, card: cardPortion } : undefined,
          discountObj
        );

    onCompleteOrder(completedOrder);
    onClose();
  };

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="nueva-orden-title"
      maxWidthClass="max-w-4xl"
      maxHeightClass="max-h-[94dvh] sm:max-h-[92dvh]"
    >
      {/* Modal Header */}
      <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/[0.08] bg-[#19191d] shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#e59b38]/15 border border-[#e59b38]/30 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#e59b38]" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="nueva-orden-title" className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                Nueva Orden (Para Llevar)
              </h2>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-[#e59b38]/20 text-[#e59b38] border border-[#e59b38]/30 shrink-0 tabular-nums">
                #{String(nextOrderNumber).padStart(3, '0')}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Selecciona los productos del menú y cobra la orden
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar nueva orden"
          className="w-11 h-11 sm:w-9 sm:h-9 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors shrink-0 touch-manipulation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main 2-Column POS Body (single natural flow on mobile, split scroll on lg+) */}
      <div className="flex-1 overflow-y-auto lg:overflow-hidden overscroll-contain grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
        
        {/* Left Column: Product Selection Grid */}
        <div className="lg:col-span-7 flex flex-col lg:overflow-hidden lg:h-full">
          
          {/* Category Filter Pills */}
          <div className="p-3 border-b border-white/[0.06] bg-[#17171a] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'sandwiches', label: 'Sándwiches' },
              { id: 'quesadillas', label: 'Quesadillas' },
              { id: 'steak-frites', label: 'Papas Lokas' },
              { id: 'fries', label: 'Papas c/ Queso' },
              { id: 'bebidas', label: 'Champurro' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`min-h-[44px] sm:min-h-[34px] px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-colors touch-manipulation ${
                  activeCategory === cat.id
                    ? 'bg-[#e59b38] text-black font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Products List */}
          <div className="flex-1 lg:overflow-y-auto lg:overscroll-contain p-3 sm:p-4 space-y-2">
            {filteredProducts.map((product) => {
              const inCartQty = cart[product.id] || 0;
              const stock = stockMap?.[product.id];
              const isExhausted = stock?.trackStock && stock.currentStock <= 0;
              const isMaxReached = stock?.trackStock && inCartQty >= stock.currentStock;

              return (
                <div
                  key={product.id}
                  className={`flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl border transition-all ${
                    inCartQty > 0
                      ? 'bg-[#e59b38]/10 border-[#e59b38]/40 shadow-sm'
                      : isExhausted
                      ? 'bg-neutral-900/60 border-white/[0.04] opacity-60'
                      : 'bg-[#18181c] border-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="font-semibold text-xs sm:text-sm text-white leading-snug flex flex-wrap items-center gap-1.5">
                      <span>{product.name}</span>
                      {stock?.trackStock && (
                        isExhausted ? (
                          <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">
                            Agotado
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-400 font-mono">
                            ({stock.currentStock} disp.)
                          </span>
                        )
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px]">
                      <span className="text-[#e59b38] font-medium">{product.variantLabel}</span>
                      <span className="font-mono text-white font-bold tabular-nums">${product.defaultPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    {inCartQty > 0 ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCustomizingProductId(customizingProductId === product.id ? null : product.id)}
                          aria-label={`Personalizar extras de ${product.name}`}
                          className={`min-w-[44px] min-h-[44px] sm:min-w-[34px] sm:min-h-[34px] rounded-lg border text-[10px] font-bold flex items-center justify-center transition-all touch-manipulation ${
                            (itemModifiers[product.id] && itemModifiers[product.id].length > 0) || itemInstructions[product.id] || customizingProductId === product.id
                              ? 'bg-[#e59b38] text-black border-[#e59b38]'
                              : 'bg-white/5 border-white/10 text-[#e59b38] hover:bg-white/10'
                          }`}
                          title="Agregar extras o notas de cocina"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(product.id)}
                          aria-label={`Quitar uno de ${product.name}`}
                          className="min-w-[44px] min-h-[44px] sm:min-w-[34px] sm:min-h-[34px] rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-95 transition-all touch-manipulation"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono font-bold text-sm text-[#e59b38] tabular-nums">
                          {inCartQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddItem(product.id)}
                          disabled={isMaxReached}
                          aria-label={`Agregar uno de ${product.name}`}
                          className={`min-w-[44px] min-h-[44px] sm:min-w-[34px] sm:min-h-[34px] rounded-lg flex items-center justify-center font-bold active:scale-95 transition-all shadow-sm touch-manipulation ${
                            isMaxReached
                              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                              : 'bg-[#e59b38] hover:bg-[#d48b28] text-black'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddItem(product.id)}
                        disabled={isExhausted}
                        className={`min-h-[44px] sm:min-h-[34px] flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95 touch-manipulation ${
                          isExhausted
                            ? 'bg-transparent border-white/5 text-neutral-600 cursor-not-allowed'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 text-[#e59b38]" />
                        <span>Agregar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Details & Checkout */}
        <div className="lg:col-span-5 flex flex-col lg:overflow-y-auto lg:overscroll-contain bg-[#161619] p-3.5 sm:p-5 space-y-4">
          
          {/* Optional Customer Name & Notes */}
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Nombre del Cliente
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ej. Juan"
                className="w-full min-h-[44px] sm:min-h-[36px] bg-[#1b1b20] border border-white/10 rounded-lg px-2.5 py-2 text-base sm:text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e59b38]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Nota de la Orden
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Sin cebolla"
                className="w-full min-h-[44px] sm:min-h-[36px] bg-[#1b1b20] border border-white/10 rounded-lg px-2.5 py-2 text-base sm:text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e59b38]"
              />
            </div>
          </div>

          {/* Items Summary in Cart */}
          <div className="space-y-2 border-t border-b border-white/[0.08] py-3 lg:flex-1 min-h-[90px]">
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              <span>Resumen de la Orden ({totalItemsCount} piezas)</span>
              {totalItemsCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="min-h-[36px] px-2 text-red-400 hover:text-red-300 text-[11px] flex items-center gap-1 touch-manipulation"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Vaciar</span>
                </button>
              )}
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center py-5 text-neutral-500 text-xs">
                Toca productos de la lista para agregarlos a la orden.
              </div>
            ) : (
              <div className="space-y-2 lg:max-h-[220px] lg:overflow-y-auto lg:pr-1">
                {orderItems.map((item) => {
                  const isCustomizing = customizingProductId === item.productId;
                  const prodCategory = products.find((p) => p.id === item.productId)?.category || 'all';
                  const applicableModifiers = STANDARD_MODIFIERS.filter(
                    (m) => m.category === 'all' || m.category === prodCategory
                  );

                  return (
                    <div
                      key={item.productId}
                      className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs space-y-2 transition-all"
                    >
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="font-bold mr-1 text-[#e59b38] tabular-nums">{item.quantity}x</span>
                          <span className="text-white font-medium">{item.productName}</span>
                          <span className="text-[10px] text-neutral-400 ml-1 tabular-nums">(${item.unitPrice.toFixed(2)})</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setCustomizingProductId(isCustomizing ? null : item.productId)}
                            className={`min-h-[36px] sm:min-h-[28px] px-2.5 py-1 rounded-md text-[11px] sm:text-[10px] font-bold flex items-center gap-1 border transition-all touch-manipulation ${
                              (item.modifiers && item.modifiers.length > 0) || item.instructions || isCustomizing
                                ? 'bg-[#e59b38]/20 text-[#e59b38] border-[#e59b38]/40'
                                : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Extras</span>
                            {isCustomizing ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                          <span className="font-mono font-bold text-white tabular-nums">${item.subtotal.toFixed(2)}</span>
                        </div>
                      </div>

                      {((item.modifiers && item.modifiers.length > 0) || item.instructions) && !isCustomizing && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          {item.modifiers?.map((mod, mIdx) => (
                            <span
                              key={mIdx}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e59b38]/15 text-[#e59b38] border border-[#e59b38]/25"
                            >
                              + {mod.name} (+${mod.price.toFixed(2)})
                            </span>
                          ))}
                          {item.instructions && (
                            <span className="text-[10px] font-semibold italic px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              * {item.instructions}
                            </span>
                          )}
                        </div>
                      )}

                      {isCustomizing && (
                        <div className="p-2.5 rounded-lg bg-[#111114] border border-white/[0.08] space-y-2.5 mt-1 animate-in fade-in">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                              Extras y Modificadores:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {applicableModifiers.map((mod) => {
                                const isSelected = item.modifiers?.some((m) => m.id === mod.id);
                                return (
                                  <button
                                    key={mod.id}
                                    type="button"
                                    onClick={() => handleToggleModifier(item.productId, mod)}
                                    className={`min-h-[38px] sm:min-h-[28px] px-2.5 py-1 rounded-md text-[11px] sm:text-[10px] font-semibold border flex items-center gap-1 transition-all touch-manipulation ${
                                      isSelected
                                        ? 'bg-[#e59b38] text-black border-[#e59b38] font-bold shadow-sm'
                                        : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white'
                                    }`}
                                  >
                                    <span>{mod.name}</span>
                                    {mod.price > 0 && <span className="opacity-80">+${mod.price.toFixed(0)}</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                              Indicaciones de Cocina:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {QUICK_INSTRUCTIONS.map((inst) => {
                                const isSelected = item.instructions === inst;
                                return (
                                  <button
                                    key={inst}
                                    type="button"
                                    onClick={() => handleToggleInstruction(item.productId, inst)}
                                    className={`min-h-[38px] sm:min-h-[28px] px-2.5 py-1 rounded-md text-[11px] sm:text-[10px] font-semibold border transition-all touch-manipulation ${
                                      isSelected
                                        ? 'bg-amber-400 text-black border-amber-400 font-bold'
                                        : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white'
                                    }`}
                                  >
                                    {inst}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setCustomizingProductId(null)}
                              className="min-h-[36px] sm:min-h-[28px] px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-[10px] font-bold uppercase tracking-wider touch-manipulation"
                            >
                              Listo
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Forma de Cobro
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'efectivo', label: 'Efectivo', icon: Banknote },
                { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
                { id: 'transferencia', label: 'Transf.', icon: Smartphone },
                { id: 'mixto', label: 'Mixto', icon: Split },
              ].map((m) => {
                const Icon = m.icon;
                const isActive = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`min-h-[44px] sm:min-h-[36px] flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold transition-all border touch-manipulation ${
                      isActive
                        ? 'bg-[#e59b38] text-black border-[#e59b38] font-bold shadow-sm'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split Payment Configuration */}
          {paymentMethod === 'mixto' && finalTotal > 0 && (
            <div className="space-y-2 bg-[#121215] p-3 rounded-xl border border-[#e59b38]/30 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#e59b38] font-bold uppercase tracking-wider">
                <span>Desglose de Cobro Mixto:</span>
                <span className="font-mono tabular-nums">${finalTotal.toFixed(2)} total</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Monto Efectivo ($)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max={finalTotal}
                    step="any"
                    placeholder={`Ej. ${Math.round(finalTotal / 2)}`}
                    value={splitCashInput}
                    onChange={(e) => setSplitCashInput(e.target.value)}
                    className="w-full min-h-[44px] sm:min-h-[36px] bg-[#1b1b20] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-base sm:text-xs focus:outline-none focus:border-[#e59b38]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Monto Tarjeta ($)</label>
                  <div className="w-full min-h-[44px] sm:min-h-[36px] flex items-center bg-[#18181d] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-[#e59b38] font-bold text-xs tabular-nums">
                    ${cardPortion.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Descuentos y Cortesías */}
          {foodSubtotal > 0 && (
            <div className="space-y-2 bg-[#121215] p-3 rounded-xl border border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-neutral-400 font-semibold uppercase">
                <div className="flex items-center gap-1 text-emerald-400">
                  <Tag className="w-3 h-3" />
                  <span>Descuento / Cortesía:</span>
                </div>
                {discountAmount > 0 && (
                  <span className="text-emerald-400 font-mono font-bold tabular-nums">
                    -${discountAmount.toFixed(2)} MXN
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 min-[420px]:grid-cols-6 gap-1.5">
                {[
                  { id: 0, label: '0%' },
                  { id: 10, label: '10%' },
                  { id: 15, label: '15%' },
                  { id: 20, label: '20%' },
                  { id: 'cortesia' as const, label: 'Cortesía' },
                  { id: 'fixed' as const, label: 'Monto $' },
                ].map((d) => {
                  const isActive = discountType === d.id;
                  return (
                    <button
                      key={String(d.id)}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setDiscountType(d.id);
                      }}
                      className={`min-h-[44px] sm:min-h-[32px] px-1 py-1.5 rounded-lg text-[11px] sm:text-[10px] font-bold transition-all touch-manipulation ${
                        isActive
                          ? 'bg-emerald-500 text-black shadow-sm font-extrabold'
                          : 'bg-white/5 hover:bg-white/10 text-neutral-400 border border-white/10'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              {discountType === 'fixed' && (
                <div className="pt-1 flex items-center gap-1.5">
                  <span className="text-xs text-neutral-400 font-mono">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max={foodSubtotal}
                    step="any"
                    placeholder={`Monto descuento (máx $${foodSubtotal})`}
                    value={customDiscount}
                    onChange={(e) => setCustomDiscount(e.target.value)}
                    className="w-full min-h-[44px] sm:min-h-[36px] bg-[#1b1b20] border border-white/10 rounded-lg px-2.5 py-1.5 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              )}
            </div>
          )}

          {/* Cash Payment Bill Helper */}
          {(paymentMethod === 'efectivo' || (paymentMethod === 'mixto' && cashPortion > 0)) && finalTotal > 0 && (
            <div className="space-y-2 bg-[#121215] p-3 rounded-xl border border-white/10 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-neutral-400 font-semibold uppercase">
                <span>
                  {paymentMethod === 'mixto'
                    ? `Paga los $${cashPortion.toFixed(2)} de efectivo con:`
                    : 'Paga con billete de:'}
                </span>
                {receivedNum > 0 && (
                  <span className="text-emerald-400 font-mono font-bold tabular-nums">
                    Cambio: ${change.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 min-[380px]:grid-cols-5 gap-1.5">
                {billetes.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setAmountReceived(b.toString())}
                    className="min-h-[44px] sm:min-h-[34px] py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 border border-emerald-500/20 text-emerald-400 font-mono text-xs sm:text-[11px] font-bold touch-manipulation"
                  >
                    ${b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Total and Submit Button */}
          <div className="pt-2">
            {discountAmount > 0 && (
              <div className="space-y-0.5 pb-2 mb-2 border-b border-white/[0.08] text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal Alimentos:</span>
                  <span className="font-mono text-white tabular-nums">${foodSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>(-) {discountObj?.label || 'Descuento'}:</span>
                  <span className="font-mono font-bold tabular-nums">-${discountAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-baseline mb-2.5">
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold">TOTAL:</span>
              <span className="font-serif text-2xl font-bold text-white tabular-nums">
                ${finalTotal.toFixed(2)} <span className="text-xs text-neutral-500 font-sans">MXN</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleComplete}
              disabled={orderItems.length === 0}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3 rounded-xl bg-[#e59b38] hover:bg-[#d48b28] disabled:opacity-30 disabled:pointer-events-none text-black font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg active:scale-98 touch-manipulation"
            >
              {discountType === 'cortesia' && finalTotal === 0 ? (
                <>
                  <Gift className="w-4 h-4" />
                  <span>Registrar Cortesía ($0.00)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cobrar Orden</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </ModalShell>
  );
};