import { useEffect, useRef, useState } from 'react';

import { Camera } from 'lucide-react';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import { Label } from '$/components/ui/label';

interface CameraEntropyCollectorProps {
  onCollect: (blob: Blob) => Promise<void>;
  isProcessing?: boolean;
  hasEntropy?: boolean;
  disabled?: boolean;
  label?: string;
}

export function CameraEntropyCollector({
  onCollect,
  isProcessing = false,
  hasEntropy = false,
  disabled = false,
  label = 'Camera',
}: CameraEntropyCollectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasStream, setHasStream] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const startCamera = async () => {
    try {
      setIsStarting(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        // Update state after video element is set up
        videoRef.current.addEventListener('loadedmetadata', () => {
          const isReady =
            !!videoRef.current?.srcObject &&
            videoRef.current.videoWidth > 0 &&
            videoRef.current.videoHeight > 0;
          setHasStream(!!videoRef.current?.srcObject);
          setIsVideoReady(isReady);
          setIsStarting(false);
        });
      }
    } catch {
      setIsStarting(false);
      // Error handling is done in parent component
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setHasStream(false);
    setIsVideoReady(false);
    setIsStarting(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    // Ensure video is ready with valid dimensions
    if (
      videoRef.current.videoWidth === 0 ||
      videoRef.current.videoHeight === 0 ||
      videoRef.current.readyState < 2 // HAVE_CURRENT_DATA
    ) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);

    // Use Promise-based approach for better error handling
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });

    if (blob) {
      await onCollect(blob);
      stopCamera();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4">
      <Label className="mb-2 block text-sm font-medium text-foreground/80">
        {label}
      </Label>
      <div
        className="relative mx-auto aspect-video w-full max-w-md overflow-hidden
          rounded-lg border border-border bg-muted"
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
          onPlaying={() => {
            const isReady =
              !!videoRef.current?.srcObject &&
              videoRef.current.videoWidth > 0 &&
              videoRef.current.videoHeight > 0;
            setIsVideoReady(isReady);
          }}
        />
        {!hasStream && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground">
              {isStarting ? 'Starting camera...' : 'Start the camera to begin'}
            </p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        {!hasStream ? (
          <Button
            type="button"
            onClick={startCamera}
            disabled={disabled || isProcessing || isStarting}
            className="w-full"
          >
            <Camera className="mr-2 h-4 w-4" />
            {isStarting ? 'Starting...' : 'Start camera'}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              onClick={capturePhoto}
              disabled={disabled || isProcessing || !isVideoReady}
              className="flex-1"
            >
              <Camera className="mr-2 h-4 w-4" />
              Capture frame
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={stopCamera}
              disabled={disabled || isProcessing}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
      {hasEntropy && (
        <Alert variant="success" className="p-2">
          ✓ Camera entropy collected (32 bytes)
        </Alert>
      )}
    </div>
  );
}
