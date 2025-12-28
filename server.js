const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const db = new sqlite3.Database('./db.sqlite');

// ============== MIDDLEWARE ==============
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.ADMIN_PASSWORD || 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// ============== DB SETUP ==============
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    riderName TEXT NOT NULL,
    tripCount INTEGER,
    incidents TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_date ON entries(date)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_riderName ON entries(riderName)`);
});

// ============== AUTH MIDDLEWARE ==============
const isAdmin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// ============== ROUTES: RIDER ==============

// Submit new entry
app.post('/api/entries', (req, res) => {
  const { date, riderName, tripCount, incidents } = req.body;
  
  if (!date || !riderName) {
    return res.status(400).json({ error: 'Date and riderName required' });
  }

  db.run(
    `INSERT INTO entries (date, riderName, tripCount, incidents) VALUES (?, ?, ?, ?)`,
    [date, riderName, tripCount || 0, incidents || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'DB error' });
      }
      res.json({ id: this.lastID, message: 'Entry saved' });
    }
  );
});

// Get all entries (for admin only)
app.get('/api/entries', isAdmin, (req, res) => {
  const { startDate, endDate, rider } = req.query;

  let query = 'SELECT * FROM entries WHERE 1=1';
  const params = [];

  if (startDate) {
    query += ' AND date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND date <= ?';
    params.push(endDate);
  }
  if (rider) {
    query += ' AND riderName LIKE ?';
    params.push(`%${rider}%`);
  }

  query += ' ORDER BY date DESC, createdAt DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'DB error' });
    }
    res.json(rows);
  });
});

// Get unique rider names for filter dropdown
app.get('/api/riders', isAdmin, (req, res) => {
  db.all(
    `SELECT DISTINCT riderName FROM entries ORDER BY riderName ASC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'DB error' });
      }
      res.json(rows.map(r => r.riderName));
    }
  );
});

// ============== ROUTES: AUTH ==============

app.post('/api/login', (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    req.session.admin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/check-auth', (req, res) => {
  res.json({ isAdmin: !!req.session.admin });
});

// ============== STATIC FILES ==============

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/rider');
});

// Rider form page
app.get('/rider', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'rider.html'));
});

// Admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ============== START SERVER ==============
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Rider form: http://localhost:${PORT}/rider`);
  console.log(`✓ Admin dashboard: http://localhost:${PORT}/admin`);
});
