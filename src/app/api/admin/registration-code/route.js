import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import RegistrationCode from '@/models/RegistrationCode';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET - Ambil kode registrasi aktif (hanya admin)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const activeCode = await RegistrationCode.getActiveCode();
    
    if (!activeCode) {
      return NextResponse.json({
        code: null,
        expiresAt: null,
        message: 'Tidak ada kode registrasi aktif. Silakan generate kode baru.'
      });
    }
    
    // Hitung waktu tersisa
    const now = new Date();
    const expiresAt = new Date(activeCode.expiresAt);
    const timeRemaining = expiresAt - now;
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return NextResponse.json({
      code: activeCode.code,
      expiresAt: activeCode.expiresAt,
      hoursRemaining,
      minutesRemaining,
      isExpired: timeRemaining <= 0,
    });
  } catch (error) {
    console.error('Error fetching registration code:', error);
    return NextResponse.json(
      { message: 'Error fetching registration code', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Generate kode registrasi baru (hanya admin)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Nonaktifkan semua kode lama yang masih aktif
    await RegistrationCode.updateMany(
      { isActive: true },
      { isActive: false }
    );
    
    // Generate kode baru (6 digit angka)
    let newCode;
    let codeExists = true;
    let attempts = 0;
    
    // Pastikan kode unik (retry maksimal 10 kali)
    while (codeExists && attempts < 10) {
      newCode = RegistrationCode.generateNewCode();
      const existingCode = await RegistrationCode.findOne({ code: newCode });
      if (!existingCode) {
        codeExists = false;
      }
      attempts++;
    }
    
    if (codeExists) {
      return NextResponse.json(
        { message: 'Gagal generate kode unik setelah beberapa percobaan' },
        { status: 500 }
      );
    }
    
    // Set expire 6 jam dari sekarang
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 6);
    
    // Buat kode baru
    const registrationCode = await RegistrationCode.create({
      code: newCode,
      expiresAt: expiresAt,
      isActive: true,
      generatedBy: session.user.id,
    });
    
    return NextResponse.json({
      message: 'Kode registrasi berhasil dibuat',
      code: registrationCode.code,
      expiresAt: registrationCode.expiresAt,
    });
  } catch (error) {
    console.error('Error generating registration code:', error);
    return NextResponse.json(
      { message: 'Error generating registration code', error: error.message },
      { status: 500 }
    );
  }
}

