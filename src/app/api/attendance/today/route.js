import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Dapatkan tanggal hari ini (reset jam ke 00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Cari presensi hari ini untuk user yang login
    let attendance = await Attendance.findOne({
      userId: session.user.id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Jika belum ada presensi hari ini, buat record baru
    if (!attendance) {
      attendance = await Attendance.create({
        userId: session.user.id,
        date: today,
        status: 'absent'
      });
    }
    
    return NextResponse.json({ attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}