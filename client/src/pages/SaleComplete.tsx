import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useSales } from '@/context/SalesContext';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Download, Printer, Save, Upload } from 'lucide-react';

export default function SaleComplete() {
  const { currentSale, downloadBill, printBill, exportSaleJson, importSaleFromJson } = useSales();
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // If there's no current sale, redirect to sales page
    if (!currentSale) {
      setLocation('/sales');
    }
  }, [currentSale, setLocation]);

  if (!currentSale) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <i className="bx bx-check text-green-600 text-4xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sale Completed</h1>
          <p className="text-slate-600 mt-2">Your sale has been processed successfully.</p>
        </div>

        <div className="border-t border-slate-200 pt-6 pb-4">
          <h2 className="text-lg font-medium mb-4">Sale Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Sale ID</p>
                <p className="font-medium">{currentSale.id}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Date</p>
                <p className="font-medium">{new Date(currentSale.date).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Customer</p>
                <p className="font-medium">{currentSale.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Payment Method</p>
                <p className="font-medium">{currentSale.paymentMethod}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 pb-4">
          <h2 className="text-lg font-medium mb-4">Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Dividend</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {currentSale.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-900">
                      <div>
                        <div className="font-medium">{item.item.item_name}</div>
                        <div className="text-slate-500 text-xs">{item.item.item_code}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                      {item.quantity} {item.item.base_unit}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                      {item.dividendPercentage !== undefined && item.dividendPercentage > 0 
                        ? `${item.dividendPercentage}%` 
                        : item.dividendDivisor !== undefined && item.dividendDivisor > 0 
                          ? `Div. by ${item.dividendDivisor}` 
                          : 'None'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td colSpan={3} className="px-3 py-2"></td>
                  <td className="px-3 py-2 text-right text-sm font-medium">Subtotal:</td>
                  <td className="px-3 py-2 text-right text-sm font-medium">{formatCurrency(currentSale.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-3 py-2"></td>
                  <td className="px-3 py-2 text-right text-sm font-medium">Discount:</td>
                  <td className="px-3 py-2 text-right text-sm font-medium">-{formatCurrency(currentSale.totalDiscount)}</td>
                </tr>
                {currentSale.totalTax > 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-2"></td>
                    <td className="px-3 py-2 text-right text-sm font-medium">Tax:</td>
                    <td className="px-3 py-2 text-right text-sm font-medium">{formatCurrency(currentSale.totalTax)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="px-3 py-2"></td>
                  <td className="px-3 py-2 text-right text-sm font-bold">Total:</td>
                  <td className="px-3 py-2 text-right text-sm font-bold">{formatCurrency(currentSale.grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 mt-4">
          <h2 className="text-lg font-medium mb-4">Actions</h2>
          
          {/* Main buttons - Print and Download */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Button 
              variant="default" 
              className="w-full" 
              onClick={() => printBill(currentSale)}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Bill
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => downloadBill(currentSale)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
          
          {/* JSON Export/Import Section */}
          <div className="bg-slate-50 rounded-md p-4 mt-4">
            <h3 className="text-sm font-medium text-slate-900 mb-3">JSON Data Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => exportSaleJson(currentSale)}
              >
                <Save className="mr-2 h-4 w-4" />
                Export as JSON
              </Button>
              
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => {
                  // Trigger file input click
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import from JSON
              </Button>
              
              {/* Hidden file input for JSON import */}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setIsImporting(true);
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        importSaleFromJson(event.target.result as string);
                        setIsImporting(false);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Export your sale data as JSON for record keeping or import previously saved sales.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Button
            variant="link"
            onClick={() => setLocation('/sales')}
            className="font-medium"
          >
            ← Back to Sales
          </Button>
          
          {/* Loading indicator for import operation */}
          {isImporting && (
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500">Importing sale data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}