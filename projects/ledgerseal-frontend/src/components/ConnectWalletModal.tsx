import { XMarkIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'
import Account from './Account'

import { useWallet } from '@txnlab/use-wallet-react'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ellipseAddress } from '../utils/ellipseAddress'

interface ConnectWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { wallets, activeAddress } = useWallet()

  const activeWallet = wallets?.find((w) => w.isActive)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleDisconnect = async () => {
    if (activeWallet) {
      await activeWallet.disconnect()
      onClose()
    }
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
          aria-labelledby="wallet-modal-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="glass-card max-w-md w-full mx-4 p-8"
            role="document"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 id="wallet-modal-title" className="text-2xl font-bold text-white">Wallet</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close wallet modal"
              >
                <XMarkIcon className="w-6 h-6 text-white/60" />
              </button>
            </div>

            {activeAddress ? (
              <div className="space-y-6">

                <div>
                  <p className="text-sm text-white/60 font-medium uppercase tracking-widest mb-3">Connected Wallet</p>
                  <Account />
                </div>


                <button
                  onClick={handleDisconnect}
                  className="btn-outline w-full flex items-center justify-center gap-2"
                >
                  <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {wallets?.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={async () => {
                      await wallet.connect()
                      onClose()
                    }}
                    className="w-full p-4 flex items-center gap-3 bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/40 rounded-xl transition-all duration-300 group"
                  >
                    {wallet.metadata.icon && (
                      <img
                        src={wallet.metadata.icon}
                        alt={wallet.metadata.name}
                        className="w-6 h-6 object-contain"
                      />
                    )}
                    <span className="text-white font-medium">{wallet.metadata.name}</span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full mt-6 p-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
