import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  try {
    // Dapatkan session untuk mengetahui user yang sedang login
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Ambil data wajah dari request
    const { faceData } = await request.json();
    
    if (!faceData || !Array.isArray(faceData)) {
      return NextResponse.json(
        { message: 'Data wajah tidak valid' },
        { status: 400 }
      );
    }
    
    // Connect ke database
    await connectToDatabase();
    
    // Update user dengan data wajah
    // Optimasi dengan operasi database yang lebih efisien
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { faceData: faceData } }, // Gunakan $set untuk update spesifik
      { new: true, lean: true } // Opsi lean untuk performa lebih baik
    );
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Data wajah berhasil disimpan',
      success: true
    });
    
  } catch (error) {
    console.error('Error saving face data:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}