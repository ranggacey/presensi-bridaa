import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Validasi environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('⚠️ Cloudinary credentials tidak lengkap. Pastikan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET sudah di-set di environment variables.');
} else {
  console.log('✅ Cloudinary config loaded:', {
    cloud_name: cloudName,
    api_key: apiKey ? `${apiKey.substring(0, 4)}...` : 'missing',
    api_secret: apiSecret ? `${apiSecret.substring(0, 4)}...` : 'missing'
  });
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export default cloudinary;

// Helper function untuk upload file ke Cloudinary
export async function uploadToCloudinary(fileBuffer, folder, publicId) {
  return new Promise((resolve, reject) => {
    // Convert buffer to stream
    const stream = Readable.from(fileBuffer);
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: publicId,
        resource_type: 'auto', // Auto-detect: image, video, raw (PDF, DOC, etc)
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.pipe(uploadStream);
  });
}

// Helper function untuk delete file dari Cloudinary
export async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

// Helper function untuk extract public_id dari URL Cloudinary
export function extractPublicIdFromUrl(url) {
  if (!url) return null;
  
  // Format URL Cloudinary: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{version}/{public_id}.{format}
  // Atau: https://res.cloudinary.com/{cloud_name}/image/upload/v1234567890/folder/filename.jpg
  try {
    const urlParts = url.split('/upload/');
    if (urlParts.length > 1) {
      const afterUpload = urlParts[1];
      // Remove version (v1234567890/)
      const withoutVersion = afterUpload.replace(/^v\d+\//, '');
      // Remove extension
      const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
      return publicId;
    }
  } catch (error) {
    console.error('Error extracting public_id:', error);
  }
  
  return null;
}

