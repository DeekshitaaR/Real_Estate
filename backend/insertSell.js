const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'real_estate',
  password: 'krishna',
  port: 5432,
});

function cleanInput(val) {
  return val === 'null' || val === '-' || val === '' ? null : val;
}

async function insertSell() {
  const [name,email,phone_number,property_address,property_type,expected_price_raw,photo_path_raw,additional_details_raw] = process.argv.slice(2);

  const expected_price = parseFloat(expected_price_raw);
  const photo_path = cleanInput(photo_path_raw);
  const additional_details = cleanInput(additional_details_raw);

  try {
    await pool.query(
      `INSERT INTO sell 
        (name, email, phone_number, property_address, property_type, expected_price, photo_path, additional_details) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [name, email, phone_number, property_address, property_type, expected_price, photo_path, additional_details]
    );

    console.log("Sell listing inserted successfully");
  } catch (err) {
    console.error("Error inserting:", err.message);
  } finally {
    await pool.end();
  }
}

insertSell();
