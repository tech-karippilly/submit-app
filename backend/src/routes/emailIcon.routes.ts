import { Router } from 'express';
import * as emailIconController from '../controllers/emailIcon.controller';
import { uploadImage } from '../config/cloudinary';

const router = Router();

// Get all email icons
router.get('/', emailIconController.getAllEmailIcons);

// Get email icon by ID
router.get('/:id', emailIconController.getEmailIconById);

// Upload and create email icon
router.post(
  '/upload',
  uploadImage.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
        return;
      }

      const file = req.file as Express.Multer.File & {
        public_id?: string;
        secure_url?: string;
        path?: string;
      };

      const iconData = {
        name: req.body.name || req.file.originalname.split('.')[0],
        url: file.secure_url || file.path || '',
        publicId: file.public_id || '',
        category: req.body.category || 'custom',
        width: req.body.width ? parseInt(req.body.width) : 100,
        height: req.body.height ? parseInt(req.body.height) : 100,
      };

      req.body = iconData;
      next();
    } catch (error) {
      next(error);
    }
  },
  emailIconController.createEmailIcon
);

// Create email icon with existing URL
router.post('/', emailIconController.createEmailIcon);

// Update email icon
router.put('/:id', emailIconController.updateEmailIcon);

// Delete email icon
router.delete('/:id', emailIconController.deleteEmailIcon);

export default router;
