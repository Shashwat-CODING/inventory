import { InventoryItem } from '../types/inventory';

// Format currency values - handles both string and number inputs
export function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(numValue);
}

// Format dates
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
}

// Calculate profit margin - we don't have cost_price in the new API, so we'll use a default margin
export function calculateMargin(mrp: string | number): string {
  // Since we don't have cost price in the new API, assume a default 30% margin
  const numValue = typeof mrp === 'string' ? parseFloat(mrp) : mrp;
  if (numValue === 0) return '0.00%';
  return '30.00%'; // Default margin
}

// Get CSS class for status badge
export function getStatusBadgeClass(item: InventoryItem): string {
  const stockNum = typeof item.stock === 'string' ? parseFloat(item.stock) : item.stock;
  const isLowStock = stockNum < 5; // Assuming low stock is less than 5 units
  
  if (isLowStock) {
    return 'badge-low-stock';
  } else if (item.status === 'true') {
    return 'badge-active';
  } else {
    return 'badge-inactive';
  }
}

// Get status text
export function getStatusText(item: InventoryItem): string {
  const stockNum = typeof item.stock === 'string' ? parseFloat(item.stock) : item.stock;
  const isLowStock = stockNum < 5; // Assuming low stock is less than 5 units
  
  if (isLowStock) {
    return 'Low Stock';
  } else if (item.status === 'true') {
    return 'Active';
  } else {
    return 'Inactive';
  }
}

// Generate CSS class name for sort indicator
export function getSortIndicatorClass(currentField: string, sortField: string, sortDirection: string): string {
  if (currentField !== sortField) {
    return 'invisible';
  }
  
  return sortDirection === 'asc' ? 'bx-chevron-up' : 'bx-chevron-down';
}

// Filter inventory items based on search, division, and status
export function filterItems(
  items: InventoryItem[], 
  search: string, 
  division: string, 
  status: string
): InventoryItem[] {
  return items.filter(item => {
    // Apply search filter
    const matchesSearch = !search || 
      item.mcode.toLowerCase().includes(search.toLowerCase()) ||
      item.desca.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase()) ||
      item.barcode.toLowerCase().includes(search.toLowerCase());
    
    // Apply division filter
    const matchesDivision = !division || 
      item.divisions === division || 
      item.multi_itemdivision.includes(division);
    
    // Apply status filter
    let matchesStatus = true;
    if (status) {
      const stockNum = typeof item.stock === 'string' ? parseFloat(item.stock) : item.stock;
      if (status === 'Low Stock') {
        matchesStatus = stockNum < 5;
      } else if (status === 'Active') {
        matchesStatus = item.status === 'true';
      } else if (status === 'Inactive') {
        matchesStatus = item.status === 'false';
      }
    }
    
    return matchesSearch && matchesDivision && matchesStatus;
  });
}

// Sort inventory items
export function sortItems(
  items: InventoryItem[], 
  sortField: keyof InventoryItem, 
  sortDirection: 'asc' | 'desc'
): InventoryItem[] {
  return [...items].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle numeric string values - convert to numbers
    if (sortField === 'mrp' || sortField === 'gst' || sortField === 'stock') {
      aValue = typeof aValue === 'string' ? parseFloat(aValue) : aValue;
      bValue = typeof bValue === 'string' ? parseFloat(bValue) : bValue;
    }
    // Handle string comparison
    else if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = (aValue as string).toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
}
