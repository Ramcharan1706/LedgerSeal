import { ArrowRightIcon, ClockIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { evidenceService, ChainEvent } from '../services/evidenceService'
import { evidenceAPI } from '../services/api'
import { ellipseAddress } from '../utils/ellipseAddress'

export default function ChainOfCustody() {
  const [timeline, setTimeline] = useState<ChainEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [evidenceId, setEvidenceId] = useState('')

  const loadCustodyEvents = async (id?: string) => {
    setLoading(true)
    setError(null)
    setTimeline([])

    try {
      let events: ChainEvent[] = []

      if (id) {
        const custodyRecords = await evidenceAPI.history(id)
        events = custodyRecords.map((row: any) => ({
          id: `${row.id}`,
          from: row.from_owner,
          to: row.to_owner,
          timestamp: new Date(row.timestamp * 1000).toISOString(),
          note: `Ownership transfer for ${row.evidence_id}`,
          transactionId: row.txn_id,
          block: undefined,
        }))
      } else {
        events = await evidenceService.fetchChainOfCustody()
      }

      if (events.length === 0 && id) {
        setError('No custody events found for this evidence ID.')
      }

      setTimeline(events)
    } catch (err) {
      console.error('Failed to fetch custody events:', err)
      setError('Failed to load chain of custody. Check network/backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustodyEvents()
  }, [])
  return (
    <section className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Chain of Custody Viewer
        </h1>
        <p className="mt-3 text-white/70 max-w-3xl mx-auto">
          View the trail of custody events for evidence lifecycle transparency and auditability.
        </p>
        <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-3">
          <input
            value={evidenceId}
            onChange={(e) => setEvidenceId(e.target.value)}
            placeholder="Evidence ID (optional)"
            className="w-full md:w-80 p-2 rounded-lg bg-white/10 border border-white/20 text-white"
          />
          <button
            onClick={() => loadCustodyEvents(evidenceId.trim())}
            className="btn-primary"
            disabled={!evidenceId.trim() || loading}
          >
            Load by Evidence ID
          </button>
          <button
            onClick={() => { setEvidenceId(''); loadCustodyEvents() }}
            className="btn-outline"
            disabled={loading}
          >
            Load Recent on-chain
          </button>
        </div>
      </header>

      <div className="glass-card p-8">
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-4"></div>
            <p className="text-white/70">Loading custody events from blockchain...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && timeline.length === 0 && (
          <div className="text-center py-8">
            <UserCircleIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Custody Events Found</h3>
            <p className="text-white/70">
              No custody transfer events found on the blockchain.
            </p>
          </div>
        )}

        {!loading && !error && timeline.length > 0 && (
          <div className="space-y-6">
            {timeline.map((event, index) => (
              <div key={event.id} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                    <UserCircleIcon className="w-5 h-5" />
                  </div>
                  {index !== timeline.length - 1 && <div className="h-full w-[2px] bg-white/20 mt-1" />}
                </div>
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <ClockIcon className="w-4 h-4 text-white/50" />
                    <p className="text-sm text-white/50">{new Date(event.timestamp).toLocaleString()}</p>
                    {event.block && (
                      <span className="text-xs text-white/40">Block #{event.block}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{event.note}</h3>
                  <div className="flex items-center gap-4 text-sm text-white/70">
                    <span className="flex items-center gap-1">
                      From: <span className="font-medium text-cyan-300">{ellipseAddress(event.from, 6)}</span>
                    </span>
                    <ArrowRightIcon className="w-4 h-4" />
                    <span className="flex items-center gap-1">
                      To: <span className="font-medium text-cyan-300">{ellipseAddress(event.to, 6)}</span>
                    </span>
                  </div>
                  {event.transactionId && (
                    <p className="text-xs text-white/40 mt-1">
                      TX: {ellipseAddress(event.transactionId, 8)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
