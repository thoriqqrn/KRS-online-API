const authService = require('../services/auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async login(req, res, next) {
    try {
      const { nim, password } = req.body;
      const result = await authService.login(nim, password);
      
      res.status(200).json({
        success: true,
        message: 'Login berhasil',
        data: result,
      });
    } catch (error) {
      error.statusCode = 401;
      next(error);
    }
  }
  
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.generateOTP(email, 'password_reset');
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async verifyOTP(req, res, next) {
    try {
      const { email, code } = req.body;
      const result = await authService.verifyOTP(email, code, 'password_reset');
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async resetPassword(req, res, next) {
    try {
      const { email, newPassword } = req.body;
      const result = await authService.resetPassword(email, newPassword);
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getProfile(req, res, next) {
    try {
      const prisma = require('../config/database');
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          nim: true,
          email: true,
          name: true,
          phoneNumber: true,
          prodi: true,
          semester: true,
          ipk: true,
          maxSks: true,
          photoUrl: true,
          createdAt: true,
        },
      });
      
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
