import { useInventory } from "@/context/InventoryContext";
import { Link, useLocation } from "wouter";

export default function Navbar() {
  const { prepareResetDatabase } = useInventory();
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-md sticky top-0 z-10 border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        {/* Top gradient bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
        
        <div className="flex justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo area */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer group">
                <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 mr-2">
                  <i className="bx bx-package text-xl"></i>
                </div>
                <span className="font-bold text-lg text-slate-800 tracking-tight">
                  <span className="text-blue-600">MAHASHAY</span> BHAGWAN DAS AYURVED
                </span>
              </div>
            </Link>
          </div>
          
          {/* Navigation area */}
          <div className="flex items-center">
            <nav className="flex mr-6">
              <Link href="/">
                <div className={`px-3 py-2 rounded-md flex items-center cursor-pointer mx-1 transition-all duration-200 ${
                  location === '/' 
                    ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}>
                  <i className={`bx bx-grid-alt mr-1.5 ${location === '/' ? 'text-blue-600' : ''}`}></i>
                  <span>Inventory</span>
                </div>
              </Link>
              <Link href="/sales">
                <div className={`px-3 py-2 rounded-md flex items-center cursor-pointer mx-1 transition-all duration-200 ${
                  location === '/sales' 
                    ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}>
                  <i className={`bx bx-cart mr-1.5 ${location === '/sales' ? 'text-blue-600' : ''}`}></i>
                  <span>Sales</span>
                </div>
              </Link>
            </nav>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
              <button 
                className="text-sm flex items-center px-3 py-1.5 rounded-md text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors group"
                onClick={prepareResetDatabase}
              >
                <i className="bx bx-reset mr-1.5 group-hover:text-red-500"></i>
                <span>Reset Database</span>
              </button>
              
              <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                <i className="bx bx-question-mark"></i>
                <span className="sr-only">Help</span>
              </button>
              
              <div className="h-6 border-r border-slate-200 mx-1"></div>
              
              <div className="flex items-center bg-slate-100 rounded-full p-1 pr-3">
                <div className="bg-blue-600 text-white rounded-full h-7 w-7 flex items-center justify-center text-xs font-medium mr-2">
                  AD
                </div>
                <span className="text-sm text-slate-700 font-medium">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
