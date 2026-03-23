import { MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { useState, ChangeEvent, useCallback, useEffect } from 'react'
import { useSnackbar } from 'notistack'
import CopyButton from '../components/CopyButton'
import { evidenceAPI } from '../services/api'
import * as z from 'zod'

interface VerificationResult {
  integrity: boolean;
  metadata: boolean;
  chain: boolean;
  trust_score: number;
}

const computeSHA256 = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function Verify() {
  const [evidenceId, setEvidenceId] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [generatedHash, setGeneratedHash] = useState<string>('')
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const onFileSelect = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (selected) {
      setFile(selected)
      setGeneratedHash('')
      setResult(null)
    }
  }, [])

  const onVerify = useCallback(async () => {
    if (!file || !evidenceId.trim()) {
      enqueueSnackbar('Please enter evidence ID and upload a file.', { variant: 'warning' })
      return
    }

    const idSchema = z.string().min(1, 'Evidence ID is required');
    const validation = idSchema.safeParse(evidenceId);
    if (!validation.success) {
      enqueueSnackbar(validation.error.errors[0].message, { variant: 'error' })
      return;
    }

    setLoading(true)
    try {
      const hash = await computeSHA256(file)
      setGeneratedHash(hash)

      // Call backend verification endpoint with file
      const verificationResult = await evidenceAPI.verify(evidenceId, file, { name: file.name, size: file.size })
      setResult(verificationResult)

      enqueueSnackbar(`Verification complete! Trust Score: ${verificationResult.trust_score}%`, {
        variant: verificationResult.integrity ? 'success' : 'warning',
      })
    } catch (error) {
      const errorMsg = (error as Error).message || 'Verification error. Please retry.'
      enqueueSnackbar(errorMsg, { variant: 'error' })
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [file, evidenceId, enqueueSnackbar])

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewUrl('')
  }, [file])

  return (
    <section className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Verify Evidence
        </h1>
        <p className="mt-3 text-white/70 max-w-3xl mx-auto">
          Verify evidence integrity against blockchain records and track verification logs.
        </p>
      </header>

      <div className="glass-card p-8 space-y-4">
        <label className="block text-sm font-medium text-white/80">Evidence ID</label>
        <input
          type="text"
          value={evidenceId}
          onChange={(e) => setEvidenceId(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white/80 placeholder-white/40"
          placeholder="e.g., ev_a1b2c3d4"
        />

        <label className="block text-sm font-medium text-white/80 mt-6">Evidence File</label>
        <input type="file" onChange={onFileSelect} className="w-full p-3 rounded-xl bg-white/5 border border-white/20" />

        {file && (
          <div className="space-y-2">
            <p className="text-sm text-white/70">
              Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
            </p>
            <div className="aspect-video bg-white/5 rounded-xl overflow-hidden">
              <img src={previewUrl} alt="File preview" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        <button type="button" disabled={loading} onClick={onVerify} className="btn-primary w-full">
          {loading ? 'Verifying...' : 'Verify Evidence'}
        </button>

        {result && (
          <div className={`rounded-2xl p-6 space-y-4 ${result.integrity ? 'bg-emerald-500/20 border border-emerald-300/40' : 'bg-rose-500/20 border border-rose-300/40'}`}>
            <div className={`flex items-center gap-2 font-semibold ${result.integrity ? 'text-emerald-200' : 'text-rose-200'}`}>
              {result.integrity ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
              {result.integrity ? '✅ Integrity Verified' : '❌ Integrity Compromised'}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-white/50 mb-1">File Integrity</p>
                <p className="font-semibold text-white">{result.integrity ? 'Valid' : 'Invalid'}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-white/50 mb-1">Metadata Match</p>
                <p className="font-semibold text-white">{result.metadata ? 'Match' : 'Mismatch'}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-white/50 mb-1">Chain Valid</p>
                <p className="font-semibold text-white">{result.chain ? 'Valid' : 'Invalid'}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-white/50 mb-1">Trust Score</p>
                <p className={`font-semibold text-lg ${result.trust_score >= 80 ? 'text-emerald-400' : result.trust_score >= 60 ? 'text-blue-400' : 'text-yellow-400'}`}>
                  {result.trust_score}%
                </p>
              </div>
            </div>

            {generatedHash && (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-xs text-white/60 mb-1">Computed SHA-256:</p>
                  <code className="block break-all font-mono text-xs bg-white/5 p-2 rounded border border-white/10 text-white/80">{generatedHash}</code>
                </div>
                <CopyButton text={generatedHash} label="Copy hash" />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
