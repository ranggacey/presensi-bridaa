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
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Connect to DB
    await dbConnect();
    
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    // Validate file
    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }
    
    // Check file type
    const fileType = file.type;
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ 
        success: false,
        message: 'File must be PDF, DOC or DOCX' 
      }, { status: 400 });
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false,
        message: 'File too large (max 5MB)' 
      }, { status: 400 });
    }
    
    // Get file extension
    let fileExtension;
    switch(fileType) {
      case 'application/pdf':
        fileExtension = 'pdf';
        break;
      case 'application/msword':
        fileExtension = 'doc';
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        fileExtension = 'docx';
        break;
      default:
        fileExtension = 'pdf';
    }
    
    try {
      // Dapatkan user dari database
      const user = await User.findById(session.user.id);
      if (!user) {
        return NextResponse.json({
          success: false,
          message: 'User not found'
        }, { status: 404 });
      }
      
      // Simpan public_id file lama untuk dihapus nanti
      const oldApplicationLetter = user.applicationLetter;
      const oldPublicId = extractPublicIdFromUrl(oldApplicationLetter);
      
      // Convert the file to a Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create unique public_id (tanpa folder karena akan di-set di uploadToCloudinary)
      const publicId = `application-letter-${session.user.id}-${Date.now()}`;
      
      // Upload ke Cloudinary
      console.log('Uploading document to Cloudinary...');
      const result = await uploadToCloudinary(buffer, 'documents', publicId);
      
      console.log('Document upload successful:', result.secure_url);
      
      // Update user profile in database dengan URL dari Cloudinary
      user.applicationLetter = result.secure_url;
      await user.save();
      
      // Hapus file lama dari Cloudinary jika ada
      if (oldPublicId) {
        try {
          await deleteFromCloudinary(oldPublicId);
          console.log('Old application letter deleted from Cloudinary');
        } catch (deleteError) {
          console.error('Error deleting old document from Cloudinary:', deleteError);
          // Continue even if delete fails
        }
      }
      
      // Return success response
      return NextResponse.json({
        success: true,
        fileUrl: result.secure_url,
        message: 'Document uploaded successfully to Cloudinary'
      });
    } catch (error) {
      console.error('Error saving file:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to save file to server'
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