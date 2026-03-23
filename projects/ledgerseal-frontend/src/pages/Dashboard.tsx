import { useWallet } from '@txnlab/use-wallet-react'
import { ShieldCheckIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

const mockEvidence = [
  {
    id: '1',
    fileName: 'contract.pdf',
    hash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
    timestamp: '2024-01-15T10:30:00Z',
    owner: '0x742d35Cc66C8D7D5aAbA6F0F5eF8e3aA2b1c0d9e',
    status: 'verified' as 'verified' | 'pending'
  },
  {
    id: '2',
    fileName: 'report.docx',
    hash: '0x9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g',
    timestamp: '2024-01-14T14:22:00Z',
    owner: '0x1234567890abcdef1234567890abcdef12345678',
    status: 'pending' as 'verified' | 'pending'
  },
  {
    id: '3',
    fileName: 'evidence.mp4',
    hash: '0xf1e2d3c4b5a69788796a8b9c0d1e2f3a4b5c6d7e',
    timestamp: '2024-01-13T09:15:00Z',
    owner: '0xabcdef1234567890abcdef1234567890abcdef12',
    status: 'verified' as 'verified' | 'pending'
  }
]

interface EvidenceItem {
  id: string
  fileName: string
  hash: string
  timestamp: string
  owner: string
  status: 'verified' | 'pending'
}

export default function Dashboard() {
  const { activeAddress } = useWallet()
  const [evidence, setEvidence] = useState<EvidenceItem[]>([])

  useEffect(() => {
    setEvidence(mockEvidence)
  }, [])

  const getStatusClass = (status: EvidenceItem['status']) => {
    return status === 'verified'
      ? 'status-verified'
      : 'status-pending bg-amber-500/20 text-amber-400 border-amber-500/30'
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString() + ' ' +
           new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  }

  return (
    <>
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
          ChainProof Dashboard
        </h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          Verify digital evidence integrity with blockchain-powered hash verification.
          Your proof is immutable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {evidence.map((item) => (
          <div key={item.id} className="glass-card p-8 hover:-translate-y-2 transition-all duration-500 group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border-2 border-white/20 group-hover:scale-110 transition-all duration-300">
                <ShieldCheckIcon className="w-7 h-7 text-emerald-400" />
              </div>
              <div className={`evidence-status ${getStatusClass(item.status)}`}>
                {item.status.toUpperCase()}
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-3 truncate group-hover:no-underline">
              {item.fileName}
            </h3>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-white/60">
                <ClockIcon className="w-4 h-4" />
                <span>{formatTimestamp(item.timestamp)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span className="font-mono text-xs bg-black/30 px-2 py-1 rounded-lg truncate max-w-[200px]">
                  {item.hash.slice(0, 16)}...
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4
