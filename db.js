const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fullstack'
});

db.connect((err) => {
  if (err) {
    console.error('Koneksi gagal:', err);
  } else {
    console.log('MySQL Connected...');
  }
});

module.exports = db;
