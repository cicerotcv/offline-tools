import type { DigestPort } from '@/shared/domain/crypto/port';
import { webCryptoDigest } from '@/shared/infra/crypto/digest.web-crypto';

export async function sha256(
  data: Uint8Array,
  digest: DigestPort = webCryptoDigest
): Promise<Uint8Array> {
  return digest.digest('SHA-256', data);
}
