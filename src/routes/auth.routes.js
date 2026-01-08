const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator.middleware');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('nim').notEmpty().withMessage('NIM harus diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('name').notEmpty().withMessage('Nama harus diisi'),
    body('prodi').notEmpty().withMessage('Prodi harus diisi'),
    body('semester').isInt({ min: 1 }).withMessage('Semester harus berupa angka'),
  ],
  validate,
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('nim').notEmpty().withMessage('NIM harus diisi'),
    body('password').notEmpty().withMessage('Password harus diisi'),
  ],
  validate,
  authController.login
);

// Forgot Password
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Email tidak valid'),
  ],
  validate,
  authController.forgotPassword
);

// Verify OTP
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('code').notEmpty().withMessage('Kode OTP harus diisi'),
  ],
  validate,
  authController.verifyOTP
);

// Reset Password
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  ],
  validate,
  authController.resetPassword
);

// Get Profile (Protected)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
