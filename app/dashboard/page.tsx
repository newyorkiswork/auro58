import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString();
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function fetchBookings() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/users/${user.id}/bookings`);
        if (!res.ok) throw new Error('Failed to fetch bookings');
        const { bookings } = await res.json();
        setBookings(bookings);
      } catch (err: any) {
        setError(err.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [user]);

  const now = new Date();
  const upcoming = bookings.filter(b => new Date(b.start_time) >= now && b.status === 'active');
  const past = bookings.filter(b => new Date(b.start_time) < now || b.status !== 'active');

  if (authLoading || (user && loading)) {
    return <div className="p-8">Loading bookings...</div>;
  }

  if (!user) return null;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Upcoming Bookings</h2>
            {upcoming.length === 0 ? (
              <div className="text-gray-400">No upcoming bookings.</div>
            ) : (
              <ul className="space-y-4">
                {upcoming.map(b => (
                  <li key={b.id} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center gap-2 border border-blue-100">
                    <div className="flex-1">
                      <div className="font-semibold text-blue-900">{b.laundromats?.name || 'Laundromat'}</div>
                      <div className="text-sm text-gray-500">{b.laundromats?.address}</div>
                      <div className="text-sm mt-1">Machine: <span className="font-medium">{b.machines?.label}</span> ({b.machines?.type})</div>
                      <div className="text-sm mt-1">Time: {formatDateTime(b.start_time)} - {formatDateTime(b.end_time)}</div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 self-start md:self-center">{b.status}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">Past & Cancelled Bookings</h2>
            {past.length === 0 ? (
              <div className="text-gray-400">No past bookings.</div>
            ) : (
              <ul className="space-y-4">
                {past.map(b => (
                  <li key={b.id} className="bg-gray-50 rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center gap-2 border border-gray-200">
                    <div className="flex-1">
                      <div className="font-semibold text-blue-900">{b.laundromats?.name || 'Laundromat'}</div>
                      <div className="text-sm text-gray-500">{b.laundromats?.address}</div>
                      <div className="text-sm mt-1">Machine: <span className="font-medium">{b.machines?.label}</span> ({b.machines?.type})</div>
                      <div className="text-sm mt-1">Time: {formatDateTime(b.start_time)} - {formatDateTime(b.end_time)}</div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded self-start md:self-center ${b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'}`}>{b.status}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
} 