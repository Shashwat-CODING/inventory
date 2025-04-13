import { useInventory } from "@/context/InventoryContext";
import { ModalType } from "@/types/inventory";

export default function ConfirmationModal() {
  const { activeModal, closeModal, confirmationOptions } = useInventory();
  
  const isOpen = activeModal === ModalType.CONFIRMATION;
  
  if (!isOpen || !confirmationOptions) {
    return null;
  }
  
  const { title, message, onConfirm, confirmButtonText, confirmButtonClass } = confirmationOptions;
  
  const handleConfirm = () => {
    onConfirm();
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <i className="bx bx-error text-2xl text-red-600"></i>
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-slate-900">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-slate-500">
                  {message}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              className="mt-3 sm:mt-0 btn-outlined w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className={confirmButtonClass}
              onClick={handleConfirm}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
