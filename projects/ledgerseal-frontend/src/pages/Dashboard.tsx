import { useWallet } from '@txnlab/use-wallet-react'
import { ShieldCheckIcon, EyeIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { evidenceAPI } from '../services/api';
import { useSnackbar } from 'notistack'
import { ellipseAddress } from '../utils/ellipseAddress'

type EvidenceStatus = 'verified' | 'pending'

interface EvidenceItem {
  id: string
  fileName: string
  hash: string
  timestamp: string
  owner: string
  status: EvidenceStatus
}

// Mock replaced by API - add GET /api/evidence/list endpoint later
const mockEvidence: EvidenceItem[] = []; // Load from backend

const formatTimestamp = (iso: string) => {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const shorten = (value: string, front = 8, back = 6) => {
  if (value.length <= front + back) return value
  return `${value.slice(0, front)}...${value.slice(-back)}`
}

export default function Dashboard() {
  const { activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  const { data: apiEvidence = [], isLoading } = useQuery({
    queryKey: ['evidence'],
    queryFn: () => evidenceAPI.list(),
  });

  const evidence: EvidenceItem[] = (apiEvidence as any[]).map((e: any) => ({
    id: e.id,
    fileName: e.metadata?.name || 'Evidence',
    hash: e.file_hash,
    timestamp: new Date(e.timestamp * 1000).toISOString(),
    owner: e.owner,
    status: 'verified' as EvidenceStatus
  }));

  const handleViewDetails = (item: EvidenceItem) => {
    enqueueSnackbar(`Opening details for ${item.fileName}`)
    navigate(`/detail/${item.id}`)
  }

  return (
    <section className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          ChainProof Dashboard
        </h1>
        <p className="mt-3 text-white/70 max-w-3xl mx-auto">
          Blockchain-based evidence verification for security teams. Track proof, status, and custody from one place.
        </p>
        <p className="mt-1 text-sm text-white/50">
          Wallet: {activeAddress ? ellipseAddress(activeAddress, 6) : 'Not connected'}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-12 bg-white/10 rounded-lg mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
              </div>
              <div className="h-10 bg-white/10 rounded-lg mt-4 w-full"></div>
            </div>
          ))
        ) : evidence.length === 0 ? (
          <div className="glass-card p-12 text-center col-span-full">
            <ShieldCheckIcon className="mx-auto h-16 w-16 text-white/40 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No evidence yet</h3>
            <p className="text-white/60 mb-6">Upload your first evidence to get started.</p>
            <a href="/upload" className="btn-primary">Upload Evidence</a>
          </div>
        ) : (
          evidence.map((item) => (
            <article key={item.id} className="glass-card p-6 border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30">
                    <DocumentTextIcon className="w-5 h-5 text-cyan-300" />
                  </div>
                  <h2 className="text-xl font-semibold truncate">{item.fileName}</h2>
                </div>
                <span className={`evidence-status ${item.status === 'verified' ? 'status-verified' : 'status-pending'}`}>
                  {item.status.toUpperCase()}
                </span>
              </div>
              <ul className="space-y-2 text-sm text-white/70 mb-5">
                <li className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" /> {formatTimestamp(item.timestamp)}
                </li>
                <li className="flex items-center gap-2">Owner: {ellipseAddress(item.owner, 8)}</li>
                <li className="flex items-center gap-2">Hash: {shorten(item.hash, 10, 8)}</li>
              </ul>
              <button
                type="button"
                onClick={() => handleViewDetails(item)}
                className="btn-primary w-full justify-center"
              >
                <EyeIcon className="w-4 h-4" />
                View Details
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
