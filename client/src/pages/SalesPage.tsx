import React, { useState, useEffect, useRef } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { useSales } from '@/context/SalesContext';
import { InventoryItem } from '@/types/inventory';
import { PaymentMethod, DiscountType } from '@/types/sales';
import { formatCurrency } from '@/utils/formatters';
import HeldBillPrompt from '@/components/HeldBillPrompt';
import HeldBillsList from '@/components/HeldBillsList';

export default function SalesPage() {
  const { items, isLoading: isLoadingInventory } = useInventory();
  const { 
    saleFormData, 
    isLoading: isLoadingSales,
    updateCustomerInfo,
    updatePaymentMethod,
    updateNotes,
    addItemToSale,
    updateSaleItemQuantity,
    updateSaleItemDiscount,
    removeSaleItem,
    clearSaleItems,
    processSale,
    holdBill,
    toggleHeldBillsList
  } = useSales();

  // Local state for item selection and search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [discountType, setDiscountType] = useState<DiscountType>(DiscountType.NONE);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  
  // Ref for the modal to detect clicks outside
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Calculate totals
  const subtotal = saleFormData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate total discount based on the difference between original prices and discounted prices
  const totalDiscount = saleFormData.items.reduce((sum, item) => {
    const originalTotal = item.price * item.quantity;
    return sum + (originalTotal - item.totalPrice);
  }, 0);
  
  const grandTotal = subtotal - totalDiscount;

  // Filter items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(item => 
        item.item_name.toLowerCase().includes(query) ||
        item.item_code.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.division.toLowerCase().includes(query)
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  // Handle click outside modal to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowItemModal(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setDiscountType(DiscountType.NONE);
    setDiscountValue(0);
    setShowItemModal(true);
  };

  const handleAddItem = () => {
    if (selectedItem && quantity > 0) {
      if (isEditMode && editingItemIndex !== null) {
        // Update existing item
        updateSaleItemQuantity(editingItemIndex, quantity);
        updateSaleItemDiscount(editingItemIndex, discountType, discountValue);
      } else {
        // Add new item
        addItemToSale(selectedItem, quantity, discountType, discountValue);
      }
      // Reset form
      setShowItemModal(false);
      setSelectedItem(null);
      setQuantity(1);
      setDiscountType(DiscountType.NONE);
      setDiscountValue(0);
      setIsEditMode(false);
      setEditingItemIndex(null);
    }
  };
  
  const handleEditItem = (index: number) => {
    const item = saleFormData.items[index];
    setSelectedItem(item.item);
    setQuantity(item.quantity);
    
    // Set discount type and value
    if (item.dividendPercentage !== undefined && item.dividendPercentage > 0) {
      setDiscountType(DiscountType.PERCENTAGE);
      setDiscountValue(item.dividendPercentage);
    } else if (item.dividendDivisor !== undefined && item.dividendDivisor > 0) {
      setDiscountType(DiscountType.DIVISOR);
      setDiscountValue(item.dividendDivisor);
    } else {
      setDiscountType(DiscountType.NONE);
      setDiscountValue(0);
    }
    
    setIsEditMode(true);
    setEditingItemIndex(index);
    setShowItemModal(true);
  };

  const handleProcessSale = () => {
    processSale();
  };

  // Helper to render the discount display for an item
  const renderDiscountInfo = (item: any) => {
    if (item.dividendPercentage !== undefined && item.dividendPercentage > 0) {
      return `${item.dividendPercentage}% off`;
    } else if (item.dividendDivisor !== undefined && item.dividendDivisor > 0) {
      return `Divided by ${item.dividendDivisor}`;
    }
    return 'None';
  };

  // Helper to update discount for an item
  const handleUpdateDiscount = (index: number, type: DiscountType, value: number) => {
    updateSaleItemDiscount(index, type, value);
  };

  const isLoading = isLoadingInventory || isLoadingSales;

  return (
    <div className="space-y-6">
      {/* Held Bill Prompt */}
      <HeldBillPrompt />
      
      {/* Held Bills List */}
      <HeldBillsList />
      
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Sales Terminal</h1>
        <p className="mt-1 text-sm text-slate-500">Create and process sales for your customers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Item selection and cart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item search and list */}
          <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-medium text-slate-900 mb-4">Inventory Items</h2>
            
            <div className="space-y-4">
              {/* Search bar */}
              <div className="relative">
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Search by name, code, brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="bx bx-search text-slate-400"></i>
                </div>
                {searchQuery && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="bx bx-x text-slate-400"></i>
                  </button>
                )}
              </div>
              
              {/* Items list */}
              <div className="border border-slate-200 rounded-md overflow-hidden">
                {filteredItems.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">
                    <i className="bx bx-search text-3xl mb-2"></i>
                    <p>No items found. Try a different search term.</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                      {filteredItems.map(item => (
                        <div 
                          key={item.id}
                          className={`p-3 rounded-md border ${item.available_stock <= 0 ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-primary cursor-pointer'}`}
                          onClick={() => item.available_stock > 0 && handleSelectItem(item)}
                        >
                          <div className="flex justify-between">
                            <div className="font-medium text-slate-900 truncate">{item.item_name}</div>
                            <div className="text-sm font-medium text-primary">{formatCurrency(item.mrp)}</div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <div className="text-xs text-slate-500">{item.item_code} | {item.brand}</div>
                            <div className={`text-xs font-medium ${item.available_stock <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                              {item.available_stock} {item.base_unit} available
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-slate-900">Cart</h2>
              {saleFormData.items.length > 0 && (
                <button
                  type="button"
                  className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
                  onClick={clearSaleItems}
                >
                  <i className="bx bx-trash mr-1"></i>
                  Clear Cart
                </button>
              )}
            </div>

            {saleFormData.items.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <i className="bx bx-cart text-3xl mb-2"></i>
                <p>Your cart is empty</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Mobile view (card layout) */}
                <div className="lg:hidden space-y-3">
                  {saleFormData.items.map((item, index) => (
                    <div key={`${item.item.id}-${index}`} className="border border-slate-200 rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-slate-900">{item.item.item_name}</div>
                          <div className="text-xs text-slate-500">{item.item.item_code}</div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleEditItem(index)}
                          >
                            <i className="bx bx-edit"></i>
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => removeSaleItem(index)}
                          >
                            <i className="bx bx-trash"></i>
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-500">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            max={item.item.available_stock}
                            className="mt-1 w-full px-2 py-1 border border-slate-300 rounded-md text-right"
                            value={item.quantity}
                            onChange={(e) => updateSaleItemQuantity(index, parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500">Discount</label>
                          <div className="text-xs font-medium text-slate-700 mt-1">
                            {renderDiscountInfo(item)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-3 pt-2 border-t border-slate-100">
                        <div className="text-xs text-slate-500">
                          {formatCurrency(item.price)} × {item.quantity}
                        </div>
                        <div className="font-medium text-slate-900">{formatCurrency(item.totalPrice)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop view (table layout) */}
                <table className="min-w-full divide-y divide-slate-200 hidden lg:table">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">MRP</th>
                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Discount</th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {saleFormData.items.map((item, index) => (
                      <tr key={`${item.item.id}-${index}`}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-900">
                          <div>
                            <div className="font-medium">{item.item.item_name}</div>
                            <div className="text-slate-500 text-xs">{item.item.item_code}</div>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                          <input
                            type="number"
                            min="1"
                            max={item.item.available_stock}
                            className="w-16 px-2 py-1 border border-slate-300 rounded-md text-right"
                            value={item.quantity}
                            onChange={(e) => updateSaleItemQuantity(index, parseInt(e.target.value) || 1)}
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                          {renderDiscountInfo(item)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">
                          {formatCurrency(item.totalPrice)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => handleEditItem(index)}
                            >
                              <i className="bx bx-edit"></i>
                            </button>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-900"
                              onClick={() => removeSaleItem(index)}
                            >
                              <i className="bx bx-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Customer info and payment */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-medium text-slate-900 mb-4">Customer Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-slate-700">Customer Name*</label>
                <input
                  type="text"
                  id="customerName"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  value={saleFormData.customerName}
                  onChange={(e) => updateCustomerInfo('customerName', e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-slate-700">Phone Number</label>
                <input
                  type="text"
                  id="customerPhone"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  value={saleFormData.customerPhone}
                  onChange={(e) => updateCustomerInfo('customerPhone', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="customerAddress" className="block text-sm font-medium text-slate-700">Address</label>
                <textarea
                  id="customerAddress"
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  value={saleFormData.customerAddress}
                  onChange={(e) => updateCustomerInfo('customerAddress', e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-medium text-slate-900 mb-4">Payment Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-slate-700">Payment Method*</label>
                <select
                  id="paymentMethod"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  value={saleFormData.paymentMethod}
                  onChange={(e) => updatePaymentMethod(e.target.value as PaymentMethod)}
                >
                  <option value={PaymentMethod.CASH}>Cash</option>
                  <option value={PaymentMethod.CARD}>Card</option>
                  <option value={PaymentMethod.UPI}>UPI</option>
                  <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
                </select>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  id="notes"
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  value={saleFormData.notes}
                  onChange={(e) => updateNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-medium text-slate-900 mb-4">Order Summary</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Trade Dividend:</span>
                <span className="font-medium">-{formatCurrency(totalDiscount)}</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-semibold border-t border-slate-200 mt-2">
                <span>Total:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {/* Process Sale Button */}
              <button
                type="button"
                className="btn-primary w-full py-3 text-base"
                onClick={handleProcessSale}
                disabled={saleFormData.items.length === 0 || !saleFormData.customerName || isLoading}
              >
                <i className="bx bx-check-circle mr-2"></i>
                {isLoading ? 'Processing...' : 'Process Sale'}
              </button>
              
              {/* Hold Bill Button */}
              {saleFormData.items.length > 0 && (
                <button
                  type="button"
                  className="w-full py-3 border border-slate-300 bg-white text-slate-700 rounded-md hover:bg-slate-50 text-base flex justify-center items-center"
                  onClick={holdBill}
                  disabled={isLoading}
                >
                  <i className="bx bx-save mr-2"></i>
                  Hold Bill for Later
                </button>
              )}
              
              {/* View Held Bills Button */}
              <button
                type="button"
                className="w-full py-3 border border-slate-300 bg-white text-slate-700 rounded-md hover:bg-slate-50 text-base flex justify-center items-center"
                onClick={toggleHeldBillsList}
                disabled={isLoading}
              >
                <i className="bx bx-list-ul mr-2"></i>
                View Held Bills
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Item selection modal */}
      {showItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-900">{isEditMode ? 'Edit Cart Item' : 'Add Item to Cart'}</h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-500"
                onClick={() => setShowItemModal(false)}
              >
                <i className="bx bx-x text-xl"></i>
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <h4 className="font-medium text-slate-900">{selectedItem.item_name}</h4>
                <p className="text-sm text-slate-500">{selectedItem.item_code} | {selectedItem.brand}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="modal-quantity" className="block text-sm font-medium text-slate-700">Quantity*</label>
                  <input
                    type="number"
                    id="modal-quantity"
                    min="1"
                    max={selectedItem.available_stock}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                  <p className="mt-1 text-xs text-slate-500">{selectedItem.available_stock} {selectedItem.base_unit} available</p>
                </div>

                <div>
                  <label htmlFor="discount-type" className="block text-sm font-medium text-slate-700">Discount Type</label>
                  <select
                    id="discount-type"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                  >
                    <option value={DiscountType.NONE}>No Discount</option>
                    <option value={DiscountType.PERCENTAGE}>Percentage (%)</option>
                    <option value={DiscountType.DIVISOR}>Divisor</option>
                  </select>
                </div>

                {discountType !== DiscountType.NONE && (
                  <div>
                    <label htmlFor="discount-value" className="block text-sm font-medium text-slate-700">
                      {discountType === DiscountType.PERCENTAGE ? 'Discount Percentage (%)' : 'Divisor'}
                    </label>
                    <input
                      type="number"
                      id="discount-value"
                      min={discountType === DiscountType.PERCENTAGE ? 0 : 1}
                      max={discountType === DiscountType.PERCENTAGE ? 100 : undefined}
                      step={discountType === DiscountType.PERCENTAGE ? 0.1 : 1}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )}

                <div className="bg-slate-50 rounded-md p-3 border border-slate-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Price per unit:</span>
                    <span className="font-medium">{formatCurrency(selectedItem.mrp)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Quantity:</span>
                    <span className="font-medium">{quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Discount:</span>
                    <span className="font-medium">
                      {discountType === DiscountType.NONE ? 'None' : 
                       discountType === DiscountType.PERCENTAGE ? `${discountValue}%` : 
                       `Divided by ${discountValue}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-medium mt-1 pt-1 border-t border-slate-200">
                    <span>Total:</span>
                    <span>
                      {formatCurrency(
                        discountType === DiscountType.NONE ? selectedItem.mrp * quantity :
                        discountType === DiscountType.PERCENTAGE ? 
                          (selectedItem.mrp * (1 - (discountValue / 100))) * quantity :
                          (selectedItem.mrp * quantity) / (discountValue || 1)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                className="btn-outlined mr-2"
                onClick={() => setShowItemModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddItem}
                disabled={quantity < 1 || quantity > selectedItem.available_stock || 
                          (discountType === DiscountType.DIVISOR && (!discountValue || discountValue <= 0))}
              >
                <i className={`bx ${isEditMode ? 'bx-check' : 'bx-plus'} mr-2`}></i>
                {isEditMode ? 'Update Item' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}