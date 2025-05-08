import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  // Fetch laundromat
  const { data: laundromat, error: laundromatError } = await supabase.from('laundromats').select('*').eq('id', id).single();
  if (laundromatError) return NextResponse.json({ error: laundromatError.message }, { status: 404 });

  // Fetch machines
  const { data: machines, error: machineError } = await supabase.from('machines').select('id, label, type, status').eq('laundromat_id', id);
  if (machineError) return NextResponse.json({ error: machineError.message }, { status: 500 });

  return NextResponse.json({ laundromat, machines });
} 