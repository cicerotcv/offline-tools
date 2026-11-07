import type { QrErrorCorrectionLevel } from '@/shared/domain/qr/port';

export interface QRCodeConfig {
  errorCorrectionLevel: QrErrorCorrectionLevel;
  margin: number;
  width: number;
  colorDark: string;
  colorLight: string;
}
