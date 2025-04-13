import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  initDb, saveHeldBill, getHeldBills, deleteHeldBill, resetDb,
  getAllInventoryItems, getInventoryItemById, createInventoryItem,
  updateInventoryItem, deleteInventoryItem, addStock, sellStock,
  bulkImportInventory, resetInventoryDb
} from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the database
  await initDb();
  
  // Simple ping endpoint to keep the server alive
  app.get('/api/ping', (_req: Request, res: Response) => {
    return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ------------------------------------------------
  // INVENTORY ROUTES
  // ------------------------------------------------

  // Get all inventory items
  app.get('/api/inventory', async (_req: Request, res: Response) => {
    const result = await getAllInventoryItems();
    
    if (result.success && result.data) {
      // Map keys to lowercase for frontend compatibility
      const normalizedData = result.data.map((item: any) => {
        const normalized: any = {};
        Object.entries(item).forEach(([key, value]) => {
          // If key is uppercase, convert to lowercase
          const normalizedKey = key === key.toUpperCase() ? key.toLowerCase() : key;
          normalized[normalizedKey] = value;
        });
        return normalized;
      });
      
      return res.status(200).json(normalizedData);
    } else {
      return res.status(500).json({ error: 'Failed to retrieve inventory items' });
    }
  });
  
  // Get a single inventory item
  app.get('/api/inventory/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const result = await getInventoryItemById(id);
    
    if (result.success && result.data) {
      // Normalize keys to lowercase
      const item = result.data;
      const normalized: any = {};
      Object.entries(item).forEach(([key, value]) => {
        const normalizedKey = key === key.toUpperCase() ? key.toLowerCase() : key;
        normalized[normalizedKey] = value;
      });
      
      return res.status(200).json(normalized);
    } else {
      if (result.error === 'Item not found') {
        return res.status(404).json({ error: 'Item not found' });
      }
      return res.status(500).json({ error: 'Failed to retrieve inventory item' });
    }
  });
  
  // Create a new inventory item
  app.post('/api/inventory', async (req: Request, res: Response) => {
    const result = await createInventoryItem(req.body);
    
    if (result.success) {
      return res.status(201).json(result.data);
    } else {
      return res.status(500).json({ error: 'Failed to create inventory item' });
    }
  });
  
  // Update an inventory item
  app.put('/api/inventory/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const result = await updateInventoryItem(id, req.body);
    
    if (result.success) {
      return res.status(200).json(result.data);
    } else {
      if (result.error === 'Item not found') {
        return res.status(404).json({ error: 'Item not found' });
      }
      return res.status(500).json({ error: 'Failed to update inventory item' });
    }
  });
  
  // Delete an inventory item
  app.delete('/api/inventory/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const result = await deleteInventoryItem(id);
    
    if (result.success) {
      return res.status(200).json({ message: 'Item deleted successfully' });
    } else {
      if (result.error === 'Item not found') {
        return res.status(404).json({ error: 'Item not found' });
      }
      return res.status(500).json({ error: 'Failed to delete inventory item' });
    }
  });
  
  // Add stock to an inventory item
  app.post('/api/inventory/:id/add-stock', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    if (!req.body.quantity || typeof req.body.quantity !== 'number' || req.body.quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity. Must be a positive number.' });
    }
    
    const result = await addStock(id, req.body.quantity);
    
    if (result.success) {
      return res.status(200).json(result.data);
    } else {
      if (result.error === 'Item not found') {
        return res.status(404).json({ error: 'Item not found' });
      }
      return res.status(500).json({ error: 'Failed to add stock' });
    }
  });
  
  // Sell stock from an inventory item
  app.post('/api/inventory/:id/sell', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    if (!req.body.quantity || typeof req.body.quantity !== 'number' || req.body.quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity. Must be a positive number.' });
    }
    
    const result = await sellStock(id, req.body.quantity);
    
    if (result.success) {
      return res.status(200).json(result.data);
    } else {
      if (result.error === 'Item not found') {
        return res.status(404).json({ error: 'Item not found' });
      } else if (result.error === 'Not enough stock available') {
        return res.status(400).json({ error: 'Not enough stock available' });
      }
      return res.status(500).json({ error: 'Failed to sell stock' });
    }
  });
  
  // Bulk import inventory items
  app.post('/api/inventory/bulk-import', async (req: Request, res: Response) => {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Invalid data format. Expected an array of items.' });
    }
    
    const result = await bulkImportInventory(req.body);
    
    if (result.success) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(500).json({ error: 'Failed to bulk import inventory items' });
    }
  });
  
  // Reset the inventory database
  app.post('/reset', async (_req: Request, res: Response) => {
    const result = await resetInventoryDb();
    
    if (result.success) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(500).json({ error: 'Failed to reset inventory database' });
    }
  });
  
  // ------------------------------------------------
  // HELD BILLS ROUTES
  // ------------------------------------------------
  
  // Reset the held bills database
  app.post('/api/held-bills/reset', async (_req: Request, res: Response) => {
    const result = await resetDb();
    
    if (result.success) {
      return res.status(200).json({ success: true, message: result.message });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to reset held bills database' });
    }
  });
  app.post('/api/held-bills', async (req: Request, res: Response) => {
    const { id, customerName, timestamp, data } = req.body;
    
    if (!id || !data) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const result = await saveHeldBill(id, customerName || '', timestamp || Date.now(), data);
    
    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to save held bill' });
    }
  });

  app.get('/api/held-bills', async (_req: Request, res: Response) => {
    const result = await getHeldBills();
    
    if (result.success) {
      return res.status(200).json({ success: true, bills: result.data });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to get held bills' });
    }
  });

  app.delete('/api/held-bills/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Missing bill ID' });
    }
    
    const result = await deleteHeldBill(id);
    
    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to delete held bill' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
