const express = require('express');
const { body } = require('express-validator');
const mataKuliahController = require('../controllers/matakuliah.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');

const router = express.Router();

// All mata kuliah routes require authentication
router.use(authMiddleware);

// Get all mata kuliah with filters
router.get('/', mataKuliahController.getAllMataKuliah);

// Get mata kuliah by ID
router.get('/:id', mataKuliahController.getMataKuliahById);

// Create mata kuliah (admin only - for now no admin check)
router.post(
  '/',
  [
    body('kodeMk').notEmpty().withMessage('Kode mata kuliah harus diisi'),
    body('namaMk').notEmpty().withMessage('Nama mata kuliah harus diisi'),
    body('sks').isInt({ min: 1, max: 6 }).withMessage('SKS harus antara 1-6'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester harus antara 1-8'),
    body('prodi').notEmpty().withMessage('Prodi harus diisi'),
  ],
  validate,
  mataKuliahController.createMataKuliah
);

// Update mata kuliah
router.put('/:id', mataKuliahController.updateMataKuliah);

// Delete mata kuliah
router.delete('/:id', mataKuliahController.deleteMataKuliah);

module.exports = router;
