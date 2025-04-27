const { Pool } = require('pg');
const bcrypt = require('bcrypt'); 

const pool = new Pool({
  user: 'postgres',       
  host: 'localhost',       
  database: 'real_estate', 
  password: 'krishna',         
  port: 5432,              
});

async function login() {
  const [username, password] = process.argv.slice(2);
  if (!username || !password) {
    console.log('Please provide both username and password');
    return;
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [username]);
    if (result.rows.length === 0) {
      console.log('No user found with that username.');
      return;
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      console.log('Login successful!');
    } else {
      console.log('Incorrect password.');
    }
  } catch (err) {
    console.error('Error during login:', err);
  } finally {
    pool.end();
  }
}

login();
