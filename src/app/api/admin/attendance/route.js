import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const username = searchParams.get('username');
    
    // Build user query for search
    let userQuery = { role: 'user' };
    
    // Username/name/email search filter
    if (username && username.trim()) {
      userQuery.$or = [
        { username: { $regex: username.trim(), $options: 'i' } },
        { name: { $regex: username.trim(), $options: 'i' } },
        { email: { $regex: username.trim(), $options: 'i' } }
      ];
    }
    
    // Get total count of matching users
    const total = await User.countDocuments(userQuery);
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Get users with pagination
    const users = await User.find(userQuery)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get attendance statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // Get attendance counts for this user
        const totalAttendance = await Attendance.countDocuments({ userId: user._id });
        const presentCount = await Attendance.countDocuments({ userId: user._id, status: 'present' });
        const lateCount = await Attendance.countDocuments({ userId: user._id, status: 'late' });
        const absentCount = await Attendance.countDocuments({ userId: user._id, status: 'absent' });
        
        // Get latest attendance
        const latestAttendance = await Attendance.findOne({ userId: user._id })
          .sort({ date: -1 })
          .lean();
        
        return {
          _id: user._id,
          user: {
            _id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
            university: user.university,
            faculty: user.faculty,
            studyProgram: user.studyProgram,
            internshipStartDate: user.internshipStartDate,
            phoneNumber: user.phoneNumber,
            address: user.address,
            profileImage: user.profileImage
          },
          stats: {
            total: totalAttendance,
            present: presentCount,
            late: lateCount,
            absent: absentCount
          },
          latestAttendance: latestAttendance ? {
            date: latestAttendance.date,
            status: latestAttendance.status,
            checkInTime: latestAttendance.checkInTime,
            checkOutTime: latestAttendance.checkOutTime
          } : null
        };
      })
    );
    
    // Calculate overall stats
    const overallStats = await Promise.all([
      Attendance.countDocuments({ status: 'present' }),
      Attendance.countDocuments({ status: 'late' }),
      Attendance.countDocuments({ status: 'absent' }),
    ]);
    
    const stats = {
      onTime: overallStats[0],
      late: overallStats[1],
      absent: overallStats[2]
    };
    
    return NextResponse.json({
      attendances: usersWithStats, // Keep same property name for compatibility
      total,
      stats
    });
    
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
} 