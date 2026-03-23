import { useEffect, useState } from 'react';
import { evidenceAPI } from '../services/api';

interface Evidence {
  id: string;
  owner: string;
  timestamp: string;
}

export default function EvidenceHistory() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  useEffect(() => {
    evidenceAPI.list().then((res) => setEvidence(res || []));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Evidence History</h1>
      <ul>
        {evidence.map(item => (
          <li key={item.id} className="p-2 border-b">
            {item.id} - {item.owner} - {item.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}

