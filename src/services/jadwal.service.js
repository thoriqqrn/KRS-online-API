const { db } = require('../config/firebase');

class JadwalService {
  constructor() {
    this.jadwalCollection = db.collection('jadwal');
    this.mataKuliahCollection = db.collection('mata_kuliah');
  }

  _validateTimeRange(jamMulai, jamSelesai) {
    if (!jamMulai || !jamSelesai) {
      throw new Error('Jam mulai dan jam selesai harus diisi');
    }
    // Expect format HH:MM so lexicographic compare is safe.
    if (String(jamMulai).length < 4 || String(jamSelesai).length < 4) {
      throw new Error('Format jam tidak valid');
    }
    if (String(jamMulai) >= String(jamSelesai)) {
      throw new Error('Jam mulai harus lebih kecil dari jam selesai');
    }
  }

  async _assertMataKuliahExists(mataKuliahId) {
    if (!mataKuliahId) {
      throw new Error('Mata kuliah harus dipilih');
    }
    const mkDoc = await this.mataKuliahCollection.doc(mataKuliahId).get();
    if (!mkDoc.exists) {
      throw new Error('Mata kuliah tidak ditemukan');
    }
  }

  async getAllJadwal(filters = {}) {
    const { prodi, semester, hari, search } = filters;
    
    let query = this.jadwalCollection.where('isActive', '==', true);
    
    if (hari) {
      query = query.where('hari', '==', hari);
    }
    
    const snapshot = await query.get();
    
    const jadwalList = [];
    for (const doc of snapshot.docs) {
      const jadwalData = { id: doc.id, ...doc.data() };
      
      // Get mata kuliah details
      const mkDoc = await this.mataKuliahCollection.doc(jadwalData.mataKuliahId).get();
      if (mkDoc.exists) {
        const mkData = { id: mkDoc.id, ...mkDoc.data() };
        
        // Apply mata kuliah filters
        if (prodi && mkData.prodi !== prodi) continue;
        if (semester && mkData.semester !== parseInt(semester)) continue;
        if (search) {
          const searchLower = search.toLowerCase();
          const matchName = mkData.namaMk.toLowerCase().includes(searchLower);
          const matchCode = mkData.kodeMk.toLowerCase().includes(searchLower);
          const matchDosen = jadwalData.dosen.toLowerCase().includes(searchLower);
          if (!matchName && !matchCode && !matchDosen) continue;
        }
        
        jadwalData.mataKuliah = mkData;
        jadwalList.push(jadwalData);
      }
    }
    
    // Sort by day and time
    const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    jadwalList.sort((a, b) => {
      const dayDiff = dayOrder.indexOf(a.hari) - dayOrder.indexOf(b.hari);
      if (dayDiff !== 0) return dayDiff;
      return a.jamMulai.localeCompare(b.jamMulai);
    });
    
    return jadwalList;
  }
  
  async getJadwalById(id) {
    const jadwalDoc = await this.jadwalCollection.doc(id).get();
    
    if (!jadwalDoc.exists) {
      throw new Error('Jadwal tidak ditemukan');
    }
    
    const jadwal = { id: jadwalDoc.id, ...jadwalDoc.data() };
    
    // Get mata kuliah details
    const mkDoc = await this.mataKuliahCollection.doc(jadwal.mataKuliahId).get();
    if (mkDoc.exists) {
      jadwal.mataKuliah = { id: mkDoc.id, ...mkDoc.data() };
    }
    
    return jadwal;
  }

  async createJadwal(payload) {
    const {
      mataKuliahId,
      dosen,
      ruangan,
      hari,
      jamMulai,
      jamSelesai,
      kuota,
      kodeKelas,
      isActive,
    } = payload || {};

    if (!hari) {
      throw new Error('Hari harus diisi');
    }

    this._validateTimeRange(jamMulai, jamSelesai);

    const kuotaNum = Number(kuota);
    if (!Number.isFinite(kuotaNum) || kuotaNum < 1) {
      throw new Error('Kuota harus berupa angka >= 1');
    }

    await this._assertMataKuliahExists(mataKuliahId);

    const data = {
      mataKuliahId,
      dosen: dosen || '',
      ruangan: ruangan || '',
      hari,
      jamMulai,
      jamSelesai,
      kuota: kuotaNum,
      terisi: 0,
      kodeKelas: kodeKelas || '',
      isActive: isActive === false ? false : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await this.jadwalCollection.add(data);
    return await this.getJadwalById(docRef.id);
  }

  async updateJadwal(id, payload) {
    const jadwalDoc = await this.jadwalCollection.doc(id).get();

    if (!jadwalDoc.exists) {
      throw new Error('Jadwal tidak ditemukan');
    }

    const current = jadwalDoc.data();
    const updates = {};

    if (payload?.mataKuliahId != null) {
      await this._assertMataKuliahExists(payload.mataKuliahId);
      updates.mataKuliahId = payload.mataKuliahId;
    }

    if (payload?.dosen != null) updates.dosen = payload.dosen;
    if (payload?.ruangan != null) updates.ruangan = payload.ruangan;
    if (payload?.hari != null) updates.hari = payload.hari;
    if (payload?.kodeKelas != null) updates.kodeKelas = payload.kodeKelas;
    if (payload?.isActive != null) updates.isActive = payload.isActive;

    const nextJamMulai = payload?.jamMulai ?? current.jamMulai;
    const nextJamSelesai = payload?.jamSelesai ?? current.jamSelesai;
    if (payload?.jamMulai != null || payload?.jamSelesai != null) {
      this._validateTimeRange(nextJamMulai, nextJamSelesai);
      updates.jamMulai = nextJamMulai;
      updates.jamSelesai = nextJamSelesai;
    }

    if (payload?.kuota != null) {
      const kuotaNum = Number(payload.kuota);
      if (!Number.isFinite(kuotaNum) || kuotaNum < 1) {
        throw new Error('Kuota harus berupa angka >= 1');
      }
      const terisiNow = Number(current.terisi) || 0;
      if (kuotaNum < terisiNow) {
        throw new Error('Kuota tidak boleh lebih kecil dari terisi');
      }
      updates.kuota = kuotaNum;
    }

    updates.updatedAt = new Date();

    await jadwalDoc.ref.update(updates);
    return await this.getJadwalById(id);
  }

  async deleteJadwal(id) {
    const jadwalDoc = await this.jadwalCollection.doc(id).get();

    if (!jadwalDoc.exists) {
      throw new Error('Jadwal tidak ditemukan');
    }

    // Soft delete: nonaktifkan agar aman untuk data KRS yang sudah ada.
    await jadwalDoc.ref.update({
      isActive: false,
      updatedAt: new Date(),
    });

    return { id, message: 'Jadwal berhasil dinonaktifkan' };
  }
  
  // Get kelas format (combined jadwal + mata kuliah for frontend)
  async getKelasFormat(filters = {}) {
    const jadwalList = await this.getAllJadwal(filters);
    
    return jadwalList.map(jadwal => {
      const mk = jadwal.mataKuliah;
      return {
        id: jadwal.id,
        kodeMataKuliah: mk.kodeMk,
        namaMataKuliah: mk.namaMk,
        sks: mk.sks,
        dosen: jadwal.dosen,
        ruangan: jadwal.ruangan,
        jadwal: `${jadwal.hari}, ${jadwal.jamMulai}-${jadwal.jamSelesai}`,
        hari: jadwal.hari,
        jamMulai: jadwal.jamMulai,
        jamSelesai: jadwal.jamSelesai,
        kodeKelas: jadwal.kodeKelas,
        kapasitas: jadwal.kuota,
        pendaftarSaat: jadwal.terisi,
        isActive: jadwal.isActive,
        prodi: mk.prodi,
        semester: mk.semester,
      };
    });
  }
}

module.exports = new JadwalService();
