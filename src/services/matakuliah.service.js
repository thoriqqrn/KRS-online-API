const { db } = require('../config/firebase');

class MataKuliahService {
  constructor() {
    this.mataKuliahCollection = db.collection('mata_kuliah');
  }

  async getMataKuliahDropdown(filters = {}) {
    const { prodi, semester, search } = filters;

    let query = this.mataKuliahCollection.select('kodeMk', 'namaMk');

    if (prodi) {
      query = query.where('prodi', '==', prodi);
    }

    if (semester) {
      query = query.where('semester', '==', parseInt(semester));
    }

    const snapshot = await query.get();

    let mataKuliahList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (search) {
      const searchLower = search.toLowerCase();
      mataKuliahList = mataKuliahList.filter(mk =>
        (mk.namaMk || '').toLowerCase().includes(searchLower) ||
        (mk.kodeMk || '').toLowerCase().includes(searchLower)
      );
    }

    mataKuliahList.sort((a, b) => (a.kodeMk || '').localeCompare(b.kodeMk || ''));

    return mataKuliahList.map(mk => ({
      id: mk.id,
      kodeMk: mk.kodeMk || '',
      namaMk: mk.namaMk || '',
    }));
  }

  async getAllMataKuliah(filters = {}) {
    const { prodi, semester, search } = filters;
    
    let query = this.mataKuliahCollection;
    
    if (prodi) {
      query = query.where('prodi', '==', prodi);
    }
    
    if (semester) {
      query = query.where('semester', '==', parseInt(semester));
    }
    
    const snapshot = await query.get();
    
    let mataKuliahList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      mataKuliahList = mataKuliahList.filter(mk => 
        mk.namaMk.toLowerCase().includes(searchLower) ||
        mk.kodeMk.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by kodeMk
    mataKuliahList.sort((a, b) => a.kodeMk.localeCompare(b.kodeMk));
    
    return mataKuliahList;
  }
  
  async getMataKuliahById(id) {
    const mkDoc = await this.mataKuliahCollection.doc(id).get();
    
    if (!mkDoc.exists) {
      throw new Error('Mata kuliah tidak ditemukan');
    }
    
    return { id: mkDoc.id, ...mkDoc.data() };
  }
  
  async createMataKuliah(data) {
    const { kodeMk, namaMk, sks, semester, prodi, description } = data;
    
    // Check if kodeMk already exists
    const existingSnapshot = await this.mataKuliahCollection
      .where('kodeMk', '==', kodeMk)
      .get();
    
    if (!existingSnapshot.empty) {
      throw new Error('Kode mata kuliah sudah ada');
    }
    
    const mkRef = this.mataKuliahCollection.doc();
    const mkData = {
      id: mkRef.id,
      kodeMk,
      namaMk,
      sks: parseInt(sks),
      semester: parseInt(semester),
      prodi,
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await mkRef.set(mkData);
    return mkData;
  }
  
  async updateMataKuliah(id, data) {
    const mkDoc = await this.mataKuliahCollection.doc(id).get();
    
    if (!mkDoc.exists) {
      throw new Error('Mata kuliah tidak ditemukan');
    }
    
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };
    
    if (data.sks) updateData.sks = parseInt(data.sks);
    if (data.semester) updateData.semester = parseInt(data.semester);
    
    await mkDoc.ref.update(updateData);
    
    return { id, ...mkDoc.data(), ...updateData };
  }
  
  async deleteMataKuliah(id) {
    const mkDoc = await this.mataKuliahCollection.doc(id).get();
    
    if (!mkDoc.exists) {
      throw new Error('Mata kuliah tidak ditemukan');
    }
    
    await mkDoc.ref.delete();
    return { message: 'Mata kuliah berhasil dihapus' };
  }
}

module.exports = new MataKuliahService();
