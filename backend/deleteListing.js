const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'real_estate',
  password: 'krishna',
  port: 5432,
});

async function deleteListing() {
  const [identifier, mode] = process.argv.slice(2);

  if (!identifier || !mode || (mode !== 'id' && mode !== 'title')) {
    console.log('Usage: node deleteListing.js <value> <id|title>');
    console.log('Example: node deleteListing.js 3 id');
    console.log('Example: node deleteListing.js "New House" title');
    return;
  }

  let query;
  let result;

  try {
    if (mode === 'id') {
      query = 'DELETE FROM listings WHERE id = $1';
      result = await pool.query(query, [identifier]);
    } else if (mode === 'title') {
      query = 'DELETE FROM listings WHERE title = $1';
      result = await pool.query(query, [identifier]);
    }

    if (result.rowCount > 0) {
      console.log(`Deleted ${result.rowCount} listing(s) with ${mode} = "${identifier}".`);
    } else {
      console.log(`No listings found with ${mode} = "${identifier}".`);
    }
  } catch (error) {
    console.error('Error deleting listing:', error);
  } finally {
    pool.end();
  }
}

deleteListing();
