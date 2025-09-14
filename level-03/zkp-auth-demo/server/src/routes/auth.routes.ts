import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user with password commitment
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route GET /api/auth/salt/:username
 * @desc Get a user's salt for ZKP generation
 * @access Public
 */
router.get('/salt/:username', authController.getSalt);

/**
 * @route GET /api/auth/user/:username
 * @desc Get basic user info
 * @access Public
 */
router.get('/user/:username', authController.getUser);

export default router;
