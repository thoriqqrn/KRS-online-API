const krsService = require('../services/krs.service');

class KRSController {
  async getKRS(req, res, next) {
    try {
      const { semester, tahunAjaran } = req.query;
      const userId = req.user.userId;
      
      const krsList = await krsService.getKRSByUser(userId, semester, tahunAjaran);
      
      res.status(200).json({
        success: true,
        data: krsList,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async addKRS(req, res, next) {
    try {
      const { jadwalId, semester, tahunAjaran } = req.body;
      const userId = req.user.userId;
      
      const krs = await krsService.addKRS(userId, jadwalId, semester, tahunAjaran);
      
      res.status(201).json({
        success: true,
        message: 'KRS berhasil ditambahkan',
        data: krs,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async deleteKRS(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      const result = await krsService.deleteKRS(id, userId);
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new KRSController();
