'use client';

import React, { useState, useMemo, useRef, useSyncExternalStore, useCallback, useEffect } from 'react';
import { ProductItem, SaleRecord, ExpenseRecord, TimeframeFilter, PaymentMethod, CustomerOrder, ClosedShiftRecord, ProductStockConfig } from '@/types/accounting';
import { INITIAL_PRODUCTS, INITIAL_STOCK } from '@/data/initialProducts';
import {
  filterSalesByTimeframe,
  filterExpensesByTimeframe,
  getProductCountsByTimeframe,
  generateSampleSales,
  generateSampleExpenses,
  getDailyHourlyBreakdown,
  getWeeklyDailyBreakdown,
  getMonthlyWeeklyBreakdown,
  getProductPerformanceRanking,
} from '@/utils/accountingCalculations';
import { Navbar } from '@/components/Navbar';
import { MobileBottomDock } from '@/components/MobileBottomDock';
import { HeroBanner } from '@/components/HeroBanner';
import { KPICards } from '@/components/KPICards';
import { GranularTimeframeView } from '@/components/GranularTimeframeView';
import { ProductCard } from '@/components/ProductCard';
import { PriceManagerModal } from '@/components/PriceManagerModal';
import { SalesHistoryModal } from '@/components/SalesHistoryModal';
import { ZeroOutModal } from '@/components/ZeroOutModal';
import { CorteDeCajaModal } from '@/components/CorteDeCajaModal';
import { GastosModal } from '@/components/GastosModal';
import { CalculadoraCambioModal } from '@/components/CalculadoraCambioModal';
import { NuevaOrdenModal } from '@/components/NuevaOrdenModal';
import { TicketComandaModal } from '@/components/TicketComandaModal';
import { HistorialCortesModal } from '@/components/HistorialCortesModal';
import { AtajosTecladoModal } from '@/components/AtajosTecladoModal';
import { StockManagerModal } from '@/components/StockManagerModal';
import { HistorialComandasModal } from '@/components/HistorialComandasModal';
import { DailyGoalTracker } from '@/components/DailyGoalTracker';
import { playCashRegisterChime, isSoundEnabled, setSoundEnabled } from '@/utils/soundEffects';
import { CheckCircle2, RotateCcw, Banknote, CreditCard, Smartphone } from 'lucide-react';

const subscribe = () => () => {};

let cachedClientDate: Date | null = null;
const getClientDate = (): Date => {
  if (!cachedClientDate) {
    cachedClientDate = new Date();
  }
  return cachedClientDate;
};

export default function SalesCounterPage() {
  const isHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const currentDate = useMemo(() => {
    return isHydrated ? getClientDate() : undefined;
  }, [isHydrated]);

  // Sync products with Mexican Spanish texts while preserving user-configured prices/costs
  const [products, setProducts] = useState<ProductItem[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PRODUCTS;
    try {
      const saved = localStorage.getItem('philly_fry_products');
      if (!saved) return INITIAL_PRODUCTS;
      const parsed: ProductItem[] = JSON.parse(saved);
      return INITIAL_PRODUCTS.map((init) => {
        const found = parsed.find((p) => p.id === init.id);
        if (found) {
          return {
            ...init,
            defaultPrice: typeof found.defaultPrice === 'number' ? found.defaultPrice : init.defaultPrice,
            cost: typeof found.cost === 'number' ? found.cost : init.cost,
          };
        }
        return init;
      });
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('philly_fry_sales');
      if (saved !== null) return JSON.parse(saved);
      const sample = generateSampleSales(INITIAL_PRODUCTS);
      localStorage.setItem('philly_fry_sales', JSON.stringify(sample));
      return sample;
    } catch {
      return [];
    }
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('philly_fry_expenses');
      if (saved !== null) return JSON.parse(saved);
      const sample = generateSampleExpenses();
      localStorage.setItem('philly_fry_expenses', JSON.stringify(sample));
      return sample;
    } catch {
      return [];
    }
  });

  const [timeframe, setTimeframe] = useState<TimeframeFilter>('today');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isZeroOutModalOpen, setIsZeroOutModalOpen] = useState(false);
  const [isCorteModalOpen, setIsCorteModalOpen] = useState(false);
  const [isGastosModalOpen, setIsGastosModalOpen] = useState(false);
  const [isCalculadoraModalOpen, setIsCalculadoraModalOpen] = useState(false);
  const [isNuevaOrdenOpen, setIsNuevaOrdenOpen] = useState(false);
  const [isTicketComandaOpen, setIsTicketComandaOpen] = useState(false);
  const [activeTicketOrder, setActiveTicketOrder] = useState<CustomerOrder | null>(null);
  const [orderCounter, setOrderCounter] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    try {
      const saved = localStorage.getItem('philly_fry_order_counter');
      return saved !== null ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });
  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('philly_fry_orders');
      return saved !== null ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [startingCash, setStartingCash] = useState<number>(() => {
    if (typeof window === 'undefined') return 1000;
    try {
      const saved = localStorage.getItem('philly_fry_starting_cash');
      return saved !== null ? parseFloat(saved) : 1000;
    } catch {
      return 1000;
    }
  });
  const [closedShifts, setClosedShifts] = useState<ClosedShiftRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('philly_fry_closed_shifts');
      return saved !== null ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [shiftCounter, setShiftCounter] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    try {
      const saved = localStorage.getItem('philly_fry_shift_counter');
      return saved !== null ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });
  const [isHistorialCortesOpen, setIsHistorialCortesOpen] = useState(false);
  const [isAtajosModalOpen, setIsAtajosModalOpen] = useState(false);
  const [stockMap, setStockMap] = useState<Record<string, ProductStockConfig>>(() => {
    if (typeof window === 'undefined') return INITIAL_STOCK;
    try {
      const saved = localStorage.getItem('philly_fry_stock');
      if (!saved) return INITIAL_STOCK;
      const parsed = JSON.parse(saved);
      return { ...INITIAL_STOCK, ...parsed };
    } catch {
      return INITIAL_STOCK;
    }
  });
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isHistorialComandasOpen, setIsHistorialComandasOpen] = useState(false);
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    if (typeof window === 'undefined') return 8000;
    try {
      const saved = localStorage.getItem('philly_fry_daily_goal');
      return saved !== null ? parseFloat(saved) : 8000;
    } catch {
      return 8000;
    }
  });
  const [soundActive, setSoundActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return isSoundEnabled();
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) {
      playCashRegisterChime();
    }
    showToast(next ? '✓ Sonido de cobro activado.' : 'Sonido silenciado.');
  };

  const handleUpdateDailyGoal = (amount: number) => {
    setDailyGoal(amount);
    try {
      localStorage.setItem('philly_fry_daily_goal', amount.toString());
      showToast(`✓ Meta del turno fijada: $${amount.toLocaleString('es-MX')} MXN.`);
    } catch {}
  };

  const productsSectionRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((curr) => (curr === message ? null : curr));
    }, 3500);
  };

  const handleArchiveShift = (record: ClosedShiftRecord) => {
    const updated = [record, ...closedShifts];
    setClosedShifts(updated);
    try {
      localStorage.setItem('philly_fry_closed_shifts', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save closed shift', e);
    }
    setShiftCounter((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('philly_fry_shift_counter', next.toString());
      } catch {}
      return next;
    });
    showToast(`✓ Turno #${record.shiftNumber} archivado en el historial de cortes.`);
  };

  const handleClearShiftHistory = () => {
    setClosedShifts([]);
    try {
      localStorage.removeItem('philly_fry_closed_shifts');
    } catch {}
    showToast('✓ Historial de turnos limpiado.');
  };

  const handleUpdateStartingCash = (amount: number) => {
    setStartingCash(amount);
    try {
      localStorage.setItem('philly_fry_starting_cash', amount.toString());
      showToast(`✓ Fondo inicial de caja guardado: $${amount.toFixed(2)} MXN.`);
    } catch (e) {
      console.error('Failed to save starting cash', e);
    }
  };

  // Save changes to localStorage
  const handleSaveProducts = (updatedProducts: ProductItem[]) => {
    setProducts(updatedProducts);
    try {
      localStorage.setItem('philly_fry_products', JSON.stringify(updatedProducts));
      showToast('✓ Precios y costos guardados correctamente.');
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  };

  // On-the-fly individual product price edit from the card
  const handleUpdateProductPrice = (productId: string, newPrice: number) => {
    const updated = products.map((p) => (p.id === productId ? { ...p, defaultPrice: newPrice } : p));
    setProducts(updated);
    try {
      localStorage.setItem('philly_fry_products', JSON.stringify(updated));
      const target = updated.find((p) => p.id === productId);
      showToast(`✓ Precio de ${target?.name} actualizado a $${newPrice.toFixed(2)}.`);
    } catch (e) {
      console.error('Failed to save updated price', e);
    }
  };

  const handleSaveSales = (updatedSales: SaleRecord[]) => {
    setSales(updatedSales);
    try {
      localStorage.setItem('philly_fry_sales', JSON.stringify(updatedSales));
    } catch (e) {
      console.error('Failed to save sales to localStorage', e);
    }
  };

  const handleSaveStock = useCallback((updatedStock: Record<string, ProductStockConfig>) => {
    setStockMap(updatedStock);
    try {
      localStorage.setItem('philly_fry_stock', JSON.stringify(updatedStock));
    } catch (e) {
      console.error('Failed to save stock to localStorage', e);
    }
  }, []);

  const handleUpdateStockQuantity = (productId: string, newStock: number) => {
    const current = stockMap[productId] || INITIAL_STOCK[productId];
    if (!current) return;
    const updated = {
      ...stockMap,
      [productId]: { ...current, currentStock: newStock },
    };
    handleSaveStock(updated);
  };

  const handleAddStock = (productId: string, amount: number) => {
    const current = stockMap[productId] || INITIAL_STOCK[productId];
    if (!current) return;
    const updated = {
      ...stockMap,
      [productId]: { ...current, currentStock: current.currentStock + amount },
    };
    handleSaveStock(updated);
    const prod = products.find((p) => p.id === productId);
    showToast(`✓ +${amount} porciones agregadas a ${prod?.name || 'producto'}.`);
  };

  const handleToggleTrackStock = (productId: string) => {
    const current = stockMap[productId] || INITIAL_STOCK[productId];
    if (!current) return;
    const updated = {
      ...stockMap,
      [productId]: { ...current, trackStock: !current.trackStock },
    };
    handleSaveStock(updated);
  };

  const handleResetAllStock = useCallback(() => {
    handleSaveStock(INITIAL_STOCK);
    showToast('✓ Porciones de turno reiniciadas a valores de apertura.');
  }, [handleSaveStock]);

  // Increment product sales tally
  const handleIncrement = useCallback((productId: string, amount: number = 1) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    // Check available stock
    const currentStockConfig = stockMap[productId];
    if (currentStockConfig?.trackStock && currentStockConfig.currentStock <= 0) {
      showToast(`⚠ Agotado: No hay porciones disponibles de ${targetProduct.name}.`);
      return;
    }

    const newRecords: SaleRecord[] = [];
    const now = new Date().toISOString();

    for (let i = 0; i < amount; i++) {
      newRecords.push({
        id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${i}`,
        productId,
        timestamp: now,
        quantity: 1,
        unitPrice: targetProduct.defaultPrice,
        unitCost: targetProduct.cost,
        paymentMethod: selectedPaymentMethod,
      });
    }

    setSales((prevSales) => {
      const updated = [...newRecords, ...prevSales];
      try {
        localStorage.setItem('philly_fry_sales', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save sales to localStorage', e);
      }
      return updated;
    });

    playCashRegisterChime();

    // Deduct stock if tracked
    if (currentStockConfig?.trackStock) {
      setStockMap((prev) => {
        const prodStock = prev[productId];
        if (!prodStock) return prev;
        const next = {
          ...prev,
          [productId]: {
            ...prodStock,
            currentStock: Math.max(0, prodStock.currentStock - amount),
          },
        };
        try {
          localStorage.setItem('philly_fry_stock', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  }, [products, selectedPaymentMethod, stockMap]);

  // Update payment method of a past sale (from audit ledger)
  const handleUpdateSalePaymentMethod = (saleId: string, newMethod: PaymentMethod) => {
    const updated = sales.map((s) => (s.id === saleId ? { ...s, paymentMethod: newMethod } : s));
    handleSaveSales(updated);
    const methodNames: Record<PaymentMethod, string> = {
      efectivo: 'Efectivo',
      tarjeta: 'Tarjeta / Clip',
      transferencia: 'Transferencia SPEI',
    };
    showToast(`✓ Método de pago cambiado a ${methodNames[newMethod]}.`);
  };

  // Decrement: remove latest sale for this product
  const handleDecrement = (productId: string, amount: number = 1) => {
    let toRemove = amount;
    const updated = sales.filter((s) => {
      if (s.productId === productId && toRemove > 0) {
        toRemove--;
        return false;
      }
      return true;
    });

    handleSaveSales(updated);
  };

  // Delete specific sale record from audit log
  const handleDeleteSale = (saleId: string) => {
    const updated = sales.filter((s) => s.id !== saleId);
    handleSaveSales(updated);
  };

  // Expenses management
  const handleSaveExpenses = (updatedExpenses: ExpenseRecord[]) => {
    setExpenses(updatedExpenses);
    try {
      localStorage.setItem('philly_fry_expenses', JSON.stringify(updatedExpenses));
    } catch (e) {
      console.error('Failed to save expenses to localStorage', e);
    }
  };

  const handleAddExpense = (description: string, amount: number, category: string) => {
    const newRecord: ExpenseRecord = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      description,
      amount,
      category,
      timestamp: new Date().toISOString(),
    };
    const updated = [newRecord, ...expenses];
    handleSaveExpenses(updated);
    showToast(`✓ Salida de efectivo registrada: $${amount.toFixed(2)} (${description}).`);
  };

  const handleDeleteExpense = (expenseId: string) => {
    const updated = expenses.filter((e) => e.id !== expenseId);
    handleSaveExpenses(updated);
    showToast('✓ Gasto eliminado de la contabilidad.');
  };

  // Complete Customer Order (Comanda)
  const handleCompleteOrder = (order: CustomerOrder) => {
    const newSales: SaleRecord[] = [];
    const now = new Date().toISOString();
    for (const item of order.items) {
      for (let i = 0; i < item.quantity; i++) {
        newSales.push({
          id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${item.productId}-${i}`,
          productId: item.productId,
          timestamp: now,
          quantity: 1,
          unitPrice: item.unitPrice,
          unitCost: item.unitCost,
          paymentMethod: order.paymentMethod,
          orderId: order.id,
          orderNumber: order.orderNumber,
        });
      }
    }
    const updated = [...newSales, ...sales];
    handleSaveSales(updated);
    setOrders((prev) => {
      const nextOrders = [order, ...prev];
      try {
        localStorage.setItem('philly_fry_orders', JSON.stringify(nextOrders));
      } catch (e) {
        console.error('Failed to save orders to localStorage', e);
      }
      return nextOrders;
    });

    // Deduct stock for items in this comanda
    setStockMap((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const item of order.items) {
        const prodStock = next[item.productId];
        if (prodStock && prodStock.trackStock) {
          next[item.productId] = {
            ...prodStock,
            currentStock: Math.max(0, prodStock.currentStock - item.quantity),
          };
          changed = true;
        }
      }
      if (changed) {
        try {
          localStorage.setItem('philly_fry_stock', JSON.stringify(next));
        } catch {}
      }
      return changed ? next : prev;
    });

    setOrderCounter((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('philly_fry_order_counter', next.toString());
      } catch {}
      return next;
    });
    setActiveTicketOrder(order);
    setIsTicketComandaOpen(true);
    playCashRegisterChime();
    showToast(`✓ Comanda #${order.orderNumber} registrada ($${order.total.toFixed(2)} MXN).`);
  };

  // ZERO OUT THE WHOLE ACCOUNTING
  const handleConfirmZeroOut = () => {
    handleSaveSales([]);
    handleSaveExpenses([]);
    setOrders([]);
    try {
      localStorage.removeItem('philly_fry_orders');
    } catch {}
    setOrderCounter(1);
    try {
      localStorage.setItem('philly_fry_order_counter', '1');
    } catch {}
    handleResetAllStock();
    showToast('✓ Contabilidad reiniciada en ceros exitosamente.');
  };

  // Load sample demo shift
  const handleLoadSample = () => {
    const sample = generateSampleSales(products, new Date());
    handleSaveSales(sample);
    const sampleExp = generateSampleExpenses(new Date());
    handleSaveExpenses(sampleExp);
    showToast('✓ Datos de prueba cargados en el sistema.');
  };

  // Keyboard Shortcuts (Hotkeys) for Fast Counter Service
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName || '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag)) return;

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setIsAtajosModalOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setIsPriceModalOpen(false);
        setIsHistoryModalOpen(false);
        setIsZeroOutModalOpen(false);
        setIsCorteModalOpen(false);
        setIsGastosModalOpen(false);
        setIsCalculadoraModalOpen(false);
        setIsNuevaOrdenOpen(false);
        setIsTicketComandaOpen(false);
        setIsHistorialCortesOpen(false);
        setIsAtajosModalOpen(false);
        setIsStockModalOpen(false);
        setIsHistorialComandasOpen(false);
        return;
      }

      const isAnyModalOpen =
        isPriceModalOpen ||
        isHistoryModalOpen ||
        isZeroOutModalOpen ||
        isCorteModalOpen ||
        isGastosModalOpen ||
        isCalculadoraModalOpen ||
        isNuevaOrdenOpen ||
        isTicketComandaOpen ||
        isHistorialCortesOpen ||
        isAtajosModalOpen ||
        isStockModalOpen ||
        isHistorialComandasOpen;

      if (isAnyModalOpen) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= products.length) {
        e.preventDefault();
        const targetProd = products[num - 1];
        if (targetProd) {
          handleIncrement(targetProd.id, 1);
          showToast(`+1 ${targetProd.name} (${targetProd.variantLabel})`);
        }
        return;
      }

      if (e.key === ' ' || e.key.toLowerCase() === 'o' || e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNuevaOrdenOpen(true);
        return;
      }

      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsHistorialComandasOpen(true);
        return;
      }

      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsStockModalOpen(true);
        return;
      }

      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsCorteModalOpen(true);
        return;
      }

      if (e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setIsGastosModalOpen(true);
        return;
      }

      if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCalculadoraModalOpen(true);
        return;
      }

      if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsHistoryModalOpen(true);
        return;
      }

      if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsHistorialCortesOpen(true);
        return;
      }

      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPriceModalOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    products,
    handleIncrement,
    isPriceModalOpen,
    isHistoryModalOpen,
    isZeroOutModalOpen,
    isCorteModalOpen,
    isGastosModalOpen,
    isCalculadoraModalOpen,
    isNuevaOrdenOpen,
    isTicketComandaOpen,
    isHistorialCortesOpen,
    isAtajosModalOpen,
    isStockModalOpen,
    isHistorialComandasOpen,
  ]);

  // Filter sales for the selected timeframe
  const filteredSales = useMemo(() => {
    if (!currentDate) return [];
    return filterSalesByTimeframe(sales, timeframe, currentDate);
  }, [sales, timeframe, currentDate]);

  // Filter expenses for the selected timeframe
  const filteredExpenses = useMemo(() => {
    if (!currentDate) return [];
    return filterExpensesByTimeframe(expenses, timeframe, currentDate);
  }, [expenses, timeframe, currentDate]);

  const totalExpensesInTimeframe = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredExpenses]);

  // Filter orders for the selected timeframe (used for tip aggregation)
  const filteredOrders = useMemo(() => {
    if (!currentDate) return orders;
    return orders.filter((o) => {
      const orderDate = new Date(o.timestamp);
      if (isNaN(orderDate.getTime())) return false;
      switch (timeframe) {
        case 'today':
          return (
            orderDate.getFullYear() === currentDate.getFullYear() &&
            orderDate.getMonth() === currentDate.getMonth() &&
            orderDate.getDate() === currentDate.getDate()
          );
        case 'week': {
          const start = new Date(currentDate);
          start.setDate(currentDate.getDate() - 6);
          start.setHours(0, 0, 0, 0);
          const end = new Date(currentDate);
          end.setHours(23, 59, 59, 999);
          return orderDate >= start && orderDate <= end;
        }
        case 'month':
          return (
            orderDate.getFullYear() === currentDate.getFullYear() &&
            orderDate.getMonth() === currentDate.getMonth()
          );
        case 'all':
        default:
          return true;
      }
    });
  }, [orders, timeframe, currentDate]);

  const totalTipsInTimeframe = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.tip || 0), 0);
  }, [filteredOrders]);

  const lowStockCount = useMemo(() => {
    return Object.values(stockMap).filter((item) => {
      return item.trackStock && item.currentStock <= item.lowStockThreshold;
    }).length;
  }, [stockMap]);

  // Overall counts for Today (used in Hero banner and Daily Granular view)
  const todaySales = useMemo(() => {
    if (!currentDate) return [];
    return filterSalesByTimeframe(sales, 'today', currentDate);
  }, [sales, currentDate]);

  // Overall counts for Week (used in Weekly Granular view)
  const weekSales = useMemo(() => {
    if (!currentDate) return [];
    return filterSalesByTimeframe(sales, 'week', currentDate);
  }, [sales, currentDate]);

  // Overall counts for Month (used in Monthly Granular view)
  const monthSales = useMemo(() => {
    if (!currentDate) return [];
    return filterSalesByTimeframe(sales, 'month', currentDate);
  }, [sales, currentDate]);

  const todayCount = useMemo(() => {
    return todaySales.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [todaySales]);

  const todayRevenue = useMemo(() => {
    return todaySales.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
  }, [todaySales]);

  const totalUnitsInTimeframe = useMemo(() => {
    return filteredSales.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [filteredSales]);

  // Granular computations
  const hourlyBlocks = useMemo(() => {
    return getDailyHourlyBreakdown(todaySales);
  }, [todaySales]);

  const dailyStats = useMemo(() => {
    return getWeeklyDailyBreakdown(weekSales, currentDate);
  }, [weekSales, currentDate]);

  const monthlyWeekStats = useMemo(() => {
    return getMonthlyWeeklyBreakdown(monthSales, currentDate);
  }, [monthSales, currentDate]);

  const productRanking = useMemo(() => {
    return getProductPerformanceRanking(monthSales, products);
  }, [monthSales, products]);

  // Map product counts (Today, Week, Month, All)
  const productCountMap = useMemo(() => {
    const map: Record<string, { today: number; week: number; month: number; all: number }> = {};
    for (const prod of products) {
      map[prod.id] = getProductCountsByTimeframe(prod.id, sales, currentDate);
    }
    return map;
  }, [products, sales, currentDate]);

  // Filtered products by category pill
  const filteredProducts = useMemo(() => {
    if (activeCategoryFilter === 'all') return products;
    return products.filter((p) => p.category === activeCategoryFilter);
  }, [products, activeCategoryFilter]);

  const scrollToProducts = () => {
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] flex flex-col items-center justify-center text-neutral-400 font-sans space-y-3">
        <div className="w-6 h-6 border-2 border-[#e59b38] border-t-transparent rounded-full animate-spin" />
        <span className="font-serif tracking-widest uppercase text-xs text-neutral-300">
          Philly & Fry • Mostrador de Ventas
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0f] text-[#f5f0eb]">
      {/* Toast Alert Feedback - Mobile centered / Desktop top-right */}
      {toastMessage && (
        <div className="fixed top-16 inset-x-4 sm:inset-x-auto sm:right-6 sm:top-24 max-w-sm mx-auto z-50 flex items-center gap-2.5 bg-[#19191d] border border-[#e59b38]/50 text-white px-4 py-3 rounded-xl shadow-2xl animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-[#e59b38] shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onOpenPriceManager={() => setIsPriceModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenZeroOut={() => setIsZeroOutModalOpen(true)}
        onOpenCorte={() => setIsCorteModalOpen(true)}
        onOpenGastos={() => setIsGastosModalOpen(true)}
        onOpenCalculadora={() => setIsCalculadoraModalOpen(true)}
        onOpenNuevaOrden={() => setIsNuevaOrdenOpen(true)}
        onOpenHistorialCortes={() => setIsHistorialCortesOpen(true)}
        onOpenAtajos={() => setIsAtajosModalOpen(true)}
        onOpenStockManager={() => setIsStockModalOpen(true)}
        onOpenHistorialComandas={() => setIsHistorialComandasOpen(true)}
        lowStockCount={lowStockCount}
        totalUnitsInTimeframe={totalUnitsInTimeframe}
        soundEnabled={soundActive}
        onToggleSound={handleToggleSound}
      />

      {/* Hero Banner */}
      <HeroBanner
        timeframe={timeframe}
        onScrollToProducts={scrollToProducts}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenZeroOut={() => setIsZeroOutModalOpen(true)}
        todayCount={todayCount}
        todayRevenue={todayRevenue}
      />

      {/* Main Content Area */}
      <main className="flex-1 bg-vertical-grid py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
          
          {/* Section 1: KPI & Aggregate Performance Overview */}
          <KPICards
            timeframe={timeframe}
            sales={filteredSales}
            products={products}
            totalExpenses={totalExpensesInTimeframe}
            startingCash={startingCash}
            onLoadSample={handleLoadSample}
            onOpenZeroOut={() => setIsZeroOutModalOpen(true)}
            onOpenGastos={() => setIsGastosModalOpen(true)}
            onOpenCalculadora={() => setIsCalculadoraModalOpen(true)}
            onOpenCorte={() => setIsCorteModalOpen(true)}
          />

          {/* Daily Sales Target Goal Progress Bar */}
          <DailyGoalTracker
            currentRevenue={todayRevenue}
            goalAmount={dailyGoal}
            onUpdateGoal={handleUpdateDailyGoal}
          />

          {/* Section 2: Dedicated Granular Timeframe View (Day / Week / Month / Total) */}
          <GranularTimeframeView
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            sales={filteredSales}
            hourlyBlocks={hourlyBlocks}
            dailyStats={dailyStats}
            monthlyWeekStats={monthlyWeekStats}
            productRanking={productRanking}
          />

          {/* Section 3: Products & Sales Counter Grid */}
          <div ref={productsSectionRef} className="pt-2 sm:pt-6 space-y-4 sm:space-y-6">
            
            {/* Header with Category Filter Chips and Active Payment Selector */}
            <div className="flex flex-col gap-3 sm:gap-4 border-b border-white/[0.08] pb-3 sm:pb-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
                <div>
                  <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#e59b38]">
                    Registro Rápido al Mostrador
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white mt-0.5 sm:mt-1">
                    Mostrador de Ventas y Comandas
                  </h2>
                  <p className="text-[11px] sm:text-xs text-neutral-400 mt-1">
                    Toca <span className="text-[#e59b38] font-bold">+1 Venta</span> para registrar pedidos al vuelo. Toca el <span className="text-white underline decoration-[#e59b38] underline-offset-2">precio en la tarjeta</span> para ajustarlo.
                  </p>
                </div>

                {/* Forma de Cobro Activa (Payment Mode Switcher) */}
                <div className="flex items-center gap-1.5 bg-[#17171a] p-1.5 rounded-xl border border-white/[0.08] self-start sm:self-auto overflow-x-auto no-scrollbar">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 px-2 tracking-wider shrink-0">
                    Cobro:
                  </span>
                  {[
                    { id: 'efectivo', label: 'Efectivo', icon: Banknote, color: 'text-emerald-400', activeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
                    { id: 'tarjeta', label: 'Tarjeta / Clip', icon: CreditCard, color: 'text-cyan-400', activeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
                    { id: 'transferencia', label: 'Transferencia', icon: Smartphone, color: 'text-violet-400', activeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isActive = selectedPaymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(m.id as PaymentMethod)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all touch-manipulation select-none active:scale-95 border ${
                          isActive
                            ? `${m.activeBg} font-bold shadow-sm`
                            : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? '' : m.color}`} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Filter Pills in Mexican Spanish - Mobile Swipeable */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 bg-[#17171a] p-1.5 rounded-xl border border-white/[0.06] overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'sandwiches', label: 'Sándwiches' },
                    { id: 'quesadillas', label: 'Quesadillas' },
                    { id: 'steak-frites', label: 'Steak Frites' },
                    { id: 'fries', label: 'Papas y Queso' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium whitespace-nowrap shrink-0 touch-manipulation select-none active:scale-95 ${
                        activeCategoryFilter === cat.id
                          ? 'bg-[#e59b38] text-black font-semibold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="hidden md:flex items-center gap-1.5 text-[11px] text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Cobrando en: <strong className="text-white capitalize">{selectedPaymentMethod}</strong></span>
                </div>
              </div>
            </div>

            {/* Product Cards Grid with On-The-Fly Price Editing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
              {filteredProducts.map((product) => {
                const counts = productCountMap[product.id] || { today: 0, week: 0, month: 0, all: 0 };
                const shortcutIndex = products.findIndex((p) => p.id === product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    counts={counts}
                    timeframe={timeframe}
                    shortcutKey={shortcutIndex !== -1 && shortcutIndex < 9 ? String(shortcutIndex + 1) : undefined}
                    stockConfig={stockMap[product.id]}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                    onUpdatePrice={handleUpdateProductPrice}
                  />
                );
              })}
            </div>

          </div>

          {/* Section 4: Summary Breakdown by Menu Category */}
          <div className="mt-8 sm:mt-12 rounded-2xl bg-[#141417] border border-white/[0.08] p-3.5 sm:p-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-3 gap-2">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-white leading-tight">
                  Desglose por Categoría ({timeframe === 'today' ? 'HOY' : timeframe === 'week' ? 'ESTA SEMANA' : timeframe === 'month' ? 'ESTE MES' : 'HISTÓRICO'})
                </h3>
                <span className="text-[11px] sm:text-xs text-neutral-400">
                  Volumen e ingresos acumulados en este periodo
                </span>
              </div>
              <span className="text-xs text-[#e59b38] font-mono font-bold bg-[#e59b38]/10 px-2.5 py-0.5 rounded-full border border-[#e59b38]/20 self-start sm:self-auto">
                {totalUnitsInTimeframe} piezas totales
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 pt-1 sm:pt-2">
              {[
                { label: 'Sándwiches Philly', cat: 'sandwiches', desc: 'Sencillo y combo' },
                { label: 'Quesadillas', cat: 'quesadillas', desc: 'Sencilla y combo' },
                { label: 'Steak Frites', cat: 'steak-frites', desc: 'Carne y papas' },
                { label: 'Papas Gourmet', cat: 'fries', desc: 'Clásicas y queso' },
              ].map((categoryItem) => {
                const catProducts = products.filter((p) => p.category === categoryItem.cat);
                const catSales = filteredSales.filter((s) => catProducts.some((p) => p.id === s.productId));
                const catUnits = catSales.reduce((sum, s) => sum + s.quantity, 0);
                const catRevenue = catSales.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
                const percentage = totalUnitsInTimeframe > 0 ? Math.round((catUnits / totalUnitsInTimeframe) * 100) : 0;

                return (
                  <div key={categoryItem.cat} className="p-3 sm:p-4 rounded-xl bg-black/30 border border-white/[0.04] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-white leading-tight truncate">{categoryItem.label}</div>
                          <div className="text-[10px] text-neutral-400 truncate">{categoryItem.desc}</div>
                        </div>
                        <span className="font-mono text-[10px] sm:text-xs font-bold text-[#e59b38] bg-[#e59b38]/10 px-1.5 py-0.5 rounded-full border border-[#e59b38]/20 shrink-0">
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 sm:mt-3">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className="font-serif text-lg sm:text-2xl font-bold text-white">{catUnits}</span>
                          <span className="text-[9px] text-neutral-500 font-mono">piezas</span>
                        </div>
                        <span className="text-[11px] sm:text-xs font-mono text-neutral-300 font-semibold">
                          ${catRevenue.toFixed(0)}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-1.5 w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#e59b38] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      {/* Footer in Mexican Spanish */}
      <footer className="border-t border-white/[0.08] bg-[#0d0d0f] py-8 pb-28 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-widest uppercase text-white font-sans text-sm">
              PHILLY & FRY
            </span>
            <span>•</span>
            <span>Mostrador de Ventas y Contabilidad de Restaurante</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsPriceModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Configurar Precios y Costos
            </button>
            <span>•</span>
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Exportar Registro en CSV
            </button>
            <span>•</span>
            <button
              onClick={() => setIsCorteModalOpen(true)}
              className="text-[#e59b38] hover:text-[#d48b28] flex items-center gap-1 transition-colors"
            >
              <span>Ticket de Corte</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsZeroOutModalOpen(true)}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Poner en Ceros</span>
            </button>
            <span>•</span>
            <button
              onClick={handleLoadSample}
              className="hover:text-[#e59b38] transition-colors"
            >
              Recargar Datos de Muestra
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Dock */}
      <MobileBottomDock
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onOpenPriceManager={() => setIsPriceModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenZeroOut={() => setIsZeroOutModalOpen(true)}
        onOpenCorte={() => setIsCorteModalOpen(true)}
        onOpenGastos={() => setIsGastosModalOpen(true)}
        onOpenCalculadora={() => setIsCalculadoraModalOpen(true)}
        onOpenNuevaOrden={() => setIsNuevaOrdenOpen(true)}
        onOpenHistorialCortes={() => setIsHistorialCortesOpen(true)}
        onOpenAtajos={() => setIsAtajosModalOpen(true)}
        onOpenStockManager={() => setIsStockModalOpen(true)}
        onOpenHistorialComandas={() => setIsHistorialComandasOpen(true)}
        lowStockCount={lowStockCount}
        totalUnitsInTimeframe={totalUnitsInTimeframe}
        soundEnabled={soundActive}
        onToggleSound={handleToggleSound}
      />

      {/* Pricing and Cost Management Modal */}
      <PriceManagerModal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        products={products}
        onSaveProducts={handleSaveProducts}
      />

      {/* Sales History and Audit Ledger Modal */}
      <SalesHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        sales={filteredSales}
        products={products}
        timeframe={timeframe}
        onDeleteSale={handleDeleteSale}
        onUpdatePaymentMethod={handleUpdateSalePaymentMethod}
        onOpenZeroOut={() => setIsZeroOutModalOpen(true)}
      />

      {/* 0 Out Accounting Confirmation Modal */}
      <ZeroOutModal
        isOpen={isZeroOutModalOpen}
        onClose={() => setIsZeroOutModalOpen(false)}
        onConfirmZeroOut={handleConfirmZeroOut}
        sales={sales}
        products={products}
      />

      {/* Corte de Caja / Receipt Modal */}
      <CorteDeCajaModal
        isOpen={isCorteModalOpen}
        onClose={() => setIsCorteModalOpen(false)}
        sales={filteredSales}
        products={products}
        expenses={filteredExpenses}
        timeframe={timeframe}
        hourlyBlocks={hourlyBlocks}
        startingCash={startingCash}
        onUpdateStartingCash={handleUpdateStartingCash}
        onArchiveShift={handleArchiveShift}
        shiftCounter={shiftCounter}
        totalTipsCollected={totalTipsInTimeframe}
        onConfirmZeroOut={() => {
          setIsCorteModalOpen(false);
          setIsZeroOutModalOpen(true);
        }}
      />

      {/* Historial de Turnos y Cortes Anteriores Modal */}
      <HistorialCortesModal
        isOpen={isHistorialCortesOpen}
        onClose={() => setIsHistorialCortesOpen(false)}
        shifts={closedShifts}
        onClearHistory={handleClearShiftHistory}
      />

      {/* Gastos Menores y Salidas de Caja Modal */}
      <GastosModal
        isOpen={isGastosModalOpen}
        onClose={() => setIsGastosModalOpen(false)}
        expenses={filteredExpenses}
        timeframe={timeframe}
        onAddExpense={handleAddExpense}
        onDeleteExpense={handleDeleteExpense}
      />

      {/* Calculadora de Cambio Modal */}
      <CalculadoraCambioModal
        isOpen={isCalculadoraModalOpen}
        onClose={() => setIsCalculadoraModalOpen(false)}
      />

      {/* Armador de Comanda / Nueva Orden Modal */}
      <NuevaOrdenModal
        isOpen={isNuevaOrdenOpen}
        onClose={() => setIsNuevaOrdenOpen(false)}
        products={products}
        nextOrderNumber={orderCounter}
        stockMap={stockMap}
        onCompleteOrder={handleCompleteOrder}
      />

      {/* Ticket de Comanda / Nota de Consumo Modal */}
      <TicketComandaModal
        isOpen={isTicketComandaOpen}
        onClose={() => setIsTicketComandaOpen(false)}
        order={activeTicketOrder}
        onNewOrder={() => setIsNuevaOrdenOpen(true)}
      />

      {/* Control de Stock y Porciones Modal */}
      <StockManagerModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        products={products}
        stockMap={stockMap}
        onUpdateStock={handleUpdateStockQuantity}
        onAddStock={handleAddStock}
        onToggleTrackStock={handleToggleTrackStock}
        onResetAllStock={handleResetAllStock}
      />

      {/* Historial y Reimpresión de Comandas Modal */}
      <HistorialComandasModal
        isOpen={isHistorialComandasOpen}
        onClose={() => setIsHistorialComandasOpen(false)}
        orders={orders}
      />

      {/* Atajos de Teclado POS Guía Modal */}
      <AtajosTecladoModal
        isOpen={isAtajosModalOpen}
        onClose={() => setIsAtajosModalOpen(false)}
        products={products}
      />
    </div>
  );
}
