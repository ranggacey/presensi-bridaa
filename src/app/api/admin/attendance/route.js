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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const username = searchParams.get('username');
    const status = searchParams.get('status');
    
    // Build query filter
    const query = {};
    
    // Date filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
    
    // Status filter
    if (status) {
      // Map frontend status to database status
      const statusMap = {
        'on-time': 'present',
        'late': 'late',
        'absent': 'absent'
      };
      query.status = statusMap[status] || status;
    }
    
    // Username filter requires looking up user IDs
    let userIds = [];
    if (username) {
      const users = await User.find({
        $or: [
          { username: { $regex: username, $options: 'i' } },
          { name: { $regex: username, $options: 'i' } },
          { email: { $regex: username, $options: 'i' } }
        ]
      }).select('_id');
      
      userIds = users.map(user => user._id);
      if (userIds.length === 0) {
        // No matching users, so no attendance records will match
        return NextResponse.json({
          attendances: [],
          total: 0,
          stats: { onTime: 0, late: 0, absent: 0 }
        });
      }
      
      query.userId = { $in: userIds };
    }
    
    // Get all existing user IDs
    const existingUserIds = await User.find().select('_id').lean();
    const existingUserIdMap = new Map(existingUserIds.map(user => [user._id.toString(), true]));
    
    // Add existing user filter
    if (!query.userId) {
      query.userId = { $in: existingUserIds.map(user => user._id) };
    } else {
      // If there's already a userId filter, make sure we're only including existing users
      const filteredUserIds = userIds.filter(id => existingUserIdMap.has(id.toString()));
      query.userId = { $in: filteredUserIds };
    }
    
    // Calculate total matching records and stats (before pagination)
    const total = await Attendance.countDocuments(query);
    
    // Get stats - convert database status to frontend status
    const stats = {
      onTime: await Attendance.countDocuments({ ...query, status: 'present' }),
      late: await Attendance.countDocuments({ ...query, status: 'late' }),
      absent: await Attendance.countDocuments({ ...query, status: 'absent' })
    };
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Fetch attendance records with user data
    const attendances = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get user information for each attendance record
    const attendancesWithUser = await Promise.all(
      attendances.map(async (attendance) => {
        const user = await User.findById(attendance.userId).lean();
        
        // Skip records where user doesn't exist (deleted users)
        if (!user) {
          return null;
        }
        
        // Map database status to frontend status
        const statusMap = {
          'present': 'on-time',
          'late': 'late',
          'absent': 'absent'
        };
        
        return {
          ...attendance,
          status: statusMap[attendance.status] || attendance.status,
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
          }
        };
      })
    );
    
    // Filter out null records (deleted users)
    const filteredAttendances = attendancesWithUser.filter(record => record !== null);
    
    return NextResponse.json({
      attendances: filteredAttendances,
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