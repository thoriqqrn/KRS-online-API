const express = require('express');
const authRoutes = require('./auth.routes');
const krsRoutes = require('./krs.routes');
const jadwalRoutes = require('./jadwal.routes');
const userRoutes = require('./user.routes');
const mataKuliahRoutes = require('./matakuliah.routes');

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/krs', krsRoutes);
router.use('/jadwal', jadwalRoutes);
router.use('/user', userRoutes);
router.use('/mata-kuliah', mataKuliahRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Documentation / Route List
router.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KRS Online API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      color: #fff;
      padding: 40px 20px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    h1 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 10px;
      background: linear-gradient(90deg, #00d4ff, #7b2cbf);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { text-align: center; color: #888; margin-bottom: 40px; }
    .status {
      background: rgba(0, 255, 136, 0.1);
      border: 1px solid #00ff88;
      border-radius: 10px;
      padding: 15px 20px;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .status-dot { width: 12px; height: 12px; background: #00ff88; border-radius: 50%; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .section { margin-bottom: 30px; }
    .section-title {
      font-size: 1.2rem;
      color: #00d4ff;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #333;
    }
    .route {
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 15px;
      transition: background 0.2s;
    }
    .route:hover { background: rgba(255,255,255,0.1); }
    .method {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: bold;
      min-width: 60px;
      text-align: center;
    }
    .get { background: #61affe; color: #fff; }
    .post { background: #49cc90; color: #fff; }
    .put { background: #fca130; color: #fff; }
    .delete { background: #f93e3e; color: #fff; }
    .patch { background: #9b59b6; color: #fff; }
    .path { font-family: 'Courier New', monospace; color: #fff; flex: 1; }
    .desc { color: #888; font-size: 0.85rem; }
    .footer { text-align: center; color: #555; margin-top: 40px; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎓 KRS Online API</h1>
    <p class="subtitle">Backend API untuk Sistem Pengisian Kartu Rencana Studi</p>
    
    <div class="status">
      <div class="status-dot"></div>
      <span>Server is running • ${new Date().toLocaleString('id-ID')}</span>
    </div>

    <div class="section">
      <h2 class="section-title">🔐 Authentication</h2>
      <div class="route"><span class="method post">POST</span><span class="path">/api/auth/register</span><span class="desc">Register new user</span></div>
      <div class="route"><span class="method post">POST</span><span class="path">/api/auth/login</span><span class="desc">Login user</span></div>
      <div class="route"><span class="method get">GET</span><span class="path">/api/auth/profile</span><span class="desc">Get user profile (protected)</span></div>
      <div class="route"><span class="method post">POST</span><span class="path">/api/auth/forgot-password</span><span class="desc">Request password reset</span></div>
      <div class="route"><span class="method post">POST</span><span class="path">/api/auth/verify-otp</span><span class="desc">Verify OTP code</span></div>
      <div class="route"><span class="method post">POST</span><span class="path">/api/auth/reset-password</span><span class="desc">Reset password</span></div>
    </div>

    <div class="section">
      <h2 class="section-title">📚 Mata Kuliah</h2>
      <div class="route"><span class="method get">GET</span><span class="path">/api/mata-kuliah</span><span class="desc">Get all mata kuliah</span></div>
      <div class="route"><span class="method get">GET</span><span class="path">/api/mata-kuliah/:id</span><span class="desc">Get mata kuliah by ID</span></div>
      <div class="route"><span class="method post">POST</span><span class="path">/api/mata-kuliah</span><span class="desc">Create mata kuliah</span></div>
      <div class="route"><span class="method put">PUT</span><span class="path">/api/mata-kuliah/:id</span><span class="desc">Update mata kuliah</span></div>
      <div class="route"><span class="method delete">DELETE</span><span class="path">/api/mata-kuliah/:id</span><span class="desc">Delete mata kuliah</span></div>
    </div>

    <div class="section">
      <h2 class="section-title">📅 Jadwal</h2>
      <div class="route"><span class="method get">GET</span><span class="path">/api/jadwal</span><span class="desc">Get all jadwal</span></div>
      <div class="route"><span class="method get">GET</span><span class="path">/api/jadwal?format=kelas</span><span class="desc">Get jadwal in kelas format</span></div>
      <div class="route"><span class="method get">GET</span><span class="path">/api/jadwal/:id</span><span class="desc">Get jadwal by ID</span></div>
    </div>

    <div class="section">
      <h2 class="section-title">📝 KRS</h2>
      <div class="route"><span class="method get">GET</span><span class="path">/api/krs</span><span class="desc">Get user's KRS</span></div>
      <div class="route"><span class="method post">POST</span><span class="path">/api/krs</span><span class="desc">Add KRS</span></div>
      <div class="route"><span class="method delete">DELETE</span><span class="path">/api/krs/:id</span><span class="desc">Delete KRS</span></div>
    </div>

    <div class="section">
      <h2 class="section-title">👤 User</h2>
      <div class="route"><span class="method put">PUT</span><span class="path">/api/user/profile</span><span class="desc">Update profile</span></div>
      <div class="route"><span class="method get">GET</span><span class="path">/api/user/saved-classes</span><span class="desc">Get saved classes</span></div>
      <div class="route"><span class="method post">POST</span><span class="path">/api/user/saved-classes</span><span class="desc">Save a class</span></div>
      <div class="route"><span class="method delete">DELETE</span><span class="path">/api/user/saved-classes/:jadwalId</span><span class="desc">Unsave a class</span></div>
      <div class="route"><span class="method get">GET</span><span class="path">/api/user/notifications</span><span class="desc">Get notifications</span></div>
      <div class="route"><span class="method patch">PATCH</span><span class="path">/api/user/notifications/:id/read</span><span class="desc">Mark notification as read</span></div>
    </div>

    <div class="section">
      <h2 class="section-title">🔧 System</h2>
      <div class="route"><span class="method get">GET</span><span class="path">/api/health</span><span class="desc">Health check</span></div>
    </div>

    <p class="footer">KRS Online API v1.0.0 • Deployed on Vercel</p>
  </div>
</body>
</html>
  `;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

module.exports = router;
