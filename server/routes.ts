import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { initDb, saveHeldBill, getHeldBills, deleteHeldBill } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the database
  await initDb();

  // Held bills routes
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
