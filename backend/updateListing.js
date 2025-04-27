const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'real_estate',
  password: 'krishna',
  port: 5432,
});

async function updateListing() {
  const [id, title, location, price, description, property_type] = process.argv.slice(2);

  if (!id) {
    console.log('Please provide the listing ID to update.');
    return;
  }

  let query = 'UPDATE listings SET ';
  const values = [];

  if (title) {
    query += `title = $${values.length + 1}, `;
    values.push(title);
  }

  if (location) {
    query += `location = $${values.length + 1}, `;
    values.push(location);
  }

  if (price) {
    query += `price = $${values.length + 1}, `;
    values.push(price);
  }

  if (description) {
    query += `description = $${values.length + 1}, `;
    values.push(description);
  }

  if (property_type) {
    query += `property_type = $${values.length + 1}, `;
    values.push(property_type);
  }

  query = query.slice(0, -2);

  query += ` WHERE id = $${values.length + 1}`;
  values.push(id);

  try {
    const result = await pool.query(query, values);

    if (result.rowCount > 0) {
      console.log(`Listing with ID ${id} updated successfully.`);
    } else {
      console.log(`No listing found with ID ${id}.`);
    }
  } catch (error) {
    console.error('Error updating listing:', error);
  }

  pool.end();
}

updateListing();
