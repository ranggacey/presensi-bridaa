import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { startOfDay, endOfDay, subDays } from 'date-fns';

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
    
    // Get today's date boundaries
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    
    // Fetch total users count
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Fetch pending identities (e.g., users without complete profile)
    const pendingIdentities = await User.countDocuments({ 
      role: 'user',
      $or: [
        { birthPlace: { $exists: false } },
        { birthDate: { $exists: false } },
        { university: { $exists: false } },
        { faculty: { $exists: false } },
        { studyProgram: { $exists: false } }
      ]
    });
    
    // Fetch total internships
    const totalInternships = await User.countDocuments({ 
      role: 'user',
      internshipStartDate: { $exists: true, $ne: null }
    });
    
    // Fetch today's attendance stats
    const todayAttendance = await Attendance.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });
    
    const presentToday = await Attendance.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      status: 'present'
    });
    
    const lateToday = await Attendance.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      status: 'late'
    });
    
    const absentToday = totalUsers - (presentToday + lateToday);
    
    // Fetch university distribution
    const universities = await User.aggregate([
      { $match: { role: 'user', university: { $exists: true, $ne: '' } } },
      { $group: { _id: '$university', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: '$_id', count: 1 } }
    ]);
    
    // Fetch attendance trends for the last 7 days
    const attendanceTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const present = await Attendance.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
        status: 'present'
      });
      
      const late = await Attendance.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
        status: 'late'
      });
      
      const absent = totalUsers - (present + late);
      
      attendanceTrend.push({
        date,
        present,
        late,
        absent
      });
    }
    
    // Fetch recent activities - only show actual attendance (with checkInTime)
    const recentAttendance = await Attendance.find({
      checkInTime: { $exists: true, $ne: null }, // Only records with actual check-in
      $or: [
        { status: 'present' },
        { status: 'late' }
      ]
    })
      .sort({ checkInTime: -1 }) // Sort by actual check-in time, not creation time
      .limit(5)
      .populate('userId', 'name')
      .lean();
      
    const recentActivities = recentAttendance
      .filter(attendance => attendance.userId && attendance.checkInTime)
      .map(attendance => {
        const statusText = attendance.status === 'present' ? 'Tepat Waktu' : 'Terlambat';
        
        return {
          id: attendance._id.toString(),
          type: 'attendance',
          user: attendance.userId.name,
          action: `melakukan presensi - ${statusText}`,
          time: attendance.checkInTime, // Use checkInTime instead of createdAt
          status: attendance.status === 'present' ? 'on-time' : 'late'
        };
      });
    
    return NextResponse.json({
      totalUsers,
      todayAttendance,
      presentToday,
      lateToday,
      absentToday,
      pendingIdentities,
      totalInternships,
      universities,
      attendanceTrend,
      recentActivities
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
} 