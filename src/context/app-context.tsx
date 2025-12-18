'use client';

import type { Product, Sale, Investment, SaleItem } from '@/lib/types';
import { createContext, useContext, type ReactNode } from 'react';
import { formatISO } from 'date-fns';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';

interface AppContextType {
  products: Product[] | null;
  sales: Sale[] | null;
  investments: Investment[] | null;
  addProduct: (product: Omit<Product, 'id'>) => void;
  addSale: (saleData: {
    customerName: string;
    items: Omit<SaleItem, 'price' | 'name'>[];
    paymentStatus: 'Paid' | 'Unpaid' | 'Remaining';
    remainingAmount?: number;
    description?: string;
  }) => void;
  addInvestment: (investment: Omit<Investment, 'id' | 'date'>) => void;
  getInventoryValue: () => number;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();

  const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'perfumes') : null, [firestore]);
  const salesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'sales') : null, [firestore]);
  const investmentsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'investments') : null, [firestore]);

  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsCollection);
  const { data: sales, isLoading: salesLoading } = useCollection<Sale>(salesCollection);
  const { data: investments, isLoading: investmentsLoading } = useCollection<Investment>(investmentsCollection);

  const addProduct = (product: Omit<Product, 'id'>) => {
    if (!productsCollection) return;
    addDocumentNonBlocking(productsCollection, product);
  };

  const addSale = (saleData: {
    customerName: string;
    items: Omit<SaleItem, 'price' | 'name'>[];
    paymentStatus: 'Paid' | 'Unpaid' | 'Remaining';
    remainingAmount?: number;
    description?: string;
  }) => {
    if (!firestore || !products) return;
    const batch = writeBatch(firestore);
    let totalPrice = 0;
    const saleItems: Omit<SaleItem, 'price'>[] = [];

    for (const item of saleData.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const productRef = doc(firestore, 'perfumes', product.id);
        const newQuantity = product.quantity - item.quantity;
        
        if (newQuantity < 0) {
          console.error(`Not enough stock for ${product.name}`);
          // Potentially throw an error to be caught and displayed to the user
          return;
        }

        batch.update(productRef, { quantity: newQuantity });
        totalPrice += product.sellingPrice * item.quantity;
        saleItems.push({ ...item, name: product.name });
      }
    }
    
    if (!salesCollection) return;
    const newSaleRef = doc(salesCollection);

    const newSale: Omit<Sale, 'id'> = {
      date: formatISO(new Date()),
      totalPrice,
      customerName: saleData.customerName,
      items: saleItems.map(item => ({...item, price: products.find(p => p.id === item.productId)?.sellingPrice || 0 })),
      paymentStatus: saleData.paymentStatus,
      remainingAmount: saleData.remainingAmount,
      description: saleData.description,
    };

    batch.set(newSaleRef, newSale);
    
    batch.commit().catch(error => {
        console.error("Failed to record sale and update inventory", error);
    });
  };

  const addInvestment = (investment: Omit<Investment, 'id' | 'date'>) => {
    if (!investmentsCollection) return;
    const newInvestment = {
      ...investment,
      date: formatISO(new Date()),
    }
    addDocumentNonBlocking(investmentsCollection, newInvestment);
  };

  const getInventoryValue = () => {
    if (!products) return 0;
    return products.reduce((total, p) => total + p.costPrice * p.quantity, 0);
  }

  const isLoading = productsLoading || salesLoading || investmentsLoading;

  const value = {
    products,
    sales,
    investments,
    addProduct,
    addSale,
    addInvestment,
    getInventoryValue,
    isLoading,
  };

  if(isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <AppContext.Provider value={value}>
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
