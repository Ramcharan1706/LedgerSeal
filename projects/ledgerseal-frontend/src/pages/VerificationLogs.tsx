import { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { evidenceAPI } from '../services/api';

interface VerificationLog {
  id: number;
  evidence_id: string;
  trust_score: number;
  result: string;
  timestamp: number;
}

const getTrustColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-500/20 border-emerald-300/30 text-emerald-200';
  if (score >= 60) return 'bg-blue-500/20 border-blue-300/30 text-blue-200';
  if (score >= 40) return 'bg-yellow-500/20 border-yellow-300/30 text-yellow-200';
  return 'bg-red-500/20 border-red-300/30 text-red-200';
};

const getTrustIcon = (score: number) => {
  if (score >= 80) return <CheckCircleIcon className="w-5 h-5 text-emerald-400" />;
  if (score >= 60) return <SparklesIcon className="w-5 h-5 text-blue-400" />;
  return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function VerificationLogs() {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'low'>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await evidenceAPI.logs();
        setLogs(res || []);
      } catch (err) {
        setError((err as Error).message || 'Failed to load verification logs');
        console.error('Error fetching logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'high') return log.trust_score >= 80;
    if (filter === 'low') return log.trust_score < 80;
    return true;
  });

  const avgTrustScore = logs.length > 0
    ? Math.round(logs.reduce((sum, log) => sum + log.trust_score, 0) / logs.length)
    : 0;

  return (
    <section className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Verification Logs
        </h1>
        <p className="mt-3 text-white/70 max-w-3xl mx-auto">
          Track verification history and trust scores for all evidence in the system.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 text-center">
          <p className="text-white/60 text-sm mb-2">Total Verifications</p>
          <p className="text-3xl font-bold text-cyan-400">{logs.length}</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-white/60 text-sm mb-2">Average Trust Score</p>
          <p className={`text-3xl font-bold ${avgTrustScore >= 80 ? 'text-emerald-400' : avgTrustScore >= 60 ? 'text-blue-400' : 'text-yellow-400'}`}>
            {avgTrustScore}%
          </p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-white/60 text-sm mb-2">High Trust (≥80%)</p>
          <p className="text-3xl font-bold text-emerald-400">
            {logs.filter(log => log.trust_score >= 80).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'high', 'low'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === f
                ? 'bg-cyan-500 text-black'
                : 'glass-card text-white/70 hover:text-white/90'
            }`}
          >
            {f === 'all' ? 'All' : f === 'high' ? 'High Trust' : 'Low Trust'}
          </button>
        ))}
      </div>

      {/* Logs */}
      <div className="space-y-3">
        {loading && (
          <div className="glass-card p-8 text-center">
            <div className="inline-block w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-white/60 mt-3">Loading verification logs...</p>
          </div>
        )}

        {error && !loading && (
          <div className="glass-card p-6 border border-red-300/30 bg-red-500/10">
            <p className="text-red-200">
              <span className="font-medium">Error:</span> {error}
            </p>
          </div>
        )}

        {!loading && !error && filteredLogs.length === 0 && (
          <div className="glass-card p-8 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60">
              {filter === 'all'
                ? 'No verification logs found'
                : filter === 'high'
                ? 'No high trust verifications found'
                : 'No low trust verifications found'}
            </p>
          </div>
        )}

        {!loading && !error && filteredLogs.map((log) => (
          <div key={log.id} className="glass-card p-6 hover:bg-white/5 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getTrustIcon(log.trust_score)}
                  <p className="font-mono text-sm text-cyan-300">{log.evidence_id}</p>
                </div>
                <p className="text-xs text-white/50">
                  {formatDate(log.timestamp)}
                </p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${getTrustColor(log.trust_score)}`}>
                  <span className="font-bold">{log.trust_score}%</span>
                </div>
              </div>
            </div>

            {log.result && (
              <p className="mt-3 text-sm text-white/70 text-left">
                <span className="text-white/50">Result: </span>
                {log.result}
              </p>
            )}

            {/* Trust score bar */}
            <div className="mt-3 w-full bg-white/10 rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all ${
                  log.trust_score >= 80
                    ? 'bg-emerald-500'
                    : log.trust_score >= 60
                    ? 'bg-blue-500'
                    : log.trust_score >= 40
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${log.trust_score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

