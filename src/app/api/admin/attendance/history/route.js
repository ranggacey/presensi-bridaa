import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { isValidObjectId } from 'mongoose';

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
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 6;
    
    // Validate user ID
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Build query for attendance records
    const query = { userId: userId };
    
    // Count total records for pagination
    const total = await Attendance.countDocuments(query);
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch attendance records for this user with pagination
    const attendances = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Map database status to frontend status
    const attendancesWithStatus = attendances.map(attendance => {
      const statusMap = {
        'present': 'on-time',
        'late': 'late',
        'absent': 'absent'
      };
      
      return {
        ...attendance,
        status: statusMap[attendance.status] || attendance.status
      };
    });
    
    return NextResponse.json({
      attendances: attendancesWithStatus,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
    
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
} 