import {
  InventoryItem,
  NewInventoryItem,
  StockAdjustment,
  BulkImportData,
} from "../types/inventory";
import { Sale, SaleItem } from "../types/sales";

const API_BASE_URL = "https://inventory-management-mu-azure.vercel.app/api";

// Helper function to handle API errors
async function handleApiResponse<T>(response: Response, errorMessage: string): Promise<T> {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.error || errorMessage);
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error(errorMessage);
    }
  }
  return await response.json();
}

// Get all inventory items
export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/inventory`);
  return handleApiResponse<InventoryItem[]>(response, "Failed to fetch inventory items");
}

// Get a single inventory item by ID
export async function fetchInventoryItem(id: number): Promise<InventoryItem> {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}`);
  return handleApiResponse<InventoryItem>(response, `Failed to fetch inventory item ${id}`);
}

// Create a new inventory item
export async function createInventoryItem(
  item: NewInventoryItem,
): Promise<InventoryItem> {
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  return handleApiResponse<InventoryItem>(response, "Failed to create inventory item");
}

// Update an existing inventory item
export async function updateInventoryItem(
  id: number,
  item: Partial<InventoryItem>,
): Promise<InventoryItem> {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  return handleApiResponse<InventoryItem>(response, `Failed to update inventory item ${id}`);
}

// Delete an inventory item
export async function deleteInventoryItem(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    method: "DELETE",
  });

  return handleApiResponse<{ message: string }>(response, `Failed to delete inventory item ${id}`);
}

// Add stock to an inventory item
export async function addStock(
  id: number,
  data: StockAdjustment,
): Promise<InventoryItem> {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}/add-stock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<InventoryItem>(response, `Failed to add stock to item ${id}`);
}

// Sell stock from an inventory item
export async function sellStock(
  id: number,
  data: StockAdjustment,
): Promise<InventoryItem> {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}/sell`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<InventoryItem>(response, `Failed to sell stock from item ${id}`);
}

// Bulk import inventory items
export async function bulkImport(data: FormData): Promise<{ message: string }> {
  const format = data.get('format') as string;
  
  // If this is a JSON import and we have the parsed data, handle it specially
  if (format === 'json' && data.has('data')) {
    const jsonData = data.get('data') as string;
    
    // Send the JSON data directly in the request body
    const response = await fetch(`${API_BASE_URL}/inventory/bulk-import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonData,
    });
    
    return handleApiResponse<{ message: string }>(response, "Failed to import inventory items");
  } else {
    // For CSV or other formats, send as FormData
    const response = await fetch(`${API_BASE_URL}/inventory/bulk-import`, {
      method: "POST",
      body: data,
    });
    
    return handleApiResponse<{ message: string }>(response, "Failed to import inventory items");
  }
}

// Reset database
export async function resetDatabase(): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/reset`, {
    method: "POST",
  });

  return handleApiResponse<{ message: string }>(response, "Failed to reset database");
}

// Process multiple stock sales at once
export async function processSale(items: SaleItem[]): Promise<InventoryItem[]> {
  const updatedItems: InventoryItem[] = [];

  try {
    // Process each sale item sequentially
    for (const item of items) {
      if (!item.item || !item.item.id) {
        throw new Error("Invalid item data: missing item ID");
      }
      
      const updatedItem = await sellStock(item.item.id, {
        quantity: item.quantity,
      });
      
      updatedItems.push(updatedItem);
    }
    
    return updatedItems;
  } catch (error) {
    console.error("Error processing sale:", error);
    throw error;
  }
}

// Generate and store a sale record
export async function createSaleRecord(sale: Sale): Promise<Sale> {
  // Since the API doesn't have a sales endpoint, we'll generate a receipt locally
  // In a production app, you would send this to your backend
  return {
    ...sale,
    id: Math.random().toString(36).substring(2, 15),
    date: new Date().toISOString(),
  };
}
