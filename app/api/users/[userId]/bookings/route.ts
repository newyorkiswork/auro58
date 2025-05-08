import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let query = supabase
    .from('bookings')
    .select(`*, machines(id, label, type), laundromats(id, name, address)`)
    .eq('user_id', userId);

  if (status) {
    query = query.eq('status', status);
  }

  query = query.order('start_time', { ascending: true });

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data });
} 