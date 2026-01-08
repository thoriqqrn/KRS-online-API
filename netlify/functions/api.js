const serverless = require('serverless-http');
const admin = require('firebase-admin');

// Initialize Firebase sebelum load app (untuk Netlify)
if (!admin.apps.length) {
  try {
    // Try environment variable first
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase initialized from FIREBASE_SERVICE_ACCOUNT');
    } else if (process.env.FIREBASE_CREDENTIALS_BASE64) {
      const decoded = Buffer.from(process.env.FIREBASE_CREDENTIALS_BASE64, 'base64').toString('utf8');
      const serviceAccount = JSON.parse(decoded);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase initialized from FIREBASE_CREDENTIALS_BASE64');
    } else {
      console.error('❌ No Firebase credentials found in environment variables');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
  }
}

const app = require('../../src/app');

// Wrap Express app dengan serverless-http
exports.handler = serverless(app);
