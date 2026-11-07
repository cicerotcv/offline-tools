import { Html5Qrcode } from 'html5-qrcode';

/** Camera / image QR decoding bound to one DOM element. */
export interface QrScanner {
  /** Starts the rear camera; calls onDecode once per decoded frame. */
  startCamera(onDecode: (text: string) => void): Promise<void>;
  stop(): Promise<void>;
  scanImage(file: File): Promise<string>;
  /** Releases the element; call on unmount. */
  dispose(): Promise<void>;
}

/** html5-qrcode adapter. `elementId` must exist and be visible on start. */
export function createHtml5QrScanner(elementId: string): QrScanner {
  let scanner: Html5Qrcode | null = null;
  let running = false;
  const instance = () => (scanner ??= new Html5Qrcode(elementId));

  return {
    async startCamera(onDecode) {
      await instance().start(
        { facingMode: 'environment' },
        {
          fps: 5,
          // Square box covering 70% of the shorter edge.
          qrbox: (width, height) => {
            const size = Math.floor(Math.min(width, height) * 0.7);
            return { width: size, height: size };
          },
        },
        onDecode,
        () => {
          // Frame without a QR code: expected while the camera moves.
        }
      );
      running = true;
    },
    async stop() {
      if (!scanner || !running) return;
      running = false;
      await scanner.stop();
    },
    async scanImage(file) {
      return (await instance().scanFileV2(file, true)).decodedText;
    },
    async dispose() {
      await this.stop().catch(() => {});
      scanner?.clear();
      scanner = null;
    },
  };
}
