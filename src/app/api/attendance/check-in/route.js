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
    
    // Jika sudah check-in, kembalikan error
    if (attendance.checkInTime) {
      return NextResponse.json(
        { message: 'Anda sudah melakukan check-in hari ini' },
        { status: 400 }
      );
    }
    
    // Set waktu check-in
    const now = new Date();
    
    // Tentukan status (terlambat jika check-in setelah jam 9 pagi)
    const lateThreshold = new Date(today);
    lateThreshold.setHours(9, 0, 0, 0);
    
    const status = now > lateThreshold ? 'late' : 'present';
    
    // Update record presensi
    attendance.checkInTime = now;
    attendance.status = status;
    await attendance.save();
    
    return NextResponse.json({ 
      message: 'Check-in berhasil', 
      attendance 
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}