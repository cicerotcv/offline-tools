import * as bitcoin from 'bitcoinjs-lib';
import type { Network } from 'bitcoinjs-lib';

import type { RandomPort } from '@/shared/domain/crypto/port';
import { webCryptoRandom } from '@/shared/infra/crypto/random.web-crypto';

import type { DerivationPath } from '../../domain/bitcoin/config';
import { ECPair } from '../../infra/bitcoin/secp256k1';
import { encryptPrivateKeyBIP38 } from '../bip38/bip38-encryption';
import { deriveBIP32Root, KeyDeriver } from '../derivation/key-derivation';
import { PaymentFactory } from '../derivation/payments';
import { bytesToHex } from '../mnemonic/bip39-generator';

export type AddressType = 'legacy' | 'segwit' | 'native';

export interface PaperWalletResult {
  address: string;
  privateKeyWIF: string;
  encryptedPrivateKey: string | null;
  path: string;
  network: 'mainnet' | 'testnet' | 'regtest';
  seedHex: string;
}

/** @deprecated Use PaperWalletResult */
export type PaperWallet = PaperWalletResult;

export interface PaperWalletDeps {
  random: RandomPort;
}

const defaultPaperWalletDeps: PaperWalletDeps = {
  random: webCryptoRandom,
};

function getSeedFromEntropy(random: RandomPort): Uint8Array {
  const entropy = new Uint8Array(32);
  random.getRandomValues(entropy);
  const seed = new Uint8Array(64);
  seed.set(entropy, 0);
  const additionalEntropy = new Uint8Array(32);
  random.getRandomValues(additionalEntropy);
  seed.set(additionalEntropy, 32);
  return seed;
}

function getNetworkLabel(network: Network): PaperWalletResult['network'] {
  if (network === bitcoin.networks.bitcoin) {
    return 'mainnet';
  }
  if (network === bitcoin.networks.regtest) {
    return 'regtest';
  }
  return 'testnet';
}

function deriveKeyFromSeed(
  seed: Uint8Array,
  network: Network,
  addressType: AddressType,
  index: number = 0
): { path: string; address: string; privateKeyWIF: string } {
  const root = deriveBIP32Root(seed, network);
  const derivationPath =
    addressType === 'native'
      ? 'bip84'
      : addressType === 'segwit'
        ? 'bip49'
        : 'bip44';

  return KeyDeriver.deriveSingleKey(root, derivationPath, network, index);
}

export async function generatePaperWallet(
  options: {
    network: Network;
    addressType: AddressType;
    passphrase: string;
    index?: number;
  },
  deps: PaperWalletDeps = defaultPaperWalletDeps
): Promise<PaperWalletResult> {
  const { network, addressType, passphrase, index = 0 } = options;

  const seed = getSeedFromEntropy(deps.random);
  const { path, address, privateKeyWIF } = deriveKeyFromSeed(
    seed,
    network,
    addressType,
    index
  );

  let encryptedPrivateKey: string | null = null;
  if (passphrase.trim()) {
    encryptedPrivateKey = await encryptPrivateKeyBIP38(
      privateKeyWIF,
      passphrase,
      network
    );
  }

  return {
    address,
    privateKeyWIF,
    encryptedPrivateKey,
    path,
    network: getNetworkLabel(network),
    seedHex: bytesToHex(seed),
  };
}

const SCHEME_BY_ADDRESS_TYPE: Record<AddressType, DerivationPath> = {
  legacy: 'bip44',
  segwit: 'bip49',
  native: 'bip84',
};

/** Address controlled by a WIF private key, for the given address type. */
export function addressFromWIF(
  wif: string,
  network: Network,
  addressType: AddressType
): string {
  const { publicKey } = ECPair.fromWIF(wif, network);
  const { address } = PaymentFactory.createPayment(
    SCHEME_BY_ADDRESS_TYPE[addressType],
    publicKey,
    network
  );
  if (!address) throw new Error('Could not derive an address from the key');
  return address;
}
