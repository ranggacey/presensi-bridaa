import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST() {
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
    const attendance = await Attendance.findOne({
      userId: session.user.id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Jika tidak ada presensi atau belum check-in
    if (!attendance || !attendance.checkInTime) {
      return NextResponse.json(
        { message: 'Anda belum melakukan check-in hari ini' },
        { status: 400 }
      );
    }
    
    // Jika sudah check-out
    if (attendance.checkOutTime) {
      return NextResponse.json(
        { message: 'Anda sudah melakukan check-out hari ini' },
        { status: 400 }
      );
    }
    
    // Set waktu check-out
    attendance.checkOutTime = new Date();
    await attendance.save();
    
    return NextResponse.json({ 
      message: 'Check-out berhasil', 
      attendance 
    });
  } catch (error) {
    console.error('Error during check-out:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}