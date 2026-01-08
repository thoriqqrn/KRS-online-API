const bcrypt = require('bcryptjs');
const { db } = require('../src/config/firebase');

async function seedData() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Seed Users
    console.log('👤 Creating sample users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        id: 'admin1',
        nim: 'ADMIN001',
        email: 'admin@krs.ac.id',
        password: hashedPassword,
        name: 'Admin Sistem',
        phoneNumber: '08111111111',
        prodi: 'Administrator',
        semester: null,
        ipk: null,
        maxSks: null,
        photoUrl: null,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user1',
        nim: '202210370311191',
        email: 'mahasiswa1@university.ac.id',
        password: hashedPassword,
        name: 'Budi Santoso',
        phoneNumber: '08123456789',
        prodi: 'Teknik Informatika',
        semester: 7,
        ipk: 3.5,
        maxSks: 24,
        photoUrl: null,
        role: 'mahasiswa',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user2',
        nim: '202210370322192',
        email: 'mahasiswa2@university.ac.id',
        password: hashedPassword,
        name: 'Siti Rahmawati',
        phoneNumber: '08198765432',
        prodi: 'Teknik Informatika',
        semester: 7,
        ipk: 3.8,
        maxSks: 24,
        photoUrl: null,
        role: 'mahasiswa',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user3',
        nim: '202210370345193',
        email: 'mahasiswa3@university.ac.id',
        password: hashedPassword,
        name: 'Ahmad Fauzi',
        phoneNumber: '08567891234',
        prodi: 'Teknik Informatika',
        semester: 7,
        ipk: 3.2,
        maxSks: 24,
        photoUrl: null,
        role: 'mahasiswa',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const batch1 = db.batch();
    users.forEach(user => {
      const userRef = db.collection('users').doc(user.id);
      batch1.set(userRef, user);
    });
    await batch1.commit();
    console.log(`✅ Created ${users.length} users`);

    // 2. Seed Mata Kuliah
    console.log('\n📚 Creating mata kuliah...');
    const mataKuliah = [
      {
        id: 'mk1',
        kodeMk: 'TIF701',
        namaMk: 'Kecerdasan Buatan',
        sks: 3,
        semester: 7,
        prodi: 'Teknik Informatika',
        description: 'Konsep AI, machine learning, dan implementasi algoritma AI',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mk2',
        kodeMk: 'TIF702',
        namaMk: 'Data Mining',
        sks: 3,
        semester: 7,
        prodi: 'Teknik Informatika',
        description: 'Teknik penggalian data dan analisis pola dari big data',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mk3',
        kodeMk: 'TIF703',
        namaMk: 'Keamanan Sistem Informasi',
        sks: 3,
        semester: 7,
        prodi: 'Teknik Informatika',
        description: 'Konsep keamanan, kriptografi, dan cyber security',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mk4',
        kodeMk: 'TIF704',
        namaMk: 'Manajemen Proyek Perangkat Lunak',
        sks: 3,
        semester: 7,
        prodi: 'Teknik Informatika',
        description: 'Metodologi manajemen proyek IT dan Agile development',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mk5',
        kodeMk: 'TIF705',
        namaMk: 'Cloud Computing',
        sks: 3,
        semester: 7,
        prodi: 'Teknik Informatika',
        description: 'Konsep cloud computing, AWS, Azure, dan Google Cloud',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'mk6',
        kodeMk: 'TIF706',
        namaMk: 'Internet of Things',
        sks: 3,
        semester: 7,
        prodi: 'Teknik Informatika',
        description: 'Pengembangan aplikasi IoT dan integrasi sensor',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const batch2 = db.batch();
    mataKuliah.forEach(mk => {
      const mkRef = db.collection('mata_kuliah').doc(mk.id);
      batch2.set(mkRef, mk);
    });
    await batch2.commit();
    console.log(`✅ Created ${mataKuliah.length} mata kuliah`);

    // 3. Seed Jadwal
    console.log('\n📅 Creating jadwal...');
    const jadwal = [
      // Kecerdasan Buatan
      {
        id: 'jadwal1',
        mataKuliahId: 'mk1',
        kodeKelas: 'A',
        hari: 'Senin',
        jamMulai: '08:00',
        jamSelesai: '10:30',
        ruangan: 'Lab AI',
        dosen: 'Prof. Dr. Ahmad Fauzi, M.Kom',
        kuota: 35,
        terisi: 20,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'jadwal2',
        mataKuliahId: 'mk1',
        kodeKelas: 'B',
        hari: 'Rabu',
        jamMulai: '13:00',
        jamSelesai: '15:30',
        ruangan: 'Lab AI',
        dosen: 'Prof. Dr. Ahmad Fauzi, M.Kom',
        kuota: 35,
        terisi: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Data Mining
      {
        id: 'jadwal3',
        mataKuliahId: 'mk2',
        kodeKelas: 'A',
        hari: 'Selasa',
        jamMulai: '10:00',
        jamSelesai: '12:30',
        ruangan: 'Lab Data Science',
        dosen: 'Dr. Siti Nurhaliza, M.Sc',
        kuota: 30,
        terisi: 18,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'jadwal4',
        mataKuliahId: 'mk2',
        kodeKelas: 'B',
        hari: 'Kamis',
        jamMulai: '08:00',
        jamSelesai: '10:30',
        ruangan: 'Lab Data Science',
        dosen: 'Dr. Siti Nurhaliza, M.Sc',
        kuota: 30,
        terisi: 22,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Keamanan Sistem
      {
        id: 'jadwal5',
        mataKuliahId: 'mk3',
        kodeKelas: 'A',
        hari: 'Senin',
        jamMulai: '13:00',
        jamSelesai: '15:30',
        ruangan: 'Lab Security',
        dosen: 'Dr. Budi Hartono, M.T',
        kuota: 30,
        terisi: 25,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Manajemen Proyek
      {
        id: 'jadwal6',
        mataKuliahId: 'mk4',
        kodeKelas: 'A',
        hari: 'Rabu',
        jamMulai: '08:00',
        jamSelesai: '10:30',
        ruangan: 'Ruang 501',
        dosen: 'Dr. Ir. Hendra Wijaya, M.M',
        kuota: 40,
        terisi: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Cloud Computing
      {
        id: 'jadwal7',
        mataKuliahId: 'mk5',
        kodeKelas: 'A',
        hari: 'Selasa',
        jamMulai: '13:00',
        jamSelesai: '15:30',
        ruangan: 'Lab Cloud',
        dosen: 'Dr. Rina Kusuma, M.Kom',
        kuota: 30,
        terisi: 20,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Internet of Things
      {
        id: 'jadwal8',
        mataKuliahId: 'mk6',
        kodeKelas: 'A',
        hari: 'Jumat',
        jamMulai: '08:00',
        jamSelesai: '10:30',
        ruangan: 'Lab IoT',
        dosen: 'Dr. Dian Pratiwi, M.T',
        kuota: 25,
        terisi: 18,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // === CONTOH KELAS PENUH (untuk test tombol "Daftar Antrean") ===
      // kuota == terisi -> dianggap penuh
      {
        id: 'jadwal_full1',
        mataKuliahId: 'mk5', // Cloud Computing
        kodeKelas: 'FULL',
        hari: 'Kamis',
        jamMulai: '10:00',
        jamSelesai: '12:30',
        ruangan: 'Lab Cloud',
        dosen: 'Dr. Rina Kusuma, M.Kom',
        kuota: 25,
        terisi: 25,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const batch3 = db.batch();
    jadwal.forEach(j => {
      const jadwalRef = db.collection('jadwal').doc(j.id);
      batch3.set(jadwalRef, j);
    });
    await batch3.commit();
    console.log(`✅ Created ${jadwal.length} jadwal`);

    // 4. Seed Sample KRS for user1
    console.log('\n📝 Creating sample KRS...');
    const krsData = [
      {
        id: 'krs1',
        userId: 'user1',
        jadwalId: 'jadwal1', // Kecerdasan Buatan
        semester: 'Ganjil',
        tahunAjaran: '2024/2025',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'krs2',
        userId: 'user1',
        jadwalId: 'jadwal3', // Data Mining
        semester: 'Ganjil',
        tahunAjaran: '2024/2025',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'krs3',
        userId: 'user1',
        jadwalId: 'jadwal5', // Keamanan Sistem
        semester: 'Ganjil',
        tahunAjaran: '2024/2025',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const batch4 = db.batch();
    krsData.forEach(krs => {
      const krsRef = db.collection('krs').doc(krs.id);
      batch4.set(krsRef, krs);
    });
    await batch4.commit();
    console.log(`✅ Created ${krsData.length} KRS records`);

    // 5. Seed Sample Notifications
    console.log('\n🔔 Creating sample notifications...');
    const notifications = [
      {
        id: 'notif1',
        userId: 'user1',
        title: 'KRS Disetujui',
        message: 'KRS Anda untuk semester Ganjil 2024/2025 telah disetujui',
        type: 'success',
        isRead: false,
        createdAt: new Date(),
      },
      {
        id: 'notif2',
        userId: 'user1',
        title: 'Periode KRS Dibuka',
        message: 'Periode pengisian KRS semester Genap 2024/2025 telah dibuka',
        type: 'info',
        isRead: false,
        createdAt: new Date(),
      },
    ];

    const batch5 = db.batch();
    notifications.forEach(notif => {
      const notifRef = db.collection('notifications').doc(notif.id);
      batch5.set(notifRef, notif);
    });
    await batch5.commit();
    
    console.log('\n✅ Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Mata Kuliah: ${mataKuliah.length}`);
    console.log(`   - Jadwal: ${jadwal.length}`);
    console.log(`   - KRS: ${krsData.length}`);
    console.log(`   - Notifications: ${notifications.length}`);
    console.log('\n🔐 Admin Login:');
    console.log('   NIM: ADMIN001');
    console.log('   Password: password123');
    console.log('\n👥 Mahasiswa Login:');
    console.log('   NIM: 202210370311191 (Budi Santoso)');
    console.log('   NIM: 202210370322192 (Siti Rahmawati)');
    console.log('   NIM: 202210370345193 (Ahmad Fauzi)');
    console.log('   Password: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
