import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import RegistrationCode from '@/models/RegistrationCode';

export async function POST(request) {
  try {
    const { username, email, password, name, registrationCode } = await request.json();

    // Validasi input
    if (!username || !email || !password || !name || !registrationCode) {
      return NextResponse.json(
        { message: 'Semua field harus diisi termasuk kode registrasi' },
        { status: 400 }
      );
    }

    // Connect ke database dengan error handling yang lebih baik
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      
      // Berikan pesan error yang lebih spesifik untuk masalah database
      let errorMessage = 'Error detail: bad auth : authentication failed';
      
      if (dbError.message.includes('bad auth')) {
        errorMessage = 'Error detail: bad auth : authentication failed - Kredensial MongoDB tidak valid';
      } else if (dbError.message.includes('ENOTFOUND')) {
        errorMessage = 'Error detail: ENOTFOUND - Tidak dapat menemukan server database';
      } else if (dbError.message.includes('ETIMEDOUT')) {
        errorMessage = 'Error detail: ETIMEDOUT - Koneksi ke database timeout';
      }
      
      return NextResponse.json(
        { message: errorMessage },
        { status: 503 }
      );
    }

    // Validasi registration code
    const isValidCode = await RegistrationCode.validateCode(registrationCode);
    if (!isValidCode) {
      return NextResponse.json(
        { message: 'Kode registrasi tidak valid atau sudah kadaluarsa' },
        { status: 400 }
      );
    }

    // Cek apakah username sudah ada
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { message: 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah ada
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { message: 'Email sudah digunakan' },
        { status: 400 }
      );
    }

    // Buat user baru
    const user = await User.create({
      username,
      email,
      password, // Password akan di-hash oleh pre-save hook di model User
      name,
      role: 'user', // Default role adalah user
    });

    // Hapus password dari response
    const newUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return NextResponse.json(
      { message: 'User berhasil dibuat', user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    
    // Berikan error detail yang lebih informatif
    let errorMessage = `Error detail: ${error.message}`;
    
    if (error.code === 11000) {
      errorMessage = 'Error: Data duplikat terdeteksi (username atau email sudah terdaftar)';
    }
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}