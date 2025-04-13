import { InventoryItem } from './inventory';

export interface SaleItem {
  item: InventoryItem;
  quantity: number;
  price: number; // MRP
  dividendPercentage?: number; // Optional trade dividend percentage
  dividendDivisor?: number; // Optional trade dividend divisor
  totalPrice: number; // Price after applying dividend
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  notes: string;
}

export enum PaymentMethod {
  CASH = 'Cash',
  CARD = 'Card',
  UPI = 'UPI',
  BANK_TRANSFER = 'Bank Transfer'
}

export enum DiscountType {
  NONE = 'none',
  PERCENTAGE = 'percentage', 
  DIVISOR = 'divisor'
}

export interface SaleFormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: SaleItem[];
  paymentMethod: PaymentMethod;
  notes: string;
}

export const initialSaleFormData: SaleFormData = {
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  items: [],
  paymentMethod: PaymentMethod.CASH,
  notes: ''
};