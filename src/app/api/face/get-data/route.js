import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    // Dapatkan session untuk mengetahui user yang sedang login
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Connect ke database
    await connectToDatabase();
    
    // Cari user berdasarkan ID dari session
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Jika user tidak memiliki data wajah
    if (!user.faceData) {
      return NextResponse.json(
        { message: 'Data wajah tidak ditemukan' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Data wajah berhasil diambil',
      faceData: user.faceData
    });
    
  } catch (error) {
    console.error('Error getting face data:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}