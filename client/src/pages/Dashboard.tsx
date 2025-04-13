import { useInventory } from "@/context/InventoryContext";
import FilterBar from "@/components/FilterBar";
import InventoryTable from "@/components/InventoryTable";

export default function Dashboard() {
  const { prepareAddItem, prepareBulkImport } = useInventory();

  return (
    <div id="dashboardView" className="space-y-6">
      {/* Header section with background and gradient */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
        <div className="p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            {/* Page title with decorative elements */}
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-lg mr-4 hidden sm:block">
                <i className="bx bx-package text-blue-600 text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                  Inventory Dashboard
                  <span className="ml-3 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Production</span>
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your inventory items, stock levels, and get real-time insights.
                </p>
              </div>
            </div>

            {/* Action buttons with improved styling */}
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-sm flex items-center justify-center text-sm font-medium"
                onClick={prepareBulkImport}
              >
                <i className="bx bx-import text-blue-600 mr-2"></i>
                Bulk Import
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center text-sm font-medium"
                onClick={prepareAddItem}
              >
                <i className="bx bx-plus mr-2"></i>
                Add Inventory
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Items</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">156</h3>
                </div>
                <div className="bg-blue-100 rounded-full p-2">
                  <i className="bx bx-box text-blue-600"></i>
                </div>
              </div>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-green-600 font-medium flex items-center">
                  <i className="bx bx-up-arrow-alt"></i> 12%
                </span>
                <span className="text-slate-500 ml-1.5">from last month</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Low Stock</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">23</h3>
                </div>
                <div className="bg-amber-100 rounded-full p-2">
                  <i className="bx bx-error text-amber-600"></i>
                </div>
              </div>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-red-600 font-medium flex items-center">
                  <i className="bx bx-up-arrow-alt"></i> 8%
                </span>
                <span className="text-slate-500 ml-1.5">from last week</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Out of Stock</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">7</h3>
                </div>
                <div className="bg-red-100 rounded-full p-2">
                  <i className="bx bx-x-circle text-red-600"></i>
                </div>
              </div>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-amber-600 font-medium flex items-center">
                  <i className="bx bx-minus"></i> 0%
                </span>
                <span className="text-slate-500 ml-1.5">no change</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Value</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">₹2.4M</h3>
                </div>
                <div className="bg-green-100 rounded-full p-2">
                  <i className="bx bx-rupee text-green-600"></i>
                </div>
              </div>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-green-600 font-medium flex items-center">
                  <i className="bx bx-up-arrow-alt"></i> 18%
                </span>
                <span className="text-slate-500 ml-1.5">from last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter bar */}
      <FilterBar />
      
      {/* Inventory table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <InventoryTable />
      </div>
    </div>
  );
}
