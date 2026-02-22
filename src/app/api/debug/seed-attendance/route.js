import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    // In production, you would want to secure this endpoint
    // or completely remove it after seeding data
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Get all users
    const users = await User.find().select('_id').lean();
    
    if (users.length === 0) {
      return NextResponse.json(
        { message: 'No users found to seed attendance records' },
        { status: 400 }
      );
    }
    
    // Delete existing attendance records
    await Attendance.deleteMany({});
    
    // Generate random attendance records for the past 30 days
    const now = new Date();
    const attendances = [];
    
    for (const user of users) {
      // Create between 10 and 30 attendance records for each user
      const numRecords = Math.floor(Math.random() * 20) + 10;
      
      for (let i = 0; i < numRecords; i++) {
        // Random date in the past 30 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        date.setHours(0, 0, 0, 0);
        
        // Random check-in time between 7:00 AM and 9:30 AM
        const checkInTime = new Date(date);
        checkInTime.setHours(7 + Math.floor(Math.random() * 3));
        checkInTime.setMinutes(Math.floor(Math.random() * 60));
        
        // Status based on check-in time
        let status;
        if (checkInTime.getHours() < 8 || (checkInTime.getHours() === 8 && checkInTime.getMinutes() <= 30)) {
          status = 'present'; // On time (before 8:30 AM)
        } else {
          status = 'late'; // Late (after 8:30 AM)
        }
        
        // Randomly mark some as absent (10% chance)
        if (Math.random() < 0.1) {
          status = 'absent';
        }
        
        attendances.push({
          userId: user._id,
          date,
          checkInTime: status === 'absent' ? null : checkInTime,
          status,
          notes: status === 'late' ? 'Keterlambatan karena macet' : (status === 'absent' ? 'Sakit/Izin' : '')
        });
      }
    }
    
    // Insert attendance records
    await Attendance.insertMany(attendances);
    
    return NextResponse.json({
      message: `Successfully seeded ${attendances.length} attendance records for ${users.length} users`,
      count: attendances.length
    });
    
  } catch (error) {
    console.error('Error seeding attendance data:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
} 