const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');
const config = require('../config/config');

class AuthService {
  constructor() {
    this.usersCollection = db.collection('users');
    this.otpCollection = db.collection('otp_codes');
  }

  async register(userData) {
    const { nim, email, password, name, phoneNumber, prodi, semester } = userData;
    
    // Check if user already exists
    const nimSnapshot = await this.usersCollection.where('nim', '==', nim).get();
    const emailSnapshot = await this.usersCollection.where('email', '==', email).get();
    
    if (!nimSnapshot.empty || !emailSnapshot.empty) {
      throw new Error('NIM atau email sudah terdaftar');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user document
    const userRef = this.usersCollection.doc();
    const userDoc = {
      id: userRef.id,
      nim,
      email,
      password: hashedPassword,
      name,
      phoneNumber: phoneNumber || null,
      prodi,
      semester: parseInt(semester),
      ipk: 0.0,
      maxSks: 24,
      photoUrl: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await userRef.set(userDoc);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = userDoc;
    return userWithoutPassword;
  }
  
  async login(nim, password) {
    const snapshot = await this.usersCollection.where('nim', '==', nim).limit(1).get();
    
    if (snapshot.empty) {
      throw new Error('NIM atau password salah');
    }
    
    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };
    
    if (!user.isActive) {
      throw new Error('Akun Anda tidak aktif');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('NIM atau password salah');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        nim: user.nim,
        email: user.email,
        role: user.role || 'mahasiswa',
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    return {
      user: {
        id: user.id,
        nim: user.nim,
        email: user.email,
        name: user.name,
        prodi: user.prodi,
        semester: user.semester,
        ipk: user.ipk,
        maxSks: user.maxSks ?? 24,
        photoUrl: user.photoUrl,
        role: user.role || 'mahasiswa',
      },
      token,
    };
  }
  
  async generateOTP(email, purpose = 'password_reset') {
    const snapshot = await this.usersCollection.where('email', '==', email).limit(1).get();
    
    if (snapshot.empty) {
      throw new Error('Email tidak ditemukan');
    }
    
    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };
    
    // Generate 6 digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + config.otp.expiryMinutes);
    
    // Save OTP to Firestore
    const otpRef = this.otpCollection.doc();
    await otpRef.set({
      id: otpRef.id,
      userId: user.id,
      code,
      purpose,
      expiresAt,
      isUsed: false,
      createdAt: new Date(),
    });
    
    // TODO: Send email with OTP code
    
    return {
      message: 'Kode OTP telah dikirim ke email Anda',
      code: process.env.NODE_ENV === 'development' ? code : undefined,
    };
  }
  
  async verifyOTP(email, code, purpose = 'password_reset') {
    const userSnapshot = await this.usersCollection.where('email', '==', email).limit(1).get();
    
    if (userSnapshot.empty) {
      throw new Error('Email tidak ditemukan');
    }
    
    const userDoc = userSnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };
    
    // Find valid OTP
    const otpSnapshot = await this.otpCollection
      .where('userId', '==', user.id)
      .where('code', '==', code)
      .where('purpose', '==', purpose)
      .where('isUsed', '==', false)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (otpSnapshot.empty) {
      throw new Error('Kode OTP tidak valid atau sudah expired');
    }
    
    const otpDoc = otpSnapshot.docs[0];
    const otpData = otpDoc.data();
    
    // Check if expired
    if (otpData.expiresAt.toDate() < new Date()) {
      throw new Error('Kode OTP sudah expired');
    }
    
    // Mark OTP as used
    await otpDoc.ref.update({ isUsed: true });
    
    return {
      message: 'Kode OTP berhasil diverifikasi',
      userId: user.id,
    };
  }
  
  async resetPassword(email, newPassword) {
    const snapshot = await this.usersCollection.where('email', '==', email).limit(1).get();
    
    if (snapshot.empty) {
      throw new Error('Email tidak ditemukan');
    }
    
    const userDoc = snapshot.docs[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await userDoc.ref.update({
      password: hashedPassword,
      updatedAt: new Date(),
    });
    
    return {
      message: 'Password berhasil direset',
    };
  }
}

module.exports = new AuthService();
