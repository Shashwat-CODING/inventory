import { useInventory } from "@/context/InventoryContext";
import { useState, useEffect, useRef } from "react";
import { ModalType } from "@/types/inventory";

export default function BulkImportModal() {
  const { activeModal, closeModal, bulkImport } = useInventory();
  
  const isOpen = activeModal === ModalType.BULK_IMPORT;
  
  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [error, setError] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setFormat('csv');
      setError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setFile(null);
        e.target.value = '';
        return;
      }
      
      // Validate file type
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      if (format === 'csv' && fileExt !== 'csv') {
        setError('Please select a CSV file');
        setFile(null);
        e.target.value = '';
        return;
      } else if (format === 'json' && fileExt !== 'json') {
        setError('Please select a JSON file');
        setFile(null);
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };
  
  // Handle format change
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormat(e.target.value as 'csv' | 'json');
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to import');
      return;
    }
    
    try {
      if (format === 'json') {
        // For JSON files, we need to parse the contents and send as JSON directly
        const reader = new FileReader();
        
        reader.onload = async (event) => {
          if (event.target?.result) {
            try {
              // Parse the JSON content
              const jsonContent = JSON.parse(event.target.result as string);
              
              // Create FormData and append the parsed JSON as a stringified array
              const formData = new FormData();
              formData.append('file', file);
              formData.append('format', format);
              formData.append('data', JSON.stringify(jsonContent));
              
              await bulkImport(formData);
            } catch (parseError) {
              console.error('Error parsing JSON:', parseError);
              setError('Invalid JSON format. Please check your file and try again.');
            }
          }
        };
        
        reader.onerror = () => {
          setError('Error reading file. Please try again.');
        };
        
        reader.readAsText(file);
      } else {
        // For CSV files, send as is with FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('format', format);
        
        await bulkImport(formData);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during import');
    }
  };
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="relative inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-slate-100">
          {/* Header with gradient */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl"></div>
          
          {/* Close button */}
          <div className="absolute top-3 right-3">
            <button
              type="button"
              className="bg-slate-50 rounded-full p-1.5 text-slate-400 hover:text-slate-500 hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={closeModal}
            >
              <span className="sr-only">Close</span>
              <i className="bx bx-x text-xl"></i>
            </button>
          </div>
          
          <div className="pt-3">
            {/* Title with icon */}
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2 mr-3">
                <i className="bx bx-import text-2xl text-blue-600"></i>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900" id="modal-title">Bulk Import Inventory</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Upload a CSV or JSON file with inventory data to import multiple items at once.
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* File format selection */}
                <div className="flex flex-wrap items-center -mx-2">
                  <div className="w-full sm:w-1/2 px-2">
                    <div className="space-y-1">
                      <label htmlFor="importFormat" className="block text-sm font-medium text-slate-700">File Format*</label>
                      <select
                        id="importFormat"
                        name="importFormat"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={format}
                        onChange={handleFormatChange}
                        required
                      >
                        <option value="csv">CSV Format</option>
                        <option value="json">JSON Format</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-1/2 px-2 mt-4 sm:mt-0">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">Max File Size</label>
                      <div className="flex items-center px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-500">
                        <i className="bx bx-info-circle text-blue-500 mr-2"></i>
                        <span>Maximum 10MB</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* File upload area */}
                <div className="mt-4">
                  <label htmlFor="importFile" className="block text-sm font-medium text-slate-700 mb-1">Import File*</label>
                  <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${file ? 'border-blue-300 bg-blue-50' : 'border-slate-300 border-dashed'} rounded-lg transition-colors duration-200`}>
                    <div className="space-y-2 text-center">
                      <i className={`bx ${file ? 'bx-file-blank text-blue-500' : 'bx-cloud-upload text-slate-400'} mx-auto text-4xl transition-all duration-200`}></i>
                      <div className="flex text-sm text-slate-600 justify-center">
                        <label htmlFor="importFile" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-3 py-1.5 border border-slate-200 shadow-sm">
                          <span>{file ? 'Change file' : 'Select file'}</span>
                          <input
                            id="importFile"
                            ref={fileInputRef}
                            name="importFile"
                            type="file"
                            accept={format === 'csv' ? '.csv' : '.json'}
                            className="sr-only"
                            onChange={handleFileChange}
                            required
                          />
                        </label>
                        {!file && <p className="pl-2 self-center">or drag and drop</p>}
                      </div>
                      
                      <p className={`text-sm ${file ? 'text-blue-600 font-medium' : 'text-slate-500'}`}>
                        {file ? `Selected: ${file.name}` : `${format.toUpperCase()} file format required`}
                      </p>
                    </div>
                  </div>
                  {error && (
                    <div className="mt-2 text-sm text-red-600 flex items-center">
                      <i className="bx bx-error-circle mr-1"></i>
                      {error}
                    </div>
                  )}
                </div>
                
                {/* Requirements card */}
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200 mt-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="bg-amber-200 rounded-full p-1.5">
                        <i className="bx bx-info-circle text-amber-700"></i>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-semibold text-amber-800">Import Requirements</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        {format === 'csv' ? (
                          <div className="space-y-2">
                            <p>
                              CSV files should include a header row with all required fields.
                            </p>
                            <a href="#" className="inline-flex items-center font-medium text-amber-800 hover:text-amber-900 bg-amber-200 px-2.5 py-1 rounded-md text-xs">
                              <i className="bx bx-download mr-1"></i>
                              Download CSV Template
                            </a>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p>
                              JSON files should contain an array of inventory items with the following fields:
                            </p>
                            <div className="bg-amber-200/50 rounded-md p-2 text-xs font-mono overflow-x-auto whitespace-nowrap">
                              "Item Code", "Item Name", "division", "vertical", "brand", "Opening Stock", 
                              "AVAILABLE STOCK", "mrp", "costprice", "GST %", "barcode", "EXP Date", "MFG Date", 
                              "batch", "warehouse", "baseunit", "status"
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center"
                  >
                    <i className="bx bx-upload mr-1.5"></i>
                    Import Data
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
