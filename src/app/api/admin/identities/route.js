import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET - Mendapatkan semua user identities dengan pagination dan filter
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
    
    // Parse URL parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const university = searchParams.get('university') || '';
    
    // Calculate pagination offsets
    const skip = (page - 1) * limit;
    
    // Build query object
    const query = {};
    
    // Add search criteria if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { university: { $regex: search, $options: 'i' } },
        { faculty: { $regex: search, $options: 'i' } },
        { studyProgram: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add university filter if provided
    if (university) {
      query.university = university;
    }
    
    // Count total documents for pagination
    const total = await User.countDocuments(query);
    
    // Fetch paginated users with identity fields
    const users = await User.find(query)
      .select('_id name profileImage university faculty studyProgram birthPlace birthDate address phoneNumber applicationLetter internshipStartDate')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });
    
    // Get all users (with minimal fields) for filtering options
    const allUsers = await User.find({})
      .select('university')
      .lean();
    
    return NextResponse.json({
      users,
      total,
      allUsers
    });
  } catch (error) {
    console.error('Error fetching user identities:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
} 