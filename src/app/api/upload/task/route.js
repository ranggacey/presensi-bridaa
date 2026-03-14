import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    // Validate file
    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }
    
    // Check file type - allow PDF, DOC, DOCX, images, etc
    const fileType = file.type;
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-zip-compressed',
    ];
    
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ 
        success: false,
        message: 'File type tidak didukung. Gunakan PDF, DOC, DOCX, Excel, ZIP, atau gambar' 
      }, { status: 400 });
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false,
        message: 'File terlalu besar (maksimal 10MB)' 
      }, { status: 400 });
    }
    
    // Get original filename dan ekstensi
    const originalName = file.name;
    const ext = originalName.includes('.')
      ? originalName.slice(originalName.lastIndexOf('.')).toLowerCase()
      : '';
    const safeExt = /^\.(pdf|doc|docx|xls|xlsx|jpg|jpeg|png|gif|webp|zip)$/.test(ext)
      ? ext
      : '';
    
    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // public_id pakai ekstensi asli supaya di Cloudinary ke-detect sebagai Word/PDF/dll
    const publicId = `task-${session.user.id}-${Date.now()}${safeExt}`;
    
    // Upload ke Cloudinary
    console.log('Uploading task file to Cloudinary...', { originalName, publicId });
    const result = await uploadToCloudinary(buffer, 'tasks', publicId);
    
    console.log('Task file upload successful:', result.secure_url);
    
    // Return success response
    return NextResponse.json({
      success: true,
      fileUrl: result.secure_url,
      fileName: originalName,
      message: 'File tugas berhasil diupload ke Cloudinary'
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error processing upload'
    }, { status: 500 });
  }
}

