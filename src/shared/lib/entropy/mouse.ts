import type { DigestPort } from '@/shared/domain/crypto/port';
import { webCryptoDigest } from '@/shared/infra/crypto/digest.web-crypto';

export interface PointerSample {
  x: number;
  y: number;
  timestamp: number;
}

const BYTES_PER_SAMPLE = 24; // x, y, timestamp as Float64

/**
 * Serializes pointer samples as Float64 (Float32 would drop most of the
 * precision of millisecond timestamps) and hashes them to 32 bytes.
 */
export async function mouseEntropyFromSamples(
  samples: readonly PointerSample[],
  digest: DigestPort = webCryptoDigest
): Promise<Uint8Array> {
  if (samples.length === 0) {
    throw new Error('Mouse position data is required');
  }

  const data = new Uint8Array(samples.length * BYTES_PER_SAMPLE);
  const view = new DataView(data.buffer);
  samples.forEach((sample, index) => {
    const offset = index * BYTES_PER_SAMPLE;
    view.setFloat64(offset, sample.x, true);
    view.setFloat64(offset + 8, sample.y, true);
    view.setFloat64(offset + 16, sample.timestamp, true);
  });

  return digest.digest('SHA-256', data);
}
