const { Pool } = require('pg');
require('dotenv').config(); // To load local .env file for testing

// Configure the database connection
const pool = new Pool({
  // Use the live database URL from Render, or a local one for testing
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const seedDatabase = async () => {
  console.log('Starting to seed the database...');
  const client = await pool.connect();
  try {
    // Start a transaction
    await client.query('BEGIN');

    // Clear existing data to prevent duplicates
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM items');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM vendors');
    console.log('Cleared existing data.');

    // Insert Vendors and get their IDs
    const vendorsResult = await client.query(`
      INSERT INTO vendors (name, address, image_url) VALUES
      ('Pizza Palace', '123 Main St, Anytown', 'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
      ('Burger Barn', '456 Oak Ave, Anytown', 'https://images.pexels.com/photos/2271107/pexels-photo-2271107.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
      RETURNING id, name;
    `);
    
    const vendors = vendorsResult.rows;
    const pizzaPalaceId = vendors.find(v => v.name === 'Pizza Palace').id;
    const burgerBarnId = vendors.find(v => v.name === 'Burger Barn').id;
    console.log('Inserted vendors.');

    // Insert Items
    await client.query(`
      INSERT INTO items (vendor_id, name, price, stock_quantity, image_url) VALUES
      ($1, 'Margherita Pizza', 8.99, 50, 'https://images.pexels.com/photos/1260968/pexels-photo-1260968.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
      ($1, 'Pepperoni Pizza', 10.50, 40, 'https://images.pexels.com/photos/845811/pexels-photo-845811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
      ($2, 'Classic Burger', 5.99, 100, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
      ($2, 'Cheese Burger', 6.49, 80, 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
      ($2, 'Fries', 2.99, 200, 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
    `, [pizzaPalaceId, burgerBarnId]);
    console.log('Inserted items.');

    // Commit the transaction
    await client.query('COMMIT');
    console.log('✅ Database seeded successfully!');

  } catch (err) {
    // If any error occurs, roll back the transaction
    await client.query('ROLLBACK');
    console.error('Error seeding database:', err);
  } finally {
    // Release the client back to the pool
    client.release();
    await pool.end();
  }
};

seedDatabase();
