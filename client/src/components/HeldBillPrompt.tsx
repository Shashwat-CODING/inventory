import React from 'react';
import { useSales } from '@/context/SalesContext';
import { formatCurrency } from '@/utils/formatters';

export default function HeldBillPrompt() {
  const { 
    heldSale, 
    showHeldSalePrompt, 
    resumeHeldBill, 
    dismissHeldBillPrompt 
  } = useSales();

  if (!showHeldSalePrompt || !heldSale) return null;
  
  // Calculate the total number of items
  const totalItems = heldSale.items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate the subtotal
  const subtotal = heldSale.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Get customer name or default to "Customer"
  const customerName = heldSale.customerName || "Customer";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-blue-600 text-white p-5">
          <h3 className="text-lg font-semibold flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" 
                clipRule="evenodd" 
              />
            </svg>
            Resume Held Bill
          </h3>
          <p className="text-sm text-blue-100 mt-1">You have a previously saved bill</p>
        </div>
        
        <div className="p-5">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-500">Bill Information</h4>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Customer:</span>
                <span className="text-sm font-medium">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Total Items:</span>
                <span className="text-sm font-medium">{totalItems} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Amount:</span>
                <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-4 mt-4">
            <p className="text-sm text-slate-600 mb-4">
              Would you like to resume this bill or start a new one?
            </p>
            <div className="flex space-x-3">
              <button 
                className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50"
                onClick={dismissHeldBillPrompt}
              >
                Start New
              </button>
              <button 
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                onClick={resumeHeldBill}
              >
                Resume Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}