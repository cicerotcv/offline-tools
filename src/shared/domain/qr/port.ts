export const QR_ERROR_CORRECTION_LEVELS = ['L', 'M', 'Q', 'H'] as const;
export type QrErrorCorrectionLevel =
  (typeof QR_ERROR_CORRECTION_LEVELS)[number];

export interface QrRenderOptions {
  errorCorrectionLevel: QrErrorCorrectionLevel;
  /** Quiet zone, in modules. */
  margin: number;
  /** Rendered width in pixels. */
  width: number;
  /** Module color (CSS hex). */
  dark: string;
  /** Background color (CSS hex). */
  light: string;
}

/** Square grid of modules, row by row; true is dark. No quiet zone. */
export interface QrMatrix {
  size: number;
  dark: boolean[];
}

/** Renders text as a QR code image. */
export interface QrImagePort {
  toDataUrl(text: string, options: QrRenderOptions): Promise<string>;
  toSvg(text: string, options: QrRenderOptions): Promise<string>;
  /** The raw module grid, for vector output such as laser engraving. */
  toMatrix(text: string, level: QrErrorCorrectionLevel): QrMatrix;
}
