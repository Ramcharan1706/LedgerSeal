import { DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { copyToClipboard } from '../utils/copyToClipboard'

interface CopyButtonProps {
  text: string
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function CopyButton({ text, label, className = '', size = 'md' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <button
      onClick={handleCopy}
      className={`hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 ${sizeClasses[size]} ${className}`}
      title={label || 'Copy to clipboard'}
    >
      {copied ? (
        <CheckIcon className={`${iconSizeClasses[size]} text-emerald-400`} />
      ) : (
        <DocumentDuplicateIcon className={`${iconSizeClasses[size]} text-white/60 hover:text-white/80`} />
      )}
    </button>
  )
}