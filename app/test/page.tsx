'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('machines').select('*');
      if (error) setError(error.message);
      else setMachines(data ?? []);
    }
    load();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Supabase Test</h1>
      {error && <p className="text-red-600">Error: {error}</p>}
      <ul className="space-y-2">
        {machines.map((m) => (
          <li key={m.id} className="border p-2 rounded">
            {m.label} — {m.status}
          </li>
        ))}
      </ul>
      {machines.length === 0 && !error && (
        <p className="text-gray-500">No machines found.</p>
      )}
    </div>
  );
}