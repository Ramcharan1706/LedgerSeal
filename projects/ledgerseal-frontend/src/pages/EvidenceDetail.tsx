import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { evidenceAPI } from '../services/api';

interface Evidence {
  id: string;
  file_hash: string;
  secondary_hash: string;
  owner: string;
  txn_id: string;
  metadata: string;
}

export default function EvidenceDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: evidence, isLoading } = useQuery<Evidence>({
    queryKey: ['evidence', id],
    queryFn: () => evidenceAPI.get(id!),
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-white/10 rounded-lg w-64 mx-auto"></div>
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="h-24 bg-white/10 rounded-lg"></div>
          <div className="h-24 bg-white/10 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
  if (!evidence) return <div className="text-center py-12">Evidence not found</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Evidence {evidence.id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p>SHA256: {evidence.file_hash}</p>
          <p>Secondary: {evidence.secondary_hash}</p>
          <p>Owner: {evidence.owner}</p>
          <p>Txn: {evidence.txn_id}</p>
        </div>
        <pre>{evidence.metadata}</pre>
      </div>
    </div>
  );
}

