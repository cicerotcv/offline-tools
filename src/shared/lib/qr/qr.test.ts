import { describe, expect, it, vi } from 'vitest';

import type { QrImagePort } from '@/shared/domain/qr/port';

import {
  DEFAULT_QR_OPTIONS,
  qrMatrix,
  renderQrDataUrl,
  renderQrSvg,
} from './index';

describe('QR facade', () => {
  it('renders a PNG data URL and an SVG with the real adapter', async () => {
    expect(await renderQrDataUrl('bc1qtest')).toMatch(
      /^data:image\/png;base64,/
    );
    expect(await renderQrSvg('bc1qtest')).toContain('<svg');
  });

  it('merges partial options over black-on-white defaults', async () => {
    const qrImage: QrImagePort = {
      toDataUrl: vi.fn(async () => 'data:'),
      toSvg: vi.fn(async () => '<svg/>'),
      toMatrix: vi.fn(() => ({ size: 0, dark: [] })),
    };
    await renderQrDataUrl('x', { width: 400 }, qrImage);
    expect(qrImage.toDataUrl).toHaveBeenCalledWith('x', {
      ...DEFAULT_QR_OPTIONS,
      width: 400,
    });
  });

  it('exposes the module grid with high error correction by default', () => {
    const low = qrMatrix('bc1qtest', 'L');
    const high = qrMatrix('bc1qtest');
    expect(low.dark).toHaveLength(low.size * low.size);
    expect(high.size).toBeGreaterThanOrEqual(low.size);
    // Finder pattern: the top-left 7x7 corner starts with a dark row.
    expect(high.dark.slice(0, 7).every(Boolean)).toBe(true);
  });
});
