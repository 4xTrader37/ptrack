'use client';

import type { Product, Sale, Investment, SaleItem, Customer, Investor } from '@/lib/types';
import { createContext, useContext, type ReactNode } from 'react';
import { formatISO } from 'date-fns';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';

interface AppContextType {
  products: Product[] | null;
  sales: Sale[] | null;
  investments: Investment[] | null;
  customers: Customer[] | null;
  investors: Investor[] | null;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Omit<Product, 'id'>>) => void;
  deleteProduct: (id: string) => void;
  addSale: (saleData: {
    customerName: string;
    items: { productId: string, quantity: number, price: number }[];
    paymentStatus: 'Paid' | 'Unpaid' | 'Remaining';
    remainingAmount?: number;
    description?: string;
  }) => void;
  updateSale: (id: string, saleData: Omit<Sale, 'id' | 'date' | 'totalPrice'>) => void;
  deleteSale: (id: string) => void;
  addInvestment: (investment: Omit<Investment, 'id' | 'date'>) => void;
  getInventoryValue: () => number;
  getInventoryProfit: () => number;
  isLoading: boolean;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Omit<Customer, 'id'>>) => void;
  deleteCustomer: (id: string) => void;
  addInvestor: (investor: Omit<Investor, 'id'>) => void;
  updateInvestor: (id: string, investor: Partial<Omit<Investor, 'id'>>) => void;
  deleteInvestor: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();

  const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'perfumes') : null, [firestore]);
  const salesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'sales') : null, [firestore]);
  const investmentsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'investments') : null, [firestore]);
  const customersCollection = useMemoFirebase(() => firestore ? collection(firestore, 'customers') : null, [firestore]);
  const investorsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'investors') : null, [firestore]);

  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsCollection);
  const { data: sales, isLoading: salesLoading } = useCollection<Sale>(salesCollection);
  const { data: investments, isLoading: investmentsLoading } = useCollection<Investment>(investmentsCollection);
  const { data: customers, isLoading: customersLoading } = useCollection<Customer>(customersCollection);
  const { data: investors, isLoading: investorsLoading } = useCollection<Investor>(investorsCollection);

  const addProduct = (product: Omit<Product, 'id'>) => {
    if (!productsCollection) return;
    addDocumentNonBlocking(productsCollection, product);
  };

  const updateProduct = (id: string, product: Partial<Omit<Product, 'id'>>) => {
    if (!firestore) return;
    const productRef = doc(firestore, 'perfumes', id);
    updateDocumentNonBlocking(productRef, product);
  }

  const deleteProduct = (id: string) => {
    if (!firestore) return;
    const productRef = doc(firestore, 'perfumes', id);
    deleteDocumentNonBlocking(productRef);
  }

  const addSale = (saleData: {
    customerName: string;
    items: { productId: string, quantity: number, price: number }[];
    paymentStatus: 'Paid' | 'Unpaid' | 'Remaining';
    remainingAmount?: number;
    description?: string;
  }) => {
    if (!firestore || !products || !salesCollection || !customersCollection || !customers) return;
    const batch = writeBatch(firestore);
    let totalPrice = 0;
    const saleItems: SaleItem[] = [];

    let customer = customers.find(c => c.name.toLowerCase() === saleData.customerName.toLowerCase());
    if (!customer) {
        const newCustomerRef = doc(customersCollection);
        const newCustomer = { id: newCustomerRef.id, name: saleData.customerName };
        batch.set(newCustomerRef, newCustomer);
        customer = newCustomer;
    }

    for (const item of saleData.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const productRef = doc(firestore, 'perfumes', product.id);
        const newQuantity = product.quantity - item.quantity;
        
        if (newQuantity < 0) {
          console.error(`Not enough stock for ${product.name}`);
          // TODO: This should probably show an error to the user
          return;
        }

        batch.update(productRef, { quantity: newQuantity });
        totalPrice += item.price * item.quantity;
        saleItems.push({ ...item, name: product.name });
      }
    }
    
    const newSaleRef = doc(salesCollection);
    const newSale: Omit<Sale, 'id'> = {
      date: formatISO(new Date()),
      totalPrice,
      customerName: saleData.customerName,
      items: saleItems,
      paymentStatus: saleData.paymentStatus,
      remainingAmount: saleData.remainingAmount,
      description: saleData.description,
    };

    batch.set(newSaleRef, newSale);
    
    batch.commit().catch(error => {
        console.error("Failed to record sale and update inventory", error);
    });
  };

  const updateSale = async (id: string, saleData: Omit<Sale, 'id' | 'date' | 'totalPrice'>) => {
    if (!firestore || !products || !sales) return;
    
    const saleRef = doc(firestore, 'sales', id);
    const originalSale = sales.find(s => s.id === id);
    if (!originalSale) return;

    const batch = writeBatch(firestore);

    // Create a map of current product quantities
    const currentQuantities: { [key: string]: number } = {};
    products.forEach(p => {
        currentQuantities[p.id] = p.quantity;
    });

    // Revert old inventory changes in memory
    for (const item of originalSale.items) {
        if (currentQuantities[item.productId] !== undefined) {
            currentQuantities[item.productId] += item.quantity;
        }
    }

    let newTotalPrice = 0;
    const newSaleItems: SaleItem[] = [];

    // Apply new inventory changes in memory and calculate new total price
    for (const item of saleData.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            if (currentQuantities[item.productId] - item.quantity < 0) {
                console.error(`Not enough stock for ${product.name}`);
                // NOTE: This will cancel the whole batch. 
                // A better implementation might show an error to the user without reverting.
                return;
            }
            currentQuantities[item.productId] -= item.quantity;
            newTotalPrice += item.price * item.quantity;
            newSaleItems.push({ ...item, name: product.name });
        }
    }

    // Update product quantities in firestore batch
    for (const productId in currentQuantities) {
        const originalProduct = products.find(p => p.id === productId);
        if (originalProduct && originalProduct.quantity !== currentQuantities[productId]) {
            const productRef = doc(firestore, 'perfumes', productId);
            batch.update(productRef, { quantity: currentQuantities[productId] });
        }
    }

    const updatedSale = {
        ...saleData,
        totalPrice: newTotalPrice,
        items: newSaleItems,
    };

    batch.update(saleRef, updatedSale);
    
    batch.commit().catch(error => {
        console.error("Failed to update sale", error);
    });
};

const deleteSale = (id: string) => {
    if (!firestore || !sales || !products) return;

    const saleToDelete = sales.find(s => s.id === id);
    if (!saleToDelete) return;

    const batch = writeBatch(firestore);

    // Restore inventory
    for (const item of saleToDelete.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            const productRef = doc(firestore, 'perfumes', product.id);
            batch.update(productRef, { quantity: product.quantity + item.quantity });
        }
    }

    const saleRef = doc(firestore, 'sales', id);
    batch.delete(saleRef);

    batch.commit().catch(error => {
        console.error("Failed to delete sale and restore inventory", error);
    });
};

  const addInvestment = (investment: Omit<Investment, 'id' | 'date'>) => {
    if (!investmentsCollection || !investorsCollection || !investors) return;

    const batch = writeBatch(firestore!);

    let investor = investors.find(i => i.name.toLowerCase() === investment.investorName.toLowerCase());
    if (!investor) {
        const newInvestorRef = doc(investorsCollection);
        const newInvestor = { id: newInvestorRef.id, name: investment.investorName };
        batch.set(newInvestorRef, newInvestor);
        investor = newInvestor;
    }

    const newInvestment = {
      ...investment,
      date: formatISO(new Date()),
    }
    const newInvestmentRef = doc(investmentsCollection);
    batch.set(newInvestmentRef, newInvestment);
    
    batch.commit().catch(error => {
        console.error("Failed to record investment", error);
    });
  };

  const getInventoryValue = () => {
    if (!products) return 0;
    return products.reduce((total, p) => total + p.costPrice * p.quantity, 0);
  }

  const getInventoryProfit = () => {
    if (!products) return 0;
    return products.reduce((total, p) => total + (p.sellingPrice - p.costPrice) * p.quantity, 0);
  }

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    if (!customersCollection) return;
    addDocumentNonBlocking(customersCollection, customer);
  }

  const updateCustomer = (id: string, customer: Partial<Omit<Customer, 'id'>>) => {
    if (!firestore) return;
    const customerRef = doc(firestore, 'customers', id);
    updateDocumentNonBlocking(customerRef, customer);
  }

  const deleteCustomer = (id: string) => {
    if (!firestore) return;
    const customerRef = doc(firestore, 'customers', id);
    deleteDocumentNonBlocking(customerRef);
  }

  const addInvestor = (investor: Omit<Investor, 'id'>) => {
    if (!investorsCollection) return;
    addDocumentNonBlocking(investorsCollection, investor);
  }

  const updateInvestor = (id: string, investor: Partial<Omit<Investor, 'id'>>) => {
    if (!firestore) return;
    const investorRef = doc(firestore, 'investors', id);
    updateDocumentNonBlocking(investorRef, investor);
  }

  const deleteInvestor = (id: string) => {
    if (!firestore) return;
    const investorRef = doc(firestore, 'investors', id);
    deleteDocumentNonBlocking(investorRef);
  }


  const isLoading = productsLoading || salesLoading || investmentsLoading || customersLoading || investorsLoading;

  const value = {
    products,
    sales,
    investments,
    customers,
    investors,
    addProduct,
    updateProduct,
    deleteProduct,
    addSale,
    updateSale,
    deleteSale,
    addInvestment,
    getInventoryValue,
    getInventoryProfit,
    isLoading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addInvestor,
    updateInvestor,
    deleteInvestor,
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
