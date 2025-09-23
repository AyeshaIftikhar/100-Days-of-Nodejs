export interface User {
  id: string;
  name: string;
  email: string;
  employeeId?: string;
  department?: string;
  faceDescriptor?: number[];
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceLog {
  id: string;
  userId: string;
  type: 'checkin' | 'checkout';
  timestamp: Date;
  confidence?: number;
  imageUrl?: string;
}

export interface FaceDetectionResult {
  detection: any;
  landmarks: any;
  descriptor: Float32Array;
}

export interface RecognitionResult {
  userId?: string;
  user?: User;
  confidence: number;
  isMatch: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface FaceApiModels {
  ssdMobilenetv1: any;
  faceLandmark68Net: any;
  faceRecognitionNet: any;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      DB_PATH: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      UPLOAD_DIR: string;
      MAX_FILE_SIZE: string;
      FACE_DETECTION_THRESHOLD: string;
      FACE_RECOGNITION_THRESHOLD: string;
      CORS_ORIGIN: string;
      RATE_LIMIT_WINDOW_MS: string;
      RATE_LIMIT_MAX_REQUESTS: string;
    }
  }
}
