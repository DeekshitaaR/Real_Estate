const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'real_estate',
  password: 'krishna',
  port: 5432,
});

async function insertBuy() {
  const [name, email, phone_number, preferred_location, budget_range, property_type] = process.argv.slice(2);

  try {
    await pool.query(
      `INSERT INTO buy 
        (name, email, phone_number, preferred_location, budget_range, property_type) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, email, phone_number, preferred_location, budget_range, property_type]
    );

    console.log("Buy request inserted successfully");
  } catch (err) {
    console.error("Error inserting:", err.message);
  } finally {
    await pool.end();
  }
}

insertBuy();
