import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import ItemDetails from "@/pages/ItemDetails";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddEditInventoryModal from "@/components/modals/AddEditInventoryModal";
import StockAdjustmentModal from "@/components/modals/StockAdjustmentModal";
import BulkImportModal from "@/components/modals/BulkImportModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { InventoryProvider } from "@/context/InventoryContext";
import { SalesProvider } from "@/context/SalesContext";
import SalesPage from "./pages/SalesPage";
import SaleComplete from "./pages/SaleComplete";

// Main application router component
function AppRouter() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/item/:id" component={ItemDetails} />
          <Route path="/sales" component={SalesPage} />
          <Route path="/sale-complete/:id" component={SaleComplete} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <AddEditInventoryModal />
      <StockAdjustmentModal />
      <BulkImportModal />
      <ConfirmationModal />
    </div>
  );
}

// Main App component with providers setup
function App() {
  // Set up providers in the correct order
  return (
    <QueryClientProvider client={queryClient}>
      <InventoryProvider>
        <SalesProvider>
          <AppRouter />
          <Toaster />
        </SalesProvider>
      </InventoryProvider>
    </QueryClientProvider>
  );
}

export default App;
