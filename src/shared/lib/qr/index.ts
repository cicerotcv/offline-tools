import type {
  QrErrorCorrectionLevel,
  QrImagePort,
  QrMatrix,
  QrRenderOptions,
} from '@/shared/domain/qr/port';
import { qrcodeImage } from '@/shared/infra/qr/qr-image.qrcode';

export type {
  QrErrorCorrectionLevel,
  QrMatrix,
  QrRenderOptions,
} from '@/shared/domain/qr/port';
export { QR_ERROR_CORRECTION_LEVELS } from '@/shared/domain/qr/port';

/**
 * Black on white, medium error correction. Printed and scanned QR codes
 * must keep maximum contrast regardless of the UI theme.
 */
export const DEFAULT_QR_OPTIONS: QrRenderOptions = {
  errorCorrectionLevel: 'M',
  margin: 2,
  width: 256,
  dark: '#000000',
  light: '#FFFFFF',
};

export function renderQrDataUrl(
  text: string,
  options: Partial<QrRenderOptions> = {},
  qrImage: QrImagePort = qrcodeImage
): Promise<string> {
  return qrImage.toDataUrl(text, { ...DEFAULT_QR_OPTIONS, ...options });
}

export function renderQrSvg(
  text: string,
  options: Partial<QrRenderOptions> = {},
  qrImage: QrImagePort = qrcodeImage
): Promise<string> {
  return qrImage.toSvg(text, { ...DEFAULT_QR_OPTIONS, ...options });
}

/** The module grid of a QR code (no quiet zone), for vector output. */
export function qrMatrix(
  text: string,
  level: QrErrorCorrectionLevel = 'H',
  qrImage: QrImagePort = qrcodeImage
): QrMatrix {
  return qrImage.toMatrix(text, level);
}
