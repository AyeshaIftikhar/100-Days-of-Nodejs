export interface User {
  id: string;
  name: string;
  email: string;
  employeeId?: string;
  department?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceLog {
  id: string;
  userId: string;
  type: 'checkin' | 'checkout';
  timestamp: string;
  confidence?: number;
  imageUrl?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    employeeId?: string;
    department?: string;
  };
}

export interface RecognitionResult {
  isMatch: boolean;
  confidence: number;
  user?: {
    id: string;
    name: string;
    email: string;
    employeeId?: string;
    department?: string;
    imageUrl?: string;
  };
  message?: string;
}

export interface AttendanceStats {
  total_records: number;
  unique_users: number;
  checkins: number;
  checkouts: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

export interface CameraProps {
  onCapture: (imageSrc: string) => void;
  isCapturing?: boolean;
  width?: number;
  height?: number;
}
