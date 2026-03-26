import { Router } from 'express';
import { uploadImage, uploadDocument, uploadVideo, uploadFile } from '../config/cloudinary';
import { uploadSingleFile, uploadMultipleFiles, deleteFile } from '../controllers/upload.controller';

const router = Router();

// Upload single image
router.post(
  '/image/single',
  uploadImage.single('file'),
  uploadSingleFile
);

// Upload multiple images (max 10)
router.post(
  '/image/multiple',
  uploadImage.array('files', 10),
  uploadMultipleFiles
);

// Upload single document
router.post(
  '/document/single',
  uploadDocument.single('file'),
  uploadSingleFile
);

// Upload multiple documents (max 10)
router.post(
  '/document/multiple',
  uploadDocument.array('files', 10),
  uploadMultipleFiles
);

// Upload single video
router.post(
  '/video/single',
  uploadVideo.single('file'),
  uploadSingleFile
);

// Upload multiple videos (max 5)
router.post(
  '/video/multiple',
  uploadVideo.array('files', 5),
  uploadMultipleFiles
);

// Upload any file type (single)
router.post(
  '/file/single',
  uploadFile.single('file'),
  uploadSingleFile
);

// Upload any file type (multiple - max 10)
router.post(
  '/file/multiple',
  uploadFile.array('files', 10),
  uploadMultipleFiles
);

// Delete file by public ID
router.delete('/:publicId', deleteFile);

export default router;
