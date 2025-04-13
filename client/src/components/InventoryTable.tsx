import { useInventory } from "@/context/InventoryContext";
import { formatCurrency, getStatusBadgeClass, getStatusText, getSortIndicatorClass, filterItems, sortItems } from "@/utils/formatters";
import { SortField, SortDirection, InventoryItem } from "@/types/inventory";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

export default function InventoryTable() {
  const { 
    items, 
    filters, 
    sorting,
    isLoading,
    setSorting,
    clearFilters,
    prepareAddItem,
    prepareEditItem,
    prepareAddStock,
    prepareSellStock,
    prepareDeleteItem
  } = useInventory();

  const [, setLocation] = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile view based on screen width
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    
    // Check on initial load
    checkIfMobile();
    
    // Set up event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  const handleClearFilters = () => {
    clearFilters();
  };

  // Apply filters and sorting
  const filteredItems = filterItems(items, filters.search, filters.division, filters.status);
  const sortedItems = sortItems(filteredItems, sorting.field, sorting.direction);

  const handleSort = (field: SortField) => {
    if (sorting.field === field) {
      // Toggle direction if same field
      setSorting(field, sorting.direction === 'asc' ? 'desc' : 'asc');
    } else {
      // New sort field, default to ascending
      setSorting(field, 'asc');
    }
  };

  const viewItemDetails = (id: number) => {
    setLocation(`/item/${id}`);
  };

  if (isLoading) {
    // Show different loading states for mobile and desktop
    if (isMobile) {
      return (
        <div className="bg-white shadow-md rounded-xl border border-slate-200 overflow-hidden animate-pulse">
          <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
            <div className="h-6 bg-slate-200 rounded w-3/4"></div>
          </div>
          
          <div className="divide-y divide-slate-200">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-2/3">
                    <div className="h-5 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-4/5"></div>
                  </div>
                  <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 my-3">
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-1"></div>
                    <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                  </div>
                  
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-1"></div>
                    <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-3 pt-2 border-t border-slate-100">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 bg-slate-200 rounded-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Desktop loading state
    return (
      <div className="bg-white shadow-md rounded-xl border border-slate-200 overflow-hidden animate-pulse">
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center">
              <div className="h-10 w-10 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
            </div>
            <div className="absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center">
              <div className="h-6 w-6 border-t-2 border-indigo-600 rounded-full animate-spin"></div>
            </div>
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-1">Loading Inventory Data</h3>
          <p className="text-sm text-slate-500">Please wait while we fetch the latest inventory information...</p>
        </div>
      </div>
    );
  }

  if (sortedItems.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-xl border border-slate-200 overflow-hidden">
        <div className="py-12 flex flex-col items-center justify-center text-center px-4">
          <div className="relative">
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-pulse"></div>
            <div className="rounded-full bg-indigo-50 p-6 mb-5 shadow-sm relative border border-indigo-100">
              <i className="bx bx-package text-indigo-400 text-4xl"></i>
            </div>
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">No Inventory Items Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            {filters.search || filters.division || filters.status 
              ? 'No items match your current filters. Try adjusting your search criteria or clearing filters.'
              : 'There are no inventory items in the system yet. Get started by adding your first inventory item.'}
          </p>
          {(filters.search || filters.division || filters.status) ? (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-700 transition-all shadow-sm flex items-center text-sm"
            >
              <i className="bx bx-x text-slate-500 mr-2"></i>
              Clear All Filters
            </button>
          ) : (
            <button
              onClick={prepareAddItem}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm flex items-center text-sm"
            >
              <i className="bx bx-plus mr-2"></i>
              Add Inventory Item
            </button>
          )}
        </div>
      </div>
    );
  }

  // Mobile card view for items
  if (isMobile) {
    return (
      <div className="bg-white shadow-md rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
          <div className="flex items-center">
            <i className="bx bx-list-ul text-indigo-500 mr-2"></i>
            <span className="text-sm font-medium text-slate-700">Inventory Items ({sortedItems.length})</span>
          </div>
          <div className="text-xs text-slate-500">
            {sorting.field && (
              <span className="flex items-center">
                Sorted by {sorting.field.toString().replace('_', ' ')} 
                <i className={`bx ${sorting.direction === 'asc' ? 'bx-sort-up' : 'bx-sort-down'} ml-1 text-indigo-500`}></i>
              </span>
            )}
          </div>
        </div>
        
        <div className="divide-y divide-slate-200">
          {sortedItems.map((item) => (
            <MobileItemCard 
              key={item.id} 
              item={item}
              onView={() => viewItemDetails(item.id)}
              onEdit={() => prepareEditItem(item)}
              onAddStock={() => prepareAddStock(item)}
              onSellStock={() => prepareSellStock(item)}
              onDelete={() => prepareDeleteItem(item)}
            />
          ))}
        </div>
        
        {/* Mobile pagination */}
        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <p className="text-xs text-slate-500">
            Showing {sortedItems.length} of {items.length}
          </p>
          <div className="flex space-x-1">
            <button className="p-1.5 text-slate-500 bg-white border border-slate-200 rounded disabled:opacity-50" disabled>
              <i className="bx bx-chevron-left"></i>
            </button>
            <button className="p-1.5 text-white bg-indigo-600 border border-indigo-600 rounded">
              1
            </button>
            <button className="p-1.5 text-slate-500 bg-white border border-slate-200 rounded">
              <i className="bx bx-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="overflow-hidden bg-white shadow-md rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider cursor-pointer border-b border-slate-200"
                onClick={() => handleSort('mcode')}
              >
                <div className="flex items-center">
                  <span>Code</span>
                  <i className={`bx ml-1.5 text-indigo-500 ${getSortIndicatorClass('mcode', sorting.field, sorting.direction)}`}></i>
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider cursor-pointer border-b border-slate-200"
                onClick={() => handleSort('desca')}
              >
                <div className="flex items-center">
                  <span>Description</span>
                  <i className={`bx ml-1.5 text-indigo-500 ${getSortIndicatorClass('desca', sorting.field, sorting.direction)}`}></i>
                </div>
              </th>

              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider cursor-pointer border-b border-slate-200"
                onClick={() => handleSort('stock')}
              >
                <div className="flex items-center justify-end">
                  <span>Stock</span>
                  <i className={`bx ml-1.5 text-indigo-500 ${getSortIndicatorClass('stock', sorting.field, sorting.direction)}`}></i>
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider cursor-pointer border-b border-slate-200"
                onClick={() => handleSort('mrp')}
              >
                <div className="flex items-center justify-end">
                  <span>MRP</span>
                  <i className={`bx ml-1.5 text-indigo-500 ${getSortIndicatorClass('mrp', sorting.field, sorting.direction)}`}></i>
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider border-b border-slate-200"
              >
                <span>Status</span>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider border-b border-slate-200"
              >
                <span>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {sortedItems.map((item) => (
              <TableRow 
                key={item.id} 
                item={item}
                onView={() => viewItemDetails(item.id)}
                onEdit={() => prepareEditItem(item)}
                onAddStock={() => prepareAddStock(item)}
                onSellStock={() => prepareSellStock(item)}
                onDelete={() => prepareDeleteItem(item)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced pagination with better styling */}
      <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div>
          <p className="text-sm text-slate-700 flex items-center">
            <i className="bx bx-data text-indigo-400 mr-2"></i>
            Showing <span className="font-medium mx-1">1</span> to <span className="font-medium mx-1">{sortedItems.length}</span> of <span className="font-medium mx-1">{items.length}</span> items
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex shadow-sm rounded-md" aria-label="Pagination">
            <button className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled>
              <i className="bx bx-chevron-left"></i>
            </button>
            <button className="relative inline-flex items-center px-4 py-2 border border-indigo-600 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
              1
            </button>
            <button className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors">
              <i className="bx bx-chevron-right"></i>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

// Mobile card component for inventory items
function MobileItemCard({ item, onView, onEdit, onAddStock, onSellStock, onDelete }: TableRowProps) {
  const statusClass = getStatusBadgeClass(item);
  const statusText = getStatusText(item);
  const stockNum = typeof item.stock === 'string' ? parseFloat(item.stock) : item.stock;
  const isLowStock = stockNum < 5;
  
  // Format GST percentage
  const gstValue = typeof item.gst === 'string' ? parseFloat(item.gst) : item.gst;
  
  // Format price properly
  const price = typeof item.mrp === 'string' ? parseFloat(item.mrp) : item.mrp;
  
  return (
    <div className="p-4 bg-white hover:bg-slate-50 transition-all">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-2">
          <h3 className="font-medium text-slate-800 break-words">{item.desca}</h3>
          <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap">
            <span className="mr-2">Code: {item.mcode}</span>
            <span>Barcode: {item.barcode || 'N/A'}</span>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full whitespace-nowrap ${statusClass}`}>
          {statusText}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 my-3">
        <div className="bg-slate-50 p-2 rounded border border-slate-200">
          <div className="text-xs text-slate-500">Stock</div>
          <div className={`font-medium ${isLowStock ? 'text-amber-600' : 'text-slate-700'}`}>
            {stockNum} {item.unit || 'Units'}
          </div>
        </div>
        
        <div className="bg-slate-50 p-2 rounded border border-slate-200">
          <div className="text-xs text-slate-500">Price</div>
          <div className="font-medium text-slate-700">{formatCurrency(price)}</div>
          <div className="text-xs text-slate-500 mt-0.5">GST: {gstValue}%</div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="col-span-3 flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="text-xs text-slate-500 truncate">
            {item.divisions ? `Division: ${item.divisions}` : ''}
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={onView}
              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              title="View Details"
              aria-label="View Details"
            >
              <i className="bx bx-info-circle"></i>
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              title="Edit"
              aria-label="Edit Item"
            >
              <i className="bx bx-edit"></i>
            </button>
          </div>
        </div>
        
        <button
          onClick={onAddStock}
          className="flex-1 p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
          title="Add Stock"
        >
          <i className="bx bx-plus-circle mr-1.5"></i>
          Add
        </button>
        
        <button
          onClick={onSellStock}
          className="flex-1 p-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
          title="Sell Stock"
        >
          <i className="bx bx-minus-circle mr-1.5"></i>
          Sell
        </button>
        
        <button
          onClick={onDelete}
          className="flex-1 p-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
          title="Delete"
        >
          <i className="bx bx-trash mr-1.5"></i>
          Delete
        </button>
      </div>
    </div>
  );
}

interface TableRowProps {
  item: InventoryItem;
  onView: () => void;
  onEdit: () => void;
  onAddStock: () => void;
  onSellStock: () => void;
  onDelete: () => void;
}

function TableRow({ item, onView, onEdit, onAddStock, onSellStock, onDelete }: TableRowProps) {
  const statusClass = getStatusBadgeClass(item);
  const statusText = getStatusText(item);
  
  // Calculate low stock warning
  const stockNum = typeof item.stock === 'string' ? parseFloat(item.stock) : item.stock;
  const isLowStock = stockNum < 5;
  
  // Format GST percentage
  const gstValue = typeof item.gst === 'string' ? parseFloat(item.gst) : item.gst;

  return (
    <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm font-medium text-slate-800">{item.mcode}</span>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-slate-700 font-medium">{item.desca}</div>
        <div className="text-xs text-slate-500 mt-0.5">Code: {item.barcode || 'N/A'}</div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className={`text-sm font-medium tabular-nums ${isLowStock ? 'text-amber-600' : 'text-slate-700'}`}>
          {stockNum}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">
          Unit: {item.unit || 'Each'}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="text-sm font-medium text-slate-800 tabular-nums">
          {formatCurrency(item.mrp)}
        </div>
        <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
          GST: {gstValue}%
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${statusClass}`}>
          {statusText}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="flex items-center justify-center space-x-1">
          <button 
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" 
            onClick={onView}
            title="View Details"
          >
            <i className="bx bx-info-circle"></i>
          </button>
          <button 
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" 
            onClick={onEdit}
            title="Edit"
          >
            <i className="bx bx-edit"></i>
          </button>
          <button 
            className="p-1.5 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors" 
            onClick={onAddStock}
            title="Add Stock"
          >
            <i className="bx bx-plus-circle"></i>
          </button>
          <button 
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors" 
            onClick={onSellStock}
            title="Sell Stock"
          >
            <i className="bx bx-minus-circle"></i>
          </button>
          <button 
            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" 
            onClick={onDelete}
            title="Delete"
          >
            <i className="bx bx-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
}