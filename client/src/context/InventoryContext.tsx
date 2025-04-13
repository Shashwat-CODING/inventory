import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  InventoryItem, 
  InventoryState, 
  Filters,
  ModalType, 
  StockActionType,
  ConfirmationOptions,
  NewInventoryItem,
  SortField,
  SortDirection
} from "../types/inventory";
import * as api from "../utils/api";

// Default state values
const defaultState: InventoryState = {
  items: [],
  isLoading: false,
  error: null,
  currentItem: null,
  filters: {
    search: '',
    division: '',
    status: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  sorting: {
    field: 'item_code',
    direction: 'asc'
  }
};

interface InventoryContextProps extends InventoryState {
  // Item actions
  fetchItems: () => Promise<void>;
  fetchItem: (id: number) => Promise<InventoryItem>;
  addItem: (item: NewInventoryItem) => Promise<void>;
  updateItem: (id: number, item: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  
  // Stock adjustment
  addStock: (id: number, quantity: number) => Promise<void>;
  sellStock: (id: number, quantity: number) => Promise<void>;
  
  // Bulk operations
  bulkImport: (formData: FormData) => Promise<void>;
  resetDatabase: () => Promise<void>;
  
  // UI state
  activeModal: ModalType;
  stockActionType: StockActionType;
  confirmationOptions: ConfirmationOptions | null;
  
  // UI actions
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  setCurrentItem: (item: InventoryItem | null) => void;
  prepareAddItem: () => void;
  prepareEditItem: (item: InventoryItem) => void;
  prepareAddStock: (item: InventoryItem) => void;
  prepareSellStock: (item: InventoryItem) => void;
  prepareDeleteItem: (item: InventoryItem) => void;
  prepareBulkImport: () => void;
  prepareResetDatabase: () => void;
  
  // Filters and sorting
  setFilters: (filters: Filters) => void;
  clearFilters: () => void;
  setSorting: (field: SortField, direction: SortDirection) => void;
}

const InventoryContext = createContext<InventoryContextProps | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InventoryState>(defaultState);
  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);
  const [stockActionType, setStockActionType] = useState<StockActionType>(StockActionType.ADD);
  const [confirmationOptions, setConfirmationOptions] = useState<ConfirmationOptions | null>(null);
  const { toast } = useToast();

  // Fetch all inventory items
  const fetchItems = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const items = await api.fetchInventoryItems();
      setState(prev => ({ 
        ...prev, 
        items, 
        isLoading: false,
        pagination: { ...prev.pagination, total: items.length }
      }));
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load inventory items'
      }));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load inventory items',
        variant: "destructive"
      });
    }
  };

  // Fetch a single inventory item
  const fetchItem = async (id: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const item = await api.fetchInventoryItem(id);
      setState(prev => ({ ...prev, currentItem: item, isLoading: false }));
      return item;
    } catch (error) {
      console.error(`Error fetching item ${id}:`, error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : `Failed to load item ${id}`
      }));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to load item ${id}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Add a new inventory item
  const addItem = async (item: NewInventoryItem) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const newItem = await api.createInventoryItem(item);
      setState(prev => ({ 
        ...prev, 
        items: [...prev.items, newItem], 
        isLoading: false,
        pagination: { ...prev.pagination, total: prev.pagination.total + 1 } 
      }));
      toast({
        title: "Success",
        description: "Inventory item added successfully"
      });
      closeModal();
    } catch (error) {
      console.error('Error adding item:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to add inventory item'
      }));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add inventory item',
        variant: "destructive"
      });
    }
  };

  // Update an existing inventory item
  const updateItem = async (id: number, item: Partial<InventoryItem>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const updatedItem = await api.updateInventoryItem(id, item);
      setState(prev => ({ 
        ...prev, 
        items: prev.items.map(i => i.id === id ? updatedItem : i),
        currentItem: prev.currentItem?.id === id ? updatedItem : prev.currentItem,
        isLoading: false 
      }));
      toast({
        title: "Success",
        description: "Inventory item updated successfully"
      });
      closeModal();
    } catch (error) {
      console.error(`Error updating item ${id}:`, error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : `Failed to update item ${id}`
      }));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to update item ${id}`,
        variant: "destructive"
      });
    }
  };

  // Delete an inventory item
  const deleteItem = async (id: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await api.deleteInventoryItem(id);
      setState(prev => ({ 
        ...prev, 
        items: prev.items.filter(i => i.id !== id),
        currentItem: prev.currentItem?.id === id ? null : prev.currentItem,
        isLoading: false,
        pagination: { ...prev.pagination, total: prev.pagination.total - 1 }
      }));
      toast({
        title: "Success",
        description: "Inventory item deleted successfully"
      });
      closeModal();
    } catch (error) {
      console.error(`Error deleting item ${id}:`, error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : `Failed to delete item ${id}`
      }));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to delete item ${id}`,
        variant: "destructive"
      });
    }
  };

  // Add stock to an inventory item
  const addStock = async (id: number, quantity: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const updatedItem = await api.addStock(id, { quantity });
      setState(prev => ({ 
        ...prev, 
        items: prev.items.map(i => i.id === id ? updatedItem : i),
        currentItem: prev.currentItem?.id === id ? updatedItem : prev.currentItem,
        isLoading: false 
      }));
      toast({
        title: "Success",
        description: `Added ${quantity} ${updatedItem.base_unit} to inventory`
      });
      closeModal();
    } catch (error) {
      console.error(`Error adding stock to item ${id}:`, error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : `Failed to add stock to item ${id}`
      }));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to add stock to item ${id}`,
        variant: "destructive"
      });
    }
  };

  // Sell stock from an inventory item
  const sellStock = async (id: number, quantity: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const updatedItem = await api.sellStock(id, { quantity });
      setState(prev => ({ 
        ...prev, 
        items: prev.items.map(i => i.id === id ? updatedItem : i),
        currentItem: prev.currentItem?.id === id ? updatedItem : prev.currentItem,
        isLoading: false 
      }));
      toast({
        title: "Success",
        description: `Sold ${quantity} ${updatedItem.base_unit} from inventory`
      });
      closeModal();
    } catch (error) {
      console.error(`Error selling stock from item ${id}:`, error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : `Failed to sell stock from item ${id}`
      }));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to sell stock from item ${id}`,
        variant: "destructive"
      });
    }
  };

  // Bulk import inventory items
  const bulkImport = async (formData: FormData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await api.bulkImport(formData);
      await fetchItems(); // Reload items after import
      toast({
        title: "Success",
        description: result.message || "Bulk import completed successfully"
      });
      closeModal();
    } catch (error) {
      console.error('Error importing inventory items:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to import inventory items'
      }));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to import inventory items',
        variant: "destructive"
      });
    }
  };

  // Reset database
  const resetDatabase = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await api.resetDatabase();
      await fetchItems(); // Reload items after reset
      toast({
        title: "Success",
        description: result.message || "Database reset successfully"
      });
      closeModal();
    } catch (error) {
      console.error('Error resetting database:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to reset database'
      }));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to reset database',
        variant: "destructive"
      });
    }
  };

  // Open a modal
  const openModal = (modal: ModalType) => {
    setActiveModal(modal);
  };

  // Close the active modal
  const closeModal = () => {
    setActiveModal(ModalType.NONE);
  };

  // Set the current item
  const setCurrentItem = (item: InventoryItem | null) => {
    setState(prev => ({ ...prev, currentItem: item }));
  };

  // Prepare to add a new item
  const prepareAddItem = () => {
    setCurrentItem(null);
    openModal(ModalType.ADD_EDIT);
  };

  // Prepare to edit an existing item
  const prepareEditItem = (item: InventoryItem) => {
    setCurrentItem(item);
    openModal(ModalType.ADD_EDIT);
  };

  // Prepare to add stock to an item
  const prepareAddStock = (item: InventoryItem) => {
    setCurrentItem(item);
    setStockActionType(StockActionType.ADD);
    openModal(ModalType.STOCK_ADJUSTMENT);
  };

  // Prepare to sell stock from an item
  const prepareSellStock = (item: InventoryItem) => {
    setCurrentItem(item);
    setStockActionType(StockActionType.SELL);
    openModal(ModalType.STOCK_ADJUSTMENT);
  };

  // Prepare to delete an item
  const prepareDeleteItem = (item: InventoryItem) => {
    setCurrentItem(item);
    setConfirmationOptions({
      title: 'Delete Inventory Item',
      message: `Are you sure you want to delete "${item.item_name}" (${item.item_code})? This action cannot be undone.`,
      onConfirm: () => deleteItem(item.id),
      confirmButtonText: 'Delete',
      confirmButtonClass: 'btn-danger'
    });
    openModal(ModalType.CONFIRMATION);
  };

  // Prepare to open bulk import modal
  const prepareBulkImport = () => {
    openModal(ModalType.BULK_IMPORT);
  };

  // Prepare to reset the database
  const prepareResetDatabase = () => {
    setConfirmationOptions({
      title: 'Reset Database',
      message: 'Are you sure you want to reset the database? This will delete all inventory data and cannot be undone.',
      onConfirm: resetDatabase,
      confirmButtonText: 'Reset',
      confirmButtonClass: 'btn-danger'
    });
    openModal(ModalType.CONFIRMATION);
  };

  // Set filters
  const setFilters = (filters: Filters) => {
    setState(prev => ({ ...prev, filters }));
  };

  // Clear all filters
  const clearFilters = () => {
    setState(prev => ({ 
      ...prev, 
      filters: {
        search: '',
        division: '',
        status: ''
      }
    }));
  };

  // Set sorting
  const setSorting = (field: SortField, direction: SortDirection) => {
    setState(prev => ({ 
      ...prev, 
      sorting: { field, direction }
    }));
  };

  // Load inventory items on initial render
  useEffect(() => {
    fetchItems();
  }, []);

  const value: InventoryContextProps = {
    ...state,
    activeModal,
    stockActionType,
    confirmationOptions,
    fetchItems,
    fetchItem,
    addItem,
    updateItem,
    deleteItem,
    addStock,
    sellStock,
    bulkImport,
    resetDatabase,
    openModal,
    closeModal,
    setCurrentItem,
    prepareAddItem,
    prepareEditItem,
    prepareAddStock,
    prepareSellStock,
    prepareDeleteItem,
    prepareBulkImport,
    prepareResetDatabase,
    setFilters,
    clearFilters,
    setSorting
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
