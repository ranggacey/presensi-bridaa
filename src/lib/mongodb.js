import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  // Check MONGODB_URI saat runtime, bukan saat build time
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI tidak ditemukan di environment variables');
    throw new Error('MONGODB_URI harus ditentukan di environment variables');
  }

  // Jika sudah ada koneksi yang aktif, gunakan itu
  if (cached.conn) {
    return cached.conn;
  }

  // Jika belum ada promise koneksi, buat baru
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log('🔄 Mencoba menghubungkan ke MongoDB...');
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ Berhasil terhubung ke MongoDB');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ Error koneksi MongoDB:', error.message);
        cached.promise = null; // Reset promise agar bisa dicoba lagi
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset promise jika error
    throw error;
  }
}

// Ubah dari export default menjadi named export
export { connectToDatabase };