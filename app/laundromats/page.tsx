'use client';

import { useEffect, useState, useRef } from 'react';
import GoogleMap, { LaundromatMapItem } from '@/components/GoogleMap';
import { Laundromat, Machine } from '@/lib/fetchers';
import { useRouter } from 'next/navigation';

interface MachineCounts {
  washersAvailable: number;
  dryersAvailable: number;
  washersInUse: number;
  dryersInUse: number;
  washersOut: number;
  dryersOut: number;
}

interface UserLocation {
  lat: number;
  lng: number;
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK') {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 3958.8; // miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function LaundromatsPage() {
  const [laundromats, setLaundromats] = useState<Laundromat[]>([]);
  const [machineCounts, setMachineCounts] = useState<Record<string, MachineCounts>>({});
  const [laundromatsWithLocation, setLaundromatsWithLocation] = useState<LaundromatMapItem[]>([]);
  const [selectedLaundromatId, setSelectedLaundromatId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const router = useRouter();
  const [search, setSearch] = useState('');

  // Fetch initial data and set up geocoding on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch laundromats with machine availability from new API
        const res = await fetch('/api/laundromats');
        if (!res.ok) throw new Error('Failed to fetch laundromats');
        const { laundromats: data } = await res.json();
        setLaundromats(data);

        // Transform API response format to match existing UI components
        const counts: Record<string, MachineCounts> = {};
        data.forEach((laundromat: any) => {
          counts[laundromat.id] = {
            washersAvailable: laundromat.availability.washer.available,
            dryersAvailable: laundromat.availability.dryer.available,
            washersInUse: laundromat.availability.washer.in_use,
            dryersInUse: laundromat.availability.dryer.in_use,
            washersOut: laundromat.availability.washer.out_of_order,
            dryersOut: laundromat.availability.dryer.out_of_order,
          };
        });
        setMachineCounts(counts);

        // Add all laundromats with latitude/longitude immediately
        const withLocation: LaundromatMapItem[] = data
          .filter((l: Laundromat) => l.latitude != null && l.longitude != null && !isNaN(Number(l.latitude)) && !isNaN(Number(l.longitude)))
          .map((l: Laundromat) => ({ id: l.id, name: l.name, address: l.address, lat: Number(l.latitude), lng: Number(l.longitude) }));
        setLaundromatsWithLocation(withLocation);

        // Geocode laundromats without coordinates and add them incrementally
        for (const l of data) {
          if (!(l.latitude != null && l.longitude != null && !isNaN(Number(l.latitude)) && !isNaN(Number(l.longitude)))) {
            const geo = await geocodeAddress(l.address);
            if (geo) {
              setLaundromatsWithLocation(prev => [
                ...prev,
                { id: l.id, name: l.name, address: l.address, lat: Number(geo.lat), lng: Number(geo.lng) }
              ]);
            }
          }
        }
      } catch (err: any) {
        // Error messages are shown in the UI
        setError(err.message || 'Unexpected error');
      }
    }
    fetchData();
  }, []);

  // Get user's geolocation for showing nearby laundromats
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setLocationError(error.message);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  // Auto-scroll to selected laundromat card
  useEffect(() => {
    if (selectedLaundromatId && cardRefs.current[selectedLaundromatId]) {
      cardRefs.current[selectedLaundromatId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedLaundromatId]);

  // Check if a laundromat has coordinates for map display
  const hasPin = (id: string) => laundromatsWithLocation.some(l => l.id === id);

  // Handle card clicks and show tooltips for laundromats without pins
  const handleCardClick = (id: string) => {
    if (hasPin(id)) {
      setSelectedLaundromatId(id);
      setTooltip(null);
    } else {
      setTooltip(id);
      setTimeout(() => setTooltip(null), 2000);
    }
  };

  // Filter laundromats by search input (name, address, or borough)
  const filteredLaundromats = laundromats.filter(l => {
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.address.toLowerCase().includes(q) ||
      (l.borough && l.borough.toLowerCase().includes(q))
    );
  });

  // Filter map pins to match search results
  const filteredLaundromatsWithLocation = laundromatsWithLocation.filter(l =>
    filteredLaundromats.some(f => f.id === l.id)
  );

  // Compute which laundromats to show on the map (selected, nearby, or all)
  let laundromatsToShow: LaundromatMapItem[] = [];
  if (selectedLaundromatId) {
    const selected = filteredLaundromatsWithLocation.find(l => l.id === selectedLaundromatId);
    if (selected) laundromatsToShow = [selected];
  } else if (userLocation) {
    laundromatsToShow = filteredLaundromatsWithLocation.filter(l =>
      haversineDistance(userLocation.lat, userLocation.lng, l.lat, l.lng) <= 2
    );
  } else {
    laundromatsToShow = filteredLaundromatsWithLocation;
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Find a Laundromat</h1>
      {/* Next Laundry Session tile */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 border border-blue-100">
          <div className="bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center">
            <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='none' viewBox='0 0 24 24'><rect width='20' height='20' x='2' y='2' fill='#3b82f6' rx='6'/><rect width='14' height='2' x='5' y='7' fill='#fff' rx='1'/><rect width='10' height='2' x='7' y='11' fill='#fff' rx='1'/></svg>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-900">Next Laundry Session</div>
            <div className="text-sm text-gray-500">Saturday, May 10, 2:00 PM</div>
          </div>
        </div>
      </div>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name, address, or borough..."
        className="w-full mb-4 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      {userLocation && (
        <p className="text-sm text-gray-600 mb-4">
          Your location: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
        </p>
      )}
      {locationError && (
        <p className="text-sm text-red-600 mb-4">
          Location error: {locationError}
        </p>
      )}
      <GoogleMap
        laundromats={laundromatsToShow}
        selectedLaundromatId={selectedLaundromatId}
        onSelectLaundromat={id => {
          setSelectedLaundromatId(id);
          if (id) router.push(`/laundromats/${id}`);
        }}
        userLocation={userLocation}
      />
      {selectedLaundromatId && (
        <button
          className="mt-2 mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          onClick={() => setSelectedLaundromatId(null)}
        >
          Show nearby laundromats
        </button>
      )}
      {error ? (
        <p className="text-red-500 mt-6">❌ Failed to load laundromats: {error}</p>
      ) : laundromats.length === 0 ? (
        <p className="mt-6 text-gray-500">Loading laundromats...</p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLaundromats.map((item) => {
            const counts = machineCounts[item.id];
            const pinReady = hasPin(item.id);
            return (
              <li
                key={item.id}
                ref={el => { cardRefs.current[item.id] = el; }}
                className={`border p-6 rounded-2xl shadow-lg bg-white flex flex-col gap-2 cursor-pointer transition-all ${selectedLaundromatId === item.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => router.push(`/laundromats/${item.id}`)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">🧺 {item.name}</h3>
                  {!pinReady && (
                    <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">Map pin not ready</span>
                  )}
                  {tooltip === item.id && (
                    <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded">Map pin not ready yet</span>
                  )}
                </div>
                <p className="text-sm text-gray-700">{item.address}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{item.borough}</p>
                {counts ? (
                  <div className="mt-2 text-sm flex flex-col gap-1">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <img src="/icons/washer.svg" alt="Washer" className="w-4 h-4" />
                        <span className="font-medium">Washers:</span>
                        <span className="ml-1 text-green-700">{counts.washersAvailable} available</span>,
                        <span className="ml-1 text-yellow-700">{counts.washersInUse} in use</span>,
                        <span className="ml-1 text-gray-500">{counts.washersOut} out</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <img src="/icons/dryer.svg" alt="Dryer" className="w-4 h-4" />
                        <span className="font-medium">Dryers:</span>
                        <span className="ml-1 text-green-700">{counts.dryersAvailable} available</span>,
                        <span className="ml-1 text-yellow-700">{counts.dryersInUse} in use</span>,
                        <span className="ml-1 text-gray-500">{counts.dryersOut} out</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 mt-2">Loading machine data...</div>
                )}
                <button
                  className="mt-3 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm self-start"
                  onClick={e => { e.stopPropagation(); router.push(`/laundromats/${item.id}`); }}
                >
                  View Details
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}