import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { upload } from '../utils/fileUtils';
import { validate, userSchema, updateUserSchema, validateImageFile } from '../middleware/validation';

const router = Router();

// Create user with optional face image
router.post(
  '/',
  upload.single('image'),
  validate(userSchema),
  UserController.createUser
);

// Get all users
router.get('/', UserController.getAllUsers);

// Get user by ID
router.get('/:id', UserController.getUserById);

// Update user
router.put(
  '/:id',
  validate(updateUserSchema),
  UserController.updateUser
);

// Update user face
router.put(
  '/:id/face',
  upload.single('image'),
  validateImageFile,
  UserController.updateUserFace
);

// Delete user
router.delete('/:id', UserController.deleteUser);

export default router;
