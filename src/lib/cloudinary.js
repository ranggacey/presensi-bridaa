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
    // File dokumen (Word, Excel, PDF, dll) pakai raw supaya format ke-detect dan tampil benar di Media Library
    const rawExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.pdf', '.zip'];
    const isRaw = rawExtensions.some((e) => publicId.toLowerCase().endsWith(e));
    const resourceType = isRaw ? 'raw' : 'auto';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: publicId,
        resource_type: resourceType,
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
// resourceType: 'image' | 'raw' | 'video' — untuk asset raw (doc, pdf, dll) wajib 'raw'
export async function deleteFromCloudinary(publicId, resourceType = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

// Helper function untuk extract public_id dan resource_type dari URL Cloudinary
// Returns { publicId, resourceType }
export function extractPublicIdFromUrl(url) {
  if (!url) return null;
  // Legacy: return string (publicId only) untuk backward compatibility
  const parsed = parseCloudinaryUrl(url);
  return parsed ? parsed.publicId : null;
}

export function parseCloudinaryUrl(url) {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const urlParts = url.split('/upload/');
    if (urlParts.length < 2) return null;
    const path = urlParts[0];
    const afterUpload = urlParts[1];
    const resourceType = path.includes('/raw/') ? 'raw' : 'image';
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    // Untuk raw, jangan buang ekstensi (e.g. task-xxx.docx)
    const publicId = resourceType === 'raw'
      ? withoutVersion
      : withoutVersion.replace(/\.[^/.]+$/, '');
    return { publicId, resourceType };
  } catch (error) {
    console.error('Error parsing Cloudinary URL:', error);
    return null;
  }
}

