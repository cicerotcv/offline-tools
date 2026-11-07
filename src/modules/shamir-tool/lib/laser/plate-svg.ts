import { type QrErrorCorrectionLevel, qrMatrix } from '@/shared/lib/qr';
import { qrMatrixToPath } from '@/shared/lib/vector/qr-path';
import { measureText, textToPath } from '@/shared/lib/vector/stroke-font';

import { type CardDensity, cardDensityFor, shareRows } from '../cards';

/*
 * Laser plate for one share: front and back of an ID-1 plate (85.6 x 53.98
 * mm), side by side, at 1:1 scale in mm. Layers by colour, as laser software
 * expects: black strokes and fills are engraved, the red hairline is the cut
 * outline. Text is single-stroke paths (no fonts needed on the machine); the
 * QR is one even-odd path with merged modules.
 */

export const PLATE_WIDTH = 85.6;
export const PLATE_HEIGHT = 53.98;
export const PLATE_RADIUS = 3.18;
export const PLATE_GAP = 10;
const MARGIN = 4;
const QUIET_ZONE = 4;
/** Smallest QR module that still engraves and scans reliably on metal. */
export const MIN_QR_MODULE = 0.5;
const STROKE = 0.25;
const CUT_STROKE = 0.01;

const CAP_BY_DENSITY: Record<CardDensity['name'], number> = {
  regular: 2.6,
  compact: 2.2,
  dense: 2,
};

export interface PlateInput {
  share: string;
  /** 0-based position of the share. */
  index: number;
  total: number;
  threshold: number;
  setId: string;
}

export interface PlateQr {
  level: QrErrorCorrectionLevel;
  /** Module count, without the quiet zone. */
  size: number;
  module: number;
  x: number;
  y: number;
}

const round = (value: number) => Number(value.toFixed(3));

/**
 * The strongest error correction whose modules stay at least 0.5 mm in the
 * space available: worn or scratched metal benefits from H.
 */
export function chooseQr(share: string, box: number): Omit<PlateQr, 'x' | 'y'> {
  for (const level of ['H', 'Q', 'M', 'L'] as const) {
    const { size } = qrMatrix(share, level);
    const module = box / (size + 2 * QUIET_ZONE);
    if (module >= MIN_QR_MODULE || level === 'L') {
      return { level, size, module: round(module) };
    }
  }
  throw new Error('unreachable');
}

function frontFace(input: PlateInput, ox: number) {
  const { index, total, threshold, setId, share } = input;
  const text: string[] = [];
  const at = (value: string, x: number, y: number, cap: number) =>
    text.push(textToPath(value, { x: ox + x, y, capHeight: cap }));

  at('OFFLINE TOOLS', MARGIN, MARGIN + 2, 2);
  const number = String(index + 1);
  // The share number shrinks with its digits so it never reaches the QR.
  const digits = String(total).length;
  const big = [11, 8, 6][digits - 1];
  const small = [4.5, 3.6, 3][digits - 1];
  at(number, MARGIN, 26, big);
  at(`/${total}`, MARGIN + measureText(number, big) + 1.2, 26, small);
  at('SECRET SHARE', MARGIN, 31.5, 2.2);
  at(`NEEDED ${threshold} OF ${total}`, MARGIN, 42.5, 2.2);
  at(`SET ${setId}`, MARGIN, PLATE_HEIGHT - MARGIN, 2.2);

  const box = PLATE_HEIGHT - 2 * MARGIN;
  const qr = chooseQr(share, box);
  const qrX = ox + PLATE_WIDTH - MARGIN - box + QUIET_ZONE * qr.module;
  const qrY = MARGIN + QUIET_ZONE * qr.module;
  const qrPath = qrMatrixToPath(qrMatrix(share, qr.level), {
    x: qrX,
    y: qrY,
    module: qr.module,
  });
  // Text must stay clear of the QR and its quiet zone.
  const textRight = Math.max(
    ...[
      ['OFFLINE TOOLS', 2],
      ['SECRET SHARE', 2.2],
      [`NEEDED ${threshold} OF ${total}`, 2.2],
      [`SET ${setId}`, 2.2],
    ].map(
      ([value, cap]) => MARGIN + measureText(value as string, cap as number)
    ),
    MARGIN + measureText(number, big) + 1.2 + measureText(`/${total}`, small)
  );
  const quietLeft = qrX - QUIET_ZONE * qr.module - ox;
  if (textRight > quietLeft) {
    throw new Error('Plate text would run into the QR quiet zone');
  }
  return {
    strokes: text.join(''),
    textRight: round(textRight),
    quietLeft: round(quietLeft),
    qr: { ...qr, x: round(qrX), y: round(qrY) },
    qrPath,
  };
}

function backFace(input: PlateInput, ox: number) {
  const { index, total, threshold, share } = input;
  const density = cardDensityFor(share.length);
  if (!density) {
    throw new Error('This share is too long for a plate');
  }
  const cap = CAP_BY_DENSITY[density.name];
  const pitch = cap * 0.75;
  const text: string[] = [];
  const at = (value: string, x: number, y: number, size: number) =>
    text.push(textToPath(value, { x: ox + x, y, capHeight: size }));

  at(`SHARE ${index + 1}/${total}`, MARGIN, MARGIN + 2, 2);
  const format = 'V3 · AES-256-GCM';
  at(format, PLATE_WIDTH - MARGIN - measureText(format, 2), MARGIN + 2, 2);
  const rule = `M${round(ox + MARGIN)} ${MARGIN + 3.6}L${round(ox + PLATE_WIDTH - MARGIN)} ${MARGIN + 3.6}`;

  const first = MARGIN + 3.6 + 2.4 + cap;
  const rowPitch = cap * 1.55;
  const textLeft = MARGIN + 3.5 * pitch;
  shareRows(share, density.groupsPerRow).forEach((row, r) => {
    const y = round(first + r * rowPitch);
    at(String(r + 1).padStart(2, '0'), MARGIN, y, cap);
    row.forEach((group, g) => at(group, textLeft + g * 5 * pitch, y, cap));
  });

  at(
    `KEEP APART · RECOVER WITH ANY ${threshold} OF ${total}`,
    MARGIN,
    PLATE_HEIGHT - MARGIN,
    2
  );
  return { strokes: text.join('') + rule, density };
}

const cutOutline = (ox: number) =>
  `<rect x="${round(ox)}" y="0" width="${PLATE_WIDTH}" height="${PLATE_HEIGHT}" rx="${PLATE_RADIUS}" fill="none" stroke="#FF0000" stroke-width="${CUT_STROKE}"/>`;

export interface Plate {
  svg: string;
  qr: PlateQr;
  density: CardDensity;
}

/** One SVG per share: front (left) and back (right), engrave + cut layers. */
export function buildLaserPlate(input: PlateInput): Plate {
  const backX = PLATE_WIDTH + PLATE_GAP;
  const width = round(PLATE_WIDTH * 2 + PLATE_GAP);
  const front = frontFace(input, 0);
  const back = backFace(input, backX);
  const engrave = `fill="none" stroke="#000" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round"`;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}mm" height="${PLATE_HEIGHT}mm" viewBox="0 0 ${width} ${PLATE_HEIGHT}">`,
    `<!-- Offline Tools, Shamir share ${input.index + 1} of ${input.total}, set ${input.setId}. ID-1 plates (${PLATE_WIDTH} x ${PLATE_HEIGHT} mm) at 1:1. Black: engrave (strokes as lines, the QR as a fill). Red: cut. Engrave the front, flip the plate along its outline, engrave the back. -->`,
    `<g id="front">`,
    `<path id="front-engrave" ${engrave} d="${front.strokes}"/>`,
    `<path id="front-qr" fill="#000" fill-rule="evenodd" stroke="none" data-ecc="${front.qr.level}" data-modules="${front.qr.size}" data-module-mm="${front.qr.module}" d="${front.qrPath}"/>`,
    cutOutline(0),
    `</g>`,
    `<g id="back">`,
    `<path id="back-engrave" ${engrave} d="${back.strokes}"/>`,
    cutOutline(backX),
    `</g>`,
    `</svg>`,
  ].join('\n');

  return { svg, qr: front.qr, density: back.density };
}
