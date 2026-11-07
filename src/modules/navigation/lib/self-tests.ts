import type { ToolId } from '@/shared/domain/tools';

export interface SelfTest {
  /** Tools sharing a key share one run per page load. */
  key: string;
  run: () => Promise<void>;
}

/*
 * Each run imports its module on demand, so the crypto libraries stay in the
 * tool's own chunk instead of the entry bundle every page downloads.
 */
const bip39: SelfTest = {
  key: 'bip39',
  run: async () => {
    const { makeRunBip39SelfTestUseCase } = await import(
      '@/modules/bip39-tool/application/bip39-tool.factory'
    );
    await makeRunBip39SelfTestUseCase().execute();
  },
};

/** Composition root: which known-answer self-test guards each tool. */
export const SELF_TESTS: Partial<Record<ToolId, SelfTest>> = {
  hash: {
    key: 'hash',
    run: async () => {
      const { makeRunHashSelfTestUseCase } = await import(
        '@/modules/hash-tool/application/hash-tool.factory'
      );
      await makeRunHashSelfTestUseCase().execute();
    },
  },
  encryption: {
    key: 'encryption',
    run: async () => {
      const { makeRunEncryptionSelfTestUseCase } = await import(
        '@/modules/encryption-tool/application/encryption-tool.factory'
      );
      await makeRunEncryptionSelfTestUseCase().execute();
    },
  },
  shamir: {
    key: 'shamir',
    run: async () => {
      const { makeRunShamirSelfTestUseCase } = await import(
        '@/modules/shamir-tool/application/shamir-tool.factory'
      );
      await makeRunShamirSelfTestUseCase().execute();
    },
  },
  'password-generator': {
    key: 'password-generator',
    run: async () => {
      const { makeRunPasswordSelfTestUseCase } = await import(
        '@/modules/password-generator/application/password-generator.factory'
      );
      await makeRunPasswordSelfTestUseCase().execute();
    },
  },
  'seed-generation': bip39,
  'seed-validation': bip39,
  'wallet-recovery': bip39,
  'paper-wallet': bip39,
  'tiny-seed': bip39,
};
