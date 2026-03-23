import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { evidenceAPI } from '../services/api';

export default function Certificate() {
  const [evidenceId, setEvidenceId] = useState('');
  const [certificate, setCertificate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [memo, setMemo] = useState<string>('');
  const { enqueueSnackbar } = useSnackbar();

  const generateCert = async () => {
    if (!evidenceId.trim()) {
      enqueueSnackbar('Please enter an evidence ID', { variant: 'warning' });
      return;
    }

    setLoading(true);
    setMemo('');
    setCertificate(null);
    try {
      const arrayBuffer = await evidenceAPI.certificate(evidenceId.trim());
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setCertificate(url);
      setMemo('Certificate generated successfully. Use the links below to view or download.');
      enqueueSnackbar('Certificate generated successfully', { variant: 'success' });
    } catch (error) {
      const msg = (error as Error).message || 'Certificate generation failed';
      enqueueSnackbar(`Certificate generation failed: ${msg}`, { variant: 'error' });
      setMemo(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Generate Evidence Certificate</h1>
      <p className="text-sm text-white/70">Enter an evidence ID to generate a PDF certificate compiled from on-chain data and verification records.</p>
      <input
        value={evidenceId}
        onChange={(e) => setEvidenceId(e.target.value)}
        placeholder="Evidence ID (e.g., ev_a1b2c3d4)"
        className="p-2 border rounded w-full bg-white/5 border-white/20 text-white"
      />
      <button
        onClick={generateCert}
        className="btn-primary"
        disabled={!evidenceId.trim() || loading}
      >
        {loading ? 'Generating...' : 'Generate Certificate'}
      </button>

      {memo && <p className="text-sm text-white/80">{memo}</p>}

      {certificate && (
        <div className="space-y-2">
          <a href={certificate} target="_blank" rel="noopener noreferrer" className="btn-outline">
            Open certificate
          </a>
          <a
            href={certificate}
            download={`certificate-${evidenceId.trim()}.pdf`}
            className="btn-secondary"
          >
            Download certificate
          </a>
        </div>
      )}
    </div>
  );
}

