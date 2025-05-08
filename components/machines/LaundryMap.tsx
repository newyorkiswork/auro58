'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getMachinesByLaundromat } from '@/lib/fetchers';

// Machine type definition
interface Machine {
  id: string;
  label: string;
  type: 'washer' | 'dryer';
  status: 'available' | 'in_use' | 'out_of_service';
}

interface Props {
  laundromatId: string;
}

const iconForMachine = (type: Machine['type']) => {
  return type === 'washer' ? '/icons/washer.svg' : '/icons/dryer.svg';
};

const statusColor = (status: Machine['status']) => {
  switch (status) {
    case 'available': return 'bg-green-400 border-green-500';
    case 'in_use': return 'bg-red-400 border-red-500';
    case 'out_of_service': return 'bg-gray-400 border-gray-500';
    default: return 'bg-gray-200 border-gray-300';
  }
};

// Simple fixed layout: 5 columns, 4 rows (20 machines max)
const getPosition = (idx: number) => {
  const col = idx % 5;
  const row = Math.floor(idx / 5);
  const left = 20 + col * 70; // px
  const top = 20 + row * 90; // px
  return { left, top };
};

function friendlyLabel(type: Machine['type'], label: string) {
  // If label is a number, use 'Washer 3' or 'Dryer 12'
  const num = label.replace(/\D/g, '');
  return `${type === 'washer' ? 'Washer' : 'Dryer'}${num ? ' ' + num : ''}`;
}

export default function LaundryMap({ laundromatId }: Props) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getMachinesByLaundromat(laundromatId)
      .then(setMachines)
      .catch(e => setError(e.message || 'Failed to load machines'))
      .finally(() => setLoading(false));
  }, [laundromatId]);

  return (
    <div className="relative w-full max-w-xl mx-auto" style={{ height: 400 }}>
      <h2 className="text-xl font-semibold mb-4 font-sans">Machine Map</h2>
      <div className="absolute inset-0 bg-white rounded-2xl border border-gray-200 shadow-lg">
        {loading && <div className="absolute inset-0 flex items-center justify-center text-gray-400">Loading machines...</div>}
        {error && <div className="absolute inset-0 flex items-center justify-center text-red-500">{error}</div>}
        {machines.map((machine, idx) => {
          const pos = getPosition(idx);
          return (
            <div
              key={machine.id}
              className={`absolute flex flex-col items-center ${statusColor(machine.status)} bg-opacity-30 rounded-xl border-2 p-3 shadow transition-transform hover:scale-105`}
              style={{ left: pos.left, top: pos.top, width: 60 }}
            >
              <Image
                src={iconForMachine(machine.type)}
                alt={machine.type}
                width={40}
                height={40}
                className="mx-auto"
              />
              <span className="mt-1 text-xs font-semibold text-gray-800 text-center font-sans">
                {friendlyLabel(machine.type, machine.label)}
              </span>
              <span className="text-[10px] text-gray-500 capitalize">
                {machine.status.replace('_', ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
} 