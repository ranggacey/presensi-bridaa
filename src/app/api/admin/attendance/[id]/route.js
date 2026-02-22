import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { isValidObjectId } from 'mongoose';

export async function GET(request, { params }) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // Validate the ID format
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid attendance ID format' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Fetch the attendance record
    const attendance = await Attendance.findById(id).lean();
    
    if (!attendance) {
      return NextResponse.json(
        { message: 'Attendance record not found' },
        { status: 404 }
      );
    }
    
    // Get user information
    const user = await User.findById(attendance.userId).lean();
    
    // Map database status to frontend status
    const statusMap = {
      'present': 'on-time',
      'late': 'late',
      'absent': 'absent'
    };
    
    // Return attendance with user info
    return NextResponse.json({
      attendance: {
        ...attendance,
        status: statusMap[attendance.status] || attendance.status,
        user: user ? {
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
          profileImage: user.profileImage,
          birthPlace: user.birthPlace,
          birthDate: user.birthDate
        } : null
      }
    });
    
  } catch (error) {
    console.error('Error fetching attendance detail:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
} 