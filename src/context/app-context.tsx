'use client';

import type { Product, Sale, Investment, SaleItem } from '@/lib/types';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { subDays, formatISO } from 'date-fns';

const initialProducts: Product[] = [
  { id: 'prod1', name: 'Mystic Oud', costPrice: 2500, sellingPrice: 4500, quantity: 50 },
  { id: 'prod2', name: 'Rose Petal Elixir', costPrice: 1800, sellingPrice: 3200, quantity: 30 },
  { id: 'prod3', name: 'Saffron Dusk', costPrice: 3500, sellingPrice: 6000, quantity: 20 },
  { id: 'prod4', name: 'Ocean Breeze', costPrice: 1500, sellingPrice: 2800, quantity: 45 },
];

const initialSales: Sale[] = [
  {
    id: 'sale1',
    customerName: 'Ahmed Khan',
    items: [{ productId: 'prod1', quantity: 1, name: 'Mystic Oud', price: 4500 }],
    totalPrice: 4500,
    paymentStatus: 'Paid',
    date: formatISO(subDays(new Date(), 2)),
    description: 'Birthday gift packaging',
  },
  {
    id: 'sale2',
    customerName: 'Fatima Ali',
    items: [{ productId: 'prod2', quantity: 2, name: 'Rose Petal Elixir', price: 3200 }],
    totalPrice: 6400,
    paymentStatus: 'Paid',
    date: formatISO(subDays(new Date(), 5)),
  },
  {
    id: 'sale3',
    customerName: 'Zainab Corporation',
    items: [
      { productId: 'prod3', quantity: 5, name: 'Saffron Dusk', price: 6000 },
      { productId: 'prod4', quantity: 5, name: 'Ocean Breeze', price: 2800 },
    ],
    totalPrice: 44000,
    paymentStatus: 'Unpaid',
    date: formatISO(subDays(new Date(), 10)),
    description: 'Corporate order'
  },
];

const initialInvestments: Investment[] = [
  {
    id: 'inv1',
    investorName: 'Self',
    amount: 50000,
    source: 'Business Self-Investment',
    itemsPurchased: 'Raw materials, packaging',
    date: formatISO(subDays(new Date(), 20)),
  },
  {
    id: 'inv2',
    investorName: 'Yasir Malik',
    amount: 150000,
    source: 'External Investor',
    itemsPurchased: 'New distillation equipment',
    date: formatISO(subDays(new Date(), 8)),
  },
];

interface AppContextType {
  products: Product[];
  sales: Sale[];
  investments: Investment[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  addSale: (saleData: {
    customerName: string;
    items: Omit<SaleItem, 'price'>[];
    paymentStatus: 'Paid' | 'Unpaid' | 'Remaining';
    remainingAmount?: number;
    description?: string;
  }) => void;
  addInvestment: (investment: Omit<Investment, 'id' | 'date'>) => void;
  getInventoryValue: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [investments, setInvestments] = useState<Investment[]>(initialInvestments);

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts((prev) => [...prev, { ...product, id: `prod${prev.length + 1}` }]);
  };

  const addSale = (saleData: {
    customerName: string;
    items: Omit<SaleItem, 'price' | 'name'>[];
    paymentStatus: 'Paid' | 'Unpaid' | 'Remaining';
    remainingAmount?: number;
    description?: string;
  }) => {
    let totalPrice = 0;
    const newProducts = [...products];
    const saleItems: SaleItem[] = [];

    for (const item of saleData.items) {
      const productIndex = newProducts.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        const product = newProducts[productIndex];
        const itemTotalPrice = product.sellingPrice * item.quantity;
        totalPrice += itemTotalPrice;

        newProducts[productIndex] = { ...product, quantity: product.quantity - item.quantity };
        saleItems.push({ ...item, name: product.name, price: product.sellingPrice });
      }
    }
    
    setProducts(newProducts);

    const newSale: Sale = {
      id: `sale${sales.length + 1}`,
      date: formatISO(new Date()),
      totalPrice,
      ...saleData,
      items: saleItems,
    };
    setSales((prev) => [newSale, ...prev]);
  };

  const addInvestment = (investment: Omit<Investment, 'id' | 'date'>) => {
    setInvestments((prev) => [
      { ...investment, id: `inv${prev.length + 1}`, date: formatISO(new Date()) },
      ...prev,
    ]);
  };

  const getInventoryValue = () => {
    return products.reduce((total, p) => total + p.costPrice * p.quantity, 0);
  }

  return (
    <AppContext.Provider
      value={{ products, sales, investments, addProduct, addSale, addInvestment, getInventoryValue }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
