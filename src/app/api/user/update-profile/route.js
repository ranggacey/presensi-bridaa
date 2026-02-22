// src/app/api/user/update-profile/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const userData = await request.json();
    
    // Validasi data
    if (!userData) {
      return NextResponse.json({ message: 'Data tidak valid' }, { status: 400 });
    }
    
    // Update user
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }
    
    // Update fields
    user.name = userData.name || user.name;
    user.birthPlace = userData.birthPlace || user.birthPlace;
    user.address = userData.address || user.address;
    user.university = userData.university || user.university;
    user.faculty = userData.faculty || user.faculty;
    user.studyProgram = userData.studyProgram || user.studyProgram;
    user.phoneNumber = userData.phoneNumber || user.phoneNumber;
    
    // Handle internshipStartDate - parse the string date to a Date object
    if (userData.internshipStartDate) {
      // Parse DD-MM-YYYY format to a proper Date object
      const dateParts = userData.internshipStartDate.split('-');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // months are 0-indexed in JS
        const year = parseInt(dateParts[2], 10);
        user.internshipStartDate = new Date(year, month, day);
      }
    }
    
    // Handle profile image update if provided
    if (userData.profileImage && userData.profileImage !== user.profileImage) {
      user.profileImage = userData.profileImage;
    }
    
    await user.save();
    
    return NextResponse.json({ 
      message: 'Profil berhasil diperbarui',
      user: {
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        birthPlace: user.birthPlace,
        address: user.address,
        university: user.university,
        faculty: user.faculty,
        studyProgram: user.studyProgram,
        internshipStartDate: user.internshipStartDate,
        phoneNumber: user.phoneNumber,
        applicationLetter: user.applicationLetter
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}