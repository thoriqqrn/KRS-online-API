const express = require('express');
const { body } = require('express-validator');
const krsController = require('../controllers/krs.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');

const router = express.Router();

// All KRS routes require authentication
router.use(authMiddleware);

// Get KRS
router.get('/', krsController.getKRS);

// Add KRS
router.post(
  '/',
  [
    body('jadwalId').notEmpty().withMessage('Jadwal ID harus diisi'),
    body('semester').notEmpty().withMessage('Semester harus diisi'),
    body('tahunAjaran').notEmpty().withMessage('Tahun ajaran harus diisi'),
  ],
  validate,
  krsController.addKRS
);

// Delete KRS
router.delete('/:id', krsController.deleteKRS);

module.exports = router;
