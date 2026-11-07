import { describe, expect, it } from 'vitest';

import { downloadBlob, type DownloadEnv, downloadText } from './download';

function fakeEnv() {
  const calls: string[] = [];
  const blobs: Blob[] = [];
  const env: DownloadEnv = {
    createObjectURL: (blob) => {
      blobs.push(blob);
      calls.push('create');
      return 'blob:1';
    },
    clickLink: (href, filename) => calls.push(`click ${href} ${filename}`),
    revokeObjectURL: (url) => calls.push(`revoke ${url}`),
  };
  return { env, calls, blobs };
}

describe('download', () => {
  it('saves text with the given name and content, then revokes the URL', async () => {
    const { env, calls, blobs } = fakeEnv();
    downloadText('shares.txt', 'a\nb', undefined, env);
    expect(calls).toEqual([
      'create',
      'click blob:1 shares.txt',
      'revoke blob:1',
    ]);
    expect(await blobs[0].text()).toBe('a\nb');
    expect(blobs[0].type).toContain('text/plain');
  });

  it('revokes the URL even when the click throws', () => {
    const { env, calls } = fakeEnv();
    env.clickLink = () => {
      throw new Error('blocked');
    };
    expect(() => downloadBlob('x.bin', new Blob(['x']), env)).toThrow(
      'blocked'
    );
    expect(calls).toContain('revoke blob:1');
  });
});
