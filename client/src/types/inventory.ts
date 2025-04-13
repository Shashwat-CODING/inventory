export interface InventoryItem {
  id: number;
  multi_itemdivision: string;
  divisions: string;
  mcode: string;
  menucode: string;
  desca: string;
  barcode: string;
  unit: string;
  isvat: number;
  mrp: string | number;
  gst: string | number;
  cess: string | number;
  gweight: string | number;
  nweight: string | number;
  mcat: string;
  brand: string;
  item_summary: string;
  warehouse: string;
  stock: string | number;
  status: string;
}

export interface NewInventoryItem {
  multi_itemdivision: string;
  divisions: string;
  mcode: string;
  menucode: string;
  desca: string;
  barcode: string;
  unit: string;
  isvat: number;
  mrp: number;
  gst: number;
  cess: number;
  gweight: number;
  nweight: number;
  mcat: string;
  brand: string;
  item_summary: string;
  warehouse: string;
  stock: number;
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
