import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowUpTrayIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, DocumentIcon, LinkIcon } from '@heroicons/react/24/outline';
import { useWallet } from '@txnlab/use-wallet-react';
import { useSnackbar } from 'notistack';
import CopyButton from '../components/CopyButton';
import { evidenceAPI } from '../services/api';
import { useAlgoPayment } from '../utils/algoPayment';

type Step = 'file' | 'hash' | 'payment' | 'backend' | 'success' | 'error';

const computeSHA256 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function Upload() {
  const [step, setStep] = useState<Step>('file');
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState('');
  const [txnId, setTxnId] = useState('');
  const [evidenceId, setEvidenceId] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { activeAddress, isReady } = useWallet();
  const { sendPayment, loading: paymentLoading } = useAlgoPayment();
  const { enqueueSnackbar } = useSnackbar();

  const reset = () => {
    setStep('file');
    setFile(null);
    setHash('');
    setTxnId('');
    setEvidenceId('');
    setPreviewUrl('');
    setIsProcessing(false);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.size <= 10 * 1024 * 1024) {
      setFile(droppedFile);
    } else {
      enqueueSnackbar('File too large (max 10MB)', { variant: 'error' });
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) {
      setFile(selectedFile);
    } else {
      enqueueSnackbar('File too large (max 10MB)', { variant: 'error' });
    }
  };

  const generateHash = useCallback(async () => {
    if (!file) return;
    try {
      setIsProcessing(true);
      const fileHash = await computeSHA256(file);
      setHash(fileHash);
      setStep('hash');
    } catch (error) {
      enqueueSnackbar('Hash generation failed', { variant: 'error' });
      setStep('error');
    } finally {
      setIsProcessing(false);
    }
  }, [file, enqueueSnackbar]);

  const processPayment = useCallback(async () => {
    if (!activeAddress || !hash || !file) {
      enqueueSnackbar('Wallet not connected or missing data', { variant: 'error' });
      return;
    }

    try {
      setIsProcessing(true);
      const result = await sendPayment({
        note: `ledgerseal:register:${hash}`,
        amount: 1000000,
        receiver: '2ZTFJNDXPWDETGJQQN33HAATRHXZMBWESKO2AUFZUHERH2H3TG4XTNPL4Y',
        waitForConfirmation: false,
      });

      if (!result.success || !result.txId) {
        throw new Error(result.error || 'Payment failed');
      }

      setTxnId(result.txId);
      setStep('payment');
      enqueueSnackbar(`Payment TX: ${result.txId.slice(0, 8)}...`, { variant: 'success' });
    } catch (error: any) {
      console.error('Payment error:', error);
      enqueueSnackbar(`Payment failed: ${error.message}`, { variant: 'error' });
      setStep('error');
    } finally {
      setIsProcessing(false);
    }
  }, [activeAddress, hash, file, sendPayment, enqueueSnackbar]);

  const uploadToBackend = useCallback(async () => {
    if (!activeAddress || !file || !hash || !txnId) return;

    try {
      setIsProcessing(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('txnId', txnId);
      formData.append('hash', hash);
      formData.append('owner', activeAddress);
      formData.append('metadata', JSON.stringify({ name: file.name, size: file.size }));

      const response = await evidenceAPI.register(formData);

      setEvidenceId(response.evidenceId || '');
      setStep('success');

      enqueueSnackbar('✅ Evidence secured on blockchain!', { variant: 'success' });
    } catch (error: any) {
      console.error('Backend upload error:', error);
      enqueueSnackbar(`Backend error: ${error.message}`, { variant: 'error' });
      setStep('error');
    } finally {
      setIsProcessing(false);
    }
  }, [activeAddress, file, hash, txnId, enqueueSnackbar]);

  const handleNext = useCallback(() => {
    switch (step) {
      case 'file':
        return generateHash();
      case 'hash':
        return processPayment();
      case 'payment':
        return uploadToBackend();
      default:
        return;
    }
  }, [step, generateHash, processPayment, uploadToBackend]);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const getExplorerLink = (id: string) => `https://testnet.algoexplorer.io/tx/${id}`;

  const StepIndicator = ({ current }: { current: Step }) => (
    <div className="flex items-center space-x-2 mb-6">
      {(['file', 'hash', 'payment', 'backend', 'success'] as Step[]).map(s => {
        const stepIndex = ['file', 'hash', 'payment', 'backend', 'success'].indexOf(s);
        const currentIndex = ['file', 'hash', 'payment', 'backend', 'success'].indexOf(current);
        let bgClass = 'bg-gray-300';
        let textClass = '';
        if (stepIndex === currentIndex) {
          bgClass = 'bg-blue-500';
          textClass = 'text-white';
        } else if (stepIndex < currentIndex) {
          bgClass = 'bg-green-500';
          textClass = 'text-white';
        }
        return (
          <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${bgClass} ${textClass}`}>
            {stepIndex + 1}
          </div>
        );
      })}
    </div>
  );

  // ✅ FIXED: Buttons for file selected state
  const FileSelectedButtons = () => (
    <div className="flex gap-4">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 rounded-2xl font-semibold hover:from-gray-500 hover:to-gray-600 transition-all shadow-lg"
      >
        Change File
      </button>
      <button
        onClick={generateHash}
        disabled={isProcessing}
        className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <ClockIcon className="w-5 h-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          '🔐 Generate Hash & Pay'
        )}
      </button>
    </div>
  );

  const SuccessContent = () => (
    <div className="text-center p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-2xl">
      <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6 animate-bounce" />
      <h2 className="text-3xl font-bold text-green-800 mb-4">Evidence Secured!</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">Your file is now permanently timestamped and tamper-proof on Algorand blockchain</p>

      {evidenceId && (
        <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 mb-6 max-w-md mx-auto">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Your Evidence ID</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg font-mono text-xl font-bold text-green-800 border-2 border-emerald-200 min-h-[4rem] flex items-center justify-center break-all">
              {evidenceId}
            </code>
            <CopyButton text={evidenceId} size="lg" className="bg-emerald-500 hover:bg-emerald-600 shadow-md" />
          </div>
        </div>
      )}

      {hash && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4 max-w-md mx-auto">
          <p className="text-xs font-medium text-gray-500 mb-1">SHA256 Fingerprint</p>
          <code className="text-xs font-mono text-gray-700 block bg-gray-50 p-2 rounded truncate">{hash}</code>
        </div>
      )}

      <div className="space-y-3 mb-8">
        {txnId && (
          <a
            href={getExplorerLink(txnId)}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all font-semibold text-center shadow-lg"
          >
            🔗 View Payment Transaction on Explorer
          </a>
        )}
      </div>

      <button
        onClick={reset}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
      >
        📁 Upload New Evidence
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-black text-center mb-16 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent drop-shadow-2xl">
          🔒 LedgerSeal Upload
        </h1>

        <StepIndicator current={step} />

        {step === 'file' && (
          <div className={`border-4 border-dashed p-16 text-center rounded-3xl shadow-xl transition-all hover:shadow-2xl cursor-pointer group ${
            dragActive ? 'border-blue-400 bg-blue-50 ring-4 ring-blue-100' : 'border-gray-300 bg-white/60 hover:border-blue-400'
          }`}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragLeave={() => setDragActive(false)}
          >
            <ArrowUpTrayIcon className="w-24 h-24 mx-auto mb-8 text-gray-400 group-hover:text-blue-500 transition-all duration-300" />
            <h3 className="text-2xl lg:text-3xl font-black mb-4 text-gray-800">Drop your evidence file</h3>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Drag & drop or click • Max 10MB • SHA256 verified • Algorand timestamped
            </p>
            <input ref={fileInputRef} type="file" onChange={onFileSelect} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-12 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
            >
              Choose File
            </button>
          </div>
        )}

        {/* ✅ FIXED: Always show file preview + buttons when file selected */}
        {file && step === 'file' && (
          <div className="space-y-6">
            <div className="p-8 bg-white rounded-3xl shadow-2xl border-2 border-blue-100">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                <DocumentIcon className="w-20 h-20 text-emerald-500 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1 truncate">{file.name}</h3>
                  <p className="text-xl text-gray-600">{formatBytes(file.size)}</p>
                </div>
              </div>
              {previewUrl && (
                <img src={previewUrl} className="mt-8 w-full max-h-80 object-cover rounded-2xl shadow-xl border-4 border-white" alt="Preview" />
              )}
            </div>
            <FileSelectedButtons />
          </div>
        )}

        {hash && step === 'hash' && (
          <div className="p-8 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-3xl border-4 border-yellow-200 shadow-2xl mb-8">
            <h3 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center gap-3 justify-center">
              <CheckCircleIcon className="w-8 h-8" />
              File Fingerprint Generated
            </h3>
            <div className="flex items-center gap-4 p-6 bg-yellow-100 rounded-2xl">
              <code className="flex-1 font-mono text-lg font-semibold text-yellow-900 break-all">{hash}</code>
            </div>
            <FileSelectedButtons />
          </div>
        )}

        {step === 'success' && <SuccessContent />}

        {step === 'error' && (
          <div className="text-center p-16 bg-gradient-to-r from-rose-50 to-red-50 border-4 border-red-200 rounded-3xl shadow-2xl">
            <ExclamationTriangleIcon className="w-28 h-28 text-red-500 mx-auto mb-8 animate-pulse" />
            <h3 className="text-3xl font-bold text-red-800 mb-6">Upload Failed</h3>
            <p className="text-xl text-gray-600 mb-12 max-w-lg mx-auto leading-relaxed">
              Something went wrong during processing. Please try again.
            </p>
            <button
              onClick={reset}
              className="w-full max-w-md mx-auto bg-gradient-to-r from-red-500 to-rose-600 text-white px-12 py-6 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
            >
              🔄 Try Again
            </button>
          </div>
        )}

        {/* Other step buttons */}
        {step !== 'file' && step !== 'success' && step !== 'error' && (
          <div className="flex gap-6">
            <button
              onClick={reset}
              className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-5 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all"
            >
              ← Back to Files
            </button>
            <button
              onClick={handleNext}
              disabled={isProcessing || paymentLoading || !isReady}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-5 rounded-2xl font-bold shadow-xl hover:shadow-2xl disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              {isProcessing || paymentLoading ? (
                <>
                  <ClockIcon className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : step === 'payment' ? (
                '🗄️ Store Evidence'
              ) : (
                'Continue →'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

