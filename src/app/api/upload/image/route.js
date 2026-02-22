import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from '@/lib/cloudinary';

export async function POST(request) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('Unauthorized: No session found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session user:', session.user);

    // Connect to DB
    await dbConnect();
    console.log('Connected to database');
    
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    // Validate file
    if (!file) {
      console.log('No file found in request');
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }
    
    console.log('File received:', file.name, file.type, file.size);
    
    // Check file type
    const fileType = file.type;
    if (!fileType.startsWith('image/')) {
      console.log('Invalid file type:', fileType);
      return NextResponse.json({ message: 'File must be an image' }, { status: 400 });
    }
    
    // Check file size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      console.log('File too large:', file.size);
      return NextResponse.json({ message: 'File too large (max 3MB)' }, { status: 400 });
    }
    
    try {
      // Dapatkan user dari database
      const user = await User.findById(session.user.id);
      if (!user) {
        console.log('User not found:', session.user.id);
        return NextResponse.json({
          success: false,
          message: 'User not found'
        }, { status: 404 });
      }
      
      // Simpan public_id file lama untuk dihapus nanti
      const oldProfileImage = user.profileImage;
      const oldPublicId = extractPublicIdFromUrl(oldProfileImage);
      
      // Convert the file to a Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create unique public_id (tanpa folder karena akan di-set di uploadToCloudinary)
      const publicId = `profile-${session.user.id}-${Date.now()}`;
      
      // Upload ke Cloudinary
      console.log('Uploading to Cloudinary...');
      const result = await uploadToCloudinary(buffer, 'profiles', publicId);
      
      console.log('Upload successful:', result.secure_url);
      
      // Update user profile in database dengan URL dari Cloudinary
      user.profileImage = result.secure_url;
      await user.save();
      console.log('User profile updated with new image:', result.secure_url);
      
      // Hapus file lama dari Cloudinary jika ada
      if (oldPublicId && !oldPublicId.includes('default-avatar')) {
        try {
          await deleteFromCloudinary(oldPublicId);
          console.log('Old profile image deleted from Cloudinary');
        } catch (deleteError) {
          console.error('Error deleting old image from Cloudinary:', deleteError);
          // Continue even if delete fails
        }
      }
      
      // Return success response
      return NextResponse.json({
        success: true,
        fileUrl: result.secure_url,
        message: 'Image uploaded successfully to Cloudinary'
      });
    } catch (error) {
      console.error('Error saving file:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return NextResponse.json({
        success: false,
        message: error.message || 'Failed to save file to server',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error processing upload'
    }, { status: 500 });
  }
} 