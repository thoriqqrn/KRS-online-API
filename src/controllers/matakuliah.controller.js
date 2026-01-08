const mataKuliahService = require('../services/matakuliah.service');

class MataKuliahController {
  async getAllMataKuliah(req, res, next) {
    try {
      const { prodi, semester, search, format } = req.query;

      const mataKuliah = format === 'dropdown'
        ? await mataKuliahService.getMataKuliahDropdown({
            prodi,
            semester,
            search,
          })
        : await mataKuliahService.getAllMataKuliah({
            prodi,
            semester,
            search,
          });
      
      res.status(200).json({
        success: true,
        data: mataKuliah,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getMataKuliahById(req, res, next) {
    try {
      const { id } = req.params;
      const mataKuliah = await mataKuliahService.getMataKuliahById(id);
      
      res.status(200).json({
        success: true,
        data: mataKuliah,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async createMataKuliah(req, res, next) {
    try {
      const mataKuliah = await mataKuliahService.createMataKuliah(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Mata kuliah berhasil dibuat',
        data: mataKuliah,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateMataKuliah(req, res, next) {
    try {
      const { id } = req.params;
      const mataKuliah = await mataKuliahService.updateMataKuliah(id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Mata kuliah berhasil diupdate',
        data: mataKuliah,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async deleteMataKuliah(req, res, next) {
    try {
      const { id } = req.params;
      const result = await mataKuliahService.deleteMataKuliah(id);
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MataKuliahController();
