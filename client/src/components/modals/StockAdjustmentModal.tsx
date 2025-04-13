import { useInventory } from "@/context/InventoryContext";
import { useState, useEffect } from "react";
import { ModalType, StockActionType } from "@/types/inventory";

export default function StockAdjustmentModal() {
  const { 
    activeModal, 
    closeModal, 
    currentItem, 
    stockActionType,
    addStock,
    sellStock
  } = useInventory();

  const isOpen = activeModal === ModalType.STOCK_ADJUSTMENT;
  const isAddStock = stockActionType === StockActionType.ADD;

  // Form state
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setNotes('');
      setError('');
    }
  }, [isOpen]);

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else {
      setQuantity(value);
    }
    setError('');
  };

  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentItem) return;
    
    // Validate quantity
    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }
    
    if (!isAddStock && quantity > currentItem.available_stock) {
      setError(`Cannot sell more than available stock (${currentItem.available_stock} ${currentItem.base_unit})`);
      return;
    }
    
    try {
      if (isAddStock) {
        await addStock(currentItem.id, quantity);
      } else {
        await sellStock(currentItem.id, quantity);
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
    }
  };

  // Calculate new stock level
  const calculateNewStock = (): number => {
    if (!currentItem) return 0;
    
    if (isAddStock) {
      return currentItem.available_stock + quantity;
    } else {
      return Math.max(0, currentItem.available_stock - quantity);
    }
  };

  if (!isOpen || !currentItem) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={closeModal}
            >
              <span className="sr-only">Close</span>
              <i className="bx bx-x text-2xl"></i>
            </button>
          </div>
          <div>
            <h3 className="text-lg leading-6 font-medium text-slate-900" id="stockAdjustmentTitle">
              {isAddStock ? 'Add Stock' : 'Sell Stock'}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-slate-500">
                <span>{isAddStock ? 'Add stock to' : 'Sell stock from'} inventory item:</span>{' '}
                <span className="font-medium text-slate-700">{currentItem.item_name}</span>{' '}
                <span className="text-xs text-slate-500">({currentItem.item_code})</span>
              </p>
            </div>
            <div className="mt-4">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <input type="hidden" value={currentItem.id} />
                
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">Quantity*</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="number"
                      name="quantity"
                      id="quantity"
                      min="1"
                      max={!isAddStock ? currentItem.available_stock : undefined}
                      className={`block w-full px-3 py-2 border ${error ? 'border-red-300' : 'border-slate-300'} rounded-l-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      value={quantity}
                      onChange={handleQuantityChange}
                      required
                    />
                    <span className="inline-flex items-center px-3 py-2 border border-l-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm rounded-r-md">
                      {currentItem.base_unit}
                    </span>
                  </div>
                  {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    value={notes}
                    onChange={handleNotesChange}
                  ></textarea>
                </div>
                
                <div className="mt-4 bg-slate-50 -mx-6 px-6 py-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Current Stock:</p>
                      <p className="text-lg font-medium text-slate-900">{currentItem.available_stock} {currentItem.base_unit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{isAddStock ? 'New Stock:' : 'Remaining Stock:'}</p>
                      <p className="text-lg font-medium text-slate-900">{calculateNewStock()} {currentItem.base_unit}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn-outlined px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isAddStock 
                        ? 'bg-primary hover:bg-blue-600 focus:ring-primary' 
                        : 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500'
                    }`}
                  >
                    {isAddStock ? 'Add Stock' : 'Sell Stock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
