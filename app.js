const express = require('express');
const app = express();
const path = require('path');
const userRoutes = require('./userRoutes');
const cors = require('cors');
const session = require('express-session');

// 🔹 MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 SESSION (WAJIB untuk tugas)
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 5 * 60 * 1000 } // 5 menit (auto logout)
}));

// 🔹 STATIC FILE (untuk HTML/CSS)
app.use(express.static(path.join(__dirname, 'public')));

// 🔹 ROUTES API
app.use('/api', userRoutes);

// 🔹 HALAMAN UTAMA
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 🔹 HANDLE ERROR API
app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
});

module.exports = app;