import { useEffect, useRef, useState } from 'react';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '$/components/ui/dialog';

interface CameraCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (blob: Blob) => void;
  disabled?: boolean;
}

export function CameraCaptureModal({
  open,
  onOpenChange,
  onCapture,
  disabled = false,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasSrcObject, setHasSrcObject] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setHasSrcObject(true);
      }
    } catch (error) {
      setHasSrcObject(false);
      setCameraError(
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Camera access was denied. Allow it in the browser, or hash a file instead.'
          : 'No camera is available. Hash a file instead.'
      );
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
    setHasSrcObject(false);
    setIsVideoReady(false);
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
      onCapture(blob);
      stopCamera();
      onOpenChange(false);
    }
  };

  useEffect(() => {
    if (open) {
      // Start camera when modal opens
      const timeoutId = setTimeout(() => {
        startCamera();
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        stopCamera();
      };
    } else {
      // Stop camera when modal closes
      stopCamera();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Take a photo</DialogTitle>
          <DialogDescription>
            The PNG bytes of the photo are hashed in this browser.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {cameraError && (
            <Alert variant="error" className="p-3">
              {cameraError}
            </Alert>
          )}
          <div
            className="relative mx-auto aspect-video w-full overflow-hidden
              rounded-lg border border-border bg-muted"
          >
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
              onLoadedMetadata={() => {
                const isReady =
                  !!videoRef.current?.srcObject &&
                  videoRef.current.videoWidth > 0 &&
                  videoRef.current.videoHeight > 0;
                setHasSrcObject(!!videoRef.current?.srcObject);
                setIsVideoReady(isReady);
              }}
              onPlaying={() => {
                const isReady =
                  !!videoRef.current?.srcObject &&
                  videoRef.current.videoWidth > 0 &&
                  videoRef.current.videoHeight > 0;
                setIsVideoReady(isReady);
              }}
            />
            {!hasSrcObject && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">Starting the camera…</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              stopCamera();
              onOpenChange(false);
            }}
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button onClick={capturePhoto} disabled={disabled || !isVideoReady}>
            Take photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
