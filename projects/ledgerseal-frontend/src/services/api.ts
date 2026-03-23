const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const throwIfNotOk = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    let errorMsg = `HTTP error ${response.status}`;
    try {
      const json = JSON.parse(text);
      errorMsg = json.error || errorMsg;
    } catch {
      errorMsg = text || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return response;
};

export const evidenceAPI = {
  getEvidence: (id: string) => ({
    queryKey: ['evidence', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/evidence/${id}`);
      await throwIfNotOk(response);
      return response.json();
    },
  }),
  get: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/evidence/${id}`);
    await throwIfNotOk(response);
    return response.json();
  },
  list: async () => {
    const response = await fetch(`${API_BASE_URL}/evidence`);
    await throwIfNotOk(response);
    return response.json();
  },
  history: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/evidence/${id}/history`);
    await throwIfNotOk(response);
    return response.json();
  },
  logs: async () => {
    const response = await fetch(`${API_BASE_URL}/evidence/logs`);
    await throwIfNotOk(response);
    return response.json();
  },
  register: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/evidence/register`, {
      method: 'POST',
      body: formData,
    });
    await throwIfNotOk(response);
    return response.json();
  },
  transfer: async (id: string, newOwner: string) => {
    const response = await fetch(`${API_BASE_URL}/evidence/${id}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newOwner }),
    });
    await throwIfNotOk(response);
    return response.json();
  },
  certificate: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/evidence/${id}/certificate`);
    await throwIfNotOk(response);
    return response.arrayBuffer();
  },
  verify: async (id: string, file: File | undefined, metadata: any) => {
    const formData = new FormData();
    formData.append('id', id);
    if (file) {
      formData.append('file', file);
    }
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await fetch(`${API_BASE_URL}/evidence/verify`, {
      method: 'POST',
      body: formData,
    });
    await throwIfNotOk(response);
    return response.json();
  },
};

