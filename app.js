const express = require('express');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// PostgreSQL connection
const pool = new Pool({
  user: 'deeks',
  host: 'localhost',
  database: 'real_estate',
  password: 'krishna',
  port: 5432,
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Render the form page
app.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM listings');
  res.render('index', { listings: result.rows });
});

// Handle form submission
app.post('/create-listing', upload.single('image'), async (req, res) => {
  const { title, location, price, description, property_type } = req.body;
  const image_path = req.file ? '/uploads/' + req.file.filename : null;

  await pool.query(
    'INSERT INTO listings (title, location, price, description, property_type, image_path) VALUES ($1, $2, $3, $4, $5, $6)',
    [title, location, price, description, property_type, image_path]
  );
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
