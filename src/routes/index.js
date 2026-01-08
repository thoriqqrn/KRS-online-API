const express = require('express');
const authRoutes = require('./auth.routes');
const krsRoutes = require('./krs.routes');
const jadwalRoutes = require('./jadwal.routes');
const userRoutes = require('./user.routes');
const mataKuliahRoutes = require('./matakuliah.routes');

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/krs', krsRoutes);
router.use('/jadwal', jadwalRoutes);
router.use('/user', userRoutes);
router.use('/mata-kuliah', mataKuliahRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
