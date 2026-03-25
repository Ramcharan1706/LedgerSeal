import crypto from 'crypto';

export function computeHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function computeHashes(buffer: Buffer): { sha256: string; blake2b: string } {
  return {
    sha256: computeHash(buffer),
    blake2b: crypto.createHash('blake2b512').update(buffer).digest('hex'),
  };
}

export function hashMetadata(metadata: object): string {
  return crypto.createHash('sha256').update(JSON.stringify(metadata)).digest('hex');
}

