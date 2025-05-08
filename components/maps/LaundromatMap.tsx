'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LaundromatMap from '@/components/maps/LaundromatMap';

type Laundromat = {
  id: string;
  name: string;
  address: string;
  borough: string;
  lat: number | null;
  lng: number | null;
};

export default function LaundromatsPage() {
  const [laundromats, setLaundromats] = useState<Laundromat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('laundromats')
        .select('*')
        .order('borough')
        .order('name');

      if (error) setError(error.message);
      else setLaundromats(data as Laundromat[]);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="p-6 space-y-8 max-w-screen-lg mx-auto">
      <h1 className="text-2xl font-bold">Find a Laundromat</h1>

      {/* ░░░ Google Map ░░░ */}
      <LaundromatMap />

      {/* ░░░ List or states ░░░ */}
      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <div className="grid gap-6 sm:grid-cols-2">
          {laundromats.map((shop) => (
            <div
              key={shop.id}
              className="border rounded shadow hover:shadow-lg transition"
            >
              <div className="p-4 space-y-1">
                <h2 className="font-semibold text-lg">{shop.name}</h2>
                <p className="text-sm text-gray-600">{shop.borough}</p>
                <p className="text-sm text-gray-500">{shop.address}</p>
              </div>

              <Link
                href={`/laundromats/${shop.id}`}
                className="block text-center bg-blue-600 text-white py-2 rounded-b hover:bg-blue-700"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}