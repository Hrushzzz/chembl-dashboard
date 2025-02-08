require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL');
    
    const result = await client.query('SELECT COUNT(*) FROM molecule_dictionary');
    console.log('Total compounds:', result.rows[0].count);
    
    client.release();
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } finally {
    await pool.end();
  }
}

testConnection();