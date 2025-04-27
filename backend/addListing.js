const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'real_estate',
  password: 'krishna',
  port: 5432,
});

async function insertListing() {
  const [title, location, price, description, property_type] = process.argv.slice(2);
  const image_path = null;

  await pool.query(
    'INSERT INTO listings (title, location, price, description, property_type, image_path) VALUES ($1, $2, $3, $4, $5, $6)',
    [title, location, price, description, property_type, image_path]
  );

  console.log("Listing inserted from CLI.");
  pool.end();
}

insertListing();
