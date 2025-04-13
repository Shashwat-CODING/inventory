import React from 'react';
import { useSales } from '@/context/SalesContext';
import { HeldBill } from '@/context/SalesContext';
import { formatCurrency } from '@/utils/formatters';

export default function HeldBillsList() {
  const { 
    heldSales, 
    showHeldSalesList, 
    toggleHeldBillsList, 
    resumeHeldBill, 
    deleteHeldBill 
  } = useSales();

  if (!showHeldSalesList) return null;

  // Sort bills by timestamp (most recent first)
  const sortedBills = [...heldSales].sort((a, b) => b.timestamp - a.timestamp);
  
  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };
  
  // Calculate total amount for a bill
  const calculateTotal = (bill: HeldBill) => {
    return bill.data.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-blue-600 text-white p-5 flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h7a1 1 0 110 2H4a1 1 0 01-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            Held Bills
          </h3>
          <button 
            className="text-white hover:text-blue-100"
            onClick={toggleHeldBillsList}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-5">
          {sortedBills.length === 0 ? (
            <div className="text-center py-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-slate-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-slate-500">No held bills available</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-96">
              {sortedBills.map((bill) => (
                <div 
                  key={bill.id} 
                  className="border border-slate-200 rounded-lg p-4 mb-3 hover:border-blue-300 transition-colors duration-150"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-slate-800">{bill.customerName}</h4>
                      <p className="text-xs text-slate-500">{formatDate(bill.timestamp)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-800">{formatCurrency(calculateTotal(bill))}</p>
                      <p className="text-xs text-slate-500">{bill.data.items.length} items</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex space-x-2">
                    <button 
                      className="flex-1 py-2 px-3 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      onClick={() => resumeHeldBill(bill)}
                    >
                      Resume
                    </button>
                    <button 
                      className="py-2 px-3 text-sm font-medium text-red-600 bg-white border border-slate-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                      onClick={() => deleteHeldBill(bill.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 text-right">
            <button 
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              onClick={toggleHeldBillsList}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}