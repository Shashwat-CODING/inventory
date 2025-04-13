import { neon } from '@neondatabase/serverless';

// Use the new connection string
const DATABASE_URL = 'postgresql://neondb_owner:npg_GO1yvWRLY6iJ@ep-blue-math-a52z6kak-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

// Initialize Neon SQL
const sql = neon(DATABASE_URL);

// Create the necessary tables if they don't exist
export const initDb = async () => {
  try {
    // Create held_bills table
    await sql`
      CREATE TABLE IF NOT EXISTS held_bills (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        data JSONB NOT NULL
      )
    `;
    
    // Create inventory table with the structure matching the provided JSON
    // Use exact field names from the JSON (preserve case and add quotes)
    await sql`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        multi_itemdivision TEXT,
        "DIVISIONS" TEXT,
        "MCODE" TEXT,
        "MENUCODE" TEXT,
        "DESCA" TEXT,
        "BARCODE" TEXT,
        "UNIT" TEXT,
        "ISVAT" INTEGER,
        "MRP" DECIMAL(12, 6),
        "GST" DECIMAL(12, 3),
        "CESS" DECIMAL(12, 8),
        "GWEIGHT" TEXT,
        "NWEIGHT" TEXT,
        "MCAT" TEXT,
        "BRAND" TEXT,
        "itemSummary" TEXT,
        "WAREHOUSE" TEXT,
        "STOCK" DECIMAL(12, 3),
        "Status" TEXT
      )
    `;
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

// Reset the held_bills table - clear all data
export const resetDb = async () => {
  try {
    await sql`TRUNCATE held_bills`;
    console.log('Held bills database reset successfully');
    return { success: true, message: 'Held bills database reset successfully' };
  } catch (error) {
    console.error('Failed to reset held bills database:', error);
    return { success: false, error };
  }
};

// Save a held bill to the database
export const saveHeldBill = async (id: string, customerName: string, timestamp: number, data: any) => {
  try {
    await sql`
      INSERT INTO held_bills (id, customer_name, timestamp, data)
      VALUES (${id}, ${customerName}, ${timestamp}, ${JSON.stringify(data)})
      ON CONFLICT (id) 
      DO UPDATE SET
        customer_name = ${customerName},
        timestamp = ${timestamp},
        data = ${JSON.stringify(data)}
    `;
    return { success: true };
  } catch (error) {
    console.error('Failed to save held bill:', error);
    return { success: false, error };
  }
};

// Get all held bills from the database
export const getHeldBills = async () => {
  try {
    const bills = await sql`SELECT * FROM held_bills ORDER BY timestamp DESC`;
    return { success: true, data: bills };
  } catch (error) {
    console.error('Failed to get held bills:', error);
    return { success: false, error };
  }
};

// Delete a held bill from the database
export const deleteHeldBill = async (id: string) => {
  try {
    await sql`DELETE FROM held_bills WHERE id = ${id}`;
    return { success: true };
  } catch (error) {
    console.error('Failed to delete held bill:', error);
    return { success: false, error };
  }
};

// INVENTORY OPERATIONS

// Get all inventory items
export const getAllInventoryItems = async () => {
  try {
    const items = await sql`SELECT * FROM inventory ORDER BY id`;
    return { success: true, data: items };
  } catch (error) {
    console.error('Failed to get inventory items:', error);
    return { success: false, error };
  }
};

// Get a single inventory item by ID
export const getInventoryItemById = async (id: number) => {
  try {
    const items = await sql`SELECT * FROM inventory WHERE id = ${id}`;
    if (items.length === 0) {
      return { success: false, error: 'Item not found' };
    }
    return { success: true, data: items[0] };
  } catch (error) {
    console.error(`Failed to get inventory item ${id}:`, error);
    return { success: false, error };
  }
};

// Create a new inventory item
export const createInventoryItem = async (item: any) => {
  try {
    const result = await sql`
      INSERT INTO inventory (
        multi_itemdivision, "DIVISIONS", "MCODE", "MENUCODE", "DESCA", "BARCODE", 
        "UNIT", "ISVAT", "MRP", "GST", "CESS", "GWEIGHT", "NWEIGHT", "MCAT", 
        "BRAND", "itemSummary", "WAREHOUSE", "STOCK", "Status"
      ) VALUES (
        ${item.multi_itemdivision || ''},
        ${item.DIVISIONS || ''},
        ${item.MCODE || ''},
        ${item.MENUCODE || ''},
        ${item.DESCA || ''},
        ${item.BARCODE || ''},
        ${item.UNIT || ''},
        ${item.ISVAT || 0},
        ${parseFloat(item.MRP) || 0},
        ${parseFloat(item.GST) || 0},
        ${parseFloat(item.CESS) || 0},
        ${item.GWEIGHT || '0'},
        ${item.NWEIGHT || '0'},
        ${item.MCAT || ''},
        ${item.BRAND || ''},
        ${item.itemSummary || ''},
        ${item.WAREHOUSE || ''},
        ${parseFloat(item.STOCK) || 0},
        ${item.Status || 'false'}
      ) RETURNING *
    `;
    
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Failed to create inventory item:', error);
    return { success: false, error };
  }
};

// Update an inventory item
export const updateInventoryItem = async (id: number, item: any) => {
  try {
    // Check if there are any fields to update
    if (Object.keys(item).length === 0 || (Object.keys(item).length === 1 && 'id' in item)) {
      return { success: false, error: 'No fields to update' };
    }
    
    // Use separate SQL updates for each item - less elegant but works with our SQL library
    let result;
    if (item.multi_itemdivision !== undefined) {
      result = await sql`UPDATE inventory SET multi_itemdivision = ${item.multi_itemdivision} WHERE id = ${id} RETURNING *`;
    }
    if (item.DIVISIONS !== undefined) {
      result = await sql`UPDATE inventory SET "DIVISIONS" = ${item.DIVISIONS} WHERE id = ${id} RETURNING *`;
    }
    if (item.MCODE !== undefined) {
      result = await sql`UPDATE inventory SET "MCODE" = ${item.MCODE} WHERE id = ${id} RETURNING *`;
    }
    if (item.MENUCODE !== undefined) {
      result = await sql`UPDATE inventory SET "MENUCODE" = ${item.MENUCODE} WHERE id = ${id} RETURNING *`;
    }
    if (item.DESCA !== undefined) {
      result = await sql`UPDATE inventory SET "DESCA" = ${item.DESCA} WHERE id = ${id} RETURNING *`;
    }
    if (item.BARCODE !== undefined) {
      result = await sql`UPDATE inventory SET "BARCODE" = ${item.BARCODE} WHERE id = ${id} RETURNING *`;
    }
    if (item.UNIT !== undefined) {
      result = await sql`UPDATE inventory SET "UNIT" = ${item.UNIT} WHERE id = ${id} RETURNING *`;
    }
    if (item.ISVAT !== undefined) {
      result = await sql`UPDATE inventory SET "ISVAT" = ${item.ISVAT} WHERE id = ${id} RETURNING *`;
    }
    if (item.MRP !== undefined) {
      result = await sql`UPDATE inventory SET "MRP" = ${parseFloat(item.MRP)} WHERE id = ${id} RETURNING *`;
    }
    if (item.GST !== undefined) {
      result = await sql`UPDATE inventory SET "GST" = ${parseFloat(item.GST)} WHERE id = ${id} RETURNING *`;
    }
    if (item.CESS !== undefined) {
      result = await sql`UPDATE inventory SET "CESS" = ${parseFloat(item.CESS)} WHERE id = ${id} RETURNING *`;
    }
    if (item.GWEIGHT !== undefined) {
      result = await sql`UPDATE inventory SET "GWEIGHT" = ${item.GWEIGHT} WHERE id = ${id} RETURNING *`;
    }
    if (item.NWEIGHT !== undefined) {
      result = await sql`UPDATE inventory SET "NWEIGHT" = ${item.NWEIGHT} WHERE id = ${id} RETURNING *`;
    }
    if (item.MCAT !== undefined) {
      result = await sql`UPDATE inventory SET "MCAT" = ${item.MCAT} WHERE id = ${id} RETURNING *`;
    }
    if (item.BRAND !== undefined) {
      result = await sql`UPDATE inventory SET "BRAND" = ${item.BRAND} WHERE id = ${id} RETURNING *`;
    }
    if (item.itemSummary !== undefined) {
      result = await sql`UPDATE inventory SET "itemSummary" = ${item.itemSummary} WHERE id = ${id} RETURNING *`;
    }
    if (item.WAREHOUSE !== undefined) {
      result = await sql`UPDATE inventory SET "WAREHOUSE" = ${item.WAREHOUSE} WHERE id = ${id} RETURNING *`;
    }
    if (item.STOCK !== undefined) {
      result = await sql`UPDATE inventory SET "STOCK" = ${parseFloat(item.STOCK)} WHERE id = ${id} RETURNING *`;
    }
    if (item.Status !== undefined) {
      result = await sql`UPDATE inventory SET "Status" = ${item.Status} WHERE id = ${id} RETURNING *`;
    }
    
    // Get the latest version after all updates
    result = await sql`SELECT * FROM inventory WHERE id = ${id}`;
    
    if (result.length === 0) {
      return { success: false, error: 'Item not found' };
    }
    
    return { success: true, data: result[0] };
  } catch (error) {
    console.error(`Failed to update inventory item ${id}:`, error);
    return { success: false, error };
  }
};

// Delete an inventory item
export const deleteInventoryItem = async (id: number) => {
  try {
    const result = await sql`
      DELETE FROM inventory WHERE id = ${id} RETURNING id
    `;
    
    if (result.length === 0) {
      return { success: false, error: 'Item not found' };
    }
    
    return { success: true, message: 'Item deleted successfully' };
  } catch (error) {
    console.error(`Failed to delete inventory item ${id}:`, error);
    return { success: false, error };
  }
};

// Add stock to an inventory item
export const addStock = async (id: number, quantity: number) => {
  try {
    const result = await sql`
      UPDATE inventory 
      SET "STOCK" = "STOCK" + ${quantity} 
      WHERE id = ${id} 
      RETURNING *
    `;
    
    if (result.length === 0) {
      return { success: false, error: 'Item not found' };
    }
    
    return { success: true, data: result[0] };
  } catch (error) {
    console.error(`Failed to add stock to item ${id}:`, error);
    return { success: false, error };
  }
};

// Sell stock from an inventory item
export const sellStock = async (id: number, quantity: number) => {
  try {
    // First check if there's enough stock
    const item = await sql`SELECT "STOCK" FROM inventory WHERE id = ${id}`;
    
    if (item.length === 0) {
      return { success: false, error: 'Item not found' };
    }
    
    const currentStock = parseFloat(item[0].STOCK);
    
    if (currentStock < quantity) {
      return { success: false, error: 'Not enough stock available' };
    }
    
    const result = await sql`
      UPDATE inventory 
      SET "STOCK" = "STOCK" - ${quantity} 
      WHERE id = ${id} 
      RETURNING *
    `;
    
    return { success: true, data: result[0] };
  } catch (error) {
    console.error(`Failed to sell stock from item ${id}:`, error);
    return { success: false, error };
  }
};

// Bulk import inventory items
export const bulkImportInventory = async (items: any[]) => {
  try {
    let importCount = 0;
    
    // Process each item sequentially
    for (const item of items) {
      // Check if an item with the same barcode exists
      const existingItems = await sql`
        SELECT id FROM inventory WHERE "BARCODE" = ${item.BARCODE}
      `;
      
      if (existingItems.length > 0) {
        // Update existing item
        await sql`
          UPDATE inventory 
          SET 
            multi_itemdivision = ${item.multi_itemdivision},
            "DIVISIONS" = ${item.DIVISIONS},
            "MCODE" = ${item.MCODE},
            "MENUCODE" = ${item.MENUCODE},
            "DESCA" = ${item.DESCA},
            "BARCODE" = ${item.BARCODE},
            "UNIT" = ${item.UNIT},
            "ISVAT" = ${item.ISVAT},
            "MRP" = ${item.MRP},
            "GST" = ${item.GST},
            "CESS" = ${item.CESS},
            "GWEIGHT" = ${item.GWEIGHT},
            "NWEIGHT" = ${item.NWEIGHT},
            "MCAT" = ${item.MCAT},
            "BRAND" = ${item.BRAND},
            "itemSummary" = ${item.itemSummary},
            "WAREHOUSE" = ${item.WAREHOUSE},
            "STOCK" = ${item.STOCK},
            "Status" = ${item.Status}
          WHERE id = ${existingItems[0].id}
        `;
      } else {
        // Insert new item
        await sql`
          INSERT INTO inventory (
            multi_itemdivision, "DIVISIONS", "MCODE", "MENUCODE", "DESCA", "BARCODE", 
            "UNIT", "ISVAT", "MRP", "GST", "CESS", "GWEIGHT", "NWEIGHT", "MCAT", 
            "BRAND", "itemSummary", "WAREHOUSE", "STOCK", "Status"
          ) VALUES (
            ${item.multi_itemdivision},
            ${item.DIVISIONS},
            ${item.MCODE},
            ${item.MENUCODE},
            ${item.DESCA},
            ${item.BARCODE},
            ${item.UNIT},
            ${item.ISVAT},
            ${item.MRP},
            ${item.GST},
            ${item.CESS},
            ${item.GWEIGHT},
            ${item.NWEIGHT},
            ${item.MCAT},
            ${item.BRAND},
            ${item.itemSummary},
            ${item.WAREHOUSE},
            ${item.STOCK},
            ${item.Status}
          )
        `;
      }
      
      importCount++;
    }
    
    return { 
      success: true, 
      message: `Import completed successfully with ${importCount} unique items` 
    };
  } catch (error) {
    console.error('Failed to bulk import inventory items:', error);
    return { success: false, error };
  }
};

// Reset the inventory database
export const resetInventoryDb = async () => {
  try {
    // Drop and recreate the inventory table with the correct schema
    await sql`DROP TABLE IF EXISTS inventory`;
    
    await sql`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        multi_itemdivision TEXT,
        "DIVISIONS" TEXT,
        "MCODE" TEXT,
        "MENUCODE" TEXT,
        "DESCA" TEXT,
        "BARCODE" TEXT,
        "UNIT" TEXT,
        "ISVAT" INTEGER,
        "MRP" DECIMAL(12, 6),
        "GST" DECIMAL(12, 3),
        "CESS" DECIMAL(12, 8),
        "GWEIGHT" TEXT,
        "NWEIGHT" TEXT,
        "MCAT" TEXT,
        "BRAND" TEXT,
        "itemSummary" TEXT,
        "WAREHOUSE" TEXT,
        "STOCK" DECIMAL(12, 3),
        "Status" TEXT
      )
    `;
    
    console.log('Inventory database reset and recreated successfully');
    return { success: true, message: 'Inventory database reset and recreated successfully' };
  } catch (error) {
    console.error('Failed to reset inventory database:', error);
    return { success: false, error };
  }
};

// Helper function to normalize inventory item field names
function normalizeInventoryItem(item: any): any {
  const normalizedItem: any = {};
  
  // Map of common field name variations to standardized names
  const fieldMap: Record<string, string> = {
    'DIVISIONS': 'divisions',
    'MCODE': 'mcode',
    'MENUCODE': 'menucode',
    'DESCA': 'desca',
    'BARCODE': 'barcode',
    'UNIT': 'unit',
    'ISVAT': 'isvat',
    'MRP': 'mrp',
    'GST': 'gst',
    'CESS': 'cess',
    'GWEIGHT': 'gweight',
    'NWEIGHT': 'nweight',
    'MCAT': 'mcat',
    'BRAND': 'brand',
    'itemSummary': 'item_summary',
    'WAREHOUSE': 'warehouse',
    'STOCK': 'stock',
    'Status': 'status'
  };
  
  // Process all fields from the input item
  Object.entries(item).forEach(([key, value]) => {
    // Get the normalized field name
    const normalizedKey = fieldMap[key] || key.toLowerCase();
    
    // Convert specific fields to appropriate types
    if (['mrp', 'gst', 'cess', 'stock'].includes(normalizedKey)) {
      normalizedItem[normalizedKey] = parseFloat(value as string);
    } else if (normalizedKey === 'isvat') {
      normalizedItem[normalizedKey] = parseInt(value as string, 10);
    } else {
      normalizedItem[normalizedKey] = value;
    }
  });
  
  // Set default values for missing fields
  if (!normalizedItem.item_summary && item.itemSummary) {
    normalizedItem.item_summary = item.itemSummary;
  }
  
  return normalizedItem;
}

export default sql;