import { useInventory } from "@/context/InventoryContext";
import { useEffect, useRef } from "react";

export default function FilterBar() {
  const { 
    filters, 
    setFilters, 
    clearFilters 
  } = useInventory();

  const searchInput = useRef<HTMLInputElement>(null);
  const divisionSelect = useRef<HTMLSelectElement>(null);
  const statusSelect = useRef<HTMLSelectElement>(null);

  // Update input elements when filters change
  useEffect(() => {
    if (searchInput.current) {
      searchInput.current.value = filters.search;
    }
    if (divisionSelect.current) {
      divisionSelect.current.value = filters.division;
    }
    if (statusSelect.current) {
      statusSelect.current.value = filters.status;
    }
  }, [filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    setFilters({ ...filters, search });
  };

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const division = e.target.value;
    setFilters({ ...filters, division });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setFilters({ ...filters, status });
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <div className="bg-white shadow-sm rounded-xl p-4 border border-slate-200 relative overflow-hidden">
      {/* Subtle gradient border at the top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-75"></div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto flex items-center">
          <div className="bg-blue-50 p-2 rounded-full text-blue-600 mr-3 hidden sm:block">
            <i className="bx bx-filter-alt"></i>
          </div>
          <h3 className="text-sm font-medium text-slate-700">Filter Inventory</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          {/* Search field with icon */}
          <div className="relative flex-grow col-span-1 sm:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="bx bx-search text-slate-400"></i>
            </div>
            <input
              ref={searchInput}
              type="text"
              placeholder="Search inventory..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
              onChange={handleSearchChange}
            />
          </div>
          
          {/* Division dropdown with icon */}
          <div className="relative col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="bx bx-category text-slate-400"></i>
            </div>
            <select
              ref={divisionSelect}
              className="block w-full pl-10 pr-8 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
              onChange={handleDivisionChange}
            >
              <option value="">All Divisions</option>
              <option value="Electronics">Electronics</option>
              <option value="Food">Food</option>
              <option value="Clothing">Clothing</option>
              <option value="Home">Home</option>
              <option value="Beauty">Beauty</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <i className="bx bx-chevron-down text-slate-400"></i>
            </div>
          </div>
          
          {/* Status dropdown with icon */}
          <div className="relative col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="bx bx-badge-check text-slate-400"></i>
            </div>
            <select
              ref={statusSelect}
              className="block w-full pl-10 pr-8 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
              onChange={handleStatusChange}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Low Stock">Low Stock</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <i className="bx bx-chevron-down text-slate-400"></i>
            </div>
          </div>
        </div>
        
        {/* Clear filters button */}
        <div className="flex">
          <button
            className="px-3 py-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center"
            onClick={handleClearFilters}
          >
            <i className="bx bx-x text-slate-500 mr-1.5"></i>
            Clear
          </button>
          
          <div className="border-r border-slate-200 mx-2 hidden sm:block"></div>
          
          <button className="px-3 py-2 text-sm text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors hidden sm:flex items-center">
            <i className="bx bx-export mr-1.5"></i>
            Export
          </button>
        </div>
      </div>
      
      {/* Active filter pills - only show if any filter is active */}
      {(filters.search || filters.division || filters.status) && (
        <div className="flex flex-wrap items-center mt-3 pt-3 border-t border-slate-200">
          <span className="text-xs text-slate-500 mr-2">Active filters:</span>
          
          {filters.search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-1">
              Search: {filters.search}
              <button className="ml-1 text-blue-500 hover:text-blue-700" onClick={() => setFilters({...filters, search: ''})}>
                <i className="bx bx-x"></i>
              </button>
            </span>
          )}
          
          {filters.division && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2 mb-1">
              Division: {filters.division}
              <button className="ml-1 text-indigo-500 hover:text-indigo-700" onClick={() => setFilters({...filters, division: ''})}>
                <i className="bx bx-x"></i>
              </button>
            </span>
          )}
          
          {filters.status && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2 mb-1">
              Status: {filters.status}
              <button className="ml-1 text-purple-500 hover:text-purple-700" onClick={() => setFilters({...filters, status: ''})}>
                <i className="bx bx-x"></i>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
