const express = require('express');
const router = express.Router();
const userController = require('./userController');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// 🔹 USER CRUD + PAGINATION
router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// 🔹 LOGIN
router.post('/login', userController.login);

// 🔹 EXPORT
router.get('/export/excel', userController.exportExcel);
router.get('/export/pdf', userController.exportPDF);

// 🔹 UPLOAD CSV
router.post('/upload', upload.single('file'), userController.uploadCSV);

module.exports = router;