import { useInventory } from "@/context/InventoryContext";
import { useEffect, useState } from "react";
import { ModalType, NewInventoryItem } from "@/types/inventory";

export default function AddEditInventoryModal() {
  const { 
    activeModal, 
    closeModal, 
    currentItem, 
    addItem, 
    updateItem 
  } = useInventory();

  const isOpen = activeModal === ModalType.ADD_EDIT;
  const isEdit = !!currentItem;

  // Form state
  const [formData, setFormData] = useState<NewInventoryItem>({
    item_code: "",
    item_name: "",
    division: "",
    vertical: "",
    brand: "",
    opening_stock: 0,
    available_stock: 0,
    mrp: 0,
    cost_price: 0,
    gst_percentage: 0,
    barcode: "",
    exp_date: "",
    mfg_date: "",
    batch: "",
    warehouse: "",
    base_unit: "",
    status: "Active"
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form with item data when editing
  useEffect(() => {
    if (isEdit && currentItem) {
      setFormData({
        item_code: currentItem.item_code,
        item_name: currentItem.item_name,
        division: currentItem.division,
        vertical: currentItem.vertical,
        brand: currentItem.brand,
        opening_stock: currentItem.opening_stock,
        available_stock: currentItem.available_stock,
        mrp: currentItem.mrp,
        cost_price: currentItem.cost_price,
        gst_percentage: currentItem.gst_percentage,
        barcode: currentItem.barcode,
        exp_date: currentItem.exp_date,
        mfg_date: currentItem.mfg_date,
        batch: currentItem.batch,
        warehouse: currentItem.warehouse,
        base_unit: currentItem.base_unit,
        status: currentItem.status
      });
    } else {
      // Reset form for new item
      setFormData({
        item_code: "",
        item_name: "",
        division: "",
        vertical: "",
        brand: "",
        opening_stock: 0,
        available_stock: 0,
        mrp: 0,
        cost_price: 0,
        gst_percentage: 0,
        barcode: "",
        exp_date: "",
        mfg_date: "",
        batch: "",
        warehouse: "",
        base_unit: "",
        status: "Active"
      });
    }
    
    // Reset errors
    setErrors({});
  }, [isEdit, currentItem, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convert numeric fields
    if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    const requiredFields: Array<keyof NewInventoryItem> = [
      'item_code', 'item_name', 'division', 'brand', 'opening_stock',
      'mrp', 'cost_price', 'gst_percentage', 'warehouse', 'base_unit'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Numeric validation
    if (formData.opening_stock < 0) {
      newErrors.opening_stock = 'Must be a positive number';
    }
    
    if (formData.mrp < 0) {
      newErrors.mrp = 'Must be a positive number';
    }
    
    if (formData.cost_price < 0) {
      newErrors.cost_price = 'Must be a positive number';
    }
    
    if (formData.gst_percentage < 0 || formData.gst_percentage > 100) {
      newErrors.gst_percentage = 'Must be between 0 and 100';
    }
    
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isEdit && currentItem) {
        await updateItem(currentItem.id, formData);
      } else {
        // For new items, set available_stock to opening_stock
        const newItem = {
          ...formData,
          available_stock: formData.opening_stock
        };
        await addItem(newItem);
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
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
            <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
              {isEdit ? 'Edit Inventory Item' : 'Add Inventory Item'}
            </h3>
            <div className="mt-4">
              <form id="inventoryForm" className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="item_code" className="block text-sm font-medium text-slate-700">Item Code*</label>
                    <input
                      type="text"
                      name="item_code"
                      id="item_code"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.item_code ? 'border-red-300' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      value={formData.item_code}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.item_code && <p className="mt-1 text-sm text-red-600">{errors.item_code}</p>}
                  </div>
                  <div>
                    <label htmlFor="item_name" className="block text-sm font-medium text-slate-700">Item Name*</label>
                    <input
                      type="text"
                      name="item_name"
                      id="item_name"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.item_name ? 'border-red-300' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      value={formData.item_name}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.item_name && <p className="mt-1 text-sm text-red-600">{errors.item_name}</p>}
                  </div>
                  <div>
                    <label htmlFor="division" className="block text-sm font-medium text-slate-700">Division*</label>
                    <select
                      name="division"
                      id="division"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.division ? 'border-red-300' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      value={formData.division}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Division</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Food">Food</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Home">Home</option>
                      <option value="Beauty">Beauty</option>
                    </select>
                    {errors.division && <p className="mt-1 text-sm text-red-600">{errors.division}</p>}
                  </div>
                  <div>
                    <label htmlFor="vertical" className="block text-sm font-medium text-slate-700">Vertical</label>
                    <input
                      type="text"
                      name="vertical"
                      id="vertical"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.vertical}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-slate-700">Brand*</label>
                    <input
                      type="text"
                      name="brand"
                      id="brand"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.brand ? 'border-red-300' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
                  </div>
                  <div>
                    <label htmlFor="opening_stock" className="block text-sm font-medium text-slate-700">Opening Stock*</label>
                    <input
                      type="number"
                      name="opening_stock"
                      id="opening_stock"
                      min="0"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.opening_stock ? 'border-red-300' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      value={formData.opening_stock}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.opening_stock && <p className="mt-1 text-sm text-red-600">{errors.opening_stock}</p>}
                  </div>
                  <div>
                    <label htmlFor="mrp" className="block text-sm font-medium text-slate-700">MRP*</label>
                    <input
                      type="number"
                      name="mrp"
                      id="mrp"
                      min="0"
                      step="0.01"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.mrp ? 'border-red-300' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      value={formData.mrp}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.mrp && <p className="mt-1 text-sm text-red-600">{errors.mrp}</p>}
                  </div>
                  <div>
                    <label htmlFor="cost_price" className="block text-sm font-medium text-slate-700">Cost Price*</label>
                    <input
                      type="number"
                      name="cost_price"
                      id="cost_price"
                      min="0"
                      step="0.01"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.cost_price ? 'border-red-300' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      value={formData.cost_price}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.cost_price && <p className="mt-1 text-sm text-red-600">{errors.cost_price}</p>}
                  </div>
                  <div>
                    <label htmlFor="gst_percentage" className="block text-sm font-medium text-slate-700">GST Percentage*</label>
                    <input
                      type="number"
                      name="gst_percentage"
                      id="gst_percentage"
                      min="0"
                      max="100"
                      step="0.01"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.gst_percentage ? 'border-red-300' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      value={formData.gst_percentage}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.gst_percentage && <p className="mt-1 text-sm text-red-600">{errors.gst_percentage}</p>}
                  </div>
                  <div>
                    <label htmlFor="barcode" className="block text-sm font-medium text-slate-700">Barcode</label>
                    <input
                      type="text"
                      name="barcode"
                      id="barcode"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.barcode}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="exp_date" className="block text-sm font-medium text-slate-700">Expiry Date</label>
                    <input
                      type="date"
                      name="exp_date"
                      id="exp_date"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.exp_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="mfg_date" className="block text-sm font-medium text-slate-700">Manufacturing Date</label>
                    <input
                      type="date"
                      name="mfg_date"
                      id="mfg_date"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.mfg_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="batch" className="block text-sm font-medium text-slate-700">Batch</label>
                    <input
                      type="text"
                      name="batch"
                      id="batch"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.batch}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="warehouse" className="block text-sm font-medium text-slate-700">Warehouse*</label>
                    <input
                      type="text"
                      name="warehouse"
                      id="warehouse"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.warehouse ? 'border-red-300' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      value={formData.warehouse}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.warehouse && <p className="mt-1 text-sm text-red-600">{errors.warehouse}</p>}
                  </div>
                  <div>
                    <label htmlFor="base_unit" className="block text-sm font-medium text-slate-700">Base Unit*</label>
                    <select
                      name="base_unit"
                      id="base_unit"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.base_unit ? 'border-red-300' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      value={formData.base_unit}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Unit</option>
                      <option value="PCS">PCS (Pieces)</option>
                      <option value="KG">KG (Kilograms)</option>
                      <option value="LTR">LTR (Liters)</option>
                      <option value="BOX">BOX (Box)</option>
                      <option value="PKT">PKT (Packet)</option>
                    </select>
                    {errors.base_unit && <p className="mt-1 text-sm text-red-600">{errors.base_unit}</p>}
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status*</label>
                    <select
                      name="status"
                      id="status"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
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
                    className="btn-primary"
                  >
                    Save
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
