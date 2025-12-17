export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
}

export interface Sale {
  id: string;
  customerName: string;
  items: SaleItem[];
  totalPrice: number;
  paymentStatus: 'Paid' | 'Unpaid' | 'Remaining';
  remainingAmount?: number;
  description?: string;
  date: string;
}

export interface Investment {
  id: string;
  investorName: string;
  amount: number;
  source: 'External Investor' | 'Business Self-Investment';
  itemsPurchased: string;
  date: string;
}
