const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'real_estate',
  password: 'krishna',
  port: 5432,
});

const cleanInput = (val) => {
  return val === 'null' || val === '-' || val === '' ? null : val;
};

async function insertRent() {
  const [name,email,phone_number,property_address,property_type,monthly_rent_raw,photo_path_raw = null,additional_details_raw = null ] = process.argv.slice(2);

  const monthly_rent = parseFloat(monthly_rent_raw);
  const photo_path = cleanInput(photo_path_raw);
  const additional_details = cleanInput(additional_details_raw);

  try {
    await pool.query(
      `INSERT INTO rent 
        (name, email, phone_number, property_address, property_type, monthly_rent, photo_path, additional_details) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [name, email, phone_number, property_address, property_type, monthly_rent, photo_path, additional_details]
    );

    console.log("Rent listing inserted successfully");
  } catch (err) {
    console.error("Error inserting:", err.message);
  } finally {
    await pool.end();
  }
}

insertRent();
