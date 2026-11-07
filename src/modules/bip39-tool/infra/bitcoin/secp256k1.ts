import { BIP32Factory } from 'bip32';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';

/**
 * secp256k1-bound factories, created once. tiny-secp256k1 is WASM with a
 * top-level await, so every consumer shares these instances.
 */
export const bip32 = BIP32Factory(ecc);
export const ECPair = ECPairFactory(ecc);
