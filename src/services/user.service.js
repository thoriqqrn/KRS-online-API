const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

class UserService {
  constructor() {
    this.usersCollection = db.collection('users');
    this.savedClassesCollection = db.collection('saved_classes');
    this.notificationsCollection = db.collection('notifications');
    this.jadwalCollection = db.collection('jadwal');
    this.mataKuliahCollection = db.collection('mata_kuliah');
  }

  // Admin: Get all users
  async getAllUsers() {
    const snapshot = await this.usersCollection.orderBy('createdAt', 'desc').get();
    const users = [];
    
    snapshot.forEach(doc => {
      const user = { id: doc.id, ...doc.data() };
      delete user.password; // Don't send passwords
      users.push(user);
    });
    
    return users;
  }

  // Admin: Get user by ID
  async getUserById(userId) {
    const userDoc = await this.usersCollection.doc(userId).get();
    
    if (!userDoc.exists) {
      throw new Error('User tidak ditemukan');
    }
    
    const user = { id: userDoc.id, ...userDoc.data() };
    delete user.password; // Don't send password
    
    return user;
  }

  // Admin: Create new user
  async createUser(userData) {
    const { nim, email, password, name, phoneNumber, prodi, semester, ipk, maxSks, role, isActive } = userData;
    
    // Check if NIM already exists
    const existingUser = await this.usersCollection.where('nim', '==', nim).get();
    if (!existingUser.empty) {
      throw new Error('NIM sudah terdaftar');
    }
    
    // Check if email already exists
    const existingEmail = await this.usersCollection.where('email', '==', email).get();
    if (!existingEmail.empty) {
      throw new Error('Email sudah terdaftar');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const parsedMaxSks = Number(maxSks);
    const normalizedMaxSks = Number.isFinite(parsedMaxSks) && parsedMaxSks > 0
      ? parsedMaxSks
      : 24;

    const newUser = {
      nim,
      email,
      password: hashedPassword,
      name,
      phoneNumber: phoneNumber || null,
      prodi: prodi || null,
      semester: semester || null,
      ipk: ipk || null,
      maxSks: normalizedMaxSks,
      photoUrl: null,
      role: role || 'mahasiswa',
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = await this.usersCollection.add(newUser);
    const user = { id: docRef.id, ...newUser };
    delete user.password;
    
    return user;
  }

  // Admin: Update user
  async updateUser(userId, updates) {
    const userDoc = await this.usersCollection.doc(userId).get();
    
    if (!userDoc.exists) {
      throw new Error('User tidak ditemukan');
    }
    
    const updateData = {
      updatedAt: new Date(),
    };
    
    // Only update provided fields
    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.phoneNumber !== undefined) updateData.phoneNumber = updates.phoneNumber;
    if (updates.prodi) updateData.prodi = updates.prodi;
    if (updates.semester !== undefined) updateData.semester = updates.semester;
    if (updates.ipk !== undefined) updateData.ipk = updates.ipk;
    if (updates.maxSks !== undefined) updateData.maxSks = updates.maxSks;
    if (updates.photoUrl !== undefined) updateData.photoUrl = updates.photoUrl;
    if (updates.role) updateData.role = updates.role;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    
    // If password is being updated, hash it
    if (updates.password) {
      updateData.password = await bcrypt.hash(updates.password, 10);
    }
    
    await this.usersCollection.doc(userId).update(updateData);
    
    const updatedDoc = await this.usersCollection.doc(userId).get();
    const user = { id: updatedDoc.id, ...updatedDoc.data() };
    delete user.password;
    
    return user;
  }

  // Admin: Delete user
  async deleteUser(userId) {
    const userDoc = await this.usersCollection.doc(userId).get();
    
    if (!userDoc.exists) {
      throw new Error('User tidak ditemukan');
    }
    
    await this.usersCollection.doc(userId).delete();
    
    return { message: 'User berhasil dihapus' };
  }

  async updateProfile(userId, updates) {
    const { name, phoneNumber, photoUrl } = updates;
    
    const updateData = {
      updatedAt: new Date(),
    };
    
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (photoUrl) updateData.photoUrl = photoUrl;
    
    await this.usersCollection.doc(userId).update(updateData);
    
    const userDoc = await this.usersCollection.doc(userId).get();
    const user = { id: userDoc.id, ...userDoc.data() };
    
    // Remove password from response
    delete user.password;
    
    return user;
  }
  
  async getSavedClasses(userId) {
    // Removed orderBy to avoid needing a composite index
    const snapshot = await this.savedClassesCollection
      .where('userId', '==', userId)
      .get();
    
    const savedClasses = [];
    for (const doc of snapshot.docs) {
      const savedData = { id: doc.id, ...doc.data() };
      
      // Get jadwal details
      const jadwalDoc = await this.jadwalCollection.doc(savedData.jadwalId).get();
      if (jadwalDoc.exists) {
        const jadwalData = { id: jadwalDoc.id, ...jadwalDoc.data() };
        
        console.log('DEBUG: jadwalData before MK fetch:', JSON.stringify(jadwalData));
        
        // Get mata kuliah details and flatten into jadwal
        if (jadwalData.mataKuliahId) {
          try {
            const mkDoc = await this.mataKuliahCollection.doc(jadwalData.mataKuliahId).get();
            console.log('DEBUG: mkDoc exists?', mkDoc.exists);
            
            if (mkDoc.exists) {
              const mkData = mkDoc.data();
              console.log('DEBUG: mkData:', JSON.stringify(mkData));
              
              // Flatten mata kuliah fields into jadwal object
              // Note: Firestore uses kodeMk/namaMk not kode/nama
              jadwalData.kodeMataKuliah = mkData.kodeMk || '';
              jadwalData.namaMataKuliah = mkData.namaMk || '';
              jadwalData.sks = mkData.sks || jadwalData.sks || 0;
            }
          } catch (mkError) {
            console.error('ERROR fetching mata kuliah:', mkError);
          }
        }
        
        // Rename fields to match KelasMataKuliah model
        jadwalData.kapasitas = jadwalData.kuota || 0;
        jadwalData.pendaftarSaat = jadwalData.terisi || 0;
        jadwalData.jadwal = `${jadwalData.hari}, ${jadwalData.jamMulai}-${jadwalData.jamSelesai}`;
        
        console.log('DEBUG: jadwalData after processing:', JSON.stringify(jadwalData));
        
        savedData.jadwal = jadwalData;
      }
      
      savedClasses.push(savedData);
    }
    
    return savedClasses;
  }
  
  async saveClass(userId, jadwalId) {
    // Check if already saved
    const existingSnapshot = await this.savedClassesCollection
      .where('userId', '==', userId)
      .where('jadwalId', '==', jadwalId)
      .get();
    
    if (!existingSnapshot.empty) {
      throw new Error('Kelas sudah disimpan sebelumnya');
    }
    
    // Create saved class
    const savedRef = this.savedClassesCollection.doc();
    const savedData = {
      id: savedRef.id,
      userId,
      jadwalId,
      createdAt: new Date(),
    };
    
    await savedRef.set(savedData);
    
    // Get jadwal details
    const jadwalDoc = await this.jadwalCollection.doc(jadwalId).get();
    if (jadwalDoc.exists) {
      const jadwalData = { id: jadwalDoc.id, ...jadwalDoc.data() };
      
      // Get mata kuliah details
      const mkDoc = await this.mataKuliahCollection.doc(jadwalData.mataKuliahId).get();
      if (mkDoc.exists) {
        jadwalData.mataKuliah = { id: mkDoc.id, ...mkDoc.data() };
      }
      
      savedData.jadwal = jadwalData;
    }
    
    return savedData;
  }
  
  async unsaveClass(userId, jadwalId) {
    const snapshot = await this.savedClassesCollection
      .where('userId', '==', userId)
      .where('jadwalId', '==', jadwalId)
      .get();
    
    if (snapshot.empty) {
      throw new Error('Kelas tidak ditemukan di daftar simpanan');
    }
    
    // Delete all matches (should be only one)
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    return { message: 'Kelas berhasil dihapus dari simpanan' };
  }
  
  async getNotifications(userId) {
    const snapshot = await this.notificationsCollection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  async markNotificationAsRead(userId, notificationId) {
    const notifDoc = await this.notificationsCollection.doc(notificationId).get();
    
    if (!notifDoc.exists) {
      throw new Error('Notifikasi tidak ditemukan');
    }
    
    const notif = notifDoc.data();
    
    if (notif.userId !== userId) {
      throw new Error('Notifikasi tidak ditemukan');
    }
    
    await notifDoc.ref.update({
      isRead: true,
    });
    
    return { id: notifDoc.id, ...notifDoc.data(), isRead: true };
  }
}

module.exports = new UserService();
