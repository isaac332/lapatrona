'use client';

import React, { useState, useMemo, useRef, useSyncExternalStore } from 'react';
import { ProductItem, SaleRecord, TimeframeFilter } from '@/types/accounting';
import { INITIAL_PRODUCTS } from '@/data/initialProducts';
import {
  filterSalesByTimeframe,
  getProductCountsByTimeframe,
  generateSampleSales,
  getDailyHourlyBreakdown,
  getWeeklyDailyBreakdown,
  getMonthlyWeeklyBreakdown,
  getProductPerformanceRanking,
} from '@/utils/accountingCalculations';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { KPICards } from '@/components/KPICards';
import { GranularTimeframeView } from '@/components/GranularTimeframeView';
import { ProductCard } from '@/components/ProductCard';
import { PriceManagerModal } from '@/components/PriceManagerModal';
import { SalesHistoryModal } from '@/components/SalesHistoryModal';
import { ZeroOutModal } from '@/components/ZeroOutModal';
import { CheckCircle2, RotateCcw } from 'lucide-react';

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

  const [timeframe, setTimeframe] = useState<TimeframeFilter>('today');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isZeroOutModalOpen, setIsZeroOutModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const productsSectionRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((curr) => (curr === message ? null : curr));
    }, 3500);
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

  // Increment product sales tally
  const handleIncrement = (productId: string, amount: number = 1) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

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
      });
    }

    const updated = [...newRecords, ...sales];
    handleSaveSales(updated);
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

  // ZERO OUT THE WHOLE ACCOUNTING
  const handleConfirmZeroOut = () => {
    handleSaveSales([]);
    showToast('✓ Contabilidad reiniciada en ceros exitosamente.');
  };

  // Load sample demo shift
  const handleLoadSample = () => {
    const sample = generateSampleSales(products, new Date());
    handleSaveSales(sample);
    showToast('✓ Datos de prueba cargados en el sistema.');
  };

  // Filter sales for the selected timeframe
  const filteredSales = useMemo(() => {
    if (!currentDate) return [];
    return filterSalesByTimeframe(sales, timeframe, currentDate);
  }, [sales, timeframe, currentDate]);

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
      {/* Toast Alert Feedback */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-2.5 bg-[#19191d] border border-[#e59b38]/50 text-white px-4 py-3 rounded-xl shadow-2xl animate-fade-in backdrop-blur-md">
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
        totalUnitsInTimeframe={totalUnitsInTimeframe}
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
      <main className="flex-1 bg-vertical-grid py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Section 1: KPI & Aggregate Performance Overview */}
          <KPICards
            timeframe={timeframe}
            sales={filteredSales}
            products={products}
            onLoadSample={handleLoadSample}
            onOpenZeroOut={() => setIsZeroOutModalOpen(true)}
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
          <div ref={productsSectionRef} className="pt-6 space-y-6">
            
            {/* Header with Category Filter Chips */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-[#e59b38]">
                  Registro Rápido al Mostrador
                </div>
                <h2 className="font-serif text-3xl font-bold tracking-tight text-white mt-1">
                  Mostrador de Ventas y Comandas
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Presiona <span className="text-[#e59b38] font-bold">+1 Venta</span> cada vez que se ordene un producto. Haz clic sobre el <span className="text-white underline decoration-[#e59b38] underline-offset-2">precio en la tarjeta</span> para cambiarlo al vuelo en cualquier momento.
                </p>
              </div>

              {/* Category Filter Pills in Mexican Spanish */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#17171a] p-1.5 rounded-xl border border-white/[0.06]">
                {[
                  { id: 'all', label: 'Todos los Platillos' },
                  { id: 'sandwiches', label: 'Sándwiches Philly' },
                  { id: 'quesadillas', label: 'Quesadillas' },
                  { id: 'steak-frites', label: 'Steak Frites' },
                  { id: 'fries', label: 'Papas y Queso' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                      activeCategoryFilter === cat.id
                        ? 'bg-[#e59b38] text-black font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid with On-The-Fly Price Editing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const counts = productCountMap[product.id] || { today: 0, week: 0, month: 0, all: 0 };
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    counts={counts}
                    timeframe={timeframe}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                    onUpdatePrice={handleUpdateProductPrice}
                  />
                );
              })}
            </div>

          </div>

          {/* Section 4: Summary Breakdown by Menu Category */}
          <div className="mt-12 rounded-2xl bg-[#141417] border border-white/[0.08] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Desglose por Categoría de Menú ({timeframe === 'today' ? 'HOY' : timeframe === 'week' ? 'ESTA SEMANA' : timeframe === 'month' ? 'ESTE MES' : 'HISTÓRICO'})
                </h3>
                <span className="text-xs text-neutral-400">
                  Volumen e ingresos acumulados en este periodo
                </span>
              </div>
              <span className="text-xs text-[#e59b38] font-mono font-bold bg-[#e59b38]/10 px-3 py-1 rounded-full border border-[#e59b38]/20">
                {totalUnitsInTimeframe} piezas totales
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {[
                { label: 'Sándwiches Philly', cat: 'sandwiches', desc: 'Sencillo y en combo con papas' },
                { label: 'Quesadillas de Ribeye', cat: 'quesadillas', desc: 'Sencilla y en combo con papas' },
                { label: 'Steak Frites', cat: 'steak-frites', desc: 'Papas con carne y verduras' },
                { label: 'Papas Gourmet', cat: 'fries', desc: 'Clásicas y con queso fundido' },
              ].map((categoryItem) => {
                const catProducts = products.filter((p) => p.category === categoryItem.cat);
                const catSales = filteredSales.filter((s) => catProducts.some((p) => p.id === s.productId));
                const catUnits = catSales.reduce((sum, s) => sum + s.quantity, 0);
                const catRevenue = catSales.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
                const percentage = totalUnitsInTimeframe > 0 ? Math.round((catUnits / totalUnitsInTimeframe) * 100) : 0;

                return (
                  <div key={categoryItem.cat} className="p-4 rounded-xl bg-black/30 border border-white/[0.04]">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-semibold text-white">{categoryItem.label}</div>
                        <div className="text-[11px] text-neutral-400">{categoryItem.desc}</div>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#e59b38] bg-[#e59b38]/10 px-2 py-0.5 rounded-full border border-[#e59b38]/20">
                        {percentage}%
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif text-2xl font-bold text-white">{catUnits}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">piezas</span>
                      </div>
                      <span className="text-xs font-mono text-neutral-300 font-semibold">
                        ${catRevenue.toFixed(2)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2 w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#e59b38] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      {/* Footer in Mexican Spanish */}
      <footer className="border-t border-white/[0.08] bg-[#0d0d0f] py-8">
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
    </div>
  );
}
