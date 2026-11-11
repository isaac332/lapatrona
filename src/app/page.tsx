'use client';

import React, { useState, useMemo, useRef, useSyncExternalStore } from 'react';
import { ProductItem, SaleRecord, TimeframeFilter } from '@/types/accounting';
import { INITIAL_PRODUCTS } from '@/data/initialProducts';
import {
  filterSalesByTimeframe,
  getProductCountsByTimeframe,
  generateSampleSales,
} from '@/utils/accountingCalculations';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { KPICards } from '@/components/KPICards';
import { ProductCard } from '@/components/ProductCard';
import { PriceManagerModal } from '@/components/PriceManagerModal';
import { SalesHistoryModal } from '@/components/SalesHistoryModal';

const subscribe = () => () => {};

export default function SalesCounterPage() {
  const isHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const [products, setProducts] = useState<ProductItem[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PRODUCTS;
    try {
      const saved = localStorage.getItem('philly_fry_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('philly_fry_sales');
      if (saved) return JSON.parse(saved);
      const sample = generateSampleSales(INITIAL_PRODUCTS, new Date());
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

  const productsSectionRef = useRef<HTMLDivElement>(null);

  // Save changes to localStorage
  const handleSaveProducts = (updatedProducts: ProductItem[]) => {
    setProducts(updatedProducts);
    try {
      localStorage.setItem('philly_fry_products', JSON.stringify(updatedProducts));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
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

  // Clear all sales
  const handleClearAllSales = () => {
    handleSaveSales([]);
  };

  // Load sample demo shift
  const handleLoadSample = () => {
    const sample = generateSampleSales(products, new Date());
    handleSaveSales(sample);
  };

  // Client-safe current date for filtering
  const currentDate = useMemo(() => {
    return isHydrated ? new Date() : undefined;
  }, [isHydrated]);

  // Filter sales for the selected timeframe
  const filteredSales = useMemo(() => {
    if (!currentDate) return [];
    return filterSalesByTimeframe(sales, timeframe, currentDate);
  }, [sales, timeframe, currentDate]);

  // Overall counts for Today (used in Hero banner)
  const todaySales = useMemo(() => {
    if (!currentDate) return [];
    return filterSalesByTimeframe(sales, 'today', currentDate);
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
          Philly & Fry Sales Counter
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0f] text-[#f5f0eb]">
      {/* Top Navbar */}
      <Navbar
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onOpenPriceManager={() => setIsPriceModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        totalUnitsInTimeframe={totalUnitsInTimeframe}
      />

      {/* Hero Banner matching the reference image's layout and font */}
      <HeroBanner
        timeframe={timeframe}
        onScrollToProducts={scrollToProducts}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        todayCount={todayCount}
        todayRevenue={todayRevenue}
      />

      {/* Main Content Area with subtle background grid */}
      <main className="flex-1 bg-vertical-grid py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Section 1: KPI & Aggregate Performance Overview */}
          <KPICards
            timeframe={timeframe}
            sales={filteredSales}
            products={products}
            onLoadSample={handleLoadSample}
          />

          {/* Section 2: Products & Counter Grid */}
          <div ref={productsSectionRef} className="pt-6 space-y-6">
            
            {/* Header with Category Filter Chips */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-[#e59b38]">
                  Tap to Tally Sales
                </div>
                <h2 className="font-serif text-3xl font-bold tracking-tight text-white mt-1">
                  Product Sales Counter
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Click <span className="text-[#e59b38] font-bold">+1 Count</span> each time an item is ordered to update the daily, weekly, and monthly totals instantly.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#17171a] p-1.5 rounded-xl border border-white/[0.06]">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'sandwiches', label: 'Sandwiches' },
                  { id: 'quesadillas', label: 'Quesadillas' },
                  { id: 'steak-frites', label: 'Steak Frites' },
                  { id: 'fries', label: 'Fries & Cheese' },
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

            {/* Product Cards Grid */}
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
                  />
                );
              })}
            </div>

          </div>

          {/* Section 3: Summary Breakdown by Menu Category */}
          <div className="mt-12 rounded-2xl bg-[#141417] border border-white/[0.08] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="font-serif text-lg font-bold text-white">
                Category Volume Breakdown ({timeframe.toUpperCase()})
              </h3>
              <span className="text-xs text-neutral-400 font-mono">
                {totalUnitsInTimeframe} total units
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {[
                { label: 'Sandwiches', cat: 'sandwiches', desc: 'Alone & With Fries' },
                { label: 'Quesadillas', cat: 'quesadillas', desc: 'Alone & With Fries' },
                { label: 'Steak Frites', cat: 'steak-frites', desc: 'Steak, Fries & Veggies' },
                { label: 'Gourmet Fries', cat: 'fries', desc: 'Classic & Melted Cheese' },
              ].map((categoryItem) => {
                const catProducts = products.filter((p) => p.category === categoryItem.cat);
                const catUnits = catProducts.reduce((sum, p) => {
                  const counts = productCountMap[p.id];
                  return sum + (counts ? counts[timeframe] : 0);
                }, 0);
                const catRevenue = catProducts.reduce((sum, p) => {
                  const counts = productCountMap[p.id];
                  return sum + (counts ? counts[timeframe] * p.defaultPrice : 0);
                }, 0);
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
                      <span className="font-serif text-2xl font-bold text-white">{catUnits}</span>
                      <span className="text-xs font-mono text-neutral-400">
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

      {/* Footer matching the dark editorial mood */}
      <footer className="border-t border-white/[0.08] bg-[#0d0d0f] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-widest uppercase text-white font-sans text-sm">
              PHILLY & FRY
            </span>
            <span>•</span>
            <span>Business Sales Counter & Ledger</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsPriceModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Configure Prices & Costs
            </button>
            <span>•</span>
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Export CSV Ledger
            </button>
            <span>•</span>
            <button
              onClick={handleLoadSample}
              className="hover:text-[#e59b38] transition-colors"
            >
              Reload Sample Data
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
        onClearAllSales={handleClearAllSales}
      />
    </div>
  );
}
