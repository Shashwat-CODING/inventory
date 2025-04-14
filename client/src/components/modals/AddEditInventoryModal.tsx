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

  // Form state that matches our actual InventoryItem structure
  const [formData, setFormData] = useState<NewInventoryItem>({
    multi_itemdivision: "",
    divisions: "",
    mcode: "",
    menucode: "",
    desca: "",
    barcode: "",
    unit: "",
    isvat: 0,
    mrp: 0,
    gst: 0,
    cess: 0,
    gweight: 0,
    nweight: 0,
    mcat: "",
    brand: "",
    item_summary: "",
    warehouse: "",
    stock: 0,
    status: "Active"
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form with item data when editing
  useEffect(() => {
    if (isEdit && currentItem) {
      // Convert string values to numbers where needed
      const mrpValue = typeof currentItem.mrp === 'string' ? parseFloat(currentItem.mrp) : currentItem.mrp;
      const gstValue = typeof currentItem.gst === 'string' ? parseFloat(currentItem.gst) : currentItem.gst;
      const cessValue = typeof currentItem.cess === 'string' ? parseFloat(currentItem.cess) : currentItem.cess;
      const gweightValue = typeof currentItem.gweight === 'string' ? parseFloat(currentItem.gweight) : currentItem.gweight;
      const nweightValue = typeof currentItem.nweight === 'string' ? parseFloat(currentItem.nweight) : currentItem.nweight;
      const stockValue = typeof currentItem.stock === 'string' ? parseFloat(currentItem.stock) : currentItem.stock;
      
      // Set form data with current item values
      setFormData({
        multi_itemdivision: currentItem.multi_itemdivision || '',
        divisions: currentItem.divisions || '',
        mcode: currentItem.mcode || '',
        menucode: currentItem.menucode || '',
        desca: currentItem.desca || '',
        barcode: currentItem.barcode || '',
        unit: currentItem.unit || '',
        isvat: currentItem.isvat || 0,
        mrp: mrpValue || 0,
        gst: gstValue || 0,
        cess: cessValue || 0,
        gweight: gweightValue || 0,
        nweight: nweightValue || 0,
        mcat: currentItem.mcat || '',
        brand: currentItem.brand || '',
        item_summary: currentItem.item_summary || '',
        warehouse: currentItem.warehouse || '',
        stock: stockValue || 0,
        status: currentItem.status || 'Active'
      });
      
      console.log('Editing item:', currentItem);
    } else {
      // Reset form for new item
      setFormData({
        multi_itemdivision: '',
        divisions: '',
        mcode: '',
        menucode: '',
        desca: '',
        barcode: '',
        unit: '',
        isvat: 0,
        mrp: 0,
        gst: 0,
        cess: 0,
        gweight: 0,
        nweight: 0,
        mcat: '',
        brand: '',
        item_summary: '',
        warehouse: '',
        stock: 0,
        status: 'Active'
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
      'mcode', 'desca', 'brand', 'unit', 'mrp', 'gst', 'warehouse', 'stock'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Numeric validation
    if (formData.stock < 0) {
      newErrors.stock = 'Must be a positive number';
    }
    
    if (formData.mrp < 0) {
      newErrors.mrp = 'Must be a positive number';
    }
    
    if (formData.gst < 0 || formData.gst > 100) {
      newErrors.gst = 'Must be between 0 and 100';
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
        await addItem(formData);
      }
      
      closeModal();
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
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
                    <label htmlFor="mcode" className="block text-sm font-medium text-slate-700">Item Code*</label>
                    <input
                      type="text"
                      name="mcode"
                      id="mcode"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.mcode ? 'border-red-300' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      value={formData.mcode}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.mcode && <p className="mt-1 text-sm text-red-600">{errors.mcode}</p>}
                  </div>
                  <div>
                    <label htmlFor="desca" className="block text-sm font-medium text-slate-700">Item Name*</label>
                    <input
                      type="text"
                      name="desca"
                      id="desca"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.desca ? 'border-red-300' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      value={formData.desca}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.desca && <p className="mt-1 text-sm text-red-600">{errors.desca}</p>}
                  </div>
                  <div>
                    <label htmlFor="divisions" className="block text-sm font-medium text-slate-700">Division</label>
                    <input
                      type="text"
                      name="divisions"
                      id="divisions"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.divisions}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="multi_itemdivision" className="block text-sm font-medium text-slate-700">Item Division Categories</label>
                    <input
                      type="text"
                      name="multi_itemdivision"
                      id="multi_itemdivision"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.multi_itemdivision}
                      onChange={handleInputChange}
                      placeholder="E.g. FOOD,OTC,GV"
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
                    <label htmlFor="stock" className="block text-sm font-medium text-slate-700">Stock*</label>
                    <input
                      type="number"
                      name="stock"
                      id="stock"
                      min="0"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.stock ? 'border-red-300' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
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
                    <label htmlFor="gst" className="block text-sm font-medium text-slate-700">GST Percentage*</label>
                    <input
                      type="number"
                      name="gst"
                      id="gst"
                      min="0"
                      max="100"
                      step="0.01"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.gst ? 'border-red-300' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      value={formData.gst}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.gst && <p className="mt-1 text-sm text-red-600">{errors.gst}</p>}
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
                    <label htmlFor="cess" className="block text-sm font-medium text-slate-700">CESS Percentage</label>
                    <input
                      type="number"
                      name="cess"
                      id="cess"
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.cess}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="gweight" className="block text-sm font-medium text-slate-700">Gross Weight</label>
                    <input
                      type="number"
                      name="gweight"
                      id="gweight"
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.gweight}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="nweight" className="block text-sm font-medium text-slate-700">Net Weight</label>
                    <input
                      type="number"
                      name="nweight"
                      id="nweight"
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.nweight}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="mcat" className="block text-sm font-medium text-slate-700">Category</label>
                    <input
                      type="text"
                      name="mcat"
                      id="mcat"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.mcat}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="menucode" className="block text-sm font-medium text-slate-700">Menu Code</label>
                    <input
                      type="text"
                      name="menucode"
                      id="menucode"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.menucode}
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
                    <label htmlFor="unit" className="block text-sm font-medium text-slate-700">Unit*</label>
                    <input
                      type="text"
                      name="unit"
                      id="unit"
                      className={`mt-1 block w-full px-3 py-2 border ${errors.unit ? 'border-red-300' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      value={formData.unit}
                      onChange={handleInputChange}
                      required
                      placeholder="pcs, kg, box"
                    />
                    {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
                    <select
                      name="status"
                      id="status"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="isvat" className="block text-sm font-medium text-slate-700">VAT Applicable</label>
                    <select
                      name="isvat"
                      id="isvat"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.isvat}
                      onChange={handleInputChange}
                    >
                      <option value={0}>No</option>
                      <option value={1}>Yes</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="item_summary" className="block text-sm font-medium text-slate-700">Item Summary</label>
                    <textarea
                      name="item_summary"
                      id="item_summary"
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      value={formData.item_summary}
                      onChange={(e) => setFormData({ ...formData, item_summary: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-5 border-t border-slate-200">
                  <button
                    type="button"
                    className="btn-outlined px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {isEdit ? 'Update' : 'Create'}
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