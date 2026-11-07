import QRCode from 'qrcode';

import type { QrImagePort, QrRenderOptions } from '@/shared/domain/qr/port';

const toLibraryOptions = (options: QrRenderOptions) => ({
  errorCorrectionLevel: options.errorCorrectionLevel,
  margin: options.margin,
  width: options.width,
  color: { dark: options.dark, light: options.light },
});

/** QrImagePort backed by the `qrcode` package (PNG data URLs and SVG). */
export const qrcodeImage: QrImagePort = {
  toDataUrl: (text, options) =>
    QRCode.toDataURL(text, toLibraryOptions(options)),
  toSvg: (text, options) =>
    QRCode.toString(text, { ...toLibraryOptions(options), type: 'svg' }),
  toMatrix: (text, level) => {
    const { modules } = QRCode.create(text, { errorCorrectionLevel: level });
    return {
      size: modules.size,
      dark: Array.from(modules.data, (cell) => Boolean(cell)),
    };
  },
};
