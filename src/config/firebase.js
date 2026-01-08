const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      return admin.app();
    }

    // Priority 1: Check for FIREBASE_SERVICE_ACCOUNT environment variable (Vercel/Netlify)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT env variable');
        return admin.app();
      } catch (parseError) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', parseError.message);
        throw parseError;
      }
    }

    // Priority 2: Check for Base64 encoded credentials
    if (process.env.FIREBASE_CREDENTIALS_BASE64) {
      try {
        const decoded = Buffer.from(process.env.FIREBASE_CREDENTIALS_BASE64, 'base64').toString('utf8');
        const serviceAccount = JSON.parse(decoded);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin initialized from FIREBASE_CREDENTIALS_BASE64 env variable');
        return admin.app();
      } catch (decodeError) {
        console.error('❌ Failed to decode FIREBASE_CREDENTIALS_BASE64:', decodeError.message);
        throw decodeError;
      }
    }

    // Priority 3: Try to use service account file (local development)
    const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized with serviceAccountKey.json');
      return admin.app();
    }

    // Priority 4: Fallback to environment variables
    const config = require('./config');
    
    if (!config.firebase.projectId || !config.firebase.clientEmail || !config.firebase.privateKey) {
      throw new Error('Firebase credentials not found. Please set FIREBASE_SERVICE_ACCOUNT env variable.');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin initialized with environment variables');

    return admin.app();
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    throw error;
  }
};

// Lazy initialization for serverless
let _db = null;
let _auth = null;

const getDb = () => {
  if (!_db) {
    initializeFirebase();
    _db = admin.firestore();
    _db.settings({ ignoreUndefinedProperties: true });
  }
  return _db;
};

const getAuth = () => {
  if (!_auth) {
    initializeFirebase();
    _auth = admin.auth();
  }
  return _auth;
};

module.exports = {
  admin,
  get db() { return getDb(); },
  get auth() { return getAuth(); },
  initializeFirebase,
};

