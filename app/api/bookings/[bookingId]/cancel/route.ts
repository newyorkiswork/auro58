import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request, { params }: { params: { bookingId: string } }) {
  const { bookingId } = params;
  const body = await req.json();
  const { user_id } = body;
  if (!user_id) {
    return NextResponse.json({ error: 'Missing user_id.' }, { status: 400 });
  }

  // Fetch booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, user_id, machine_id, status')
    .eq('id', bookingId)
    .single();
  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  }
  if (booking.user_id !== user_id) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
  }
  if (booking.status !== 'active') {
    return NextResponse.json({ error: 'Booking is not active.' }, { status: 409 });
  }

  // Cancel booking
  const { error: cancelError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);
  if (cancelError) {
    return NextResponse.json({ error: cancelError.message }, { status: 500 });
  }

  // Free the machine
  await supabase.from('machines').update({ status: 'available' }).eq('id', booking.machine_id);

  return NextResponse.json({ success: true });
} 