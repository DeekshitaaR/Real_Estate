const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'real_estate',
  password: 'krishna',
  port: 5432,
});

async function viewListings() {
    const [city = null, priceMin = null, priceMax = null, type = null] = process.argv.slice(2).map(val => {
        if (val === 'null' || val === '') return null;
        return val && val.trim() || null; 
      });
  console.log('Inputs:', { city, priceMin, priceMax, type });

  let query = 'SELECT * FROM listings WHERE 1=1'; 
  const values = [];

  if (city) {
    query += ' AND lower(location) = lower($' + (values.length + 1)+')';
    values.push(city);
  }

  if (priceMin) {
    query += ' AND price >= $' + (values.length + 1);
    values.push(priceMin);
  }

  if (priceMax) {
    query += ' AND price <= $' + (values.length + 1);
    values.push(priceMax);
  }

  if (type) {
    query += ' AND lower(property_type) = lower($' + (values.length + 1)+')';
    values.push(type);
  }
    console.log("Executing query:", query);
    console.log("With values:", values);
  try {
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      console.log('Listings found:');
      result.rows.forEach(listing => {
        console.log(`Title: ${listing.title}, Location: ${listing.location}, Price: ${listing.price}, Type: ${listing.property_type}, Description: ${listing.description}`);
      });
    } else {
      console.log('No listings found with the given filters.');
    }
  } catch (error) {
    console.error('Error fetching listings:', error);
  }

  pool.end();
}

viewListings();
