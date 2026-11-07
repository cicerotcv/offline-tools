export { reconstructSecret, splitSecret } from './shamir';
export type { ReconstructResult, ShamirShare } from './shamir';
export {
  assertSameSplit,
  GCM_TAG_LENGTH,
  openSharesV3,
  SET_ID_LENGTH,
  splitSecretV3,
  v3Header,
} from './v3';
export type { OpenResult, ShamirShareV3 } from './v3';
