const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'graduation'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

app.get('/api/guests', (req, res) => {
  const query = 'SELECT FROM guests';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err); // Debugging log
      return res.status(500).send(err);
    }
    console.log('Query results:', results); // Debugging log
    res.json(results);
  });
});
app.get('/api/branches', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT DISTINCT branch FROM users');
    const branches = rows.map(row => row.branch);
    res.json(branches);
  } catch (err) {
    console.error('Error fetching branches:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});