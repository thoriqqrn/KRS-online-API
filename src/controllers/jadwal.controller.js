const jadwalService = require('../services/jadwal.service');

class JadwalController {
  async getAllJadwal(req, res, next) {
    try {
      const filters = {
        prodi: req.query.prodi,
        semester: req.query.semester,
        hari: req.query.hari,
        search: req.query.search,
      };
      
      // If format=kelas, return kelas format for frontend
      if (req.query.format === 'kelas') {
        const kelas = await jadwalService.getKelasFormat(filters);
        
        return res.status(200).json({
          success: true,
          data: kelas,
        });
      }
      
      const jadwalList = await jadwalService.getAllJadwal(filters);
      
      res.status(200).json({
        success: true,
        data: jadwalList,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getJadwalById(req, res, next) {
    try {
      const { id } = req.params;
      const jadwal = await jadwalService.getJadwalById(id);
      
      res.status(200).json({
        success: true,
        data: jadwal,
      });
    } catch (error) {
      next(error);
    }
  }

  async createJadwal(req, res, next) {
    try {
      const jadwal = await jadwalService.createJadwal(req.body);
      res.status(201).json({
        success: true,
        data: jadwal,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateJadwal(req, res, next) {
    try {
      const { id } = req.params;
      const jadwal = await jadwalService.updateJadwal(id, req.body);
      res.status(200).json({
        success: true,
        data: jadwal,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteJadwal(req, res, next) {
    try {
      const { id } = req.params;
      const result = await jadwalService.deleteJadwal(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new JadwalController();
