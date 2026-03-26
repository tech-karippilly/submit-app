import { v2 as cloudinary } from 'cloudinary';

export interface UploadResult {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format: string;
  bytes: number;
  original_filename: string;
}

export interface ImageInfo {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

/**
 * Upload an image to Cloudinary
 * @param file - The file buffer or base64 string
 * @param folder - Optional folder path (default: 'submit-project/images')
 * @returns UploadResult
 */
export const uploadImage = async (
  file: Buffer | string,
  folder: string = 'submit-project/images'
): Promise<UploadResult> => {
  try {
    const uploadOptions = {
      folder: folder,
      resource_type: 'image' as const,
    };

    let result;
    if (Buffer.isBuffer(file)) {
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(file);
      });
    } else {
      result = await cloudinary.uploader.upload(file, uploadOptions);
    }

    return {
      public_id: (result as any).public_id,
      secure_url: (result as any).secure_url,
      resource_type: (result as any).resource_type,
      format: (result as any).format,
      bytes: (result as any).bytes,
      original_filename: (result as any).original_filename || '',
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image
 * @returns boolean indicating success
 */
export const deleteImage = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

/**
 * Get image info from Cloudinary
 * @param publicId - The public ID of the image
 * @returns ImageInfo
 */
export const getImage = async (publicId: string): Promise<ImageInfo> => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'image',
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      created_at: result.created_at,
    };
  } catch (error) {
    console.error('Error getting image info from Cloudinary:', error);
    throw error;
  }
};
