import { Router } from 'express';
import * as zkpController from '../controllers/zkp.controller';

const router = Router();

/**
 * @route POST /api/zkp/verify
 * @desc Verify a zero-knowledge proof for authentication
 * @access Public
 */
router.post('/verify', zkpController.verifyAuth);

export default router;
