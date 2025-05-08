'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import GoogleMap, { LaundromatMapItem } from '@/components/GoogleMap'
import { getLaundromats } from '@/lib/fetchers'

export default function HomePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [laundromats, setLaundromats] = useState<LaundromatMapItem[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    getLaundromats().then(data => {
      setLaundromats(
        data
          .filter(l => l.latitude != null && l.longitude != null && !isNaN(Number(l.latitude)) && !isNaN(Number(l.longitude)))
          .map(l => ({ id: l.id, name: l.name, address: l.address, lat: Number(l.latitude), lng: Number(l.longitude) }))
      )
    })
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      )
    }
  }, [])

  // Filter laundromats by search
  const filtered = laundromats.filter(l => {
    const q = search.toLowerCase()
    return l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q)
  })

  // Show up to 6 featured laundromats
  const featured = filtered.slice(0, 6)

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-white">
      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center gap-6 mt-12 mb-10">
        <Image
          src="/auro-logo.svg"
          alt="Auro Logo"
          width={120}
          height={120}
          priority
        />
        <h1 className="text-4xl font-bold text-center text-blue-900 mb-2">Find a Laundromat Near You</h1>
        <p className="text-lg text-gray-600 text-center max-w-xl mb-4">Discover, book, and track machines at laundromats across NYC. Start by searching below or view all locations.</p>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, address, or borough..."
          className="w-full max-w-md px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => router.push('/laundromats')}
          className="px-6 py-3 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors shadow"
        >
          View All Laundromats
        </button>
      </div>

      {/* Next Laundry Session tile */}
      <div className="mb-8 w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 border border-blue-100">
          <div className="bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center">
            <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='none' viewBox='0 0 24 24'><rect width='20' height='20' x='2' y='2' fill='#3b82f6' rx='6'/><rect width='14' height='2' x='5' y='7' fill='#fff' rx='1'/><rect width='10' height='2' x='7' y='11' fill='#fff' rx='1'/></svg>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-900">Next Laundry Session</div>
            <div className="text-sm text-gray-500">Saturday, May 10, 2:00 PM</div>
          </div>
        </div>
      </div>

      {/* Small Map with featured laundromats */}
      <div className="relative z-10 w-full max-w-2xl mb-12">
        <GoogleMap
          laundromats={featured}
          userLocation={userLocation}
        />
      </div>
    </main>
  )
} 