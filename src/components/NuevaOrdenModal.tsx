'use client';

import React, { useState } from 'react';
import { ProductItem, PaymentMethod, CustomerOrder, CustomerOrderItem } from '@/types/accounting';
import { triggerHaptic } from '@/utils/haptics';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Utensils,
  Package,
  Banknote,
  CreditCard,
  Smartphone,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface NuevaOrdenModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  nextOrderNumber: number;
  onCompleteOrder: (order: CustomerOrder) => void;
}

function createNewOrder(
  nextOrderNumber: number,
  orderType: 'aqui' | 'llevar',
  customerName: string,
  notes: string,
  items: CustomerOrderItem[],
  total: number,
  paymentMethod: PaymentMethod,
  amountReceived?: number,
  change?: number
): CustomerOrder {
  return {
    id: `order-${nextOrderNumber}-${Date.now()}`,
    orderNumber: nextOrderNumber,
    timestamp: new Date().toISOString(),
    orderType,
    customerName: customerName.trim() || undefined,
    notes: notes.trim() || undefined,
    items,
    total,
    paymentMethod,
    amountReceived,
    change,
  };
}

export const NuevaOrdenModal: React.FC<NuevaOrdenModalProps> = ({
  isOpen,
  onClose,
  products,
  nextOrderNumber,
  onCompleteOrder,
}) => {
  const [orderType, setOrderType] = useState<'aqui' | 'llevar'>('llevar');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [amountReceived, setAmountReceived] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const handleAddItem = (productId: string) => {
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
  };

  // Compute order items
  const orderItems: CustomerOrderItem[] = Object.entries(cart)
    .map(([productId, quantity]) => {
      const prod = products.find((p) => p.id === productId);
      if (!prod || quantity <= 0) return null;
      return {
        productId,
        productName: prod.name,
        variantLabel: prod.variantLabel,
        quantity,
        unitPrice: prod.defaultPrice,
        unitCost: prod.cost,
        subtotal: quantity * prod.defaultPrice,
      };
    })
    .filter((item): item is CustomerOrderItem => item !== null);

  const totalItemsCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  const receivedNum = parseFloat(amountReceived) || 0;
  const change = paymentMethod === 'efectivo' && receivedNum > 0 ? Math.max(0, receivedNum - totalAmount) : 0;

  const billetes = [50, 100, 200, 500, 1000];

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) return;

    triggerHaptic('success');

    const newOrder = createNewOrder(
      nextOrderNumber,
      orderType,
      customerName,
      notes,
      orderItems,
      totalAmount,
      paymentMethod,
      paymentMethod === 'efectivo' && receivedNum > 0 ? receivedNum : undefined,
      paymentMethod === 'efectivo' && receivedNum > 0 ? change : undefined
    );

    onCompleteOrder(newOrder);
    onClose();
  };

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#141417] border border-white/[0.12] shadow-2xl overflow-hidden pb-safe sm:pb-0">
        
        {/* Mobile handle indicator */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#19191d] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#e59b38]/15 border border-[#e59b38]/30 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#e59b38]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Armar Comanda / Nueva Orden
                </h2>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-[#e59b38]/20 text-[#e59b38] border border-[#e59b38]/30">
                  #{String(nextOrderNumber).padStart(3, '0')}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Selecciona los productos y cobra la comanda completa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main 2-Column POS Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
          
          {/* Left Column: Product Selection Grid (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden max-h-[45vh] lg:max-h-[70vh]">
            
            {/* Category Filter Pills */}
            <div className="p-3 border-b border-white/[0.06] bg-[#17171a] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'sandwiches', label: 'Sándwiches' },
                { id: 'quesadillas', label: 'Quesadillas' },
                { id: 'steak-frites', label: 'Steak Frites' },
                { id: 'fries', label: 'Papas y Queso' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-colors touch-manipulation ${
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
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
              {filteredProducts.map((product) => {
                const inCartQty = cart[product.id] || 0;
                return (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${
                      inCartQty > 0
                        ? 'bg-[#e59b38]/10 border-[#e59b38]/40 shadow-sm'
                        : 'bg-[#18181c] border-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <div className="flex-1 pr-2">
                      <div className="font-semibold text-xs sm:text-sm text-white leading-tight">
                        {product.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                        <span className="text-[#e59b38] font-medium">{product.variantLabel}</span>
                        <span className="font-mono text-white font-bold">${product.defaultPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {inCartQty > 0 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(product.id)}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-95 transition-all"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-mono font-bold text-sm text-[#e59b38]">
                            {inCartQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddItem(product.id)}
                            className="w-8 h-8 rounded-lg bg-[#e59b38] hover:bg-[#d48b28] flex items-center justify-center text-black font-bold active:scale-95 transition-all shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddItem(product.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-all active:scale-95"
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

          {/* Right Column: Order Details & Checkout (5 cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col overflow-y-auto max-h-[50vh] lg:max-h-[70vh] bg-[#161619] p-3.5 sm:p-5 space-y-4">
            
            {/* Order Type Toggle: Comer Aquí vs Para Llevar */}
            <div className="grid grid-cols-2 gap-2 bg-[#121215] p-1 rounded-xl border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setOrderType('llevar')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  orderType === 'llevar'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Para Llevar</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('aqui')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  orderType === 'aqui'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Comer Aquí</span>
              </button>
            </div>

            {/* Optional Customer Name & Notes */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Cliente / Mesa
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej. Juan / Mesa 3"
                  className="w-full bg-[#1b1b20] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e59b38]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Nota / Cocina
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Sin cebolla"
                  className="w-full bg-[#1b1b20] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e59b38]"
                />
              </div>
            </div>

            {/* Items Summary in Cart */}
            <div className="space-y-1.5 border-t border-b border-white/[0.08] py-2.5 flex-1 min-h-[90px]">
              <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <span>Resumen de Comanda ({totalItemsCount} piezas)</span>
                {totalItemsCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="text-red-400 hover:text-red-300 text-[10px] flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Vaciar</span>
                  </button>
                )}
              </div>

              {orderItems.length === 0 ? (
                <div className="text-center py-6 text-neutral-500 text-xs">
                  Toca productos a la izquierda para agregarlos a la comanda.
                </div>
              ) : (
                <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                  {orderItems.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center text-xs py-0.5">
                      <div className="truncate max-w-[65%]">
                        <span className="font-bold mr-1 text-[#e59b38]">{item.quantity}x</span>
                        <span className="text-white">{item.productName}</span>
                      </div>
                      <span className="font-mono font-bold text-white">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Forma de Cobro
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'efectivo', label: 'Efectivo', icon: Banknote },
                  { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
                  { id: 'transferencia', label: 'Transf.', icon: Smartphone },
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        isActive
                          ? 'bg-[#e59b38] text-black border-[#e59b38] font-bold shadow-sm'
                          : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Payment Bill Helper */}
            {paymentMethod === 'efectivo' && totalAmount > 0 && (
              <div className="space-y-1.5 bg-[#121215] p-2.5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between text-[10px] text-neutral-400 font-semibold uppercase">
                  <span>Paga con billete de:</span>
                  {receivedNum > 0 && (
                    <span className="text-emerald-400 font-mono font-bold">
                      Cambio: ${change.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {billetes.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setAmountReceived(b.toString())}
                      className="py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold"
                    >
                      ${b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Total and Submit Button */}
            <div className="pt-2">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold">TOTAL:</span>
                <span className="font-serif text-2xl font-bold text-white">
                  ${totalAmount.toFixed(2)} <span className="text-xs text-neutral-500 font-sans">MXN</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleComplete}
                disabled={totalAmount <= 0}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#e59b38] hover:bg-[#d48b28] disabled:opacity-30 disabled:pointer-events-none text-black font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg active:scale-98 touch-manipulation"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Cobrar y Generar Comanda</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
