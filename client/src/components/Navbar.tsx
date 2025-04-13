import { useInventory } from "@/context/InventoryContext";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { prepareResetDatabase } = useInventory();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll events to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-20 backdrop-blur-sm transition-all duration-300 ${
      scrolled ? 'bg-white/95 shadow-lg' : 'bg-white shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Animated top gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-blue-500 to-purple-600 bg-[length:400%_100%] animate-gradient"></div>
        
        <div className="flex justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo area with enhanced visual treatment */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer group">
                <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-md group-hover:bg-indigo-700 transition-all duration-300 mr-2.5">
                  <i className="bx bx-package text-xl"></i>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-indigo-700 tracking-tight leading-tight">
                    MAHASHAY
                  </span>
                  <span className="text-xs text-gray-600 font-medium -mt-0.5">
                    BHAGWAN DAS AYURVED
                  </span>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Enhanced navigation area with active indicators */}
          <div className="flex items-center">
            <nav className="flex mr-6">
              <Link href="/">
                <div className={`px-4 py-2 rounded-lg flex items-center cursor-pointer mx-1 transition-all duration-200 ${
                  location === '/' 
                    ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm border border-indigo-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                }`}>
                  <i className={`bx bx-grid-alt mr-2 ${location === '/' ? 'text-indigo-600' : ''}`}></i>
                  <span>Inventory</span>
                  {location === '/' && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                </div>
              </Link>
              <Link href="/sales">
                <div className={`px-4 py-2 rounded-lg flex items-center cursor-pointer mx-1 transition-all duration-200 ${
                  location === '/sales' 
                    ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm border border-indigo-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                }`}>
                  <i className={`bx bx-cart mr-2 ${location === '/sales' ? 'text-indigo-600' : ''}`}></i>
                  <span>Sales</span>
                  {location === '/sales' && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                </div>
              </Link>
            </nav>
            
            {/* Redesigned action buttons with improved visual hierarchy */}
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
              <button 
                className="text-sm flex items-center px-3 py-2 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100 shadow-sm"
                onClick={prepareResetDatabase}
              >
                <i className="bx bx-reset mr-1.5 text-red-500"></i>
                <span>Reset</span>
              </button>
              
              <button className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors border border-transparent hover:border-indigo-100">
                <i className="bx bx-help-circle"></i>
                <span className="sr-only">Help</span>
              </button>
              
              <div className="h-6 border-r border-slate-200 mx-1"></div>
              
              <div className="flex items-center bg-indigo-50 rounded-full p-1 pr-3 border border-indigo-100 shadow-sm hover:bg-indigo-100 transition-colors cursor-pointer">
                <div className="bg-indigo-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-xs font-medium mr-2 shadow-sm">
                  <i className="bx bx-user"></i>
                </div>
                <span className="text-sm text-indigo-700 font-medium">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
