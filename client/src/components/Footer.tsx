export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm mr-2">
              <i className="bx bx-package text-lg"></i>
            </div>
            <span className="font-medium text-slate-800">MAHASHAY</span>
          </div>
          
          <div className="flex flex-col items-center sm:items-end">
            <p className="text-sm text-slate-500">
              Inventory Management System &copy; {currentYear}
            </p>
            <div className="flex items-center mt-2 space-x-4">
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <i className="bx bxl-github text-xl"></i>
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <i className="bx bxl-linkedin text-xl"></i>
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <i className="bx bx-envelope text-xl"></i>
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
