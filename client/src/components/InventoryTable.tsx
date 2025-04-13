import { useInventory } from "@/context/InventoryContext";
import { formatCurrency, getStatusBadgeClass, getStatusText, getSortIndicatorClass, filterItems, sortItems } from "@/utils/formatters";
import { SortField, SortDirection, InventoryItem } from "@/types/inventory";
import { useLocation } from "wouter";

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
    return (
      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center">
              <div className="h-10 w-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
            <div className="absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center">
              <div className="h-6 w-6 border-t-2 border-blue-600 rounded-full animate-spin"></div>
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
      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div className="py-12 flex flex-col items-center justify-center text-center px-4">
          <div className="relative">
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-pulse"></div>
            <div className="rounded-full bg-slate-100 p-6 mb-5 shadow-inner relative">
              <i className="bx bx-package text-5xl text-slate-400"></i>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No Inventory Items Found</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {filters.search || filters.division || filters.status ? 
              "There are no items matching your current search criteria. Try adjusting your filters or adding new inventory items." :
              "Your inventory is currently empty. Start by adding your first inventory item to begin tracking your stock."}
          </p>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            {(filters.search || filters.division || filters.status) && (
              <button
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center text-sm font-medium"
                onClick={handleClearFilters}
              >
                <i className="bx bx-filter-alt text-slate-500 mr-2"></i>
                Clear Filters
              </button>
            )}
            
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center text-sm font-medium"
              onClick={prepareAddItem}
            >
              <i className="bx bx-plus mr-2"></i>
              Add Inventory Item
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden relative">
      {/* Subtle gradient border at the top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-blue-500 opacity-75"></div>
      
      {/* Table header with action buttons */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 bg-slate-50/50">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Inventory Items</h3>
          <p className="text-sm text-slate-500 mt-1">Manage and monitor your stock levels</p>
        </div>
        <div className="mt-3 sm:mt-0">
          <button 
            onClick={prepareAddItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center text-sm font-medium"
          >
            <i className="bx bx-plus mr-2"></i>
            Add New Item
          </button>
        </div>
      </div>
      
      {/* Main table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-slate-200 table-fixed">
          <thead>
            <tr className="bg-slate-50">
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider cursor-pointer border-b border-slate-200"
                onClick={() => handleSort('item_code')}
              >
                <div className="flex items-center">
                  <span>Item Code</span>
                  <i className={`bx ml-1.5 text-slate-400 ${getSortIndicatorClass('item_code', sorting.field, sorting.direction)}`}></i>
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider cursor-pointer border-b border-slate-200"
                onClick={() => handleSort('item_name')}
              >
                <div className="flex items-center">
                  <span>Name</span>
                  <i className={`bx ml-1.5 text-slate-400 ${getSortIndicatorClass('item_name', sorting.field, sorting.direction)}`}></i>
                </div>
              </th>

              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider cursor-pointer border-b border-slate-200"
                onClick={() => handleSort('available_stock')}
              >
                <div className="flex items-center justify-end">
                  <span>Stock</span>
                  <i className={`bx ml-1.5 text-slate-400 ${getSortIndicatorClass('available_stock', sorting.field, sorting.direction)}`}></i>
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider cursor-pointer border-b border-slate-200"
                onClick={() => handleSort('mrp')}
              >
                <div className="flex items-center justify-end">
                  <span>MRP</span>
                  <i className={`bx ml-1.5 text-slate-400 ${getSortIndicatorClass('mrp', sorting.field, sorting.direction)}`}></i>
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
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            <i className="bx bx-chevron-left mr-1"></i> Previous
          </button>
          <button className="ml-3 px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm">
            Next <i className="bx bx-chevron-right ml-1"></i>
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-700 flex items-center">
              <i className="bx bx-data text-slate-400 mr-2"></i>
              Showing <span className="font-medium mx-1">1</span> to <span className="font-medium mx-1">{sortedItems.length}</span> of <span className="font-medium mx-1">{items.length}</span> items
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex shadow-sm rounded-md" aria-label="Pagination">
              <button className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled>
                <i className="bx bx-chevron-left"></i>
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-blue-600 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                1
              </button>
              <button className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors">
                <i className="bx bx-chevron-right"></i>
              </button>
            </nav>
          </div>
        </div>
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
  const isLowStock = item.available_stock < 10;

  return (
    <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm font-medium text-slate-800">{item.item_code}</span>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-slate-700 font-medium">{item.item_name}</div>
        <div className="text-xs text-slate-500 mt-0.5">Code: {item.barcode || 'N/A'}</div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className={`text-sm font-medium tabular-nums ${isLowStock ? 'text-amber-600' : 'text-slate-700'}`}>
          {item.available_stock}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">
          Unit: {item.base_unit || 'Each'}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="text-sm font-medium text-slate-800 tabular-nums">
          {formatCurrency(item.mrp)}
        </div>
        <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
          Cost: {formatCurrency(item.cost_price)}
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
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" 
            onClick={onView}
            title="View Details"
          >
            <i className="bx bx-info-circle"></i>
          </button>
          <button 
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" 
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
