import { useInventory } from "@/context/InventoryContext";
import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { formatCurrency, formatDate, calculateMargin, getStatusBadgeClass, getStatusText } from "@/utils/formatters";

export default function ItemDetails() {
  const { 
    currentItem, 
    fetchItem, 
    isLoading,
    prepareEditItem,
    prepareAddStock,
    prepareSellStock,
    prepareDeleteItem
  } = useInventory();
  
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  
  const itemId = parseInt(params.id);
  
  useEffect(() => {
    if (itemId) {
      fetchItem(itemId).catch(() => {
        setLocation('/'); // Redirect to dashboard on error
      });
    }
  }, [itemId, fetchItem, setLocation]);
  
  const backToDashboard = () => {
    setLocation('/');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-slate-500">Loading item details...</span>
        </div>
      </div>
    );
  }
  
  if (!currentItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h3 className="text-lg font-medium text-slate-900">Item not found</h3>
        <p className="mt-1 text-sm text-slate-500">The item you are looking for does not exist or has been removed.</p>
        <button 
          className="mt-4 btn-primary"
          onClick={backToDashboard}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  const statusClass = getStatusBadgeClass(currentItem);
  const statusText = getStatusText(currentItem);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          className="flex items-center text-sm text-slate-600 hover:text-slate-900"
          onClick={backToDashboard}
        >
          <i className="bx bx-arrow-back mr-1"></i>
          Back to Dashboard
        </button>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{currentItem.item_name}</h2>
            <p className="text-sm text-slate-500">Item Code: {currentItem.item_code}</p>
          </div>
          <div className="flex space-x-2">
            <button 
              className="btn-outlined flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={() => prepareEditItem(currentItem)}
            >
              <i className="bx bx-edit mr-1"></i>
              Edit
            </button>
          </div>
        </div>
        
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500">Basic Information</h3>
                <div className="mt-2 border border-slate-200 rounded-md divide-y divide-slate-200">
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm text-slate-600">Division</span>
                    <span className="text-sm font-medium text-slate-900">{currentItem.division}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm text-slate-600">Vertical</span>
                    <span className="text-sm font-medium text-slate-900">{currentItem.vertical || 'N/A'}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm text-slate-600">Brand</span>
                    <span className="text-sm font-medium text-slate-900">{currentItem.brand}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm text-slate-600">Status</span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                      {statusText}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500">Stock Information</h3>
                <div className="mt-2 border border-slate-200 rounded-md divide-y divide-slate-200">
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm text-slate-600">Opening Stock</span>
                    <span className="text-sm font-medium text-slate-900 tabular-nums">{currentItem.opening_stock}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm text-slate-600">Available Stock</span>
                    <span className="text-sm font-medium text-slate-900 tabular-nums">{currentItem.available_stock}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm text-slate-600">Base Unit</span>
                    <span className="text-sm font-medium text-slate-900">{currentItem.base_unit}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm text-slate-600">Warehouse</span>
                    <span className="text-sm font-medium text-slate-900">{currentItem.warehouse}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500">Pricing Information</h3>
                <div className="mt-2 border border-slate-200 rounded-md divide-y divide-slate-200">
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm text-slate-600">MRP</span>
                    <span className="text-sm font-medium text-slate-900 tabular-nums">{formatCurrency(currentItem.mrp)}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm text-slate-600">Cost Price</span>
                    <span className="text-sm font-medium text-slate-900 tabular-nums">{formatCurrency(currentItem.cost_price)}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm text-slate-600">GST Percentage</span>
                    <span className="text-sm font-medium text-slate-900 tabular-nums">{currentItem.gst_percentage}%</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm text-slate-600">Profit Margin</span>
                    <span 
                      className={`text-sm font-medium ${parseFloat(calculateMargin(currentItem.mrp, currentItem.cost_price)) < 0 ? 'text-red-600' : 'text-green-600'} tabular-nums`}
                    >
                      {calculateMargin(currentItem.mrp, currentItem.cost_price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500">Product Information</h3>
                <div className="mt-2 border border-slate-200 rounded-md divide-y divide-slate-200">
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm text-slate-600">Barcode</span>
                    <span className="text-sm font-medium text-slate-900 tabular-nums">{currentItem.barcode || 'N/A'}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm text-slate-600">Batch</span>
                    <span className="text-sm font-medium text-slate-900">{currentItem.batch || 'N/A'}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm text-slate-600">Manufacturing Date</span>
                    <span className="text-sm font-medium text-slate-900">{formatDate(currentItem.mfg_date)}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-sm text-slate-600">Expiry Date</span>
                    <span className="text-sm font-medium text-slate-900">{formatDate(currentItem.exp_date)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">Stock Adjustment Actions</h3>
              <div className="flex space-x-2">
                <button 
                  className="btn-outlined flex-1 flex items-center justify-center px-4 py-2 border border-emerald-500 rounded-md text-sm font-medium text-emerald-600 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  onClick={() => prepareAddStock(currentItem)}
                >
                  <i className="bx bx-plus-circle mr-1"></i>
                  Add Stock
                </button>
                <button 
                  className="btn-outlined flex-1 flex items-center justify-center px-4 py-2 border border-amber-500 rounded-md text-sm font-medium text-amber-600 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  onClick={() => prepareSellStock(currentItem)}
                >
                  <i className="bx bx-minus-circle mr-1"></i>
                  Sell Stock
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">Management Actions</h3>
              <div className="flex space-x-2">
                <button 
                  className="btn-outlined flex-1 flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={() => prepareEditItem(currentItem)}
                >
                  <i className="bx bx-edit mr-1"></i>
                  Edit Item
                </button>
                <button 
                  className="btn-outlined flex-1 flex items-center justify-center px-4 py-2 border border-red-500 rounded-md text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => prepareDeleteItem(currentItem)}
                >
                  <i className="bx bx-trash mr-1"></i>
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
