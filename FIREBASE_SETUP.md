# SETUP FIREBASE - IKUTI LANGKAH INI

## Cara Termudah: Pakai File JSON

1. **Download Service Account Key dari Firebase:**
   - Buka https://console.firebase.google.com/
   - Pilih project Anda
   - Klik ⚙️ Settings → Project settings
   - Tab "Service accounts"
   - Klik "Generate new private key"
   - Download file JSON

2. **Rename & Copy File:**
   - Rename file yang didownload menjadi: `serviceAccountKey.json`
   - Copy file ke folder `backend/` (sejajar dengan package.json)

3. **Start Server:**
   ```bash
   npm run dev
   ```

## Struktur Folder:
```
backend/
├── serviceAccountKey.json  ← Taruh file di sini
├── package.json
├── .env
└── src/
```

⚠️ **PENTING:** 
- File `serviceAccountKey.json` sudah di-gitignore (tidak akan ter-commit ke git)
- JANGAN share file ini ke siapapun!
- Isi file ini adalah credentials untuk akses Firebase

## Jika Belum Punya Firebase Project:

1. Buka https://console.firebase.google.com/
2. Klik "Add project" → nama: `krs-online`
3. Disable Google Analytics → Create project
4. Setelah selesai, pilih "Firestore Database"
5. Klik "Create database" → Start in test mode → Location: asia-southeast1
6. Lalu ikuti langkah download service account di atas

## Troubleshooting:

**Error: Firebase initialization error**
→ Pastikan file `serviceAccountKey.json` ada di folder `backend/`

**Error: Permission denied**
→ Pastikan Firestore Database sudah dibuat di Firebase Console
