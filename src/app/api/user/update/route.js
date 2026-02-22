import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from '@/lib/cloudinary';

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Gunakan formData untuk membaca data termasuk file
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const profileImage = formData.get('profileImage');
    
    // Ambil field-field tambahan
    const birthdate = formData.get('birthdate');
    const address = formData.get('address');
    const university = formData.get('university');
    const faculty = formData.get('faculty');
    const studyProgram = formData.get('studyProgram');
    const internshipStartDate = formData.get('internshipStartDate');
    const phoneNumber = formData.get('phoneNumber');
    const applicationLetter = formData.get('applicationLetter');
    
    // Tambahkan console.log di sini
    console.log('Received data:', { name, email, birthdate, university });
    
    // Validasi input
    if (!name || !email) {
      return NextResponse.json(
        { message: 'Nama dan email harus diisi' },
        { status: 400 }
      );
    }
    
    // Cari user berdasarkan ID dari session
    const user = await User.findById(session.user.id).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Cek apakah email sudah digunakan oleh user lain
    if (email !== user.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingEmail) {
        return NextResponse.json(
          { message: 'Email sudah digunakan oleh pengguna lain' },
          { status: 400 }
        );
      }
    }
    
    // Update data user
    user.name = name;
    user.email = email;
    
    // Update field-field tambahan
    user.birthdate = birthdate || user.birthdate;
    user.address = address || user.address;
    user.university = university || user.university;
    user.faculty = faculty || user.faculty;
    user.studyProgram = studyProgram || user.studyProgram;
    user.internshipStartDate = internshipStartDate || user.internshipStartDate;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    
    // Jika ada permintaan untuk mengubah password
    if (newPassword && currentPassword) {
      // Verifikasi password saat ini
      const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordCorrect) {
        return NextResponse.json(
          { message: 'Password saat ini tidak sesuai' },
          { status: 400 }
        );
      }
      
      // Hash password baru
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    
    // Proses upload foto profil jika ada
    if (profileImage && profileImage.size > 0) {
      // Hapus foto lama dari Cloudinary jika ada
      if (user.profileImage && user.profileImage !== '/uploads/dummy-profile.jpg') {
        const oldPublicId = extractPublicIdFromUrl(user.profileImage);
        if (oldPublicId && !oldPublicId.includes('default-avatar')) {
          try {
            await deleteFromCloudinary(oldPublicId);
          } catch (error) {
            console.error('Error deleting old profile image:', error);
          }
        }
      }
      
      // Convert file to buffer
      const fileBuffer = await profileImage.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);
      
      // Upload ke Cloudinary
      const publicId = `profile-${user._id}-${Date.now()}`;
      const result = await uploadToCloudinary(buffer, 'profiles', publicId);
      
      // Update path foto di database dengan URL Cloudinary
      user.profileImage = result.secure_url;
    }
    
    // Proses upload surat permohonan jika ada
    if (applicationLetter && applicationLetter.size > 0) {
      // Hapus file lama dari Cloudinary jika ada
      if (user.applicationLetter) {
        const oldPublicId = extractPublicIdFromUrl(user.applicationLetter);
        if (oldPublicId) {
          try {
            await deleteFromCloudinary(oldPublicId);
          } catch (error) {
            console.error('Error deleting old application letter:', error);
          }
        }
      }
      
      // Convert file to buffer
      const fileBuffer = await applicationLetter.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);
      
      // Upload ke Cloudinary
      const publicId = `application-letter-${user._id}-${Date.now()}`;
      const result = await uploadToCloudinary(buffer, 'documents', publicId);
      
      // Update path file di database dengan URL Cloudinary
      user.applicationLetter = result.secure_url;
    }
    
    await user.save();
    
    // Tambahkan console.log di sini
    console.log('Updated user:', { 
      name: user.name, 
      email: user.email,
      university: user.university,
      studyProgram: user.studyProgram
    });
    
    // Hapus password dari response
    const updatedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      profileImage: user.profileImage,
      birthdate: user.birthdate,
      address: user.address,
      university: user.university,
      faculty: user.faculty,
      studyProgram: user.studyProgram,
      internshipStartDate: user.internshipStartDate,
      phoneNumber: user.phoneNumber,
      applicationLetter: user.applicationLetter
    };
    
    return NextResponse.json({
      message: 'Profil berhasil diperbarui',
      user: updatedUser,
      profileImage: user.profileImage,
      applicationLetter: user.applicationLetter
    });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}