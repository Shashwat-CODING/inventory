import { InventoryItem } from '../types/inventory';

// Format currency values
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);
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

// Calculate profit margin
export function calculateMargin(mrp: number, costPrice: number): string {
  if (mrp === 0) return '0.00%';
  const margin = ((mrp - costPrice) / mrp * 100).toFixed(2);
  return `${margin}%`;
}

// Get CSS class for status badge
export function getStatusBadgeClass(item: InventoryItem): string {
  const isLowStock = item.available_stock <= 0.2 * item.opening_stock;
  
  if (isLowStock) {
    return 'badge-low-stock';
  } else if (item.status === 'Active') {
    return 'badge-active';
  } else {
    return 'badge-inactive';
  }
}

// Get status text
export function getStatusText(item: InventoryItem): string {
  const isLowStock = item.available_stock <= 0.2 * item.opening_stock;
  
  if (isLowStock) {
    return 'Low Stock';
  } else {
    return item.status;
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
      item.item_code.toLowerCase().includes(search.toLowerCase()) ||
      item.item_name.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase());
    
    // Apply division filter
    const matchesDivision = !division || item.division === division;
    
    // Apply status filter
    let matchesStatus = true;
    if (status) {
      if (status === 'Low Stock') {
        matchesStatus = item.available_stock <= 0.2 * item.opening_stock;
      } else {
        matchesStatus = item.status === status;
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
    
    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
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
