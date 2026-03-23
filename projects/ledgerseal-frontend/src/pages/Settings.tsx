import { useWallet } from '@txnlab/use-wallet-react';
import { ellipseAddress } from '../utils/ellipseAddress';
import { useSnackbar } from 'notistack';
import CopyButton from '../components/CopyButton';

export default function Settings() {
  const { activeAddress, wallets } = useWallet();
  const { enqueueSnackbar } = useSnackbar();

  const handleCopyAddress = () => {
    if (!activeAddress) return;
    navigator.clipboard.writeText(activeAddress).then(() => {
      enqueueSnackbar('Wallet address copied to clipboard', { variant: 'success' });
    }).catch(() => {
      enqueueSnackbar('Failed to copy wallet address', { variant: 'error' });
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Settings</h1>

      <section className="glass-card p-5 rounded-xl border border-white/10">
        <h2 className="font-semibold mb-2">Wallet Connection</h2>
        <p className="text-sm text-white/70">{activeAddress ? 'Connected' : 'Not connected'}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="bg-white/10 p-2 rounded-md w-full text-xs font-mono break-all">{activeAddress || 'No address available'}</span>
          {activeAddress && <CopyButton text={activeAddress} label="Copy wallet address" />}
        </div>
      </section>

      <section className="glass-card p-5 rounded-xl border border-white/10">
        <h2 className="font-semibold mb-2">Available Wallets</h2>
        {wallets.length > 0 ? (
          <ul className="list-disc pl-5 text-sm text-white/80">
            {wallets.map((wallet) => (
              <li key={(wallet.id || '').toString()}>{wallet.metadata.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/60">No wallets configured.</p>
        )}
      </section>
    </div>
  );
}

