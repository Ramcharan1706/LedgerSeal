import crypto from 'crypto';

export function computeHashes(buffer: Buffer) {
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  const sha3 = crypto.createHash('sha3-256').update(buffer).digest('hex');
  return { sha256, blake2b: sha3 };
}

export function hashMetadata(metadata: object): string {
  return crypto.createHash('sha256').update(JSON.stringify(metadata)).digest('hex');
}
