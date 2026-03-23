// PDF Certificate gen (mock for MVP)
export async function generateCertificate(evidenceId: string, data: any): Promise<Buffer> {
  return Buffer.from(`Certificate for ${evidenceId}: Trust ${data.trust_score}%`);
}
