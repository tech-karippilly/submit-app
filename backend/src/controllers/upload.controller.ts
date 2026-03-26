import { Request, Response, NextFunction } from 'express';

export interface UploadResult {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format: string;
  bytes: number;
  original_filename: string;
}

interface CloudinaryFile {
  public_id?: string;
  secure_url?: string;
  resource_type?: string;
  format?: string;
  path?: string;
  size: number;
  originalname: string;
  mimetype: string;
}

export const uploadSingleFile = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    const file = req.file as CloudinaryFile;
    const result: UploadResult = {
      public_id: file.public_id || '',
      secure_url: file.secure_url || file.path || '',
      resource_type: file.resource_type || 'auto',
      format: file.format || file.mimetype.split('/')[1],
      bytes: file.size,
      original_filename: file.originalname,
    };

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMultipleFiles = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
      return;
    }

    const results: UploadResult[] = req.files.map((file: Express.Multer.File) => {
      const cloudinaryFile = file as CloudinaryFile;
      return {
        public_id: cloudinaryFile.public_id || '',
        secure_url: cloudinaryFile.secure_url || cloudinaryFile.path || '',
        resource_type: cloudinaryFile.resource_type || 'auto',
        format: cloudinaryFile.format || file.mimetype.split('/')[1],
        bytes: file.size,
        original_filename: file.originalname,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.query;

    if (!publicId) {
      res.status(400).json({
        success: false,
        message: 'Public ID is required',
      });
      return;
    }

    const { deleteFromCloudinary } = await import('../config/cloudinary');
    await deleteFromCloudinary(publicId, resourceType as 'image' | 'video' | 'raw');

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
