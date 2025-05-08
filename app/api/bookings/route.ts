import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const body = await req.json();
  const { user_id, laundromat_id, machine_id, start_time, end_time } = body;
  if (!user_id || !laundromat_id || !machine_id || !start_time || !end_time) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  // Validate time logic
  if (new Date(start_time) >= new Date(end_time)) {
    return NextResponse.json({ error: 'Start time must be before end time.' }, { status: 400 });
  }

  // Check for booking conflicts (Clairvoyant conflict prevention)
  const { data: conflicts, error: conflictError } = await supabase
    .from('bookings')
    .select('id')
    .eq('machine_id', machine_id)
    .eq('status', 'active')
    .or(`and(start_time,lt.${end_time},end_time,gt.${start_time})`);
  if (conflictError) {
    return NextResponse.json({ error: 'Error checking for booking conflicts.' }, { status: 500 });
  }
  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({ error: 'This machine is already booked for the selected time slot.' }, { status: 409 });
  }

  // Check if machine is available
  const { data: machine, error: machineError } = await supabase
    .from('machines')
    .select('status')
    .eq('id', machine_id)
    .single();
  if (machineError || !machine) {
    return NextResponse.json({ error: 'Machine not found.' }, { status: 404 });
  }
  if (machine.status !== 'available') {
    return NextResponse.json({ error: 'Machine is not available.' }, { status: 409 });
  }

  // Insert booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({ user_id, laundromat_id, machine_id, start_time, end_time, status: 'active' })
    .select()
    .single();
  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  // Optionally update machine status to 'booked'
  await supabase.from('machines').update({ status: 'booked' }).eq('id', machine_id);

  return NextResponse.json({ booking }, { status: 201 });
} 