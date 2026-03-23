import { ArrowUpTrayIcon, CloudArrowUpIcon, DocumentTextIcon, CheckCircleIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { useState, DragEvent, ChangeEvent, useCallback, useEffect } from 'react'
import { useSnackbar } from 'notistack'
import CopyButton from '../components/CopyButton'
import { copyToClipboard } from '../utils/copyToClipboard'
import { evidenceAPI } from '../services/api'
import { useWallet } from '@txnlab/use-wallet-react'
import * as z from 'zod'

type Status = 'idle' | 'processing' | 'stored'

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const computeSHA256 = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileHash, setFileHash] = useState<string>('')
  const [evidenceId, setEvidenceId] = useState<string>('')
  const [status, setStatus] = useState<Status>('idle')
  const [previewUrl, setPreviewUrl] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { activeAddress } = useWallet()

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(true)
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files[0]
    if (file) setSelectedFile(file)
  }

  const onFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    if (file) setSelectedFile(file)
  }, [])

  const handleGenerateAndStore = useCallback(async () => {
    if (!selectedFile) {
      enqueueSnackbar('Please choose a file first.', { variant: 'warning' })
      return
    }

    if (!activeAddress) {
      enqueueSnackbar('Please connect your wallet first.', { variant: 'warning' })
      return
    }

    const schema = z.object({
      size: z.number().max(10 * 1024 * 1024, 'File too large (max 10MB)')
    });
    const validation = schema.safeParse({ size: selectedFile.size });
    if (!validation.success) {
      enqueueSnackbar(validation.error.errors[0].message, { variant: 'error' })
      return;
    }

    setStatus('processing')
    try {
      const hash = await computeSHA256(selectedFile)
      setFileHash(hash)

      // Submit to backend API
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('metadata', JSON.stringify({ name: selectedFile.name, size: selectedFile.size }))
      formData.append('owner', activeAddress!)

      const response = await evidenceAPI.register(formData)
      const transactionId = response?.txnId || 'unknown'

      await new Promise((resolve) => setTimeout(resolve, 1200))
      setStatus('stored')

      setEvidenceId(response?.evidenceId || '')

      if (response?.isExisting) {
        enqueueSnackbar(`Evidence already registered! ID: ${response.evidenceId}. TX: ${transactionId}`, { variant: 'info' })
      } else {
        enqueueSnackbar(`Evidence stored on blockchain! ID: ${response.evidenceId}. TX: ${transactionId}`, { variant: 'success' })
      }
    } catch (error) {
      const errorMsg = (error as Error).message || 'Unknown error';
      console.error('Upload error details:', error);
      enqueueSnackbar(`Error: ${errorMsg}`, { variant: 'error' })
      setStatus('idle')
      setEvidenceId('')
    }
  }, [selectedFile, activeAddress, enqueueSnackbar])

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
    setPreviewUrl('')
  }, [selectedFile])

  return (
    <section className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Upload Evidence
        </h1>
        <p className="mt-3 text-white/70 max-w-3xl mx-auto">
          Drag and drop verified evidence, generate a blockchain hash, and store immutably.
        </p>
      </header>

      <div
        onDragOver={onDragOver}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={`glass-card border-dashed border-2 ${dragActive ? 'border-cyan-400 bg-cyan-300/10' : 'border-white/30'} p-8 text-center transition-all duration-300`}
      >
        <CloudArrowUpIcon className="mx-auto h-14 w-14 text-cyan-300 mb-4" />
        <p className="text-lg text-white/80">Drag & drop evidence here</p>
        <p className="text-sm text-white/60 mb-5">or choose a file from your device</p>
        <input type="file" onChange={onFileSelect} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="btn-outline inline-flex items-center justify-center gap-2 cursor-pointer">
          <ArrowUpTrayIcon className="w-4 h-4" />
          Select File
        </label>
      </div>

      {selectedFile && (
        <div className="glass-card p-6 space-y-3">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="w-6 h-6 text-blue-300" />
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-white/60">{formatBytes(selectedFile.size)}</p>
            </div>
          </div>

          {previewUrl && (
            <div className="aspect-video bg-white/5 rounded-xl overflow-hidden">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerateAndStore}
            className="btn-primary w-full"
            disabled={status === 'processing'}
          >
            <span className="flex items-center gap-2">
              {status === 'processing' ? <span className="spinner-border inline-block w-4 h-4 border-2 border-white/40 rounded-full animate-spin" /> : <CheckCircleIcon className="w-5 h-5" />}
              Generate Hash & Store on Blockchain
            </span>
          </button>

          {fileHash && (
            <div className="rounded-2xl border border-white/20 p-4 bg-black/20 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-300" />
                <span className="text-sm text-emerald-200">SHA-256 hash generated</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 block break-all text-xs text-white/90 font-mono">{fileHash}</code>
                <CopyButton text={fileHash} label="Copy hash" />
              </div>
            </div>
          )}

          {status === 'stored' && (
            <div className="rounded-xl bg-emerald-500/20 border border-emerald-300/30 p-3 text-sm font-medium space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-300" />
                <span>Evidence successfully stored on blockchain!</span>
              </div>
              {evidenceId && (
                <div className="flex items-center justify-between bg-white/10 rounded-lg p-2">
                  <span className="text-xs text-cyan-100 font-mono break-all">Evidence ID: {evidenceId}</span>
                  <CopyButton text={evidenceId} label="Copy evidence ID" />
                </div>
              )}
              <p className="text-xs text-white/70">
                Your evidence is now immutably recorded and can be verified by anyone.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
 }
