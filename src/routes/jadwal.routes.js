const express = require('express');
const jadwalController = require('../controllers/jadwal.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const router = express.Router();

// All jadwal routes require authentication
router.use(authMiddleware);

// Get all jadwal with filters
router.get('/', jadwalController.getAllJadwal);

// Get jadwal by ID
router.get('/:id', jadwalController.getJadwalById);

// Admin CRUD
router.post('/', adminMiddleware, jadwalController.createJadwal);
router.put('/:id', adminMiddleware, jadwalController.updateJadwal);
router.delete('/:id', adminMiddleware, jadwalController.deleteJadwal);

module.exports = router;
