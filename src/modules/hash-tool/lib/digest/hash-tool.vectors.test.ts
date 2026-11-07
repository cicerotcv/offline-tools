import { describe, expect, it } from 'vitest';

import { HashTool } from './hash-tool';

// Known-answer tests: SHA-2 from NIST FIPS 180 examples, MD5 from RFC 1321.
// Digests cross-checked with Python hashlib.
const VECTORS = [
  {
    label: 'empty string',
    input: '',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    sha512:
      'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e',
    md5: 'd41d8cd98f00b204e9800998ecf8427e',
  },
  {
    label: '"abc"',
    input: 'abc',
    sha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    sha512:
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    md5: '900150983cd24fb0d6963f7d28e17f72',
  },
  {
    label: '448-bit message',
    input: 'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
    sha256: '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    sha512:
      '204a8fc6dda82f0a0ced7beb8e08a41657c16ef468b228a8279be331a703c33596fd15c13b1b07f9aa1d3bea57789ca031ad85c7a71dd70354ec631238ca3445',
    md5: '8215ef0796a20bcaaae116d3876c664a',
  },
  {
    label: '"message digest"',
    input: 'message digest',
    sha256: 'f7846f55cf23e14eebeab5b4e1550cad5b509e3348fbc4efa3a1413d393cb650',
    sha512:
      '107dbf389d9e9f71a3a95f6c055b9251bc5268c2be16d6c13492ea45b0199f3309e16455ab1e96118e8a905d5597b72038ddb372a89826046de66687bb420e7c',
    md5: 'f96b697d7cb7938d525a2f31aaf161d0',
  },
  {
    label: 'one million "a"',
    input: 'a'.repeat(1_000_000),
    sha256: 'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0',
    sha512:
      'e718483d0ce769644e2e42c7bc15b4638e1f98b13b2044285632a803afa973ebde0ff244877ea60a4cb0432ce577c31beb009c5c2c49aa2e4eadb217ad8cc09b',
    md5: '7707d6ae4e027c70eea2a935c2296f21',
  },
] as const;

const bufferOf = (text: string) =>
  new TextEncoder().encode(text).buffer as ArrayBuffer;

describe('HashTool known-answer tests', () => {
  it.each(VECTORS.map((v) => [v.label, v]))('%s', async (_label, vector) => {
    expect(await HashTool.sha256(bufferOf(vector.input))).toBe(vector.sha256);
    expect(await HashTool.sha512(bufferOf(vector.input))).toBe(vector.sha512);
    expect(await HashTool.md5(bufferOf(vector.input))).toBe(vector.md5);
  });

  it('dispatches by algorithm id', async () => {
    const [, abc] = VECTORS;
    expect(await HashTool.hash(bufferOf(abc.input), 'sha256')).toBe(abc.sha256);
    expect(await HashTool.hash(bufferOf(abc.input), 'sha512')).toBe(abc.sha512);
    expect(await HashTool.hash(bufferOf(abc.input), 'md5')).toBe(abc.md5);
  });

  it('hashes every byte value correctly (binary input, bytes 0x00-0xff)', async () => {
    const allBytes = new Uint8Array(256).map((_, i) => i).buffer;
    expect(await HashTool.md5(allBytes)).toBe(
      'e2c865db4162bed963bfaa9ef6ac18f0'
    );
    expect(await HashTool.sha256(allBytes)).toBe(
      '40aff2e9d2d8922e47afd4648e6967497158785fbd1da870e7110266bf944880'
    );
    expect(await HashTool.sha512(allBytes)).toBe(
      '1e7b80bc8edc552c8feeb2780e111477e5bc70465fac1a77b29b35980c3f0ce4a036a6c9462036824bd56801e62af7e9feba5c22ed8a5af877bf7de117dcac6d'
    );
  });

  it('hashes non-ASCII text as UTF-8 bytes', async () => {
    expect(await HashTool.md5(bufferOf('ação ✓'))).toBe(
      'becf0347a5a810e1da161311f51b9b00'
    );
  });
});
