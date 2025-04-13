import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_OQu0iXcY8BNp@ep-still-sun-a5vulmjc-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

// Initialize Neon SQL
const sql = neon(DATABASE_URL);

// Create the held_bills table if it doesn't exist
export const initDb = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS held_bills (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        data JSONB NOT NULL
      )
    `;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
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

export default sql;