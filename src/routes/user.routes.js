const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const validate = require('../middlewares/validator.middleware');

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

// Admin: Manage all users
router.get('/users', adminMiddleware, userController.getAllUsers);
router.get('/users/:id', adminMiddleware, userController.getUserById);
router.post(
  '/users',
  adminMiddleware,
  [
    body('nim').notEmpty().withMessage('NIM harus diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('name').notEmpty().withMessage('Nama harus diisi'),
  ],
  validate,
  userController.createUser
);
router.put('/users/:id', adminMiddleware, userController.updateUser);
router.delete('/users/:id', adminMiddleware, userController.deleteUser);

// Update Profile (for current user)
router.put('/profile', userController.updateProfile);

// Saved Classes
router.get('/saved-classes', userController.getSavedClasses);
router.post(
  '/saved-classes',
  [
    body('jadwalId').notEmpty().withMessage('Jadwal ID harus diisi'),
  ],
  validate,
  userController.saveClass
);
router.delete('/saved-classes/:jadwalId', userController.unsaveClass);

// Notifications
router.get('/notifications', userController.getNotifications);
router.patch('/notifications/:id/read', userController.markNotificationAsRead);

module.exports = router;
