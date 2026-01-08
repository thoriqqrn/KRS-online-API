// Middleware untuk check role admin
const adminMiddleware = (req, res, next) => {
  try {
    // req.user sudah di-set oleh authMiddleware sebelumnya
    const userRole = req.user.role || 'mahasiswa';
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat mengakses resource ini.',
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat verifikasi role',
    });
  }
};

module.exports = adminMiddleware;
