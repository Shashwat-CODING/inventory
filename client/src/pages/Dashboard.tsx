import { useInventory } from "@/context/InventoryContext";
import FilterBar from "@/components/FilterBar";
import InventoryTable from "@/components/InventoryTable";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { prepareAddItem, prepareBulkImport, items } = useInventory();
  const [animateStats, setAnimateStats] = useState(false);

  // Trigger stats animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setAnimateStats(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Calculate stats from actual data
  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.available_stock < 10).length;
  const outOfStockItems = items.filter(item => item.available_stock === 0).length;
  const totalValue = items.reduce((sum, item) => sum + (item.available_stock * item.mrp), 0);

  return (
    <div id="dashboardView" className="space-y-6">
      {/* Enhanced header section with visual polish */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
        <div className="h-2 bg-gradient-to-r from-indigo-600 via-blue-500 to-purple-600 bg-[length:400%_100%] animate-gradient"></div>
        <div className="p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            {/* Updated page title with enhanced visuals */}
            <div className="flex items-start">
              <div className="bg-indigo-100 p-2.5 rounded-xl mr-4 hidden sm:flex items-center justify-center shadow-sm border border-indigo-200 text-indigo-700">
                <i className="bx bx-package text-2xl"></i>
              </div>
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-slate-900">
                    Inventory Dashboard
                  </h1>
                  <div className="ml-3 text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium border border-indigo-200 shadow-sm flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                    Production
                  </div>
                </div>
                <p className="mt-1.5 text-sm text-slate-600">
                  Manage your inventory items, stock levels, and get real-time insights.
                </p>
              </div>
            </div>

            {/* Enhanced action buttons with hover effects */}
            <div className="mt-5 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-700 transition-all shadow-sm flex items-center justify-center text-sm font-medium"
                onClick={prepareBulkImport}
              >
                <i className="bx bx-import text-indigo-600 mr-2 text-lg"></i>
                Bulk Import
              </button>
              <button
                className="px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center text-sm font-medium"
                onClick={prepareAddItem}
              >
                <i className="bx bx-plus mr-2 text-lg"></i>
                Add Inventory
              </button>
            </div>
          </div>

          {/* Redesigned animated stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-6">
            <div className={`bg-gradient-to-br from-white to-indigo-50 p-5 rounded-xl border border-indigo-100 shadow-sm transition-all duration-700 ease-out transform ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider flex items-center">
                    <i className="bx bx-box mr-1"></i> Total Items
                  </p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1.5">{totalItems}</h3>
                </div>
                <div className="bg-indigo-100 rounded-lg p-2.5 border border-indigo-200 shadow-sm">
                  <i className="bx bx-package text-indigo-700 text-xl"></i>
                </div>
              </div>
              <div className="flex items-center mt-3 text-xs">
                <span className="text-green-600 font-medium flex items-center bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                  <i className="bx bx-up-arrow-alt mr-0.5"></i> 12%
                </span>
                <span className="text-slate-500 ml-1.5">from last month</span>
              </div>
            </div>

            <div className={`bg-gradient-to-br from-white to-amber-50 p-5 rounded-xl border border-amber-100 shadow-sm transition-all duration-700 delay-100 ease-out transform ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-amber-600 uppercase tracking-wider flex items-center">
                    <i className="bx bx-error-circle mr-1"></i> Low Stock
                  </p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1.5">{lowStockItems}</h3>
                </div>
                <div className="bg-amber-100 rounded-lg p-2.5 border border-amber-200 shadow-sm">
                  <i className="bx bx-error text-amber-700 text-xl"></i>
                </div>
              </div>
              <div className="flex items-center mt-3 text-xs">
                <span className="text-red-600 font-medium flex items-center bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  <i className="bx bx-up-arrow-alt mr-0.5"></i> 8%
                </span>
                <span className="text-slate-500 ml-1.5">from last week</span>
              </div>
            </div>

            <div className={`bg-gradient-to-br from-white to-red-50 p-5 rounded-xl border border-red-100 shadow-sm transition-all duration-700 delay-200 ease-out transform ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-red-600 uppercase tracking-wider flex items-center">
                    <i className="bx bx-x-circle mr-1"></i> Out of Stock
                  </p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1.5">{outOfStockItems}</h3>
                </div>
                <div className="bg-red-100 rounded-lg p-2.5 border border-red-200 shadow-sm">
                  <i className="bx bx-x-circle text-red-700 text-xl"></i>
                </div>
              </div>
              <div className="flex items-center mt-3 text-xs">
                <span className="text-amber-600 font-medium flex items-center bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  <i className="bx bx-minus mr-0.5"></i> 0%
                </span>
                <span className="text-slate-500 ml-1.5">no change</span>
              </div>
            </div>

            <div className={`bg-gradient-to-br from-white to-emerald-50 p-5 rounded-xl border border-emerald-100 shadow-sm transition-all duration-700 delay-300 ease-out transform ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider flex items-center">
                    <i className="bx bx-rupee mr-1"></i> Total Value
                  </p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1.5">₹{(totalValue / 1000000).toFixed(1)}M</h3>
                </div>
                <div className="bg-emerald-100 rounded-lg p-2.5 border border-emerald-200 shadow-sm">
                  <i className="bx bx-rupee text-emerald-700 text-xl"></i>
                </div>
              </div>
              <div className="flex items-center mt-3 text-xs">
                <span className="text-green-600 font-medium flex items-center bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                  <i className="bx bx-up-arrow-alt mr-0.5"></i> 18%
                </span>
                <span className="text-slate-500 ml-1.5">from last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter bar */}
      <FilterBar />
      
      {/* Inventory table with enhanced styling */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
        <InventoryTable />
      </div>
    </div>
  );
}
