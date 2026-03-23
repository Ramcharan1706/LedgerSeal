import { useState } from 'react';

export default function TamperSim() {
  const [file, setFile] = useState<File | null>(null);
  const [hash1, setHash1] = useState('');
  const [hash2, setHash2] = useState('');

  const handleFile = async (f: File) => {
    const arrayBuffer = await f.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    setHash1(hashArray.map(b => b.toString(16).padStart(2, '0')).join(''));
    // "Tamper"
    const tamperedBuffer = arrayBuffer.slice(0, -1);
    const tamperedHash = await crypto.subtle.digest('SHA-256', tamperedBuffer);
    const tamperedArray = Array.from(new Uint8Array(tamperedHash));
    setHash2(tamperedArray.map(b => b.toString(16).padStart(2, '0')).join(''));
    setFile(f);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tamper Simulation</h1>
      <input type="file" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
      {hash1 && (
        <div>
          <p>Original: {hash1.slice(0,16)}...</p>
          <p>Tampered: {hash2.slice(0,16)}... ❌</p>
        </div>
      )}
    </div>
  );
}

