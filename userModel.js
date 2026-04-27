const db = require('./config/db');

const User = {

    // 🔹 Ambil semua user (lama, tetap dipakai)
    getAll: (callback) => {
        db.query('SELECT * FROM users', callback);
    },

    // 🔹 Pagination + Search (FITUR BARU)
    getWithPagination: (search, limit, offset, callback) => {
        const sql = `
            SELECT * FROM users 
            WHERE name LIKE ? OR email LIKE ?
            LIMIT ? OFFSET ?
        `;
        db.query(sql, [`%${search}%`, `%${search}%`, limit, offset], callback);
    },

    // 🔹 Hitung total data (untuk pagination)
    countUsers: (search, callback) => {
        const sql = `
            SELECT COUNT(*) as total FROM users 
            WHERE name LIKE ? OR email LIKE ?
        `;
        db.query(sql, [`%${search}%`, `%${search}%`], callback);
    },

    // 🔹 Cari berdasarkan email
    getByEmail: (email, callback) => {
        db.query('SELECT * FROM users WHERE email = ?', [email], callback);
    },

    // 🔹 Tambah user
    create: (data, callback) => {
        const sql = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';
        db.query(sql, [data.name, data.email, data.phone, data.password], callback);
    },

    // 🔹 Update user
    update: (id, data, callback) => {
        const sql = 'UPDATE users SET name=?, email=?, phone=? WHERE id=?';
        db.query(sql, [data.name, data.email, data.phone, id], callback);
    },

    // 🔹 Hapus user
    delete: (id, callback) => {
        db.query('DELETE FROM users WHERE id=?', [id], callback);
    },

    // 🔹 Bulk insert (UNTUK CSV)
    bulkInsert: (users, callback) => {
        const sql = 'INSERT INTO users (name, email, phone, password) VALUES ?';
        const values = users.map(u => [u.name, u.email, u.phone, u.password]);
        db.query(sql, [values], callback);
    }

};

module.exports = User;