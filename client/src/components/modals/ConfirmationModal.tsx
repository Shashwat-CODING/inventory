import { useInventory } from "@/context/InventoryContext";
import { useState } from "react";
import { ModalType } from "@/types/inventory";

export default function ConfirmationModal() {
  const { activeModal, closeModal, confirmationOptions } = useInventory();
  const isOpen = activeModal === ModalType.CONFIRMATION;
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !confirmationOptions) {
    return null;
  }

  const { title, message, onConfirm, confirmButtonText, confirmButtonClass } = confirmationOptions;

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await onConfirm();
    } catch (error) {
      console.error("Error in confirmation action:", error);
    } finally {
      setIsProcessing(false);
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-slate-500">
                {message}
              </p>
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:col-start-1"
              onClick={closeModal}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${confirmButtonClass} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2`}
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                confirmButtonText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}