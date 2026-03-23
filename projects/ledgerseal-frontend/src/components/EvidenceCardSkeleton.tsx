import { ShieldCheckIcon } from '@heroicons/react/24/outline'

interface EvidenceCardSkeletonProps {
  count?: number
}

export default function EvidenceCardSkeleton({ count = 6 }: EvidenceCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass-card p-8 animate-pulse">
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
              <ShieldCheckIcon className="w-7 h-7 text-white/20" />
            </div>
            <div className="w-20 h-6 bg-white/10 rounded-xl"></div>
          </div>

          <div className="space-y-3 mb-8">
            <div className="h-6 bg-white/10 rounded-lg w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
            <div className="h-4 bg-white/10 rounded w-2/3"></div>
            <div className="h-4 bg-white/10 rounded w-1/3"></div>
          </div>

          <div className="h-12 bg-white/10 rounded-xl"></div>
        </div>
      ))}
    </>
  )
}