/* ------------------------------------------------------------------
   app/home/page.tsx – Auro dashboard
   Shows next booking, machine availability, and quick‑action buttons
------------------------------------------------------------------- */

'use client';

import Link from 'next/link';

/* Mock data — replace with real Supabase fetch later */
const nextBooking = {
  date: '5/6/2025, 9:30 PM',
  machine: '9a7c‑01',
};
const machines = { available: 3, inUse: 3 };

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page heading */}
      <h1 className="text-3xl font-bold">Auro Dashboard</h1>

      {/* Next laundry session */}
      <section className="border rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Next Laundry Session</h2>
        <p className="text-sm text-gray-700">
          {nextBooking.date} — Machine {nextBooking.machine}
        </p>
      </section>

      {/* Machine availability */}
      <section className="border rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Machine Availability</h2>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="rounded-lg bg-green-50 py-6">
            <p className="text-sm text-gray-500">Available</p>
            <p className="mt-1 text-3xl font-bold">{machines.available}</p>
          </div>
          <div className="rounded-lg bg-red-50 py-6">
            <p className="text-sm text-gray-500">In Use</p>
            <p className="mt-1 text-3xl font-bold">{machines.inUse}</p>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/booking"
            className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
          >
            Book Machine
          </Link>
          <Link
            href="/supplies"
            className="inline-block rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition"
          >
            Order Supplies
          </Link>
          <Link
            href="/deals"
            className="inline-block rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 transition"
          >
            View Deals
          </Link>
        </div>
      </section>
    </main>
  );
}