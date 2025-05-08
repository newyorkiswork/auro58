'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { supabase } from '@/lib/supabaseClient'

type Props = {
  machine: { id: string; label: string }
  laundromat: { id: string; name: string }
}

export function BookingModal({ machine, laundromat }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startDatetime, setStartDatetime] = useState('')
  const [endDatetime, setEndDatetime] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with real user_id from auth context (currently hardcoded for demo)
      const user_id = 'demo-user';
      // POST /api/bookings expects: { user_id, laundromat_id, machine_id, start_time, end_time }
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          laundromat_id: laundromat.id,
          machine_id: machine.id,
          start_time: startDatetime,
          end_time: endDatetime
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to book machine');
      }
      setOpen(false)
      setStartDatetime('')
      setEndDatetime('')
      router.refresh()
    } catch (err) {
      // Error messages are shown in the modal
      setError(err instanceof Error ? err.message : 'Failed to book machine')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Book
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-lg p-6 shadow-lg">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Book {machine.label}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={startDatetime}
                onChange={(e) => setStartDatetime(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={endDatetime}
                onChange={(e) => setEndDatetime(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Booking...' : 'Confirm'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
} 