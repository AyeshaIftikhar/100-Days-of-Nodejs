import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Camera, CameraOff } from 'lucide-react';

interface CameraComponentProps {
  onCapture: (imageSrc: string) => void;
  isCapturing?: boolean;
  width?: number;
  height?: number;
  disabled?: boolean;
}

const CameraComponent: React.FC<CameraComponentProps> = ({
  onCapture,
  isCapturing = false,
  width = 640,
  height = 480,
  disabled = false,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState<string>('');

  const videoConstraints = {
    width,
    height,
    facingMode: 'user',
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [onCapture]);

  const handleUserMedia = () => {
    setIsCameraOn(true);
    setError('');
  };

  const handleUserMediaError = (error: any) => {
    setError('Camera access denied or not available');
    setIsCameraOn(false);
    console.error('Camera error:', error);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {!isCameraOn && !error && (
              <div
                className="flex items-center justify-center bg-gray-100 rounded-lg"
                style={{ width, height }}
              >
                <div className="text-center">
                  <CameraOff className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Camera not started</p>
                </div>
              </div>
            )}

            {error && (
              <div
                className="flex items-center justify-center bg-red-50 border border-red-200 rounded-lg"
                style={{ width, height }}
              >
                <div className="text-center">
                  <CameraOff className="h-12 w-12 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {!error && (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
                className="rounded-lg"
              />
            )}

            {isCameraOn && !error && (
              <div className="absolute top-2 right-2">
                <div className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span>Live</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={capture}
              disabled={!isCameraOn || error !== '' || isCapturing || disabled}
              className="flex items-center space-x-2"
            >
              <Camera className="h-4 w-4" />
              <span>{isCapturing ? 'Processing...' : 'Capture Photo'}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraComponent;
