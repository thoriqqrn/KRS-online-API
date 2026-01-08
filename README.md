# KRS Online Backend

Backend API untuk aplikasi KRS Online menggunakan Node.js, Express, dan Firebase Firestore.

## 📋 Prerequisites

- Node.js (v14 atau lebih baru)
- npm atau yarn
- Firebase project dengan Firestore database
- Service Account Key dari Firebase

## 🚀 Installation

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup Firebase:**
   - Buka [Firebase Console](https://console.firebase.google.com/)
   - Buat project baru atau gunakan project yang sudah ada
   - Aktifkan Firestore Database
   - Download Service Account Key:
     - Project Settings → Service Accounts
     - Generate New Private Key
     - Save file sebagai `serviceAccountKey.json` di folder backend
   
   Lihat [FIREBASE_SETUP.md](FIREBASE_SETUP.md) untuk detail lengkap.

4. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` dan sesuaikan konfigurasi:
   ```env
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRES_IN=7d
   
   # Email config (optional, untuk forgot password)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

5. **Seed database dengan data sample:**
   ```bash
   npm run seed
   ```

## 🏃 Running the Server

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## 📚 API Documentation

Lihat [API_DOCUMENTATION.md](API_DOCUMENTATION.md) untuk dokumentasi lengkap semua endpoints.

### Quick Test:

1. **Health Check:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"nim":"202210370311","password":"password123"}'
   ```

## 🗄️ Database Collections

Backend menggunakan Firebase Firestore dengan collections:

1. **users** - Data mahasiswa
2. **mata_kuliah** - Data mata kuliah
3. **jadwal** - Jadwal kelas mata kuliah
4. **krs** - Kartu Rencana Studi mahasiswa
5. **saved_classes** - Kelas yang disimpan mahasiswa
6. **notifications** - Notifikasi untuk mahasiswa
7. **otp_codes** - Kode OTP untuk reset password

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── config.js           # Environment configuration
│   │   ├── database.js         # Database helper
│   │   └── firebase.js         # Firebase initialization
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── jadwal.controller.js
│   │   ├── krs.controller.js
│   │   ├── matakuliah.controller.js
│   │   └── user.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js  # JWT authentication
│   │   ├── error.middleware.js # Error handling
│   │   └── validator.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── jadwal.routes.js
│   │   ├── krs.routes.js
│   │   ├── matakuliah.routes.js
│   │   ├── user.routes.js
│   │   └── index.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── jadwal.service.js
│   │   ├── krs.service.js
│   │   ├── matakuliah.service.js
│   │   └── user.service.js
│   └── server.js               # Entry point
├── scripts/
│   └── seed.js                 # Database seeding script
├── .env.example                # Environment variables template
├── package.json
├── API_DOCUMENTATION.md        # API documentation
├── FIREBASE_SETUP.md          # Firebase setup guide
└── README.md                   # This file
```

## 🔐 Authentication

API menggunakan JWT (JSON Web Token) untuk autentikasi:

1. **Login** di `/api/auth/login` untuk mendapatkan token
2. **Include token** di header untuk request lainnya:
   ```
   Authorization: Bearer <your_token>
   ```

## 🧪 Test Data

Setelah running `npm run seed`, akan ada 3 user test:

| NIM | Password | Nama |
|-----|----------|------|
| 202210370311 | password123 | Budi Santoso |
| 202210370322 | password123 | Siti Rahmawati |
| 202210370345 | password123 | Ahmad Fauzi |

## 🛠️ Available Scripts

- `npm start` - Run production server
- `npm run dev` - Run development server with nodemon
- `npm run seed` - Seed database with test data

## 📝 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/reset-password` - Reset password

### Mata Kuliah
- `GET /api/mata-kuliah` - Get all mata kuliah (with filters)
- `GET /api/mata-kuliah/:id` - Get mata kuliah by ID
- `POST /api/mata-kuliah` - Create mata kuliah
- `PUT /api/mata-kuliah/:id` - Update mata kuliah
- `DELETE /api/mata-kuliah/:id` - Delete mata kuliah

### Jadwal
- `GET /api/jadwal` - Get all jadwal (with filters)
- `GET /api/jadwal?format=kelas` - Get jadwal in kelas format (frontend-friendly)
- `GET /api/jadwal/:id` - Get jadwal by ID

### KRS
- `GET /api/krs` - Get user's KRS
- `POST /api/krs` - Add KRS
- `DELETE /api/krs/:id` - Delete KRS

### User
- `PUT /api/user/profile` - Update profile
- `GET /api/user/saved-classes` - Get saved classes
- `POST /api/user/saved-classes` - Save a class
- `DELETE /api/user/saved-classes/:jadwalId` - Unsave a class
- `GET /api/user/notifications` - Get notifications
- `PATCH /api/user/notifications/:id/read` - Mark notification as read

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment (development/production) | development |
| JWT_SECRET | Secret key for JWT | (required) |
| JWT_EXPIRES_IN | JWT token expiration | 7d |
| EMAIL_HOST | SMTP host for email | smtp.gmail.com |
| EMAIL_PORT | SMTP port | 587 |
| EMAIL_USER | Email username | (required for forgot password) |
| EMAIL_PASSWORD | Email password/app password | (required for forgot password) |

## 🐛 Troubleshooting

### Cannot connect to Firebase
- Pastikan `serviceAccountKey.json` sudah ada di folder backend
- Check Firebase project settings
- Pastikan Firestore sudah aktif

### JWT errors
- Pastikan `JWT_SECRET` sudah di-set di `.env`
- Check format Authorization header: `Bearer <token>`

### Email not sending
- Pastikan EMAIL_* environment variables sudah di-set
- Untuk Gmail, gunakan App Password bukan password biasa
- Check SMTP settings

## 📞 Support

Jika ada masalah, check:
1. [API Documentation](API_DOCUMENTATION.md)
2. [Firebase Setup Guide](FIREBASE_SETUP.md)
3. Server logs di console

## 📄 License

ISC
