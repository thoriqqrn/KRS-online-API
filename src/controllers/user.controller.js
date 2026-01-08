const userService = require('../services/user.service');

class UserController {
  // Admin: Get all users
  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Get user by ID
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Create new user
  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      
      res.status(201).json({
        success: true,
        message: 'User berhasil dibuat',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Update user
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.updateUser(id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'User berhasil diperbarui',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Delete user
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      
      res.status(200).json({
        success: true,
        message: 'User berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.userId;
      const user = await userService.updateProfile(userId, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Profile berhasil diperbarui',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getSavedClasses(req, res, next) {
    try {
      const userId = req.user.userId;
      const savedClasses = await userService.getSavedClasses(userId);
      
      res.status(200).json({
        success: true,
        data: savedClasses,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async saveClass(req, res, next) {
    try {
      const userId = req.user.userId;
      const { jadwalId } = req.body;
      
      const savedClass = await userService.saveClass(userId, jadwalId);
      
      res.status(201).json({
        success: true,
        message: 'Kelas berhasil disimpan',
        data: savedClass,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async unsaveClass(req, res, next) {
    try {
      const userId = req.user.userId;
      const { jadwalId } = req.params;
      
      const result = await userService.unsaveClass(userId, jadwalId);
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.userId;
      const notifications = await userService.getNotifications(userId);
      
      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async markNotificationAsRead(req, res, next) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;
      
      const notification = await userService.markNotificationAsRead(userId, id);
      
      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
