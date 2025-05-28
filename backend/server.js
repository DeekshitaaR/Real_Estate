const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, 'uploads');

// Make sure uploads folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'real_estate',
  password: 'krishna',
  port: 5432,
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'ListNBuyHome.html'));
});

app.get('/listings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM listings');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/rent', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rent');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/listings', upload.single('image'), async (req, res) => {
  const { title, location, price, description, property_type } = req.body;
  const image_path = req.file ? req.file.filename : null;

  if (!title || !location || !price || !description || !property_type) {
    return res.status(400).send(`Missing required fields`);
  }

  try {
    await pool.query(
      'INSERT INTO listings (title, location, price, description, property_type, image_path) VALUES ($1, $2, $3, $4, $5, $6)',
      [title, location, price, description, property_type, image_path]
    );
    res.status(201).send(`Listing inserted successfully`);
  } catch (err) {
    console.error('Error inserting listing:', err.message);
    res.status(500).send(err.message);
  }
});

app.get('/listings/search', async (req, res) => {
  const { city, priceMin, priceMax, type } = req.query;
  let query = 'SELECT * FROM listings WHERE 1=1';
  const values = [];

  if (city) {
    query += ` AND LOWER(location) = LOWER($${values.length + 1})`;
    values.push(city);
  }

  if (priceMin) {
    query += ` AND price >= $${values.length + 1}`;
    values.push(priceMin);
  }

  if (priceMax) {
    query += ` AND price <= $${values.length + 1}`;
    values.push(priceMax);
  }

  if (type) {
    query += ` AND LOWER(property_type) = LOWER($${values.length + 1})`;
    values.push(type);
  }

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching listings:', error.message);
    res.status(500).send(error.message);
  }
});

app.delete('/listings/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM listings WHERE id = $1', [id]);

    if (result.rowCount > 0) {
      res.send(`Listing with ID ${id} deleted.`);
    } else {
      res.status(404).send(`No listing found with ID ${id}`);
    }
  } catch (err) {
    console.error('Error deleting by ID:', err.message);
    res.status(500).send(err.message);
  }
});

app.delete('/listings/by-title', async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).send(`Title is required in request body`);
  }

  try {
    const result = await pool.query('DELETE FROM listings WHERE title = $1', [title]);

    if (result.rowCount > 0) {
      res.send(`Listing(s) with title "${title}" deleted.`);
    } else {
      res.status(404).send(`No listing found with title "${title}"`);
    }
  } catch (err) {
    console.error('Error deleting by title:', err.message);
    res.status(500).send(err.message);
  }
});

app.put('/listings/:id', async (req, res) => {
  const { id } = req.params;
  const { title, location, price, description, property_type } = req.body;

  if (!id) {
    return res.status(400).send(`Listing ID is required in URL`);
  }

  let query = 'UPDATE listings SET ';
  const values = [];
  const setClauses = [];

  if (title) {
    values.push(title);
    setClauses.push(`title = $${values.length}`);
  }
  if (location) {
    values.push(location);
    setClauses.push(`location = $${values.length}`);
  }
  if (price) {
    values.push(price);
    setClauses.push(`price = $${values.length}`);
  }
  if (description) {
    values.push(description);
    setClauses.push(`description = $${values.length}`);
  }
  if (property_type) {
    values.push(property_type);
    setClauses.push(`property_type = $${values.length}`);
  }

  if (setClauses.length === 0) {
    return res.status(400).send(`No fields provided to update`);
  }

  query += setClauses.join(', ');
  values.push(id);
  query += ` WHERE id = $${values.length}`;

  try {
    const result = await pool.query(query, values);

    if (result.rowCount > 0) {
      res.send(`Listing with ID ${id} updated successfully.`);
    } else {
      res.status(404).send(`No listing found with ID ${id}`);
    }
  } catch (err) {
    console.error('Error updating listing:', err.message);
    res.status(500).send(err.message);
  }
});

const signupUpload = upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'idProof', maxCount: 1 }
]);

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname,'register'));
});

app.post('/register', signupUpload, async (req, res) => {
  console.log(req.body);
  console.log(req.files);
  const { name, phone, email, password, role } = req.body;

  if (!name || !phone || !email || !password || !role || !req.files.profilePic || !req.files.idProof) {
    return res.status(400).send(`All fields and files are required`);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePicPath = path.join(__dirname, req.files.profilePic[0].path);
    const idProofPath = path.join(__dirname, req.files.idProof[0].path);
    const profilePic = fs.readFileSync(profilePicPath).toString('base64');
    const idProof = fs.readFileSync(idProofPath).toString('base64');

    await pool.query(
      'INSERT INTO users (name, phone, email, password, role, profile_pic, id_proof) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [name, phone, email, hashedPassword, role, profilePic, idProof]
    );

    res.status(201).send(`<h1>Signup successful!</h1><a href="/">Go home</a>`);
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).send(`err.message`);
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send(`Please provide both email and password`);
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).send(`No user found with that email`);
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      res.redirect('/ListNBuyHome.html');
    } else {
      res.status(401).send(`Incorrect password`);
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send(`${err.message }`);
  }
});

app.post('/buy', async (req, res) => {
  const { name, email, phone_number, preferred_location, budget_range, property_type } = req.body;

  if (!name || !email || !phone_number || !preferred_location || !budget_range || !property_type) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    await pool.query(
      `INSERT INTO buy 
        (name, email, phone_number, preferred_location, budget_range, property_type) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, email, phone_number, preferred_location, budget_range, property_type]
    );

    res.status(201).send(`Buy request inserted successfully`);
  } catch (err) {
    console.error("Error inserting buy request:", err.message);
    res.status(500).send(err.message);
  }
});

app.post('/rent', async (req, res) => {
  const cleanInput = (val) => {
    return val === 'null' || val === '-' || val === '' ? null : val;
  };

  const {
    name,
    email,
    phone_number,
    property_address,
    property_type,
    monthly_rent: monthly_rent_raw,
    photo_path: photo_path_raw,
    additional_details: additional_details_raw,
  } = req.body;

  if (!name || !email || !phone_number || !property_address || !property_type || !monthly_rent_raw) {
    return res.status(400).send(`Missing required fields`);
  }

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

    res.status(201).send(`Rent listing inserted successfully`);
  } catch (err) {
    console.error('Error inserting rent listing:', err.message);
    res.status(500).send(err.message);
  }
});

app.post('/sell', upload.single('photo_path'), async (req, res) => {
  function cleanInput(val) {
    return val === 'null' || val === '-' || val === '' ? null : val;
  }

  const {
    name,
    email,
    phone_number,
    property_address,
    property_type,
    expected_price: expected_price_raw,
    additional_details: additional_details_raw,
  } = req.body;

  if (!name || !email || !phone_number || !property_address || !property_type || !expected_price_raw) {
    return res.status(400).send(`Missing required fields`);
  }

  const expected_price = parseFloat(expected_price_raw);
  const photo_path = req.file ? req.file.path : null;
  const additional_details = cleanInput(additional_details_raw);

  try {
    await pool.query(
      `INSERT INTO sell 
        (name, email, phone_number, property_address, property_type, expected_price, photo_path, additional_details) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [name, email, phone_number, property_address, property_type, expected_price, photo_path, additional_details]
    );

    res.status(201).send(`Sell listing inserted successfully`);
  } catch (err) {
    console.error('Error inserting sell listing:', err.message);
    res.status(500).send(err.message);
  }
});

app.get('/listings/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).send(`No listing found with ID ${id}`);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching listing by ID:', err.message);
    res.status(500).send(err.message);
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
