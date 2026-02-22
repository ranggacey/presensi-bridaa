import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { deleteFile } from '@/lib/fileHelper';

export async function POST(request) {
  try {
    // Cek autentikasi
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    // Ambil data file path dari request
    const data = await request.json();
    const { filePath } = data;
    
    // Validasi path
    if (!filePath) {
      return NextResponse.json({ 
        success: false, 
        message: 'File path is required' 
      }, { status: 400 });
    }

    // Hapus file (support Cloudinary URL dan local path)
    const deleted = await deleteFile(filePath);
    
    if (deleted) {
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to delete file'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete file: ' + error.message 
    }, { status: 500 });
  }
} 