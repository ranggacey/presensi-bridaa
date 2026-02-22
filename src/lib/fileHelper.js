import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { deleteFromCloudinary, extractPublicIdFromUrl } from './cloudinary';

/**
 * Menghapus file dari server atau Cloudinary
 * @param {string} filePath - Path file (bisa local path atau Cloudinary URL)
 * @returns {Promise<boolean>} - True jika berhasil atau file tidak ada, false jika gagal
 */
export async function deleteFile(filePath) {
  try {
    if (!filePath || typeof filePath !== 'string') {
      return true;
    }
    
    // Jika URL Cloudinary (mengandung cloudinary.com)
    if (filePath.includes('cloudinary.com')) {
      const publicId = extractPublicIdFromUrl(filePath);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
          console.log('File deleted from Cloudinary:', publicId);
          return true;
        } catch (error) {
          console.error('Error deleting from Cloudinary:', error);
          return false;
        }
      }
      return true;
    }
    
    // Jika local file path (legacy support)
    if (filePath.startsWith('/uploads/')) {
      const fullPath = join(process.cwd(), 'public', filePath);
      
      if (!existsSync(fullPath)) {
        console.log('File not found for deletion:', filePath);
        return true;
      }
      
      await unlink(fullPath);
      console.log('File deleted successfully:', filePath);
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Menghapus semua file yang terkait dengan user (support Cloudinary dan local)
 * @param {Object} user - User object dari database
 * @returns {Promise<void>}
 */
export async function deleteUserFiles(user) {
  if (!user) return;
  
  const filesToDelete = [];
  
  // Add profile image if exists
  if (user.profileImage && user.profileImage !== '' && !user.profileImage.includes('default-avatar')) {
    filesToDelete.push(user.profileImage);
  }
  
  // Add application letter if exists
  if (user.applicationLetter && user.applicationLetter !== '') {
    filesToDelete.push(user.applicationLetter);
  }
  
  // Add any other user-related files here
  
  // Delete all files (support Cloudinary URL dan local path)
  for (const filePath of filesToDelete) {
    await deleteFile(filePath);
  }
} 