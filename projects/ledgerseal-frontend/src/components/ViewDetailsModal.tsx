import { XMarkIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { copyToClipboard } from '../utils/copyToClipboard'
import { ellipseAddress } from '../utils/ellipseAddress'

interface ViewDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  evidence?: {
    id: string
    fileName: string
    hash: string
    timestamp: string
    owner: string
    status: 'verified' | 'pending'
    transactionId?: string
    block?: number
  }
}

export default function ViewDetailsModal({ isOpen, onClose, evidence }: ViewDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!evidence) return null

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="glass-card max-w-2xl w-full mx-4 p-8"
            role="document"
          >
        <div className="flex items-center justify-between mb-8">
          <h2 id="modal-title" className="text-3xl font-bold text-white">Evidence Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6 text-white/60" />
          </button>
        </div>

        <div className="space-y-6">
          {/* File Name */}
          <div>
            <label className="text-sm text-white/60 font-medium uppercase tracking-widest">File Name</label>
            <div className="mt-2 flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
              <span className="flex-1 font-mono text-white break-all">{evidence.fileName}</span>
              <button
                onClick={() => handleCopy(evidence.fileName, 'fileName')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              >
                {copiedField === 'fileName' ? (
                  <CheckIcon className="w-5 h-5 text-emerald-400" />
                ) : (
                  <DocumentDuplicateIcon className="w-5 h-5 text-white/60 hover:text-white/80" />
                )}
              </button>
            </div>
          </div>

          {/* Full Hash */}
          <div>
            <label className="text-sm text-white/60 font-medium uppercase tracking-widest">SHA-256 Hash</label>
            <div className="mt-2 flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
              <span className="flex-1 font-mono text-white break-all text-sm">{evidence.hash}</span>
              <button
                onClick={() => handleCopy(evidence.hash, 'hash')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              >
                {copiedField === 'hash' ? (
                  <CheckIcon className="w-5 h-5 text-emerald-400" />
                ) : (
                  <DocumentDuplicateIcon className="w-5 h-5 text-white/60 hover:text-white/80" />
                )}
              </button>
            </div>
          </div>

          {/* Owner Wallet */}
          <div>
            <label className="text-sm text-white/60 font-medium uppercase tracking-widest">Owner Wallet</label>
            <div className="mt-2 flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
              <span className="flex-1 font-mono text-white">{ellipseAddress(evidence.owner, 12)}</span>
              <button
                onClick={() => handleCopy(evidence.owner, 'owner')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              >
                {copiedField === 'owner' ? (
                  <CheckIcon className="w-5 h-5 text-emerald-400" />
                ) : (
                  <DocumentDuplicateIcon className="w-5 h-5 text-white/60 hover:text-white/80" />
                )}
              </button>
            </div>
          </div>

          {/* Transaction ID */}
          {evidence.transactionId && (
            <div>
              <label className="text-sm text-white/60 font-medium uppercase tracking-widest">Transaction ID</label>
              <div className="mt-2 flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                <span className="flex-1 font-mono text-white break-all text-sm">{evidence.transactionId}</span>
                <button
                  onClick={() => handleCopy(evidence.transactionId!, 'transactionId')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                >
                  {copiedField === 'transactionId' ? (
                    <CheckIcon className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <DocumentDuplicateIcon className="w-5 h-5 text-white/60 hover:text-white/80" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Block Number */}
          {evidence.block && (
            <div>
              <label className="text-sm text-white/60 font-medium uppercase tracking-widest">Block Number</label>
              <div className="mt-2 p-4 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-white font-mono">{evidence.block.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="text-sm text-white/60 font-medium uppercase tracking-widest">Status</label>
            <div className="mt-2">
              <span
                className={`inline-flex px-4 py-2 rounded-xl font-semibold ${
                  evidence.status === 'verified'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {evidence.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Chain of Custody Preview */}
          <div>
            <label className="text-sm text-white/60 font-medium uppercase tracking-widest">Chain of Custody</label>
            <div className="mt-3 space-y-3">
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-300 font-bold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Original Upload</p>
                    <p className="text-sm text-white/70">{formatTimestamp(evidence.timestamp)}</p>
                  </div>
                </div>
                <div className="ml-11 text-sm text-white/80">
                  <p>Owner: {ellipseAddress(evidence.owner, 12)}</p>
                  {evidence.transactionId && <p>TX: {ellipseAddress(evidence.transactionId, 8)}</p>}
                  {evidence.block && <p>Block: {evidence.block.toLocaleString()}</p>}
                </div>
              </div>

              {/* Placeholder for future custody transfers */}
              <div className="text-center py-4 text-white/50 text-sm">
                <p>No additional custody transfers recorded</p>
                <p className="text-xs mt-1">Future updates will show transfer history here</p>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-8 flex gap-3">
          <button onClick={onClose} className="btn-primary flex-1">
            Close
          </button>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
