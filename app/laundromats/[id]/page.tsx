'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Machine } from '@/lib/fetchers'
import { BookingModal } from '@/components/booking/BookingModal'
import LaundryMap from '@/components/machines/LaundryMap'

type Laundromat = {
  id: string
  name: string
  address: string
}

const TABS = [
  { key: 'map', label: 'Map View' },
  { key: 'grid', label: 'Grid View' },
]

export default function LaundromatPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [laundromat, setLaundromat] = useState<Laundromat | null>(null)
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'map' | 'grid'>('map')

  // Auto-refresh machines every 10s
  useEffect(() => {
    let interval: NodeJS.Timeout
    async function load() {
      try {
        // GET /api/laundromats/[id] returns: { laundromat, machines }
        const res = await fetch(`/api/laundromats/${id}`)
        if (!res.ok) throw new Error('Failed to fetch laundromat')
        const { laundromat: laundromatData, machines: machinesData } = await res.json()
        setLaundromat(laundromatData)
        setMachines(machinesData)
      } catch (err) {
        // Error messages are shown in the UI
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    load()
    // Auto-refresh every 10s for real-time machine status updates
    interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [id])

  if (loading) {
    // Loading state is shown in the UI
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !laundromat) {
    // Error state is shown in the UI
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500 mb-4">
          {error || 'Laundromat not found'}
        </p>
        <button
          onClick={() => router.push('/laundromats')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Laundromats
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
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
      <button
        onClick={() => router.push('/laundromats')}
        className="text-blue-600 hover:text-blue-800 mb-4"
      >
        ← Back to Laundromats
      </button>

      <h1 className="text-2xl font-bold mb-2">{laundromat.name}</h1>
      <p className="text-gray-600 mb-6">{laundromat.address}</p>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
            onClick={() => setTab(t.key as 'map' | 'grid')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content is conditionally rendered based on the selected tab */}
      {tab === 'map' ? (
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <LaundryMap laundromatId={laundromat.id} />
        </div>
      ) : (
        // Machine grid is rendered when the grid tab is selected
        <div className="grid gap-4 md:grid-cols-2">
          {machines.map((machine) => (
            // Machine card is rendered for each machine
            <div
              key={machine.id}
              className="border rounded-2xl p-4 shadow-lg bg-white hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{machine.label}</h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {machine.type}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    machine.status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : machine.status === 'in_use'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {machine.status.replace('_', ' ')}
                </span>
              </div>

              {machine.status === 'available' && (
                // Booking modal is rendered for available machines
                <BookingModal
                  machine={machine}
                  laundromat={laundromat}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 