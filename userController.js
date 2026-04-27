const User = require('./userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const csv = require('csv-parser');
const fs = require('fs');

const SECRET = 'rahasia';


// 🔥 1. PAGINATION + SEARCH
exports.getUsers = (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    User.getWithPagination(search, limit, offset, (err, results) => {
        if (err) return res.status(500).json(err);

        User.countUsers(search, (err, countResult) => {
            if (err) return res.status(500).json(err);

            res.json({
                data: results,
                total: countResult[0].total,
                page: page
            });
        });
    });
};


// 🔥 2. CREATE USER
exports.createUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        User.create({ name, email, phone, password: hashedPassword }, (err) => {
            if (err) return res.status(500).json({ message: 'Gagal simpan' });

            res.json({ message: 'User berhasil dibuat' });
        });

    } catch (err) {
        res.status(500).json(err);
    }
};


// 🔥 3. LOGIN + SESSION
exports.login = (req, res) => {
    const { email, password } = req.body;

    User.getByEmail(email, async (err, results) => {
        if (err) return res.status(500).json(err);

        if (!results || results.length === 0) {
            return res.status(400).json({ message: 'User tidak ditemukan' });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Password salah' });
        }

        const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1h' });

        // 🔥 SESSION
        req.session.user = user;

        res.json({ message: 'Login berhasil', token, user });
    });
};


// 🔥 4. EXPORT EXCEL
exports.exportExcel = async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    worksheet.columns = [
        { header: 'ID', key: 'id' },
        { header: 'Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Phone', key: 'phone' }
    ];

    User.getAll((err, users) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error database' });
        }

        if (!users || users.length === 0) {
            return res.json({ message: 'Data kosong' });
        }

        users.forEach(u => worksheet.addRow(u));

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');

        workbook.xlsx.write(res).then(() => res.end());
    });
};


// 🔥 5. EXPORT PDF
exports.exportPDF = (req, res) => {
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    User.getAll((err, users) => {
        if (err) return res.status(500).json(err);

        if (!users || users.length === 0) {
            doc.text("Data kosong");
            doc.end();
            return;
        }

        users.forEach(u => {
            doc.text(`${u.name} - ${u.email} - ${u.phone}`);
        });

        doc.end();
    });
};


// 🔥 6. UPLOAD CSV (BULK INSERT)
exports.uploadCSV = (req, res) => {
    const results = [];

    if (!req.file) {
        return res.status(400).json({ message: 'File tidak ditemukan' });
    }

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {

            const users = results.map(r => ({
                name: r.name,
                email: r.email,
                phone: r.phone,
                password: r.password
            }));

            if (users.length === 0) {
                return res.json({ message: 'File kosong' });
            }

            User.bulkInsert(users, (err) => {
                if (err) return res.status(500).json(err);

                res.json({ message: 'Upload berhasil' });
            });
        });
};


// 🔥 7. UPDATE
exports.updateUser = (req, res) => {
    const { id } = req.params;

    User.update(id, req.body, (err) => {
        if (err) return res.status(500).json({ message: 'Gagal update' });

        res.json({ message: 'Berhasil update' });
    });
};


// 🔥 8. DELETE
exports.deleteUser = (req, res) => {
    const { id } = req.params;

    User.delete(id, (err) => {
        if (err) return res.status(500).json(err);

        res.json({ message: 'Berhasil delete' });
    });
};