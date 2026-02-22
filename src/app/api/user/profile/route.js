// src/app/api/user/profile/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import { format } from 'date-fns';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await connectToDatabase();
    
    const user = await User.findById(session.user.id).select('-password');
    
    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }
    
    // Format dates to dd-MM-yyyy format if they exist
    const internshipStartDate = user.internshipStartDate 
      ? format(new Date(user.internshipStartDate), 'dd-MM-yyyy') 
      : '';
      
    return NextResponse.json({ 
      user: {
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        birthPlace: user.birthPlace,
        address: user.address,
        university: user.university,
        faculty: user.faculty,
        studyProgram: user.studyProgram,
        internshipStartDate: internshipStartDate,
        phoneNumber: user.phoneNumber,
        applicationLetter: user.applicationLetter
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}