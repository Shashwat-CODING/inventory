export interface InventoryItem {
  id: number;
  item_code: string;
  item_name: string;
  division: string;
  vertical: string;
  brand: string;
  opening_stock: number;
  available_stock: number;
  mrp: number;
  cost_price: number;
  gst_percentage: number;
  barcode: string;
  exp_date: string;
  mfg_date: string;
  batch: string;
  warehouse: string;
  base_unit: string;
  status: string;
}

export interface NewInventoryItem {
  item_code: string;
  item_name: string;
  division: string;
  vertical: string;
  brand: string;
  opening_stock: number;
  available_stock: number;
  mrp: number;
  cost_price: number;
  gst_percentage: number;
  barcode: string;
  exp_date: string;
  mfg_date: string;
  batch: string;
  warehouse: string;
  base_unit: string;
  status: string;
}

export interface StockAdjustment {
  quantity: number;
}

export type SortField = keyof InventoryItem;
export type SortDirection = 'asc' | 'desc';

export interface Filters {
  search: string;
  division: string;
  status: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  currentItem: InventoryItem | null;
  filters: Filters;
  pagination: Pagination;
  sorting: {
    field: SortField;
    direction: SortDirection;
  }
}

export enum ModalType {
  NONE = 'none',
  ADD_EDIT = 'addEdit',
  STOCK_ADJUSTMENT = 'stockAdjustment',
  BULK_IMPORT = 'bulkImport',
  CONFIRMATION = 'confirmation'
}

export enum StockActionType {
  ADD = 'add',
  SELL = 'sell'
}

export interface ConfirmationOptions {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmButtonText: string;
  confirmButtonClass: string;
}

export interface BulkImportData {
  file: File;
  format: 'csv' | 'json';
}
