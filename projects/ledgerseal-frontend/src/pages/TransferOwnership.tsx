import { useState } from 'react';
import { evidenceAPI } from '../services/api';
import { useWallet } from '@txnlab/use-wallet-react';
import { useSnackbar } from 'notistack';
import CopyButton from '../components/CopyButton';

export default function TransferOwnership() {
  const [evidenceId, setEvidenceId] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastTxn, setLastTxn] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const { activeAddress } = useWallet();

  const handleTransfer = async () => {
    if (!evidenceId.trim() || !newOwner.trim()) {
      enqueueSnackbar('Evidence ID and New Owner wallet are required', { variant: 'warning' });
      return;
    }

    if (!activeAddress) {
      enqueueSnackbar('Connect your wallet before transferring ownership', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const res = await evidenceAPI.transfer(evidenceId.trim(), newOwner.trim());
      setLastTxn(res.txnId);
      enqueueSnackbar(`Transfer successful: ${res.txnId}`, { variant: 'success' });
      setEvidenceId('');
      setNewOwner('');
    } catch (error) {
      enqueueSnackbar('Transfer failed: ' + (error as Error).message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold">Transfer Ownership</h1>
      <p className="text-xs text-white/60">Use this form to move evidence ownership on-chain. Your wallet must be connected.</p>

      <div className="grid grid-cols-1 gap-3">
        <label className="space-y-1">
          <span className="text-sm text-white/70">Evidence ID</span>
          <input
            value={evidenceId}
            onChange={(e) => setEvidenceId(e.target.value)}
            placeholder="e.g. ev_a1b2c3d4"
            className="p-2 border rounded w-full bg-white/5 border-white/20"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-white/70">New Owner Wallet</span>
          <input
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            placeholder="Algorand address"
            className="p-2 border rounded w-full bg-white/5 border-white/20"
          />
        </label>

        <button
          onClick={handleTransfer}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Transferring...' : 'Transfer Ownership'}
        </button>
      </div>

      {lastTxn && (
        <div className="form-card p-4 border rounded-lg bg-white/5 border-white/20">
          <p className="text-sm text-white/70">Last transfer transaction</p>
          <div className="flex items-center justify-between gap-2">
            <code className="text-xs font-mono break-all">{lastTxn}</code>
            <CopyButton text={lastTxn} label="Copy txn ID" />
          </div>
        </div>
      )}
    </div>
  );
}

