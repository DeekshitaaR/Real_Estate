const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'real_estate',
  password: 'krishna', 
  port: 5432,
});
async function registerUser() {
  const [name, phone, email, password, role, profilePicPath, idProofPath] = process.argv.slice(2);
  if (!name || !phone || !email || !password || !role || !profilePicPath || !idProofPath) {
    console.log("Error: Missing required fields.");
    console.log("Usage: node register.js <name> <phone> <email> <password> <role> <profilePicPath> <idProofPath>");
    pool.end();
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePic = fs.readFileSync(path.resolve(profilePicPath)).toString('base64');
    const idProof = fs.readFileSync(path.resolve(idProofPath)).toString('base64');
    await pool.query(
      'INSERT INTO users (name, phone, email, password, role, profile_pic, id_proof) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [name, phone, email, hashedPassword, role, profilePic, idProof]
    );
    console.log("User registered successfully!");
  } catch (err) {
    console.error("Error during registration:", err);
  } finally {
    pool.end();
  }
}

registerUser();
