import { Router } from 'express';
import { AttendanceController } from '../controllers/attendanceController';
import { upload } from '../utils/fileUtils';

const router = Router();

// Check in with optional face recognition
router.post(
  '/checkin',
  upload.single('image'),
  AttendanceController.checkIn
);

// Check out with optional face recognition
router.post(
  '/checkout',
  upload.single('image'),
  AttendanceController.checkOut
);

// Get all attendance logs
router.get('/logs', AttendanceController.getAttendanceLogs);

// Get attendance stats
router.get('/stats', AttendanceController.getAttendanceStats);

// Get user-specific attendance
router.get('/user/:userId', AttendanceController.getUserAttendance);

export default router;
