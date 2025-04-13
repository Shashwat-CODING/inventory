import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { InventoryItem } from "../types/inventory";
import { Sale, SaleItem, SaleFormData, PaymentMethod, initialSaleFormData, DiscountType } from "../types/sales";
import * as api from "../utils/api";
import { downloadSaleBill, printSaleBill, exportSaleToJson } from "../utils/pdfGenerator";

// Interface for a held bill record in localStorage
export interface HeldBill {
  id: string;
  timestamp: number;
  customerName: string;
  data: SaleFormData;
}

interface SalesState {
  isLoading: boolean;
  error: string | null;
  saleFormData: SaleFormData;
  completedSales: Sale[];
  currentSale: Sale | null;
  heldSales: HeldBill[];
  heldSale: SaleFormData | null;
  showHeldSalePrompt: boolean;
  showHeldSalesList: boolean;
}

const defaultState: SalesState = {
  isLoading: false,
  error: null,
  saleFormData: initialSaleFormData,
  completedSales: [],
  currentSale: null,
  heldSales: [] as HeldBill[],
  heldSale: null,
  showHeldSalePrompt: false,
  showHeldSalesList: false
};

interface SalesContextProps extends SalesState {
  // Form data management
  updateCustomerInfo: (name: string, value: string) => void;
  updatePaymentMethod: (method: PaymentMethod) => void;
  updateNotes: (notes: string) => void;
  
  // Item management
  addItemToSale: (
    item: InventoryItem, 
    quantity: number, 
    discountType: DiscountType,
    discountValue: number
  ) => void;
  updateSaleItemQuantity: (index: number, quantity: number) => void;
  updateSaleItemDiscount: (
    index: number, 
    discountType: DiscountType,
    discountValue: number
  ) => void;
  removeSaleItem: (index: number) => void;
  clearSaleItems: () => void;
  
  // Sale processing
  processSale: () => Promise<void>;
  resetSaleForm: () => void;
  
  // PDF and data management
  downloadBill: (sale: Sale) => void;
  printBill: (sale: Sale) => void;
  exportSaleJson: (sale: Sale) => void;
  importSaleFromJson: (jsonData: string) => void;
  
  // Hold bill functionality
  holdBill: () => void;
  resumeHeldBill: (bill?: HeldBill) => void;
  dismissHeldBillPrompt: () => void;
  toggleHeldBillsList: () => void;
  loadHeldBill: (billId: string) => void;
  deleteHeldBill: (billId: string) => void;
}

// Calculate item price after applying discount
function calculateItemPrice(price: number, quantity: number, discountType: DiscountType, discountValue: number): number {
  let totalPrice = price * quantity;
  
  switch (discountType) {
    case DiscountType.PERCENTAGE:
      // Apply percentage discount
      return (price * (1 - (discountValue / 100))) * quantity;
    
    case DiscountType.DIVISOR:
      // Apply divisor (divide the total amount by the divisor)
      if (discountValue > 0) {
        return totalPrice / discountValue;
      }
      return totalPrice;
    
    case DiscountType.NONE:
    default:
      return totalPrice;
  }
}

// Calculate discount amount for reporting
function calculateDiscountAmount(price: number, quantity: number, discountType: DiscountType, discountValue: number): number {
  const totalPrice = price * quantity;
  const discountedPrice = calculateItemPrice(price, quantity, discountType, discountValue);
  return totalPrice - discountedPrice;
}

const SalesContext = createContext<SalesContextProps | undefined>(undefined);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SalesState>(defaultState);
  const { toast } = useToast();
  
  // Load held bills from localStorage on component mount
  useEffect(() => {
    try {
      // Load held bills
      const savedBills = localStorage.getItem('heldBills');
      if (savedBills) {
        const heldBills = JSON.parse(savedBills) as HeldBill[];
        setState(prev => ({
          ...prev,
          heldSales: heldBills
        }));
      }
      
      // Legacy support: Check for old single held bill format
      const oldHeldBill = localStorage.getItem('heldBill');
      if (oldHeldBill) {
        const heldSale = JSON.parse(oldHeldBill) as SaleFormData;
        setState(prev => ({
          ...prev,
          heldSale,
          showHeldSalePrompt: true
        }));
      }
    } catch (error) {
      console.error('Error loading held bills:', error);
    }
  }, []);

  // Customer information update
  const updateCustomerInfo = (name: string, value: string) => {
    setState(prev => ({
      ...prev,
      saleFormData: {
        ...prev.saleFormData,
        [name]: value
      }
    }));
  };

  // Payment method update
  const updatePaymentMethod = (method: PaymentMethod) => {
    setState(prev => ({
      ...prev,
      saleFormData: {
        ...prev.saleFormData,
        paymentMethod: method
      }
    }));
  };

  // Notes update
  const updateNotes = (notes: string) => {
    setState(prev => ({
      ...prev,
      saleFormData: {
        ...prev.saleFormData,
        notes
      }
    }));
  };

  // Add item to sale
  const addItemToSale = (
    item: InventoryItem, 
    quantity: number, 
    discountType: DiscountType,
    discountValue: number
  ) => {
    // Calculate the total price with discount applied
    const price = item.mrp;
    const totalPrice = calculateItemPrice(price, quantity, discountType, discountValue);

    const saleItem: SaleItem = {
      item,
      quantity,
      price,
      totalPrice
    };

    // Add the specific discount type and value
    if (discountType === DiscountType.PERCENTAGE && discountValue > 0) {
      saleItem.dividendPercentage = discountValue;
    } else if (discountType === DiscountType.DIVISOR && discountValue > 0) {
      saleItem.dividendDivisor = discountValue;
    }

    setState(prev => ({
      ...prev,
      saleFormData: {
        ...prev.saleFormData,
        items: [...prev.saleFormData.items, saleItem]
      }
    }));

    toast({
      title: "Item Added",
      description: `Added ${quantity} ${item.base_unit} of ${item.item_name} to sale`
    });
  };

  // Update sale item quantity
  const updateSaleItemQuantity = (index: number, quantity: number) => {
    setState(prev => {
      const updatedItems = [...prev.saleFormData.items];
      if (updatedItems[index]) {
        const item = updatedItems[index];
        
        // Determine discount type and value
        const discountType = item.dividendPercentage !== undefined 
          ? DiscountType.PERCENTAGE 
          : item.dividendDivisor !== undefined 
            ? DiscountType.DIVISOR 
            : DiscountType.NONE;
        
        const discountValue = item.dividendPercentage !== undefined 
          ? item.dividendPercentage 
          : item.dividendDivisor !== undefined 
            ? item.dividendDivisor 
            : 0;
        
        const totalPrice = calculateItemPrice(item.price, quantity, discountType, discountValue);
        
        updatedItems[index] = {
          ...item,
          quantity,
          totalPrice
        };
      }
      
      return {
        ...prev,
        saleFormData: {
          ...prev.saleFormData,
          items: updatedItems
        }
      };
    });
  };

  // Update sale item discount
  const updateSaleItemDiscount = (
    index: number, 
    discountType: DiscountType,
    discountValue: number
  ) => {
    setState(prev => {
      const updatedItems = [...prev.saleFormData.items];
      if (updatedItems[index]) {
        const item = updatedItems[index];
        
        // Calculate new price with updated discount
        const totalPrice = calculateItemPrice(item.price, item.quantity, discountType, discountValue);
        
        // Create updated item with new discount values
        const updatedItem: SaleItem = {
          ...item,
          totalPrice,
          dividendPercentage: undefined,
          dividendDivisor: undefined
        };
        
        // Set the specific discount type and value
        if (discountType === DiscountType.PERCENTAGE && discountValue > 0) {
          updatedItem.dividendPercentage = discountValue;
        } else if (discountType === DiscountType.DIVISOR && discountValue > 0) {
          updatedItem.dividendDivisor = discountValue;
        }
        
        updatedItems[index] = updatedItem;
      }
      
      return {
        ...prev,
        saleFormData: {
          ...prev.saleFormData,
          items: updatedItems
        }
      };
    });
  };

  // Remove item from sale
  const removeSaleItem = (index: number) => {
    setState(prev => {
      const updatedItems = [...prev.saleFormData.items];
      updatedItems.splice(index, 1);
      
      return {
        ...prev,
        saleFormData: {
          ...prev.saleFormData,
          items: updatedItems
        }
      };
    });

    toast({
      title: "Item Removed",
      description: "Item has been removed from the sale"
    });
  };

  // Clear all items from sale
  const clearSaleItems = () => {
    setState(prev => ({
      ...prev,
      saleFormData: {
        ...prev.saleFormData,
        items: []
      }
    }));

    toast({
      title: "Cart Cleared",
      description: "All items have been removed from the sale"
    });
  };

  // Process the sale
  const processSale = async () => {
    const { saleFormData } = state;
    
    if (saleFormData.items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one item to the sale",
        variant: "destructive"
      });
      return;
    }

    if (!saleFormData.customerName) {
      toast({
        title: "Missing Information",
        description: "Please enter customer name",
        variant: "destructive"
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Process the stock reduction for each item through the API
      await api.processSale(saleFormData.items);

      // Calculate sale totals
      const subtotal = saleFormData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Calculate total discount based on the difference between original prices and discounted prices
      const totalDiscount = saleFormData.items.reduce((sum, item) => {
        const originalTotal = item.price * item.quantity;
        return sum + (originalTotal - item.totalPrice);
      }, 0);
      
      const totalTax = 0; // Not calculating tax for now, but could be added
      const grandTotal = subtotal - totalDiscount + totalTax;

      // Create a complete sale record
      const newSale: Sale = {
        id: Math.random().toString(36).substring(2, 15),
        date: new Date().toISOString(),
        items: saleFormData.items,
        customerName: saleFormData.customerName,
        customerPhone: saleFormData.customerPhone,
        customerAddress: saleFormData.customerAddress,
        subtotal,
        totalDiscount,
        totalTax,
        grandTotal,
        paymentMethod: saleFormData.paymentMethod,
        notes: saleFormData.notes
      };

      // Store sale record (this would normally go to a backend API)
      const completedSale = await api.createSaleRecord(newSale);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        completedSales: [...prev.completedSales, completedSale],
        currentSale: completedSale
      }));
      
      // Automatically generate and print the bill
      printSaleBill(completedSale);
      
      toast({
        title: "Sale Completed",
        description: "The sale has been processed successfully"
      });
      
      // Reset the form for a new sale
      resetSaleForm();
      
    } catch (error) {
      console.error('Error processing sale:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to process sale'
      }));
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to process sale',
        variant: "destructive"
      });
    }
  };

  // Reset the sale form
  const resetSaleForm = () => {
    setState(prev => ({
      ...prev,
      saleFormData: initialSaleFormData
    }));
  };

  // Download bill as PDF
  const downloadBill = (sale: Sale) => {
    downloadSaleBill(sale);
    
    toast({
      title: "Download Started",
      description: "Your bill is being downloaded"
    });
  };

  // Print bill
  const printBill = (sale: Sale) => {
    printSaleBill(sale);
    
    toast({
      title: "Print Started",
      description: "Your bill is being prepared for printing"
    });
  };
  
  // Export sale to JSON
  const exportSaleJson = (sale: Sale) => {
    exportSaleToJson(sale);
    
    toast({
      title: "Export Started",
      description: "Your sale data is being exported as JSON"
    });
  };
  
  // Import sale from JSON
  const importSaleFromJson = (jsonData: string) => {
    try {
      // Parse the JSON data
      const saleData = JSON.parse(jsonData) as Sale;
      
      // Validate the imported data
      if (!saleData || !saleData.items || !Array.isArray(saleData.items)) {
        throw new Error("Invalid sale data format");
      }
      
      // Add to completed sales and set as current sale
      setState(prev => ({
        ...prev,
        completedSales: [...prev.completedSales, saleData],
        currentSale: saleData
      }));
      
      toast({
        title: "Import Successful",
        description: "Sale data has been imported successfully"
      });
    } catch (error) {
      console.error("Error importing sale data:", error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import sale data",
        variant: "destructive"
      });
    }
  };

  // Hold the current bill in localStorage
  const holdBill = () => {
    // Only hold bills with items
    if (state.saleFormData.items.length === 0) {
      toast({
        title: "No Items",
        description: "There are no items to hold",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create a unique ID for this held bill
      const timestamp = new Date().getTime();
      const billId = `heldBill_${timestamp}`;
      
      // Create a bill with timestamp and data
      const billToHold = {
        id: billId,
        timestamp,
        customerName: state.saleFormData.customerName || "Customer",
        data: state.saleFormData
      };
      
      // Get existing held bills
      let heldBills = [];
      const savedBills = localStorage.getItem('heldBills');
      if (savedBills) {
        heldBills = JSON.parse(savedBills);
      }
      
      // Add the new bill to the list
      heldBills.push(billToHold);
      
      // Save the updated list
      localStorage.setItem('heldBills', JSON.stringify(heldBills));
      
      toast({
        title: "Bill Held",
        description: "Your bill has been saved and can be resumed later",
      });
      
      // Reset the form for a new sale
      resetSaleForm();
    } catch (error) {
      console.error('Error holding bill:', error);
      toast({
        title: "Error",
        description: "Failed to hold the bill",
        variant: "destructive"
      });
    }
  };
  
  // Resume a held bill
  const resumeHeldBill = (bill?: HeldBill) => {
    try {
      if (bill) {
        // If a specific bill is provided (from the held bills list)
        setState(prev => ({
          ...prev,
          saleFormData: bill.data,
          showHeldSalesList: false
        }));
        
        // Get existing held bills
        let heldBills = [];
        const savedBills = localStorage.getItem('heldBills');
        if (savedBills) {
          heldBills = JSON.parse(savedBills);
          // Remove this bill from the list
          heldBills = heldBills.filter((b: HeldBill) => b.id !== bill.id);
          // Save the updated list
          localStorage.setItem('heldBills', JSON.stringify(heldBills));
        }
        
        toast({
          title: "Bill Resumed",
          description: "Your held bill has been restored",
        });
      } else if (state.heldSale) {
        // For compatibility with the old system
        setState(prev => ({
          ...prev,
          saleFormData: state.heldSale as SaleFormData,
          heldSale: null,
          showHeldSalePrompt: false
        }));
        
        // Remove the held bill from localStorage
        localStorage.removeItem('heldBill');
        
        toast({
          title: "Bill Resumed",
          description: "Your held bill has been restored",
        });
      }
    } catch (error) {
      console.error('Error resuming held bill:', error);
      toast({
        title: "Error",
        description: "Failed to resume the held bill",
        variant: "destructive"
      });
    }
  };

  // Toggle the held bills list visibility
  const toggleHeldBillsList = () => {
    setState(prev => ({
      ...prev,
      showHeldSalesList: !prev.showHeldSalesList
    }));
  };

  // Load a specific held bill by ID
  const loadHeldBill = (billId: string) => {
    try {
      const savedBills = localStorage.getItem('heldBills');
      if (savedBills) {
        const heldBills = JSON.parse(savedBills);
        const bill = heldBills.find((b: HeldBill) => b.id === billId);
        
        if (bill) {
          resumeHeldBill(bill);
        }
      }
    } catch (error) {
      console.error('Error loading held bill:', error);
      toast({
        title: "Error",
        description: "Failed to load the held bill",
        variant: "destructive"
      });
    }
  };

  // Delete a held bill by ID
  const deleteHeldBill = (billId: string) => {
    try {
      const savedBills = localStorage.getItem('heldBills');
      if (savedBills) {
        let heldBills = JSON.parse(savedBills);
        // Filter out the bill to delete
        heldBills = heldBills.filter((b: HeldBill) => b.id !== billId);
        // Save the updated list
        localStorage.setItem('heldBills', JSON.stringify(heldBills));
        
        // Update state with the remaining bills
        setState(prev => ({
          ...prev,
          heldSales: heldBills
        }));
        
        toast({
          title: "Bill Deleted",
          description: "The held bill has been removed",
        });
      }
    } catch (error) {
      console.error('Error deleting held bill:', error);
      toast({
        title: "Error",
        description: "Failed to delete the held bill",
        variant: "destructive"
      });
    }
  };
  
  // Dismiss the held bill prompt
  const dismissHeldBillPrompt = () => {
    setState(prev => ({
      ...prev,
      showHeldSalePrompt: false
    }));
  };

  const value: SalesContextProps = {
    ...state,
    updateCustomerInfo,
    updatePaymentMethod,
    updateNotes,
    addItemToSale,
    updateSaleItemQuantity,
    updateSaleItemDiscount,
    removeSaleItem,
    clearSaleItems,
    processSale,
    resetSaleForm,
    downloadBill,
    printBill,
    exportSaleJson,
    importSaleFromJson,
    holdBill,
    resumeHeldBill,
    dismissHeldBillPrompt,
    toggleHeldBillsList,
    loadHeldBill,
    deleteHeldBill
  };

  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
}