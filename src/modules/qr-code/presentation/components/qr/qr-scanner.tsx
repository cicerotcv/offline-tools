import { useEffect, useRef, useState } from 'react';

import { Camera, Image as ImageIcon } from 'lucide-react';

import { Alert } from '$/components/ui/alert';
import { Button } from '$/components/ui/button';

import { createQrScanner, type QrScanner } from '../../../lib/scanner';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<
    string | null
  >(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerId = 'reader';

  const scanner = () => (scannerRef.current ??= createQrScanner(readerId));

  // Release the camera when leaving the page.
  useEffect(
    () => () => {
      void scannerRef.current?.dispose();
    },
    []
  );

  const stopScanning = async () => {
    try {
      await scannerRef.current?.stop();
    } catch (err) {
      console.warn('Scanner stop warning (likely already stopped):', err);
    } finally {
      setIsScanning(false);
    }
  };

  const startScanning = async () => {
    setCameraPermissionError(null);
    let ignoreScans = false;
    // The reader element must be visible before the camera attaches to it.
    setIsScanning(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      await scanner().startCamera((decodedText) => {
        if (ignoreScans) return;
        ignoreScans = true;
        onScan(decodedText);
        void stopScanning();
      });
    } catch (err) {
      console.error('Error starting scanner:', err);
      setIsScanning(false);
      setCameraPermissionError(
        'The camera is not available. Allow camera access in the browser, or read the code from an image.'
      );
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    scanner()
      .scanImage(file)
      .then(onScan)
      .catch((err) => {
        console.error('Error scanning file:', err);
        onError?.('No QR code was found in this image.');
      });
    event.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        {!isScanning ? (
          <Button onClick={startScanning} className="flex-1 gap-2">
            <Camera className="h-4 w-4" />
            Scan with camera
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="destructive"
            className="flex-1 gap-2"
          >
            <Camera className="h-4 w-4" />
            Stop camera
          </Button>
        )}

        <div className="relative flex-1">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
            Read from an image
          </Button>
        </div>
      </div>

      {cameraPermissionError && (
        <Alert variant="error">{cameraPermissionError}</Alert>
      )}

      {/* The container for the camera stream */}
      <div
        id={readerId}
        className={`overflow-hidden rounded-lg bg-black ${
          isScanning ? 'block' : 'hidden'
        }`}
        style={{ width: '100%' }}
      />
    </div>
  );
}
