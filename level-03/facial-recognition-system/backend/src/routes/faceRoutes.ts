import { Router } from 'express';
import { FaceController } from '../controllers/faceController';
import { upload } from '../utils/fileUtils';
import { validateImageFile } from '../middleware/validation';

const router = Router();

// Load face recognition models
router.get('/models', FaceController.loadModels);

// Recognize face from image
router.post(
  '/recognize',
  upload.single('image'),
  validateImageFile,
  FaceController.recognizeFace
);

// Verify face against specific user
router.post(
  '/verify',
  upload.single('image'),
  validateImageFile,
  FaceController.verifyFace
);

// Detect face in image
router.post(
  '/detect',
  upload.single('image'),
  validateImageFile,
  FaceController.detectFace
);

export default router;
