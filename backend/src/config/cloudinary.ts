import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async () => ({
    folder: 'submit-project/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1920, height: 1080, crop: 'limit' }],
    resource_type: 'image',
  }),
});

// Storage configuration for documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async () => ({
    folder: 'submit-project/documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
    resource_type: 'raw',
  }),
});

// Storage configuration for videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async () => ({
    folder: 'submit-project/videos',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    resource_type: 'video',
  }),
});

// Multer upload instances
export const uploadImage = multer({ storage: imageStorage });
export const uploadDocument = multer({ storage: documentStorage });
export const uploadVideo = multer({ storage: videoStorage });

// Generic upload for any file type
const genericStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async () => ({
    folder: 'submit-project/files',
    resource_type: 'auto',
  }),
});

export const uploadFile = multer({ storage: genericStorage });

// Export cloudinary instance for direct operations
export { cloudinary };

// Helper function to delete a file from Cloudinary
export const deleteFromCloudinary = async (publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get file info from Cloudinary
export const getFileInfo = async (publicId: string): Promise<object> => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting file info from Cloudinary:', error);
    throw error;
  }
};
