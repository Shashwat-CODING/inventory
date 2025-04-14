import { useInventory } from "@/context/InventoryContext";
import { useState } from "react";
import { ModalType } from "@/types/inventory";

export default function BulkImportModal() {
  const { activeModal, closeModal, bulkImport } = useInventory();
  const isOpen = activeModal === ModalType.BULK_IMPORT;

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      if (!selectedFile.name.endsWith('.json') && !selectedFile.name.endsWith('.csv')) {
        setError('Please select a JSON or CSV file');
        setFile(null);
        return;
      }
      
      // Check file size (50MB max)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', file.name.endsWith('.json') ? 'json' : 'csv');
      
      await bulkImport(formData);
      
      // Reset state and close modal on success
      setFile(null);
      closeModal();
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
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
        <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={closeModal}
              disabled={isUploading}
            >
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div>
            <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
              Bulk Import Inventory
            </h3>
            <div className="mt-2">
              <p className="text-sm text-slate-500">
                Upload a JSON or CSV file to import multiple inventory items at once.
                Maximum file size is 50MB.
              </p>
            </div>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="import-file" className="block text-sm font-medium text-slate-700">
                  Select File
                </label>
                <div className="mt-1">
                  <input
                    id="import-file"
                    name="import-file"
                    type="file"
                    accept=".json,.csv"
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-blue-600"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </div>
                {file && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                {error && (
                  <p className="mt-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:col-start-1"
                  onClick={closeModal}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:col-start-2"
                  disabled={!file || isUploading}
                >
                  {isUploading ? (
                    <span className="inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}