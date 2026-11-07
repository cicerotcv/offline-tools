import type { BIP32Interface } from 'bip32';
import type { Network } from 'bitcoinjs-lib';
import { Buffer } from 'buffer';

import type { DerivationPath, DerivedKey } from '../../domain/bitcoin/config';
import { ECPair } from '../../infra/bitcoin/secp256k1';
import { ExtendedKeyConverter } from './extended-key-converter';
import { ExtendedKeyParser } from './extended-key-parser';
import { DerivationPathManager } from './paths';
import { PaymentFactory } from './payments';

/**
 * Represents a BIP32 account-level node with its operations
 */
export class BIP32Account {
  private account: BIP32Interface;
  private accountPublic: BIP32Interface;
  private derivationPath: DerivationPath;
  private network: Network;
  private xpub: string;
  private xprv: string;

  constructor(
    root: BIP32Interface,
    derivationPath: DerivationPath,
    network: Network
  ) {
    this.derivationPath = derivationPath;
    this.network = network;
    const accountPath = DerivationPathManager.getAccountPath(
      derivationPath,
      network
    );
    this.account = root.derivePath(accountPath);
    this.accountPublic = this.account.neutered();
    this.xpub = ExtendedKeyConverter.convertToExtendedPublicKey(
      this.accountPublic,
      derivationPath,
      network
    );
    this.xprv = this.account.toBase58();
  }

  /**
   * Creates a BIP32Account from an existing account-level node
   * Used when parsing extended keys that are already at account level
   */
  static fromAccountNode(
    accountNode: BIP32Interface,
    derivationPath: DerivationPath,
    network: Network
  ): BIP32Account {
    const instance = Object.create(BIP32Account.prototype);
    instance.account = accountNode;
    instance.accountPublic = accountNode.neutered();
    instance.derivationPath = derivationPath;
    instance.network = network;
    instance.xpub = ExtendedKeyConverter.convertToExtendedPublicKey(
      instance.accountPublic,
      derivationPath,
      network
    );
    instance.xprv = accountNode.toBase58();
    return instance;
  }

  deriveKey(
    changeIndex: 0 | 1,
    addressIndex: number,
    hasPrivateKey: boolean = true
  ): DerivedKey {
    const change = this.account.derive(changeIndex);
    const child = change.derive(addressIndex);

    const path =
      changeIndex === 0
        ? DerivationPathManager.getReceivingPath(
            this.derivationPath,
            this.network,
            addressIndex
          )
        : DerivationPathManager.getChangePath(
            this.derivationPath,
            this.network,
            addressIndex
          );

    const keyPair = hasPrivateKey
      ? ECPair.fromPrivateKey(child.privateKey!, { network: this.network })
      : null;

    const { address } = PaymentFactory.createPayment(
      this.derivationPath,
      child.publicKey,
      this.network
    );

    if (!address) {
      throw new Error(`Failed to derive address for path ${path}`);
    }

    if (hasPrivateKey && !child.privateKey) {
      throw new Error(`Failed to derive private key for path ${path}`);
    }

    return {
      path,
      address,
      publicKey: Buffer.from(child.publicKey).toString('hex'),
      privateKey:
        hasPrivateKey && child.privateKey
          ? Buffer.from(child.privateKey).toString('hex')
          : '',
      privateKeyWIF: hasPrivateKey && keyPair ? keyPair.toWIF() : '',
      xpub: this.xpub,
      xprv: hasPrivateKey ? this.xprv : undefined,
    };
  }

  deriveKeysForChangeIndex(
    changeIndex: 0 | 1,
    count: number,
    hasPrivateKey: boolean = true
  ): DerivedKey[] {
    const keys: DerivedKey[] = [];
    for (let i = 0; i < count; i++) {
      keys.push(this.deriveKey(changeIndex, i, hasPrivateKey));
    }
    return keys;
  }

  deriveAllKeys(count: number, hasPrivateKey: boolean = true): DerivedKey[] {
    const receiving = this.deriveKeysForChangeIndex(0, count, hasPrivateKey);
    const change = this.deriveKeysForChangeIndex(1, count, hasPrivateKey);
    return [...receiving, ...change];
  }

  getAccount(): BIP32Interface {
    return this.account;
  }

  getAccountPublic(): BIP32Interface {
    return this.accountPublic;
  }

  getXpub(): string {
    return this.xpub;
  }

  getXprv(): string {
    return this.xprv;
  }
}

/**
 * Orchestrates key derivation operations
 */
export class KeyDeriver {
  /**
   * Derives keys from a BIP32 root
   */
  static deriveKeysFromRoot(
    root: BIP32Interface,
    derivationPath: DerivationPath,
    network: Network,
    count: number
  ): DerivedKey[] {
    const account = new BIP32Account(root, derivationPath, network);
    return account.deriveAllKeys(count, true);
  }

  /**
   * Derives keys from an extended private key
   */
  static deriveKeysFromExtendedPrivateKey(
    extendedKey: string,
    network: Network,
    derivationPath: DerivationPath,
    count: number
  ): DerivedKey[] {
    const accountNode = ExtendedKeyParser.parsePrivateKey(
      extendedKey,
      network,
      derivationPath
    );

    if (accountNode.depth === 3) {
      // Already at account level
      const account = BIP32Account.fromAccountNode(
        accountNode,
        derivationPath,
        network
      );
      return account.deriveAllKeys(count, true);
    } else {
      // Root level or intermediate, use standard derivation
      return this.deriveKeysFromRoot(
        accountNode,
        derivationPath,
        network,
        count
      );
    }
  }

  /**
   * Derives addresses from an extended public key (watch-only)
   */
  static deriveKeysFromExtendedPublicKey(
    extendedKey: string,
    network: Network,
    derivationPath: DerivationPath,
    count: number
  ): DerivedKey[] {
    const accountNode = ExtendedKeyParser.parsePublicKey(
      extendedKey,
      network,
      derivationPath
    );
    const accountPublic = accountNode.neutered();

    const keys: DerivedKey[] = [];

    // Receiving addresses (change index 0)
    for (let i = 0; i < count; i++) {
      const changePublic = accountPublic.derive(0);
      const childPublic = changePublic.derive(i);

      const path = DerivationPathManager.getReceivingPath(
        derivationPath,
        network,
        i
      );

      const { address } = PaymentFactory.createPayment(
        derivationPath,
        childPublic.publicKey,
        network
      );

      if (!address) {
        throw new Error(`Failed to derive address at index ${i}`);
      }

      keys.push({
        path,
        address,
        publicKey: Buffer.from(childPublic.publicKey).toString('hex'),
        privateKey: '',
        privateKeyWIF: '',
        xpub: extendedKey,
      });
    }

    // Change addresses (change index 1)
    for (let i = 0; i < count; i++) {
      const changePublic = accountPublic.derive(1);
      const childPublic = changePublic.derive(i);

      const path = DerivationPathManager.getChangePath(
        derivationPath,
        network,
        i
      );

      const { address } = PaymentFactory.createPayment(
        derivationPath,
        childPublic.publicKey,
        network
      );

      if (!address) {
        throw new Error(`Failed to derive change address at index ${i}`);
      }

      keys.push({
        path,
        address,
        publicKey: Buffer.from(childPublic.publicKey).toString('hex'),
        privateKey: '',
        privateKeyWIF: '',
        xpub: extendedKey,
      });
    }

    return keys;
  }

  /**
   * Derives a single key at a specific index
   */
  static deriveSingleKey(
    root: BIP32Interface,
    derivationPath: DerivationPath,
    network: Network,
    index: number = 0
  ): { path: string; address: string; privateKeyWIF: string } {
    const account = new BIP32Account(root, derivationPath, network);
    const key = account.deriveKey(0, index, true);
    return {
      path: key.path,
      address: key.address,
      privateKeyWIF: key.privateKeyWIF,
    };
  }
}
