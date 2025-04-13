import { useInventory } from "@/context/InventoryContext";
import { useEffect, useRef, useState } from "react";

export default function FilterBar() {
  const { 
    filters, 
    setFilters, 
    clearFilters 
  } = useInventory();
  const [isExpanded, setIsExpanded] = useState(false);

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

  const activeFiltersCount = [
    filters.search ? 1 : 0,
    filters.division ? 1 : 0,
    filters.status ? 1 : 0
  ].reduce((sum, val) => sum + val, 0);

  return (
    <div className="bg-white shadow-md rounded-xl p-5 border border-slate-200 relative overflow-hidden transition-all duration-300">
      {/* Enhanced gradient border with animation */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-blue-500 to-purple-600 bg-[length:400%_100%] animate-gradient"></div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto flex items-center">
          <div className="bg-indigo-100 p-2.5 rounded-lg text-indigo-700 mr-3 hidden sm:flex items-center justify-center border border-indigo-200 shadow-sm">
            <i className="bx bx-filter text-lg"></i>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center">
              Filter Inventory
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full border border-indigo-200">
                  {activeFiltersCount}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
              Narrow down inventory items by specific criteria
            </p>
          </div>
          <button 
            className="ml-auto sm:hidden text-indigo-600 hover:text-indigo-800 p-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <i className={`bx ${isExpanded ? 'bx-chevron-up' : 'bx-chevron-down'} text-xl`}></i>
          </button>
        </div>
        
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4 sm:mt-0 ${isExpanded ? 'block' : 'hidden sm:grid'}`}>
          {/* Enhanced search field with icon */}
          <div className="relative flex-grow col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="bx bx-search text-indigo-500"></i>
            </div>
            <input
              ref={searchInput}
              type="text"
              placeholder="Search inventory..."
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm hover:border-indigo-300 transition-colors"
              onChange={handleSearchChange}
            />
          </div>
          
          {/* Enhanced division dropdown with icon */}
          <div className="relative col-span-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="bx bx-category text-indigo-500"></i>
            </div>
            <select
              ref={divisionSelect}
              className="block w-full pl-10 pr-8 py-2.5 border border-slate-200 rounded-lg text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none hover:border-indigo-300 transition-colors"
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
              <i className="bx bx-chevron-down text-indigo-500 group-hover:transform group-hover:translate-y-0.5 transition-transform"></i>
            </div>
          </div>
          
          {/* Enhanced status dropdown with icon */}
          <div className="relative col-span-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="bx bx-badge-check text-indigo-500"></i>
            </div>
            <select
              ref={statusSelect}
              className="block w-full pl-10 pr-8 py-2.5 border border-slate-200 rounded-lg text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none hover:border-indigo-300 transition-colors"
              onChange={handleStatusChange}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Low Stock">Low Stock</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <i className="bx bx-chevron-down text-indigo-500 group-hover:transform group-hover:translate-y-0.5 transition-transform"></i>
            </div>
          </div>
        </div>
        
        {/* Enhanced action buttons */}
        <div className={`flex space-x-2 mt-4 sm:mt-0 ${isExpanded ? 'block' : 'hidden sm:flex'}`}>
          <button
            className="px-3 py-2 text-sm text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all flex items-center border border-transparent hover:border-indigo-200"
            onClick={handleClearFilters}
          >
            <i className="bx bx-x text-lg mr-1"></i>
            Clear
          </button>
          
          <div className="border-r border-slate-200 mx-1 hidden sm:block"></div>
          
          <button className="px-3 py-2 text-sm text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all hidden sm:flex items-center border border-transparent hover:border-indigo-200">
            <i className="bx bx-export text-lg mr-1"></i>
            Export
          </button>
        </div>
      </div>
      
      {/* Redesigned active filter pills - only show if any filter is active */}
      {(filters.search || filters.division || filters.status) && (
        <div className={`flex flex-wrap items-center mt-4 pt-4 border-t border-slate-200 ${isExpanded ? 'block' : 'hidden sm:flex'}`}>
          <span className="text-xs font-medium text-slate-600 mr-2 bg-slate-100 px-2 py-1 rounded-md">Active filters:</span>
          
          {filters.search && (
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-800 mr-2 mb-2 border border-indigo-200 shadow-sm">
              <i className="bx bx-search text-indigo-500 mr-1.5"></i>
              {filters.search}
              <button className="ml-1.5 text-indigo-500 hover:text-indigo-700 p-0.5 hover:bg-indigo-200 rounded-full transition-colors" onClick={() => setFilters({...filters, search: ''})}>
                <i className="bx bx-x"></i>
              </button>
            </span>
          )}
          
          {filters.division && (
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-800 mr-2 mb-2 border border-purple-200 shadow-sm">
              <i className="bx bx-category text-purple-500 mr-1.5"></i>
              {filters.division}
              <button className="ml-1.5 text-purple-500 hover:text-purple-700 p-0.5 hover:bg-purple-200 rounded-full transition-colors" onClick={() => setFilters({...filters, division: ''})}>
                <i className="bx bx-x"></i>
              </button>
            </span>
          )}
          
          {filters.status && (
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2 border border-blue-200 shadow-sm">
              <i className="bx bx-badge-check text-blue-500 mr-1.5"></i>
              {filters.status}
              <button className="ml-1.5 text-blue-500 hover:text-blue-700 p-0.5 hover:bg-blue-200 rounded-full transition-colors" onClick={() => setFilters({...filters, status: ''})}>
                <i className="bx bx-x"></i>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
