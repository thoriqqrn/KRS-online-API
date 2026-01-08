const { db } = require('../config/firebase');

class KRSService {
  constructor() {
    this.krsCollection = db.collection('krs');
    this.jadwalCollection = db.collection('jadwal');
    this.mataKuliahCollection = db.collection('mata_kuliah');
    this.usersCollection = db.collection('users');
  }

  _toDate(value) {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value.toDate === 'function') return value.toDate(); // Firestore Timestamp
    return null;
  }

  async getKRSByUser(userId, semester, tahunAjaran) {
    // NOTE: Hindari query multi-field + orderBy karena memerlukan composite index.
    // Ambil berdasarkan userId saja, lalu filter & sort di memory.
    const snapshot = await this.krsCollection.where('userId', '==', userId).get();
    const { docs: snapshotDocs } = snapshot;

    let docs = snapshotDocs;
    if (semester) {
      docs = docs.filter(d => (d.data().semester ?? null) === semester);
    }
    if (tahunAjaran) {
      docs = docs.filter(d => (d.data().tahunAjaran ?? null) === tahunAjaran);
    }

    docs.sort((a, b) => {
      const aDate = this._toDate(a.data().createdAt);
      const bDate = this._toDate(b.data().createdAt);
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return bDate - aDate;
    });

    const krsList = [];
    for (const doc of docs) {
      const krsData = { id: doc.id, ...doc.data() };
      
      // Get jadwal details
      const jadwalDoc = await this.jadwalCollection.doc(krsData.jadwalId).get();
      if (jadwalDoc.exists) {
        const jadwalData = { id: jadwalDoc.id, ...jadwalDoc.data() };
        
        // Get mata kuliah details
        const mkDoc = await this.mataKuliahCollection.doc(jadwalData.mataKuliahId).get();
        if (mkDoc.exists) {
          jadwalData.mataKuliah = { id: mkDoc.id, ...mkDoc.data() };
        }
        
        krsData.jadwal = jadwalData;
      }
      
      krsList.push(krsData);
    }
    
    return krsList;
  }
  
  async addKRS(userId, jadwalId, semester, tahunAjaran) {
    // Check if jadwal exists
    const jadwalDoc = await this.jadwalCollection.doc(jadwalId).get();
    
    if (!jadwalDoc.exists) {
      throw new Error('Jadwal tidak ditemukan');
    }
    
    const jadwal = { id: jadwalDoc.id, ...jadwalDoc.data() };
    
    if (!jadwal.isActive) {
      throw new Error('Kelas ini tidak aktif');
    }

    // Penentuan status otomatis:
    // - Jika slot masih ada -> approved
    // - Jika kelas penuh -> pending (antrean)
    const isFull = Number(jadwal.terisi) >= Number(jadwal.kuota);
    const nextStatus = isFull ? 'pending' : 'approved';
    
    // Get mata kuliah
    const mkDoc = await this.mataKuliahCollection.doc(jadwal.mataKuliahId).get();
    if (!mkDoc.exists) {
      throw new Error('Mata kuliah tidak ditemukan');
    }
    const mataKuliah = { id: mkDoc.id, ...mkDoc.data() };
    
    // Check if already enrolled (hindari query multi-field yang butuh index)
    const existingSnapshot = await this.krsCollection.where('userId', '==', userId).get();
    const alreadyEnrolled = existingSnapshot.docs.some((d) => {
      const k = d.data();
      return (
        k.jadwalId === jadwalId &&
        k.semester === semester &&
        k.tahunAjaran === tahunAjaran
      );
    });

    if (alreadyEnrolled) {
      throw new Error('Anda sudah mengambil mata kuliah ini');
    }
    
    // Check user's total SKS (hindari query composite index)
    const userKRSSnapshot = await this.krsCollection.where('userId', '==', userId).get();

    const eligibleKrsDocs = userKRSSnapshot.docs
      .map(d => d.data())
      .filter(krs =>
        krs.semester === semester &&
        krs.tahunAjaran === tahunAjaran &&
        (krs.status === 'pending' || krs.status === 'approved')
      );

    let currentSKS = 0;
    for (const krs of eligibleKrsDocs) {
      const jDoc = await this.jadwalCollection.doc(krs.jadwalId).get();
      if (jDoc.exists) {
        const j = jDoc.data();
        const mDoc = await this.mataKuliahCollection.doc(j.mataKuliahId).get();
        if (mDoc.exists) {
          const sksValue = Number(mDoc.data().sks);
          currentSKS += Number.isFinite(sksValue) ? sksValue : 0;
        }
      }
    }
    
    const userDoc = await this.usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('User tidak ditemukan');
    }

    const user = userDoc.data();

    // maxSks bisa null pada data lama; default untuk mahasiswa adalah 24.
    const maxSksValue = Number(user?.maxSks);
    const maxSksLimit = Number.isFinite(maxSksValue) && maxSksValue > 0
      ? maxSksValue
      : 24;
    
    const mataKuliahSks = Number(mataKuliah?.sks);
    const mataKuliahSksValue = Number.isFinite(mataKuliahSks)
      ? mataKuliahSks
      : 0;

    if (currentSKS + mataKuliahSksValue > maxSksLimit) {
      throw new Error(`Total SKS melebihi batas maksimal (${maxSksLimit} SKS)`);
    }
    
    // Create KRS
    const krsRef = this.krsCollection.doc();
    const krsData = {
      id: krsRef.id,
      userId,
      jadwalId,
      semester,
      tahunAjaran,
      status: nextStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await krsRef.set(krsData);
    
    // Update terisi hanya jika approved (ambil kursi nyata)
    if (nextStatus === 'approved') {
      await jadwalDoc.ref.update({
        terisi: jadwal.terisi + 1,
        updatedAt: new Date(),
      });
      // Update object untuk response agar konsisten
      jadwal.terisi += 1;
    }
    
    // Get complete data for response
    jadwal.mataKuliah = mataKuliah;
    krsData.jadwal = jadwal;
    
    return krsData;
  }
  
  async deleteKRS(krsId, userId) {
    const krsDoc = await this.krsCollection.doc(krsId).get();
    
    if (!krsDoc.exists) {
      throw new Error('KRS tidak ditemukan');
    }
    
    const krs = krsDoc.data();
    
    if (krs.userId !== userId) {
      throw new Error('Anda tidak memiliki akses untuk menghapus KRS ini');
    }

    // 'approved' tetap boleh dihapus (drop mata kuliah).
    // Kuota (terisi) hanya berkurang jika yang dihapus adalah 'approved'
    // karena hanya status itu yang mengambil kursi nyata.
    const shouldDecrementTerisi = krs.status === 'approved';
    
    // Get jadwal
    const jadwalDoc = await this.jadwalCollection.doc(krs.jadwalId).get();
    
    // Delete KRS
    await krsDoc.ref.delete();
    
    // Update terisi
    if (shouldDecrementTerisi && jadwalDoc.exists) {
      const jadwal = jadwalDoc.data();
      await jadwalDoc.ref.update({
        terisi: Math.max(0, jadwal.terisi - 1),
        updatedAt: new Date(),
      });
    }
    
    return { message: 'KRS berhasil dihapus' };
  }
}

module.exports = new KRSService();
